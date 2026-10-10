"use client";

// Heading bet. A page of heading bars and body bars. First every heading is at full ink, loud (the
// bet). They dim to muted, with no glow. The judge lamp sweeps the page three times; each sweep
// lights the same seven body lines a little brighter. Then those seven fall out of the page and land
// as a small stack of accent bars on the ground beside it, and the page closes up.
import { Figure, defineFigure, cues, E, lerp, q } from "../_figure";
import { Frame, Street, Judge, labels, FG, MUTED, ACCENT } from "./world";

const C = cues({
  dim: [1.2, 1.8],
  lamp: [1.6, 1.9],
  labels: [1.8, 2.2],
  s1: [1.8, 2.7],
  s2: [2.95, 3.85],
  s3: [4.1, 5.0],
  drop: [5.2, 5.9],
});
const SWEEPS = ["s1", "s2", "s3"] as const;
const LEVELS = [0.45, 0.7, 1]; // how bright a lit line is after each sweep

type Row = { kind: "H" | "B"; len: number; lit?: boolean };
// four sections: a heading, then its body lines. The seven lit lines are the ones the three runs quoted.
const ROWS: Row[] = [
  { kind: "H", len: 0.55 },
  { kind: "B", len: 0.95, lit: true },
  { kind: "B", len: 0.9 },
  { kind: "B", len: 0.7, lit: true },
  { kind: "H", len: 0.45 },
  { kind: "B", len: 0.95, lit: true },
  { kind: "B", len: 0.92 },
  { kind: "B", len: 0.96, lit: true },
  { kind: "B", len: 0.6 },
  { kind: "H", len: 0.6 },
  { kind: "B", len: 0.93, lit: true },
  { kind: "B", len: 0.97 },
  { kind: "B", len: 0.8, lit: true },
  { kind: "H", len: 0.4 },
  { kind: "B", len: 0.95 },
  { kind: "B", len: 0.88 },
  { kind: "B", len: 0.5, lit: true },
];
const LIT = ROWS.flatMap((r, i) => (r.lit ? [i] : [])); // the seven rows, in reading order
const PAD = 12;
const INSET = 14;
const ROW = { H: 16, B: 10 };
const BAR = { H: 6, B: 4 };

const spec = defineFigure({
  dur: 6,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 320 },
  setup: () => ({}),
  render: (t, _S, { W, H, compact }) => {
    const L = labels(compact);
    const G = compact ? H - 30 : H - 32; // the ground line the page stands on
    const sw = compact ? 150 : 240; // sheet width
    const sx = compact ? 16 : 40; // sheet left
    const textW = sw - INSET * 2;
    const jx = compact ? W - 42 : W - 60;
    const js = compact ? 0.8 : 1;
    // the stack of the seven cut lines, on the ground beside the page
    const stX = compact ? sx + sw + 14 : sx + sw + 18; // stack left
    const stW = compact ? 58 : 80; // a stack bar's length at len 1
    const stP = compact ? 6 : 7; // stack pitch

    const dimK = C.p(t, "dim", E.io2); // headings go from full ink to muted
    const lampK = C.p(t, "lamp", E.io2);
    const fall = C.p(t, "drop", E.io2); // the seven lines fall out, then the page closes up
    const labelK = C.p(t, "labels", E.io2);

    // Row heights: a dropped line shrinks as it falls, so the rows below close up.
    const rowH = (r: Row) => (r.lit ? ROW.B * (1 - fall) : ROW[r.kind]);
    const pageH = PAD * 2 + ROWS.reduce((s, r) => s + rowH(r), 0);
    const top = G - pageH;

    // Each sweep's scan line, as a fraction of the page's height (0 before, 1 after).
    const scanY = SWEEPS.map((id) => top + pageH * C.p(t, id));

    const rows = ROWS.reduce<{ r: Row; i: number; rt: number; cy: number; k: number }[]>((acc, r, i) => {
      const prev = acc[acc.length - 1];
      const rt = prev ? prev.rt + rowH(prev.r) : top + PAD;
      const base = ROW[r.kind];
      const cy = rt + base / 2;
      // a lit line brightens as each sweep's scan passes it; the brightest sweep so far wins
      const k = r.lit ? Math.max(...SWEEPS.map((_, n) => LEVELS[n] * Math.min(1, Math.max(0, (scanY[n] - cy) / 16)))) : 0;
      acc.push({ r, i, rt, cy, k });
      return acc;
    }, []);

    const h1 = rows[0];
    // the stack's bottom bar sits on the ground; the rest stand on it, the first cut line at the bottom
    const stackTop = G - BAR.B - (LIT.length - 1) * stP - BAR.B;
    const gx = sx + sw + 18;

    return (
      <g>
        <defs>
          <clipPath id="prose-heading-bet-clip">
            <rect width={W} height={G} />
          </clipPath>
        </defs>
        <g clipPath="url(#prose-heading-bet-clip)">
          <Street x={0} y={G} w={W} />

          {/* the sheet */}
          <rect x={q(sx)} y={q(top)} width={q(sw)} height={q(pageH)} fill={MUTED} fillOpacity={0.3} />

          {rows.map(({ r, i, rt, k }) => {
            const base = ROW[r.kind];
            const bar = BAR[r.kind];
            const bw = Math.max(2, textW * r.len);
            const by = rt + (base - bar) / 2;
            if (r.kind === "H") {
              // loud: full ink; dims to muted with no glow (the muted bar underneath is the end state)
              return (
                <g key={i}>
                  <rect x={q(sx + INSET)} y={q(by)} width={q(bw)} height={bar} fill={MUTED} fillOpacity={0.7} />
                  <rect x={q(sx + INSET)} y={q(by)} width={q(bw)} height={bar} fill={FG} fillOpacity={1 - dimK} />
                </g>
              );
            }
            if (r.lit) {
              // a dropped line falls out of the page and lands on the stack, in accent
              const j = LIT.indexOf(i);
              const tx = stX;
              const ty = G - BAR.B - j * stP - BAR.B;
              const x = lerp(sx + INSET, tx, fall);
              const y = lerp(by, ty, fall * fall); // gravity: it speeds up as it goes
              const w = lerp(bw, Math.max(2, stW * r.len), fall);
              return (
                <g key={i}>
                  <rect x={q(x)} y={q(y)} width={q(w)} height={bar} fill={MUTED} fillOpacity={0.7 * (1 - fall)} />
                  <rect x={q(x)} y={q(y)} width={q(w)} height={bar} fill={ACCENT} fillOpacity={k} />
                </g>
              );
            }
            return <rect key={i} x={q(sx + INSET)} y={q(by)} width={q(bw)} height={bar} fill={MUTED} fillOpacity={0.7} />;
          })}

          {/* the judge's three sweeps: a scan line down the page, one per run */}
          {SWEEPS.map((id, n) => {
            const p = C.p(t, id);
            const o = Math.min(1, p * 8, (1 - p) * 8);
            if (o <= 0) return null;
            return <rect key={id} x={q(sx - 8)} y={q(scanY[n] - 1)} width={q(sw + 16)} height={2} fill={ACCENT} opacity={o} />;
          })}

          {/* the judge stands to the right of the page and lights as it starts to read */}
          <Judge x={jx} y={G} s={js} aim={14} k={lampK} id="prose-heading-bet-glow" />

          {/* labels: beside the objects at full width, stacked above the page when compact */}
          {compact ? (
            <g>
              <text x={0} y={18} {...L.label} fill={FG}>the bet: every heading loud</text>
              <text x={0} y={36} {...L.label} fill={FG} opacity={labelK}>three runs, same seven lines</text>
              <text x={0} y={53} {...L.small} fill={MUTED} opacity={labelK}>0.47 / 0.52 / 0.50</text>
            </g>
          ) : (
            <g>
              <text x={q(gx)} y={q(h1.cy + 4)} {...L.label} fill={FG}>the bet: every heading loud</text>
              <text x={q(gx)} y={q(h1.cy + 21)} {...L.label} fill={FG} opacity={labelK}>three runs, same seven lines</text>
              <text x={q(gx)} y={q(h1.cy + 38)} {...L.small} fill={MUTED} opacity={labelK}>0.47 / 0.52 / 0.50</text>
            </g>
          )}

          {/* the stack's label: beside it at full width, above it when compact (the judge is at the right) */}
          {compact ? (
            <g>
              <text x={q(stX)} y={q(stackTop - 22)} {...L.label} fill={FG} opacity={fall}>the seven</text>
              <text x={q(stX)} y={q(stackTop - 6)} {...L.label} fill={FG} opacity={fall}>the rewrite cut</text>
            </g>
          ) : (
            <text x={q(stX + stW + 12)} y={q(G - 12)} {...L.label} fill={FG} opacity={fall}>the seven the rewrite cut</text>
          )}
        </g>
      </g>
    );
  },
});

export default function HeadingBet() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
