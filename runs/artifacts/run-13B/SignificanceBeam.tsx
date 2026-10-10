"use client";
// The significance beam: two paragraphs weighed on a balance by the small reader. Paragraph A says
// a little and shows a little, so the pans sit level and nothing is flagged. Paragraph B says its
// subject matters far more than it shows, so the "says it matters" pan sinks and the reader flags
// it. Only significance is weighed here; the superficial-analysis scoring is not drawn. The pan
// weights are illustrative, not scores.
import { Figure, defineFigure, cues, E, P, lerp, fall, settle, tilt, q } from "../_figure";
import { TextLine, Reader, Ground, Label, INK, FLAG, MUTED } from "./world";

const C = cues({ slideA: 0.3, wobble: 2.5, clearA: 5.0, slideB: 5.6, swing: 7.5, flag: 8.2 });

const LINES = [190, 170, 180, 120]; // widths at desktop; a paragraph is four lines
const FLAG_ROW = 2;
const ROWS = [62, 80, 98, 116];
const TILT_A = tilt(2, 2); // paragraph A: level
const TILT_B = tilt(6, 1); // paragraph B: the says-it-matters pan sinks

// Items on the pans. side L = "says it matters", R = "shows evidence". offX from the pan's centre,
// stack = height already on the pan below this item. at = when it is dropped on.
const ITEMS = [
  { g: "A", side: "L", kind: "banner", text: "KEY", w: 40, h: 16, offX: 0, stack: 0, at: 1.4 },
  { g: "A", side: "R", kind: "block", w: 22, h: 12, offX: -12, stack: 0, at: 1.9 },
  { g: "A", side: "R", kind: "block", w: 22, h: 12, offX: 12, stack: 0, at: 2.2 },
  { g: "B", side: "L", kind: "banner", text: "PIVOTAL", w: 74, h: 17, offX: 0, stack: 0, at: 6.6 },
  { g: "B", side: "L", kind: "banner", text: "CRUCIAL", w: 74, h: 17, offX: 0, stack: 19, at: 6.9 },
  { g: "B", side: "R", kind: "block", w: 16, h: 12, offX: 0, stack: 0, at: 7.3 },
] as const;

type Lay = {
  P: { x: number; y: number }; L: number; HANG: number; PW: number; ground: number; k: number; W: number;
  x0: number; reader: { x: number; y: number }; readerLabel: { x: number; y: number; anchor: "start" };
  paraLabel: { x: number; y: number }; labelSize: number;
};
const DESK: Lay = {
  P: { x: 430, y: 120 }, L: 140, HANG: 70, PW: 55, ground: 270, k: 1, W: 640,
  x0: 24, reader: { x: 120, y: 36 }, readerLabel: { x: 142, y: 40, anchor: "start" },
  paraLabel: { x: 24, y: 168 }, labelSize: 12.5,
};
const COMPACT: Lay = {
  P: { x: 180, y: 200 }, L: 120, HANG: 60, PW: 50, ground: 340, k: 0.7, W: 360,
  x0: 14, reader: { x: 60, y: 34 }, readerLabel: { x: 82, y: 38, anchor: "start" },
  paraLabel: { x: 14, y: 160 }, labelSize: 12,
};

function Scene({ t, lay }: { t: number; lay: Lay }) {
  const Pv = lay.P, L = lay.L, HANG = lay.HANG, PW = lay.PW;
  const clearA = C.at("clearA");

  // The beam: level under paragraph A (a small wobble as its weights land), then B's weights swing it.
  const theta = t >= C.at("swing")
    ? settle(t, { t0: C.at("swing"), from: 0, to: TILT_B, zeta: 0.4, omega: 7 })
    : t >= C.at("wobble") ? settle(t, { t0: C.at("wobble"), from: 0.05, to: TILT_A }) : 0;
  const c = Math.cos(theta), s = Math.sin(theta);
  const ends = { L: { x: Pv.x - L * c, y: Pv.y - L * s }, R: { x: Pv.x + L * c, y: Pv.y + L * s } };
  const rimLevel = Pv.y + HANG;
  const rimY = (side: "L" | "R") => ends[side].y + HANG;

  // Page lines: paragraph A slides in under the reader, then out to the left; B slides in after.
  const line = (g: "A" | "B", i: number) => {
    const w = LINES[i] * lay.k, start = g === "A" ? C.at("slideA") : C.at("slideB"), st = start + 0.1 * i;
    const x0 = lay.x0, off = -w - 10;
    const inK = E.o3(P(t, st, st + 0.6));
    const out = g === "A" ? E.i3(P(t, clearA, clearA + 0.5)) : 0;
    const x = lerp(lerp(off, x0, inK), off, out);
    const dim = P(t, st, st + 0.3) * (1 - out);
    const flagged = g === "B" && i === FLAG_ROW && t >= C.at("flag");
    return <TextLine key={`${g}${i}`} x={x} y={ROWS[i]} w={w} state={flagged ? "flag" : "plain"} dim={dim} />;
  };

  // Items on the pans. Each falls onto its pan at rest, then rides with the pan as it tilts.
  const item = (it: (typeof ITEMS)[number], n: number) => {
    const rimX = ends[it.side].x, restBottom = rimLevel + 2 - it.stack, restTop = restBottom - it.h;
    const y = fall(t, { from: restTop - 80, to: restTop, t0: it.at }) + (rimY(it.side) - rimLevel);
    const x = rimX + it.offX * lay.k - it.w / 2;
    const w = it.w, h = it.h;
    const fade = it.g === "A" ? 1 - P(t, clearA, clearA + 0.5) : 1;
    const op = (t >= it.at ? 1 : 0) * fade;
    if (it.kind === "banner") {
      return (
        <g key={n} opacity={q(op, 3)}>
          <rect x={q(x)} y={q(y)} width={q(w)} height={q(h)} rx={3} style={{ fill: INK }} />
          <text x={q(x + w / 2)} y={q(y + h / 2 + 4.5)} textAnchor="middle" fontSize={12} fontWeight={600} style={{ fill: "var(--background)" }}>{it.text}</text>
        </g>
      );
    }
    return <rect key={n} x={q(x)} y={q(y)} width={q(w)} height={q(h)} rx={2} opacity={q(op, 3)} style={{ fill: MUTED, fillOpacity: 0.9 }} />;
  };

  // The reader is lit while it reads each paragraph.
  const reading = P(t, 0.8, 1.0) * (1 - P(t, 4.6, 4.9)) + P(t, 6.2, 6.4) * (1 - P(t, 8.6, 8.9));
  const lamp = 0.25 + 0.75 * reading;
  const verdictA = t >= 4.4 && t < clearA;
  const flagged = t >= C.at("flag");
  const flagX = lay.x0 + LINES[FLAG_ROW] * lay.k + 8, flagY = ROWS[FLAG_ROW] + 10;

  const pan = (side: "L" | "R", label: string) => {
    const e = ends[side], y = e.y + HANG;
    return (
      <g key={side}>
        <line x1={q(e.x)} y1={q(e.y)} x2={q(e.x - PW)} y2={q(y)} style={{ stroke: MUTED }} strokeWidth={1.2} />
        <line x1={q(e.x)} y1={q(e.y)} x2={q(e.x + PW)} y2={q(y)} style={{ stroke: MUTED }} strokeWidth={1.2} />
        <path d={`M${q(e.x - PW)} ${q(y)}Q${q(e.x)} ${q(y + 22)} ${q(e.x + PW)} ${q(y)}`} fill="none" style={{ stroke: INK }} strokeWidth={1.4} />
        <Label x={e.x} y={rimY(side) + 30} anchor="middle" size={lay.labelSize}>{label}</Label>
      </g>
    );
  };

  return (
    <g>
      <Ground x1={20} x2={lay.W - 20} y={lay.ground} />

      {/* the balance */}
      <path d={`M${q(Pv.x)} ${q(Pv.y)}L${q(Pv.x - 14)} ${q(lay.ground)}L${q(Pv.x + 14)} ${q(lay.ground)}Z`} fill="none" style={{ stroke: INK }} strokeWidth={1.5} />
      {pan("L", "says it matters")}
      {pan("R", "shows evidence")}
      {ITEMS.map((it, n) => item(it, n))}
      <g transform={`rotate(${q((theta * 180) / Math.PI, 3)} ${q(Pv.x)} ${q(Pv.y)})`}>
        <line x1={q(Pv.x - L)} y1={q(Pv.y)} x2={q(Pv.x + L)} y2={q(Pv.y)} style={{ stroke: INK }} strokeWidth={2.5} strokeLinecap="round" />
      </g>
      <circle cx={q(Pv.x)} cy={q(Pv.y)} r={4.5} style={{ fill: INK }} />

      {/* the page, and the reader above it */}
      {LINES.map((_, i) => line("A", i))}
      {LINES.map((_, i) => line("B", i))}
      <Label x={lay.paraLabel.x} y={lay.paraLabel.y}>{t < C.at("slideB") ? "paragraph A" : "paragraph B"}</Label>
      <Reader x={lay.reader.x} y={lay.reader.y} lamp={lamp} />
      <Label x={lay.readerLabel.x} y={lay.readerLabel.y} anchor={lay.readerLabel.anchor}>small reader</Label>

      {verdictA && <Label x={flagX} y={flagY}>no flag</Label>}
      {flagged && <text x={q(flagX)} y={q(flagY)} fontSize={lay.labelSize} fontWeight={600} style={{ fill: FLAG }}>flag</text>}
    </g>
  );
}

const spec = defineFigure({
  dur: 9,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 350 },
  render: (t, _state, ctx) => <Scene t={t} lay={ctx.compact ? COMPACT : DESK} />,
});

export default function SignificanceBeam() {
  return <Figure spec={spec} />;
}
