import type { ReactNode } from "react";
import { images } from "../deck/images";
import { E, useDeck } from "../deck/context";
import { SLIDES, type CopyKey } from "../deck/copy";
import { cn } from "../utils/cn";

function Frame({
  children,
  tone = "paper",
  className,
}: {
  children: ReactNode;
  tone?: "paper" | "dark" | "cover";
  className?: string;
}) {
  return (
    <section className={cn("slide", tone === "paper" && "slide-paper", tone === "dark" && "slide-dark", tone === "cover" && "slide-cover", className)}>
      {tone === "paper" && (
        <>
          <i className="mark tl" />
          <i className="mark br" />
        </>
      )}
      {children}
    </section>
  );
}

function Head({ section, kicker, title, dark = false }: { section: string; kicker: string; title: CopyKey; dark?: boolean }) {
  return (
    <header className={cn("s-head", dark && "is-dark")}>
      <div className="s-kicker">
        <span>{section}</span>
        <i />
        <em>{kicker}</em>
      </div>
      <h2>
        <E k={title} />
      </h2>
    </header>
  );
}

function Foot({ section, page }: { section: string; page: number }) {
  return (
    <footer className="s-foot">
      <span className="s-sec">{section}</span>
      <span className="rule" />
      <E k="university" className="s-uni" />
      <span className="s-num">
        {String(page).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
      </span>
    </footer>
  );
}

function Compass({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.4" />
      <path d="M32 8v6M32 50v6M8 32h6M50 32h6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M32 14l7 18-7 3-7-3 7-18z" fill="#e3a72e" />
      <path d="M32 50l-7-18 7-3 7 3-7 18z" fill="currentColor" opacity="0.35" />
      <circle cx="32" cy="32" r="2.2" fill="currentColor" />
    </svg>
  );
}

function Flag() {
  return (
    <span className="flag" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function statusTone(value: string) {
  const s = value.toLowerCase();
  if (s.includes("écart") || s.includes("ecart")) return "no";
  if (s.includes("hors") || s.includes("non")) return "warn";
  if (s.includes("admissible")) return "ok";
  return "warn";
}

function parseMoney(input: string): number | null {
  const matches = input.match(/\d{1,3}(?:[ .\u00a0]\d{3})+|\d+(?:[.,]\d+)?/g);
  if (!matches) return null;
  const nums = matches
    .map((item) => Number(item.replace(/[ .\u00a0]/g, "").replace(",", ".")))
    .filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  return Math.max(...nums);
}

function SlideCover() {
  return (
    <Frame tone="cover">
      <img className="cover-img" src={images.cover} alt="" />
      <div className="cover-shade" />
      <div className="cover-grid" />
      <div className="institutional-banner">
        <div className="institutional-seal">
          <img src={images.universityLogo} alt="Logo de l’Université d’Antananarivo" />
        </div>
        <div className="institutional-copy">
          <h2><E k="country" /></h2>
          <p className="institutional-motto"><E k="motto" /></p>
          <span className="institutional-divider" />
          <h2><E k="ministry" multi /></h2>
          <span className="institutional-divider" />
          <h2><E k="university" /></h2>
          <span className="institutional-divider" />
          <h2><E k="school" multi /></h2>
          <div className="institutional-program">
            <p><strong>Mention</strong> <E k="mention" /></p>
            <p><strong>Parcours</strong> <E k="pathway" multi /></p>
          </div>
        </div>
        <div className="institutional-seal">
          <img src={images.schoolLogo} alt="Logo de l’École Supérieure Polytechnique d’Antananarivo" />
        </div>
      </div>
      <div className="cover-inner">
        <div className="dossier-tag">
          <Flag />
          <E k="dossierCode" />
        </div>
        <h1 className="cover-title">
          <E k="title" multi />
        </h1>
        <E k="subtitle" className="cover-sub" multi />
        <div className="cover-meta">
          <div>
            <span>Auteur</span>
            <strong><E k="author" /></strong>
          </div>
          <div>
            <span>Encadreur</span>
            <strong><E k="supervisor" /></strong>
          </div>
          <div>
            <span>Diplôme</span>
            <strong><E k="degree" /></strong>
          </div>
          <div>
            <span>Session</span>
            <strong><E k="date" /> · <E k="place" /></strong>
          </div>
        </div>
      </div>
      <div className="cover-line" />
      <Compass className="cover-compass" />
    </Frame>
  );
}

function SlideThanks() {
  const items: { n: string; k: CopyKey }[] = [
    { n: "01", k: "thanks1" },
    { n: "02", k: "thanks2" },
    { n: "03", k: "thanks3" },
    { n: "04", k: "thanks4" },
  ];
  return (
    <Frame>
      <Head section="01" kicker="Page de garde" title="thanksTitle" />
      <div className="s-body room">
        <div className="thanks-layout">
          <E k="thanksLead" className="thanks-lead" multi />
          <div className="thanks-list">
            {items.map((item) => (
              <article key={item.n}>
                <em>{item.n}</em>
                <p><E k={item.k} multi /></p>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="thanks-bottom">
        <div>
          <span>Encadrement</span>
          <strong><E k="supervisor" /></strong>
        </div>
        <div>
          <span>Jury</span>
          <strong><E k="jury" /></strong>
        </div>
        <div>
          <span>Institution</span>
          <strong><E k="university" /></strong>
        </div>
      </div>
      <Foot section="01" page={2} />
    </Frame>
  );
}

function SlideContext() {
  return (
    <Frame>
      <Head section="02" kicker="Contexte" title="ctxTitle" />
      <div className="s-body">
        <div className="ctx">
          <figure className="ctx-photo">
            <img src={images.dusk} alt="Village des hautes terres au crépuscule, une maison éclairée" />
            <figcaption><E k="ctxCaption" multi /></figcaption>
          </figure>
          <div className="stats">
            {([
              ["ctxStat1n", "ctxStat1l", "ctxStat1s"],
              ["ctxStat2n", "ctxStat2l", "ctxStat2s"],
              ["ctxStat3n", "ctxStat3l", "ctxStat3s"],
            ] as const).map(([n, l, s]) => (
              <div className="stat" key={n}>
                <b><E k={n} /></b>
                <strong><E k={l} /></strong>
                <em><E k={s} /></em>
              </div>
            ))}
            <p className="ctx-copy"><E k="ctxBody" multi /></p>
            <p className="source"><E k="ctxSource" multi /></p>
          </div>
        </div>
      </div>
      <Foot section="02" page={3} />
    </Frame>
  );
}

function SlideProblem() {
  const cards: { t: CopyKey; b: CopyKey }[] = [
    { t: "pb1t", b: "pb1b" },
    { t: "pb2t", b: "pb2b" },
    { t: "pb3t", b: "pb3b" },
  ];
  return (
    <Frame>
      <Head section="02" kicker="Problématique" title="pbTitle" />
      <div className="s-body">
        <div className="cards-3">
          {cards.map((card, index) => (
            <article className="d-card" key={card.t}>
              <span className="idx">0{index + 1}</span>
              <h3><E k={card.t} /></h3>
              <p><E k={card.b} multi /></p>
            </article>
          ))}
        </div>
        <div className="thesis">
          <span>Formulation</span>
          <E k="pbThesis" multi />
        </div>
      </div>
      <Foot section="02" page={4} />
    </Frame>
  );
}

function SlideObjectives() {
  const items: { n: string; t: CopyKey; b: CopyKey }[] = [
    { n: "01", t: "obj1t", b: "obj1b" },
    { n: "02", t: "obj2t", b: "obj2b" },
    { n: "03", t: "obj3t", b: "obj3b" },
    { n: "04", t: "obj4t", b: "obj4b" },
  ];
  return (
    <Frame>
      <Head section="03" kicker="Objectifs et contribution" title="objTitle" />
      <div className="s-body">
        <div className="obj-banner">
          <span>Objectif général</span>
          <p><E k="objGeneral" multi /></p>
        </div>
        <div className="obj-grid">
          {items.map((item) => (
            <article className="obj-card" key={item.n}>
              <span className="idx">{item.n}</span>
              <div>
                <h3><E k={item.t} /></h3>
                <p><E k={item.b} multi /></p>
              </div>
            </article>
          ))}
        </div>
        <div className="contrib"><E k="contrib" multi /></div>
      </div>
      <Foot section="03" page={5} />
    </Frame>
  );
}

function SlideMethod() {
  const steps: { n: string; t: CopyKey; b: CopyKey }[] = [
    { n: "01", t: "step1t", b: "step1b" },
    { n: "02", t: "step2t", b: "step2b" },
    { n: "03", t: "step3t", b: "step3b" },
    { n: "04", t: "step4t", b: "step4b" },
    { n: "05", t: "step5t", b: "step5b" },
  ];
  return (
    <Frame tone="dark">
      <Head section="04" kicker="Démarche méthodologique" title="demTitle" dark />
      <div className="s-body">
        <div className="steps">
          {steps.map((step) => (
            <article className="step" key={step.n}>
              <div className="no">{step.n}</div>
              <h3><E k={step.t} /></h3>
              <p><E k={step.b} multi /></p>
            </article>
          ))}
        </div>
        <div className="dem-note"><E k="demNote" multi /></div>
      </div>
      <Foot section="04" page={6} />
    </Frame>
  );
}

function SlideData() {
  const cards: { k: CopyKey; t: CopyKey; b: CopyKey }[] = [
    { k: "data1k", t: "data1t", b: "data1b" },
    { k: "data2k", t: "data2t", b: "data2b" },
    { k: "data3k", t: "data3t", b: "data3b" },
    { k: "data4k", t: "data4t", b: "data4b" },
  ];
  return (
    <Frame>
      <Head section="05" kicker="Données et outils" title="dataTitle" />
      <div className="s-body">
        <div className="data-grid">
          {cards.map((card) => (
            <article className="data-card" key={card.k}>
              <span className="k"><E k={card.k} /></span>
              <h3><E k={card.t} /></h3>
              <p><E k={card.b} multi /></p>
            </article>
          ))}
        </div>
        <p className="data-foot"><E k="dataFoot" /></p>
      </div>
      <Foot section="05" page={7} />
    </Frame>
  );
}

function SlideScore() {
  const { copy } = useDeck();
  const models: { n: CopyKey; a: CopyKey; b: CopyKey; c: CopyKey; level: number }[] = [
    { n: "m1n", a: "m1a", b: "m1b", c: "m1c", level: 4 },
    { n: "m2n", a: "m2a", b: "m2b", c: "m2c", level: 3 },
    { n: "m3n", a: "m3a", b: "m3b", c: "m3c", level: 1 },
  ];
  const vars: CopyKey[] = ["v1", "v2", "v3", "v4", "v5", "v6"];
  return (
    <Frame>
      <Head section="06" kicker="Modélisation" title="scoreTitle" />
      <div className="s-body">
        <div className="score-top">
          <p className="score-lead"><E k="scoreLead" multi /></p>
          <div className="vars">
            {vars.map((key) => (
              <span key={key}><E k={key} /></span>
            ))}
          </div>
        </div>
        <div className="models">
          {models.map((model) => {
            const picked = copy[model.n] === copy.scorePick;
            return (
              <article className={cn("model", picked && "is-pick")} key={model.n}>
                {picked && <span className="pick">Retenu</span>}
                <h3><E k={model.n} /></h3>
                <div className="meter" aria-label="Lisibilité">
                  {Array.from({ length: 4 }, (_, i) => (
                    <i key={i} className={i < model.level ? "on" : ""} />
                  ))}
                </div>
                <span className="meter-label">Lisibilité</span>
                <ul>
                  <li><E k={model.a} /></li>
                  <li><E k={model.b} /></li>
                  <li><E k={model.c} /></li>
                </ul>
              </article>
            );
          })}
        </div>
        <div className="score-bottom">
          <p><E k="scoreInsight" multi /></p>
          <div className="metrics"><E k="scoreMetrics" multi /></div>
        </div>
      </div>
      <Foot section="06" page={8} />
    </Frame>
  );
}

function SlideChain() {
  const nodes: { n: string; t: CopyKey; b: CopyKey; out?: boolean }[] = [
    { n: "01", t: "n1t", b: "n1b" },
    { n: "02", t: "n2t", b: "n2b" },
    { n: "03", t: "n3t", b: "n3b" },
    { n: "04", t: "n4t", b: "n4b", out: true },
  ];
  return (
    <Frame>
      <Head section="07" kicker="Chaîne de décision" title="chTitle" />
      <div className="s-body">
        <div className="chain">
          {nodes.map((node, index) => (
            <span key={node.n} style={{ display: "contents" }}>
              <article className={cn("node", node.out && "is-out")}>
                <span className="idx">{node.n}</span>
                <h3><E k={node.t} /></h3>
                <p><E k={node.b} multi /></p>
              </article>
              {index < nodes.length - 1 && <div className="arrow" aria-hidden="true">→</div>}
            </span>
          ))}
        </div>
        <div className="ch-note"><E k="chNote" multi /></div>
      </div>
      <Foot section="07" page={9} />
    </Frame>
  );
}

function SlidePv() {
  return (
    <Frame className="slide-pv">
      <div className="panel-col">
        <img src={images.panel} alt="" />
      </div>
      <Head section="08" kicker="Dimensionnement photovoltaïque" title="pvTitle" />
      <div className="s-body">
        <div className="pv-grid">
          <div>
            <p className="pv-lead"><E k="pvLead" multi /></p>
            <div className="scheme">
              <div className="scheme-node dc">
                <b><E k="pvNode1" /></b>
                <span>champ</span>
              </div>
              <div className="arrow">→</div>
              <div className="scheme-node">
                <b><E k="pvNode2" /></b>
                <span>MPPT / PWM</span>
              </div>
              <div className="arrow">→</div>
              <div className="scheme-node">
                <b><E k="pvNode3" /></b>
                <span>autonomie</span>
              </div>
            </div>
            <div className="scheme-sub">
              <div className="scheme-node">
                <b><E k="pvNode4" /></b>
                <span>seulement si usage alternatif</span>
              </div>
              <div className="scheme-node dc">
                <b><E k="pvNode5" /></b>
                <span>éclairage, recharge, ou confort</span>
              </div>
            </div>
            <div className="hyps">
              {(["hyp1", "hyp2", "hyp3", "hyp4"] as const).map((key) => (
                <span key={key}><E k={key} /></span>
              ))}
            </div>
          </div>
          <div className="formulas">
            {([
              ["f1l", "f1eq", "f1n"],
              ["f2l", "f2eq", "f2n"],
              ["f3l", "f3eq", "f3n"],
            ] as const).map(([l, eq, n]) => (
              <article className="formula" key={l}>
                <span><E k={l} /></span>
                <strong><E k={eq} /></strong>
                <p><E k={n} multi /></p>
              </article>
            ))}
          </div>
        </div>
      </div>
      <Foot section="08" page={10} />
    </Frame>
  );
}

function SlideArchi() {
  const layers: { n: string; t: CopyKey; b: CopyKey; cls?: string }[] = [
    { n: "01", t: "l1t", b: "l1b" },
    { n: "02", t: "l2t", b: "l2b" },
    { n: "03", t: "l3t", b: "l3b", cls: "l3" },
    { n: "04", t: "l4t", b: "l4b", cls: "l4" },
  ];
  return (
    <Frame>
      <Head section="09" kicker="Architecture" title="arTitle" />
      <div className="s-body">
        <div className="arch">
          <div>
            <div className="layers">
              {layers.map((layer) => (
                <article className={cn("layer", layer.cls)} key={layer.n}>
                  <span className="n">{layer.n}</span>
                  <div>
                    <h3><E k={layer.t} /></h3>
                    <p><E k={layer.b} multi /></p>
                  </div>
                </article>
              ))}
            </div>
            <E k="arFlow" className="flow" />
          </div>
          <div className="exts">
            <article><span>Service</span><strong><E k="ext1" /></strong></article>
            <article><span>Saisie du lieu</span><strong><E k="ext2" /></strong></article>
            <article><span>Artefact</span><strong><E k="ext3" /></strong></article>
          </div>
        </div>
      </div>
      <Foot section="09" page={11} />
    </Frame>
  );
}

function SlideCase() {
  const { copy } = useDeck();
  const cap = parseMoney(copy.casCap) ?? 90000;
  const rows = [
    { label: copy.cfg1n, raw: copy.cfg1m, tone: statusTone(copy.cfg1v) },
    { label: copy.cfg2n, raw: copy.cfg2m, tone: statusTone(copy.cfg2v) },
    { label: copy.cfg3n, raw: copy.cfg3m, tone: statusTone(copy.cfg3v) },
  ].map((row) => ({ ...row, value: parseMoney(row.raw) }));
  const max = Math.max(cap, ...rows.map((row) => row.value ?? 0), 1) * 1.08;
  const configs: { n: CopyKey; s: CopyKey; p: CopyKey; m: CopyKey; v: CopyKey }[] = [
    { n: "cfg1n", s: "cfg1s", p: "cfg1p", m: "cfg1m", v: "cfg1v" },
    { n: "cfg2n", s: "cfg2s", p: "cfg2p", m: "cfg2m", v: "cfg2v" },
    { n: "cfg3n", s: "cfg3s", p: "cfg3p", m: "cfg3m", v: "cfg3v" },
  ];
  return (
    <Frame>
      <Head section="10" kicker="Étude de cas" title="casTitle" />
      <div className="s-body">
        <div className="case-grid">
          <figure className="case-photo">
            <img src={images.house} alt="Habitation des hautes terres avec un petit kit solaire" />
            <div className="badge"><E k="casBadge" /></div>
            <figcaption>
              <strong><E k="casPlace" /></strong>
            </figcaption>
          </figure>
          <div>
            <div className="chips">
              <div className="chip"><span>Soleil</span><b><E k="casPsh" /></b></div>
              <div className="chip"><span>Ménage</span><b><E k="casHh" /></b></div>
              <div className="chip"><span>Usages</span><b><E k="casUses" /></b></div>
              <div className="chip"><span>Besoin</span><b><E k="casLoad" /></b></div>
              <div className="chip"><span>Score</span><b><E k="casScore" /></b></div>
              <div className="chip"><span>Capacité</span><b><E k="casCap" /></b></div>
            </div>
            <div className="balance"><E k="casBalance" /></div>
            <div className="cfgs">
              {configs.map((cfg) => {
                const tone = statusTone(copy[cfg.v]);
                return (
                  <article className={cn("cfg", tone)} key={cfg.n}>
                    <span className="st"><E k={cfg.v} /></span>
                    <h3><E k={cfg.n} /></h3>
                    <div className="spec"><E k={cfg.s} /></div>
                    <div className="price"><E k={cfg.p} /></div>
                    <div className="month"><E k={cfg.m} /></div>
                  </article>
                );
              })}
            </div>
            <div className="payviz">
              <div className="capline" style={{ left: `${(cap / max) * 100}%` }}>
                <span>capacité</span>
              </div>
              {rows.map((row) => (
                <div className="pay-row" key={row.label}>
                  <span>{row.label}</span>
                  <div className="track">
                    <i
                      className={row.tone}
                      style={{ width: row.value ? `${Math.min(100, (row.value / max) * 100)}%` : "100%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="decision"><E k="casDecision" multi /></div>
            <div className="hyp-line"><E k="casHyp" multi /></div>
          </div>
        </div>
      </div>
      <Foot section="10" page={12} />
    </Frame>
  );
}

function SlideDemo() {
  return (
    <Frame>
      <Head section="11" kicker="Démonstration" title="demoTitle" />
      <div className="s-body">
        <div className="demo-grid">
          <div className="mini">
            <div className="mini-head">
              <div className="tag"><E k="miniTag" /></div>
              <h3><E k="miniTitle" /></h3>
            </div>
            <div className="mini-steps">
              <i className="done">Lieu</i>
              <i className="done">Ménage</i>
              <i className="on">Calcul</i>
              <i>Économie</i>
              <i>Décision</i>
            </div>
            <div className="mini-card">
              <div className="mini-map">
                <svg viewBox="0 0 300 132" aria-hidden="true">
                  <path d="M80 78 C 120 70, 150 48, 200 48" fill="none" stroke="#a97815" strokeDasharray="4 4" strokeWidth="1.4" />
                </svg>
                <i className="pin a" />
                <i className="pin b" />
              </div>
              <div className="coords">
                <div><span>Ménage</span><E k="coordA" /></div>
                <div><span>Référence</span><E k="coordB" /></div>
              </div>
              <div className="town"><E k="townPreview" /></div>
              <div className="worker">
                <b><E k="demoWorker" /></b>
                <span className="salary"><E k="salaryBadge" /></span>
                <p><E k="demoActivity" /> · éclairage et recharge</p>
              </div>
            </div>
          </div>
          <div className="callouts">
            {([
              ["01", "demo1t", "demo1b"],
              ["02", "demo2t", "demo2b"],
              ["03", "demo3t", "demo3b"],
            ] as const).map(([n, t, b]) => (
              <article key={n}>
                <span>{n}</span>
                <h3><E k={t} /></h3>
                <p><E k={b} multi /></p>
              </article>
            ))}
          </div>
        </div>
      </div>
      <Foot section="11" page={13} />
    </Frame>
  );
}

function SlideValidation() {
  const checks: { t: CopyKey; b: CopyKey }[] = [
    { t: "val1t", b: "val1b" },
    { t: "val2t", b: "val2b" },
    { t: "val3t", b: "val3b" },
    { t: "val4t", b: "val4b" },
  ];
  const talk: CopyKey[] = ["dis1", "dis2", "dis3", "dis4"];
  return (
    <Frame>
      <Head section="12" kicker="Validation et discussion" title="valTitle" />
      <div className="s-body">
        <div className="val-grid">
          <div className="val-col ctrl">
            <h3>Ce qui est contrôlé</h3>
            <div className="stack">
              {checks.map((item) => (
                <article className="val-card" key={item.t}>
                  <h3><E k={item.t} /></h3>
                  <p><E k={item.b} multi /></p>
                </article>
              ))}
            </div>
          </div>
          <div className="val-col dis">
            <h3>Ce que cela permet de discuter</h3>
            <div className="stack">
              {talk.map((key) => (
                <div className="dis-item" key={key}><E k={key} multi /></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Foot section="12" page={14} />
    </Frame>
  );
}

function SlideLimits() {
  const limits: { t: CopyKey; b: CopyKey }[] = [
    { t: "lim1t", b: "lim1b" },
    { t: "lim2t", b: "lim2b" },
    { t: "lim3t", b: "lim3b" },
  ];
  const pers: { t: CopyKey; b: CopyKey }[] = [
    { t: "per1t", b: "per1b" },
    { t: "per2t", b: "per2b" },
    { t: "per3t", b: "per3b" },
    { t: "per4t", b: "per4b" },
  ];
  return (
    <Frame>
      <Head section="13" kicker="Limites et perspectives" title="limTitle" />
      <div className="s-body">
        <div className="lim-grid">
          <div className="lim-col limits">
            <h3>Limites</h3>
            <div className="stack">
              {limits.map((item, index) => (
                <article className="lim-card" key={item.t}>
                  <span className="idx">0{index + 1}</span>
                  <h3><E k={item.t} /></h3>
                  <p><E k={item.b} multi /></p>
                </article>
              ))}
            </div>
          </div>
          <div className="lim-col pers">
            <h3>Perspectives</h3>
            <div className="stack">
              {pers.map((item, index) => (
                <article className="lim-card" key={item.t}>
                  <span className="idx">0{index + 1}</span>
                  <h3><E k={item.t} /></h3>
                  <p><E k={item.b} multi /></p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Foot section="13" page={15} />
    </Frame>
  );
}

function SlideConclusion() {
  const items: { n: string; k: CopyKey }[] = [
    { n: "01", k: "conc1" },
    { n: "02", k: "conc2" },
    { n: "03", k: "conc3" },
  ];
  return (
    <Frame>
      <Head section="14" kicker="Conclusion" title="concTitle" />
      <div className="s-body">
        <div className="conc-list">
          {items.map((item) => (
            <article className="conc-item" key={item.n}>
              <span>{item.n}</span>
              <p><E k={item.k} multi /></p>
            </article>
          ))}
        </div>
        <div className="conc-close"><E k="concClose" multi /></div>
      </div>
      <Foot section="14" page={16} />
    </Frame>
  );
}

function SlideQuestions() {
  return (
    <Frame tone="cover">
      <img className="cover-img" src={images.cover} alt="" />
      <div className="q-shade" />
      <div className="q-inner">
        <div className="dossier-tag">
          <Flag />
          <E k="university" />
        </div>
        <p className="q-thanks"><E k="qThanks" /></p>
        <h2 className="q-title"><E k="qTitle" /></h2>
        <p className="q-sub"><E k="qSub" multi /></p>
        <div className="q-meta">
          <div><span>Auteur</span><E k="author" /></div>
          <div><span>Encadreur</span><E k="supervisor" /></div>
          <div><span>Contact</span><E k="contact" /></div>
        </div>
      </div>
      <div className="cover-line" />
    </Frame>
  );
}

const VIEWS = [
  SlideCover,
  SlideThanks,
  SlideContext,
  SlideProblem,
  SlideObjectives,
  SlideMethod,
  SlideData,
  SlideScore,
  SlideChain,
  SlidePv,
  SlideArchi,
  SlideCase,
  SlideDemo,
  SlideValidation,
  SlideLimits,
  SlideConclusion,
  SlideQuestions,
];

export function SlideView({ index }: { index: number }) {
  const View = VIEWS[index] ?? SlideCover;
  return <View />;
}
