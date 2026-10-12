import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DeckProvider } from "./deck/context";
import {
  SECTIONS,
  SLIDES,
  STORAGE_KEY,
  defaultCopy,
  defaultNotes,
  loadDeck,
  type Copy,
  type CopyKey,
} from "./deck/copy";
import { images } from "./deck/images";
import { getRevealTargets } from "./deck/reveal";
import { exportPptx } from "./export/pptx";
import { SlideView } from "./slides/views";
import { cn } from "./utils/cn";

const BANNER_KEY = "soutenance-pv-banner-off";

const FICHE: { key: CopyKey; label: string; area?: boolean }[] = [
  { key: "country", label: "Pays" },
  { key: "motto", label: "Devise" },
  { key: "ministry", label: "Ministère", area: true },
  { key: "university", label: "Université" },
  { key: "school", label: "École / établissement", area: true },
  { key: "mention", label: "Mention" },
  { key: "pathway", label: "Parcours", area: true },
  { key: "degree", label: "Diplôme" },
  { key: "title", label: "Titre", area: true },
  { key: "subtitle", label: "Sous-titre", area: true },
  { key: "author", label: "Auteur" },
  { key: "supervisor", label: "Encadreur" },
  { key: "jury", label: "Jury" },
  { key: "date", label: "Session" },
  { key: "place", label: "Lieu" },
  { key: "contact", label: "Contact" },
  { key: "dossierCode", label: "Pastille" },
];

const SCENARIO: { key: CopyKey; label: string }[] = [
  { key: "casPlace", label: "Lieu du cas" },
  { key: "casPsh", label: "PSH" },
  { key: "casHh", label: "Ménage" },
  { key: "casUses", label: "Usages" },
  { key: "casLoad", label: "Besoin" },
  { key: "casScore", label: "Score" },
  { key: "casCap", label: "Capacité" },
  { key: "casBalance", label: "Bilan" },
  { key: "cfg1n", label: "Config. 1 — nom" },
  { key: "cfg1v", label: "Config. 1 — statut" },
  { key: "cfg1p", label: "Config. 1 — prix" },
  { key: "cfg1m", label: "Config. 1 — échéance" },
  { key: "cfg2n", label: "Config. 2 — nom" },
  { key: "cfg2v", label: "Config. 2 — statut" },
  { key: "cfg2p", label: "Config. 2 — prix" },
  { key: "cfg2m", label: "Config. 2 — échéance" },
  { key: "cfg3n", label: "Config. 3 — nom" },
  { key: "cfg3v", label: "Config. 3 — statut" },
  { key: "cfg3p", label: "Config. 3 — prix" },
  { key: "scorePick", label: "Modèle retenu" },
  { key: "scoreMetrics", label: "Métriques" },
];

function CompassMark() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.6" />
      <path d="M32 14l7 18-7 3-7-3 7-18z" fill="#e3a72e" />
      <path d="M32 50l-7-18 7-3 7 3-7 18z" fill="currentColor" opacity="0.35" />
      <circle cx="32" cy="32" r="2.2" fill="currentColor" />
    </svg>
  );
}

export default function App() {
  const initial = useMemo(() => loadDeck(), []);
  const [copy, setCopy] = useState<Copy>(initial.copy);
  const [notes, setNotes] = useState<string[]>(initial.notes);
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [ficheOpen, setFicheOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [banner, setBanner] = useState(() => localStorage.getItem(BANNER_KEY) !== "1");
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [exportProgress, setExportProgress] = useState(0);
  const [revealStep, setRevealStep] = useState(0);
  const [revealCount, setRevealCount] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "backward">("forward");
  const [scale, setScale] = useState(0.7);
  const [hud, setHud] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const firstSave = useRef(true);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const setField = useCallback((key: CopyKey, value: string) => {
    setCopy((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ copy, notes }));
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }
    setSaved(true);
    const timer = window.setTimeout(() => setSaved(false), 1200);
    return () => window.clearTimeout(timer);
  }, [copy, notes]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const rect = el.getBoundingClientRect();
      const next = Math.min((rect.width - 8) / 1280, (rect.height - 8) / 720);
      setScale(Math.max(0.18, next));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [presenting, notesOpen, banner, helpOpen]);

  useEffect(() => {
    document.getElementById(`rail-${index}`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const go = useCallback((next: number) => {
    setTransitionDirection(next >= index ? "forward" : "backward");
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)));
    setRevealStep(0);
  }, [index]);

  const advance = useCallback(() => {
    if (presenting && revealStep < revealCount) {
      setRevealStep((step) => step + 1);
      return;
    }
    if (index >= SLIDES.length - 1) return;
    go(index + 1);
  }, [go, index, presenting, revealCount, revealStep]);

  const retreat = useCallback(() => {
    if (presenting && revealStep > 0) {
      setRevealStep((step) => step - 1);
      return;
    }
    if (index <= 0) return;
    go(index - 1);
  }, [go, index, presenting, revealStep]);

  useLayoutEffect(() => {
    const slide = stageRef.current?.querySelector<HTMLElement>(".canvas-anim .slide") ?? null;
    const targets = getRevealTargets(slide);
    targets.forEach((target) => target.classList.add("reveal-item"));
    setRevealCount(targets.length);
  }, [index, presenting]);

  useLayoutEffect(() => {
    const slide = stageRef.current?.querySelector<HTMLElement>(".canvas-anim .slide") ?? null;
    getRevealTargets(slide).forEach((target, step) => {
      target.classList.toggle("is-revealed", !presenting || step < revealStep);
    });
  }, [index, presenting, revealStep, revealCount]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowRight" || event.key === "PageDown" || (event.key === " " && presenting)) {
        event.preventDefault();
        if (presenting) advance();
        else go(index + 1);
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        if (presenting) retreat();
        else go(index - 1);
      } else if (event.key === "Home") {
        go(0);
      } else if (event.key === "End") {
        go(SLIDES.length - 1);
      } else if (event.key === "Escape") {
        setPresenting(false);
        setHelpOpen(false);
        setFicheOpen(false);
        if (document.fullscreenElement) void document.exitFullscreen();
      } else if (event.key.toLowerCase() === "f") {
        void present();
      } else if (event.key.toLowerCase() === "e") {
        setEditing((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, go, index, presenting, retreat]);

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setPresenting(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!presenting) return;
    let timer = 0;
    const show = () => {
      setHud(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setHud(false), 1800);
    };
    show();
    window.addEventListener("mousemove", show);
    return () => {
      window.removeEventListener("mousemove", show);
      window.clearTimeout(timer);
    };
  }, [presenting, index]);

  async function present() {
    setRevealStep(0);
    setPresenting(true);
    setFicheOpen(false);
    setHelpOpen(false);
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* présentation sans plein écran */
    }
  }

  async function download() {
    setStatus("working");
    setExportProgress(0);
    try {
      await document.fonts.ready;
      const slides = Array.from(document.querySelectorAll<HTMLElement>(".rail-item .slide"));
      if (slides.length !== SLIDES.length) {
        throw new Error(`Export impossible : ${slides.length} diapositives trouvées sur ${SLIDES.length}.`);
      }
      await exportPptx(copy, notes, slides, setExportProgress);
      setStatus("done");
      setHelpOpen(true);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  function resetDeck() {
    if (!window.confirm("Revenir au texte d'origine ? Vos modifications locales seront effacées.")) return;
    setCopy({ ...defaultCopy });
    setNotes([...defaultNotes]);
    localStorage.removeItem(STORAGE_KEY);
  }

  const slide = SLIDES[index];
  const sectionNumber = Number(slide.section);
  const deckValue = useMemo(() => ({ copy, editing, set: setField }), [copy, editing, setField]);
  const thumbValue = useMemo(() => ({ copy, editing: false, set: setField }), [copy, setField]);

  return (
    <div className={cn("studio", presenting && "is-present")}>
      {!presenting && banner && (
        <div className="banner">
          <p>
            <strong>Dossier modifiable.</strong> Remplacez le nom, la faculté et les chiffres du scénario, puis téléchargez le fichier pour l'ouvrir dans Google Slides.
          </p>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(BANNER_KEY, "1");
              setBanner(false);
            }}
          >
            Compris
          </button>
        </div>
      )}

      {!presenting && (
        <header className="topbar">
          <div className="brand">
            <CompassMark />
            <div>
              <div className="name">Dossier</div>
              <div className="sub">Soutenance PV</div>
            </div>
          </div>
          <div className="top-title">
            <div className="sec">{slide.section} / 14</div>
            <div className="lab">{slide.label}</div>
          </div>
          <div className="top-actions">
            {saved && <span className="saved">Enregistré</span>}
            <button type="button" className={cn("btn keep", editing && "is-on")} onClick={() => setEditing((v) => !v)}>
              {editing ? "Édition" : "Éditer"}
            </button>
            <button type="button" className={cn("btn keep", ficheOpen && "is-on")} onClick={() => setFicheOpen(true)}>
              Fiche
            </button>
            <button type="button" className={cn("btn", notesOpen && "is-on")} onClick={() => setNotesOpen((v) => !v)}>
              Notes
            </button>
            <button type="button" className="btn" onClick={() => setHelpOpen(true)}>
              Google Slides
            </button>
            <button type="button" className="btn btn-gold" onClick={() => void download()} disabled={status === "working"}>
              {status === "working" ? `Export ${exportProgress}/${SLIDES.length}…` : "Télécharger .pptx"}
            </button>
            <button type="button" className="btn keep" onClick={() => void present()}>
              Présenter
            </button>
          </div>
        </header>
      )}

      <div className="workspace">
        {!presenting && (
          <aside className="rail" aria-label="Planches">
            {SLIDES.map((item, i) => (
              <button
                id={`rail-${i}`}
                key={item.id}
                type="button"
                className={cn("rail-item", i === index && "is-on")}
                onClick={() => setIndex(i)}
                aria-current={i === index}
              >
                <div className="rail-thumb" aria-hidden="true">
                  <div className="rail-scale">
                    <DeckProvider value={thumbValue}>
                      <SlideView index={i} />
                    </DeckProvider>
                  </div>
                </div>
                <div className="rail-meta">
                  <em>{item.section}</em>
                  <strong>{item.label}</strong>
                </div>
              </button>
            ))}
          </aside>
        )}

        <div
          className={cn("stage-wrap", editing && "is-editing")}
          ref={stageRef}
          onPointerDown={(event) => {
            pointer.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            if (!pointer.current || editing) return;
            const dx = event.clientX - pointer.current.x;
            pointer.current = null;
            if (Math.abs(dx) > 80) {
              if (presenting) {
                if (dx < 0) advance();
                else retreat();
              } else {
                go(index + (dx < 0 ? 1 : -1));
              }
            }
          }}
        >
          <div className="canvas" style={{ width: 1280 * scale, height: 720 * scale }}>
            <div className={cn("canvas-anim", `slide-enter-${transitionDirection}`)} key={index} style={{ width: 1280, height: 720, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <DeckProvider value={deckValue}>
                <SlideView index={index} />
              </DeckProvider>
            </div>
          </div>
          {presenting && (
            <>
              <button type="button" className="nav-hotspot prev" aria-label="Planche précédente" onClick={retreat} />
              <button type="button" className="nav-hotspot next" aria-label="Planche suivante" onClick={advance} />
            </>
          )}
          {presenting && (
            <div className={cn("hud", hud && "show")}>
              <span>{slide.section}</span>
              <span>{slide.label}</span>
              <span>
                {index + 1} / {SLIDES.length}
              </span>
              {revealCount > 0 && <span>Étapes {revealStep} / {revealCount}</span>}
            </div>
          )}
        </div>
      </div>

      {!presenting && (
        <nav className="stepper-bar" aria-label="Sections">
          {SECTIONS.map((section) => {
            const n = Number(section.id);
            const state = n < sectionNumber ? "done" : section.id === slide.section ? "active" : "";
            return (
              <button
                key={section.id}
                type="button"
                className={cn("sec-tick", state)}
                onClick={() => setIndex(section.slide)}
              >
                {section.id}
                <small>{section.label}</small>
              </button>
            );
          })}
        </nav>
      )}

      {!presenting && notesOpen && (
        <section className="notes">
          <div>
            <h3>Notes d'oral</h3>
            <p>Exportées dans le fichier PowerPoint, visibles dans le mode présentateur de Google Slides.</p>
          </div>
          <textarea
            value={notes[index] ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setNotes((prev) => prev.map((note, i) => (i === index ? value : note)));
            }}
            aria-label="Notes de la planche"
          />
        </section>
      )}

      {ficheOpen && (
        <aside className="drawer" role="dialog" aria-label="Fiche du dossier">
          <header>
            <div>
              <h2>Fiche</h2>
              <p>Ces champs se retrouvent sur les planches et dans le fichier Google Slides.</p>
            </div>
            <button type="button" className="icon-x" onClick={() => setFicheOpen(false)} aria-label="Fermer">
              ×
            </button>
          </header>
          <div className="body">
            <div className="fiche-block">Identité</div>
            {FICHE.map((field) => (
              <div className="field" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                {field.area ? (
                  <textarea
                    id={field.key}
                    value={copy[field.key]}
                    onChange={(event) => setField(field.key, event.target.value)}
                  />
                ) : (
                  <input
                    id={field.key}
                    value={copy[field.key]}
                    onChange={(event) => setField(field.key, event.target.value)}
                  />
                )}
              </div>
            ))}
            <div className="fiche-block">Scénario et modèle</div>
            {SCENARIO.map((field) => (
              <div className="field" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                <input id={field.key} value={copy[field.key]} onChange={(event) => setField(field.key, event.target.value)} />
              </div>
            ))}
          </div>
          <footer>
            <button type="button" className="btn btn-light" onClick={resetDeck}>
              Réinitialiser
            </button>
            <button type="button" className="btn btn-dark" onClick={() => setFicheOpen(false)}>
              Fermer
            </button>
          </footer>
        </aside>
      )}

      {helpOpen && (
        <div className="overlay" role="presentation" onClick={() => setHelpOpen(false)}>
          <div className="panel" role="dialog" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <h2 id="help-title">Ouvrir dans Google Slides</h2>
                <p>Dans l’application comme dans le PowerPoint, les textes apparaissent par blocs au fil des clics. Les diapositives passent aussi en fondu, et les textes exportés restent modifiables.</p>
              </div>
              <button type="button" className="icon-x" onClick={() => setHelpOpen(false)} aria-label="Fermer">
                ×
              </button>
            </header>
            <div className="body">
              <img src={images.desk} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 3, marginBottom: 14 }} />
              <div className="steps-import">
                <article>
                  <span>01</span>
                  <h3>Télécharger</h3>
                  <p>Le fichier inclut vos textes modifiés et les notes d'oral.</p>
                </article>
                <article>
                  <span>02</span>
                  <h3>Importer</h3>
                  <p>Dans Google Drive : Nouveau, puis Importation de fichiers.</p>
                </article>
                <article>
                  <span>03</span>
                  <h3>Ouvrir</h3>
                  <p>Clic droit sur le fichier, Ouvrir avec, Google Slides.</p>
                </article>
                <article>
                  <span>04</span>
                  <h3>Enregistrer</h3>
                  <p>Fichier, puis Enregistrer au format Google Slides, pour une copie native.</p>
                </article>
              </div>
              <div className="help-actions">
                <button type="button" className="btn btn-gold" onClick={() => void download()} disabled={status === "working"}>
                  {status === "working" ? "Préparation…" : status === "done" ? "Télécharger à nouveau" : "Télécharger le fichier .pptx"}
                </button>
                <a href="https://drive.google.com" target="_blank" rel="noreferrer">
                  Ouvrir Google Drive
                </a>
                {status === "error" && <span>L'export n'a pas abouti. Réessayez.</span>}
              </div>
              <p className="fine">
                Dans l’application, les flèches et la barre d’espace révèlent les blocs puis passent à la diapositive suivante. Le PowerPoint suit le même principe au clic et ajoute un fondu entre les diapositives ; ses textes restent modifiables.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
