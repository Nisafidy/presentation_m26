import { toJpeg } from "html-to-image";
import JSZip from "jszip";
import PptxGenJS from "pptxgenjs";
import type { Copy } from "../deck/copy";
import { getRevealTargets } from "../deck/reveal";

const WIDTH = 13.333;
const HEIGHT = 7.5;
const SLIDE_WIDTH_PX = 1280;
const SLIDE_HEIGHT_PX = 720;

type EditableText = {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontFace: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right" | "justify";
  revealGroup: number;
  objectName?: string;
};

function colorHex(color: string): string {
  const values = color.match(/[\d.]+/g);
  if (!values || values.length < 3) return "16212C";
  return values
    .slice(0, 3)
    .map((part) => Math.round(Number(part)).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function extractEditableText(slide: HTMLElement): EditableText[] {
  const slideRect = slide.getBoundingClientRect();
  const texts: EditableText[] = [];
  const revealTargets = getRevealTargets(slide);
  const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const text = node.textContent ?? "";
    if (!text.trim()) continue;
    const parent = node.parentElement;
    if (!parent) continue;

    const style = getComputedStyle(parent);
    const range = document.createRange();
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;

    const replacement = document.createElement("span");
    replacement.textContent = text;
    replacement.style.visibility = "hidden";
    node.replaceWith(replacement);

    const weight = Number.parseInt(style.fontWeight, 10);
    const textAlign = style.textAlign;
    const revealGroup = revealTargets.findIndex((target) => target === parent || target.contains(parent));
    const objectName = revealGroup >= 0 ? `reveal-${revealGroup}-${texts.length}` : undefined;
    texts.push({
      text,
      x: ((rect.left - slideRect.left) / SLIDE_WIDTH_PX) * WIDTH,
      y: ((rect.top - slideRect.top) / SLIDE_HEIGHT_PX) * HEIGHT,
      w: (rect.width / SLIDE_WIDTH_PX) * WIDTH + 0.02,
      h: (rect.height / SLIDE_HEIGHT_PX) * HEIGHT + 0.04,
      fontFace: style.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
      fontSize: (Number.parseFloat(style.fontSize) || 16) * 0.75,
      color: colorHex(style.color),
      bold: Number.isFinite(weight) ? weight >= 600 : style.fontWeight === "bold",
      italic: style.fontStyle.includes("italic"),
      align: textAlign === "center" || textAlign === "right" || textAlign === "justify" ? textAlign : "left",
      revealGroup,
      objectName,
    });
  }

  return texts;
}

async function waitForImages(slide: HTMLElement) {
  await Promise.all(
    Array.from(slide.querySelectorAll("img")).map(async (image) => {
      if (image.complete) return;
      await new Promise<void>((resolve, reject) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => reject(new Error(`Impossible de charger l’image ${image.src}`)), { once: true });
      });
    }),
  );
}

export async function exportPptx(
  copy: Copy,
  notes: string[],
  slideElements: HTMLElement[],
  onProgress: (completed: number) => void,
) {
  if (!slideElements.length) {
    throw new Error("Aucune diapositive n’est disponible pour l’export.");
  }

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: WIDTH, height: HEIGHT });
  pptx.layout = "WIDE";
  pptx.title = copy.title;
  pptx.author = copy.author;
  pptx.subject = `${copy.university} — soutenance`;

  const stage = document.createElement("div");
  Object.assign(stage.style, {
    position: "fixed",
    left: "-14000px",
    top: "0",
    width: `${SLIDE_WIDTH_PX}px`,
    height: `${SLIDE_HEIGHT_PX}px`,
    overflow: "hidden",
    pointerEvents: "none",
  });
  document.body.append(stage);

  try {
    for (const [index, source] of slideElements.entries()) {
      const slideElement = source.cloneNode(true) as HTMLElement;
      slideElement.style.transform = "none";
      slideElement.style.width = `${SLIDE_WIDTH_PX}px`;
      slideElement.style.height = `${SLIDE_HEIGHT_PX}px`;
      stage.replaceChildren(slideElement);
      await waitForImages(slideElement);

      const editableText = extractEditableText(slideElement);
      const background = await toJpeg(slideElement, {
        cacheBust: true,
        pixelRatio: 1,
        quality: 0.92,
        width: SLIDE_WIDTH_PX,
        height: SLIDE_HEIGHT_PX,
      });
      const pptSlide = pptx.addSlide();
      pptSlide.addImage({
        data: background.replace(/^data:/, ""),
        x: 0,
        y: 0,
        w: WIDTH,
        h: HEIGHT,
      });
      for (const text of editableText) {
        pptSlide.addText(text.text, {
          x: text.x,
          y: text.y,
          w: text.w,
          h: text.h,
          fontFace: text.fontFace,
          fontSize: text.fontSize,
          color: text.color,
          bold: text.bold,
          italic: text.italic,
          align: text.align,
          margin: 0,
          breakLine: false,
          transparency: 0,
          valign: "middle",
          fit: "shrink",
          ...(text.objectName ? { objectName: text.objectName } : {}),
        });
      }
      pptSlide.addNotes(notes[index] || "");
      onProgress(index + 1);
    }
  } finally {
    stage.remove();
  }

  const output = await pptx.write({ outputType: "blob" });
  if (!(output instanceof Blob)) {
    throw new Error("Impossible de préparer le fichier PowerPoint.");
  }

  const archive = await JSZip.loadAsync(output);
  for (let index = 0; index < slideElements.length; index += 1) {
    const path = `ppt/slides/slide${index + 1}.xml`;
    const slideFile = archive.file(path);
    if (!slideFile) throw new Error(`La diapositive ${index + 1} est absente du fichier PowerPoint.`);

    const xml = await slideFile.async("string");
    const groups = new Map<number, string[]>();
    const shapePattern = /<p:cNvPr\b(?=[^>]*\bid="([^"]+)")(?=[^>]*\bname="reveal-(\d+)-\d+")[^>]*>/g;
    for (const match of xml.matchAll(shapePattern)) {
      const shapeId = match[1];
      const group = Number(match[2]);
      if (!shapeId || !Number.isInteger(group)) continue;
      groups.set(group, [...(groups.get(group) ?? []), shapeId]);
    }
    const transition = '<p:transition spd="med" advClick="1"><p:fade/></p:transition>';
    const animations = [...groups.entries()]
      .sort(([left], [right]) => left - right)
      .map(([group, shapeIds]) => createEntranceGroup(shapeIds, group));
    const timing = animations.length ? createTimingXml(animations) : "";
    const transitionedXml = xml.replace("</p:sld>", `${transition}${timing}</p:sld>`);
    if (transitionedXml === xml) {
      throw new Error(`Impossible d’ajouter le fondu à la diapositive ${index + 1}.`);
    }
    archive.file(path, transitionedXml);
  }

  const animatedPptx = await archive.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  const url = URL.createObjectURL(animatedPptx);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Universite-Antananarivo-Soutenance-PV-menages.pptx";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

type EntranceGroup = { id: number; shapeIds: string[] };

function targetXml(shapeId: string) {
  return `<p:tgtEl><p:spTgt spid="${shapeId}"/></p:tgtEl>`;
}

function slideTargetXml() {
  return "<p:tgtEl><p:sldTgt/></p:tgtEl>";
}

function createEntranceGroup(shapeIds: string[], group: number): EntranceGroup {
  return { id: group, shapeIds };
}

function createTimingXml(groups: EntranceGroup[]) {
  let nextId = 3;
  const buildEffects = groups.map(({ shapeIds }) => {
    const groupId = nextId++;
    const clickId = nextId++;
    const effects = shapeIds.map((shapeId) => {
      const setId = nextId++;
      const fadeId = nextId++;
      const visibility = `<p:set><p:cBhvr><p:cTn id="${setId}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>${targetXml(shapeId)}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`;
      const fade = `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${fadeId}" dur="450"/>${targetXml(shapeId)}</p:cBhvr></p:animEffect>`;
      return visibility + fade;
    }).join("");
    return `<p:par><p:cTn id="${groupId}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${clickId}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="clickEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${effects}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
  }).join("");
  const buildEntries = groups.flatMap(({ shapeIds }) => shapeIds.map((shapeId) => `<p:bldP spid="${shapeId}" grpId="0" animBg="1"/>`)).join("");
  return `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${buildEffects}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0">${slideTargetXml()}</p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0">${slideTargetXml()}</p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>${buildEntries}</p:bldLst></p:timing>`;
}
