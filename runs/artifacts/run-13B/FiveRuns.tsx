"use client";
// Five runs, five marbles. Each blink of the small reader drops one marble onto a ruler, and a marble
// can only rest in a notch. Four land in the 0.3 notch, one in the 0.25 notch beside it, and the
// average sits between them. Then the ruler is swapped for the 0 to 50 one, whose notches are whole
// numbers, and the same five marbles settle into its notches.
import { Figure, defineFigure, cues, E, P, lerp, drop, q } from "../_figure";
import { Reader, Label, INK, MUTED } from "./world";

const BLINK = [0.9, 1.7, 2.5, 3.3, 4.1]; // five blinks, five runs
const LAG = 0.16; // the marble leaves just after its blink
const V1 = [0.3, 0.3, 0.25, 0.3, 0.3]; // run by run, on the 0 to 1 grid
const V2 = [15, 15, 14, 15, 15]; // on the 0 to 50 grid, whole numbers (illustrative)
const MEAN1 = V1.reduce((a, b) => a + b, 0) / V1.length; // 0.29
const MEAN2 = V2.reduce((a, b) => a + b, 0) / V2.length; // 14.8
const SWAP: [number, number] = [6.0, 7.0];
const R1 = 7, R2 = 5.5; // marble radius on each ruler

const C = cues({ mean: [5.2, 5.7], swap: [6.0, 7.0] });

type Lay = {
  X0: number; K: number; BT: number; rulerL: number; rulerR: number; sideX: number;
  tray: { x0: number; y: number; dx: number }; reader: { x: number; y: number }; readerLabel: { x: number; y: number };
  titleX: number; titleY: number; scaleY: number;
};
// The ruler's window runs from 0.2 to 0.4 on the 0 to 1 scale, which is 10 to 20 on the 0 to 50 one.
const DESK: Lay = {
  X0: 80, K: 2000, BT: 196, rulerL: 50, rulerR: 510, sideX: 624,
  tray: { x0: 120, y: 50, dx: 22 }, reader: { x: 70, y: 50 }, readerLabel: { x: 42, y: 90 },
  titleX: 624, titleY: 24, scaleY: 264,
};
const COMPACT: Lay = {
  X0: 30, K: 1500, BT: 230, rulerL: 14, rulerR: 346, sideX: 344,
  tray: { x0: 90, y: 60, dx: 22 }, reader: { x: 44, y: 60 }, readerLabel: { x: 16, y: 96 },
  titleX: 344, titleY: 24, scaleY: 298,
};

const x1 = (lay: Lay, s: number) => lay.X0 + (s - 0.2) * lay.K;
const x2 = (lay: Lay, n: number) => lay.X0 + (n - 10) * lay.K * 0.02;

// Marbles in one notch: three on the ruler, a fourth on top; one alone sits in the notch.
function heap(cx: number, base: number, r: number, j: number, n: number) {
  if (n === 1) return { x: cx, y: base - r };
  if (j < 3) return { x: q(cx + (j - 1) * 2 * r), y: q(base - r) };
  return { x: q(cx), y: q(base - 3 * r) };
}

// Where run i rests: the j-th marble to land on the same notch takes the j-th slot.
function rest(vals: number[], xOf: (v: number) => number, base: number, r: number, i: number) {
  const v = vals[i], j = vals.slice(0, i).filter((u) => u === v).length, n = vals.filter((u) => u === v).length;
  const p = heap(xOf(v), base, r, j, n);
  return { x: p.x, y: p.y };
}

function Scene({ t, lay }: { t: number; lay: Lay }) {
  const BT = lay.BT;
  const sw = C.p(t, "swap", E.io3);
  const meanOn = C.p(t, "mean", E.io2);
  const out = 1 - P(t, SWAP[0], SWAP[0] + 0.5), into = P(t, SWAP[0] + 0.5, SWAP[1]);

  // Each marble: in the tray, falling from its blink, then in its notch (sliding to the 0 to 50 notch in the swap).
  const marbles = V1.map((_, i) => {
    const from = { x: lay.tray.x0 + i * lay.tray.dx, y: lay.tray.y };
    const a = rest(V1, (v) => x1(lay, v), BT, R1, i);
    const b = rest(V2, (v) => x2(lay, v), BT, R2, i);
    const d = drop(t, { from, to: { x: a.x, y: a.y, r: R1 }, t0: BLINK[i] + LAG, r0: R1 });
    if (!d.landed) return { x: d.x, y: d.y, r: d.r };
    return { x: lerp(a.x, b.x, sw), y: lerp(a.y, b.y, sw), r: lerp(R1, R2, sw) };
  });

  const blinking = BLINK.some((b) => t >= b && t < b + 0.16);
  const lamp = blinking ? 1 : 0.25;
  const mx = lerp(x1(lay, MEAN1), x2(lay, MEAN2), sw);

  const ticks1 = [0.2, 0.25, 0.3, 0.35, 0.4];
  const ticks2 = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const labels2 = [10, 15, 20];

  return (
    <g>
      {/* the ruler: one bar, two scales swapped on it */}
      <rect x={q(lay.rulerL)} y={q(BT)} width={q(lay.rulerR - lay.rulerL)} height={8} rx={2} fill="none" style={{ stroke: MUTED }} strokeWidth={1.2} />

      <g opacity={q(out, 3)}>
        {ticks1.map((s) => (
          <line key={s} x1={q(x1(lay, s))} y1={BT + 8} x2={q(x1(lay, s))} y2={BT + 12} style={{ stroke: MUTED }} strokeWidth={1.2} />
        ))}
        {ticks1.map((s) => (
          <Label key={`l${s}`} x={x1(lay, s)} y={BT + 32} anchor="middle" size={12}>{s.toFixed(s === 0.2 || s === 0.3 || s === 0.4 ? 1 : 2)}</Label>
        ))}
      </g>
      <g opacity={q(into, 3)}>
        {ticks2.map((n) => (
          <line key={n} x1={q(x2(lay, n))} y1={BT + 8} x2={q(x2(lay, n))} y2={BT + 12} style={{ stroke: MUTED }} strokeWidth={1.2} />
        ))}
        {labels2.map((n) => (
          <Label key={`m${n}`} x={x2(lay, n)} y={BT + 32} anchor="middle" size={12}>{String(n)}</Label>
        ))}
      </g>

      <Label x={lay.sideX} y={lay.titleY} anchor="end">158 of 330 agreed</Label>
      <Label x={(lay.rulerL + lay.rulerR) / 2} y={lay.scaleY} anchor="middle" size={12}>
        {t < SWAP[0] + 0.5 ? "part of the 0 to 1 scale" : "the same part, on 0 to 50"}
      </Label>

      <Reader x={lay.reader.x} y={lay.reader.y} lamp={lamp} />
      <Label x={lay.readerLabel.x} y={lay.readerLabel.y}>Haiku, five runs</Label>

      {marbles.map((m, i) => (
        <circle key={i} cx={q(m.x)} cy={q(m.y)} r={q(m.r)} style={{ fill: INK, fillOpacity: 0.55, stroke: INK }} strokeWidth={1.2} />
      ))}

      <g opacity={q(meanOn, 3)}>
        <path d={`M${q(mx)} ${BT + 13}L${q(mx - 3.5)} ${BT + 20}L${q(mx + 3.5)} ${BT + 20}Z`} style={{ fill: INK }} />
        <Label x={mx} y={BT + 47} anchor="middle" size={12}>average</Label>
      </g>
    </g>
  );
}

const spec = defineFigure({
  dur: 7.6,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 310 },
  render: (t, _state, ctx) => <Scene t={t} lay={ctx.compact ? COMPACT : DESK} />,
});

export default function FiveRuns() {
  return <Figure spec={spec} />;
}
