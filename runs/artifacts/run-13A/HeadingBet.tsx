"use client";

// "A bet about headings": what happened.
// Claim: he bet Haiku would rank every heading 1.0 and lost (means 0.47, 0.52, 0.50; 0.05 up to 0.90), but all three
// runs quoted the same seven lines as the reason a section sounded important, and the rewrite cut those seven.
// Only the numbers in the post are data. The other row lengths and positions of the seven lines are illustrative.
import { Figure, defineFigure, E, P, drawOn, lerp, q, rng } from "../_figure";
import { Bench, DIM, FAINT, BODY, Haiku, INK, MONO, Mackenzie, MARK, OK, Scissors, Scrap, Slip } from "./world";

const C = {
  hand: [0.2, 0.6], chalk: [0.6, 1.5], bet: [1.3, 1.8], hand_down: [1.7, 2.1],
  poles: [2.2, 3.1], runs: 3.2, shrug: [4.3, 5.0], partB: [5.2, 5.8],
  throw: 6.0, label: [7.7, 8.2], snip: 8.8,
} as const;
const STEP = 0.32; // seconds per snipped line
const ROWS = 14, HOT = [1, 3, 4, 6, 8, 9, 12]; // seven lines (positions illustrative)
const RUNS = [{ v: 0.47, dx: 0 }, { v: 0.52, dx: 45 }, { v: 0.5, dx: 90 }];

type L = {
  W: number; H: number; compact: boolean; gy: number;
  slip: { x: number; top: number; w: number; step: number }; hx: number; feet: number[]; ss: number;
};
const land: L = { W: 740, H: 340, compact: false, gy: 252, slip: { x: 592, top: 38, w: 220, step: 15 }, hx: 440, feet: [112, 192, 272], ss: 1 };
const port: L = { W: 360, H: 612, compact: true, gy: 208, slip: { x: 210, top: 304, w: 200, step: 15 }, hx: 46, feet: [372, 436, 498], ss: 0.9 };

const WALL = { l: 108, r: 358, h: 160 };
const POLE = { src: 128, rel: 338 }, RUN0 = 182;

const spec = defineFigure({
  dur: 12.4,
  size: { W: land.W, H: land.H },
  compact: { W: port.W, H: port.H },
  setup: () => {
    const r = rng(7);
    return { len: Array.from({ length: ROWS }, () => r.range(0.55, 0.95)) };
  },
  render: (t, st, { compact }) => {
    const L = compact ? port : land, fs = compact ? 12 : 11;
    const gy = L.gy, yOf = (v: number) => gy - v * WALL.h;

    // Part A: the wall
    const hand = E.io2(P(t, C.hand[0], C.hand[1])) * (1 - E.io2(P(t, C.hand_down[0], C.hand_down[1])) * 0.6);
    const chalk = E.io2(P(t, C.chalk[0], C.chalk[1]));
    const shr = E.io2(P(t, C.shrug[0], C.shrug[1]));
    const pole = E.o3(P(t, C.poles[0], C.poles[1]));
    const pen = (x: number, v: number, k: number) => {
      const tip = yOf(v), top = tip - 20;
      return (
        <g opacity={q(Math.min(1, k * 4))}>
          <line x1={x} x2={x} y1={gy} y2={q(lerp(gy, top, k))} stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
          {k > 0.98 && <path d={`M${x} ${q(tip - 6)} L${x + 17} ${q(tip)} L${x} ${q(tip + 6)} Z`} fill={INK} />}
        </g>
      );
    };

    // Part B: the long slip, the three strings, the cuts
    const { x: sx, top, w, step } = L.slip, h = ROWS * step + 24, left = sx - w / 2, right = sx + w / 2;
    const rowY = (i: number) => top + 20 + i * step;
    const inB = E.o2(P(t, C.partB[0], C.partB[1]));
    const cutAt = (j: number) => C.snip + j * STEP + 0.2; // when hot line j drops
    const cutOf = (i: number) => { const j = HOT.indexOf(i); return j < 0 ? 0 : P(t, cutAt(j), cutAt(j) + 0.7); };
    const landAt = (hi: number, j: number) => C.throw + hi * 0.4 + j * 0.07 + 0.5;
    const hotK = (j: number) => E.o2(P(t, landAt(0, j) - 0.1, landAt(2, j)));

    const scale = L.ss;
    const hs = compact ? 1.15 : 1.1;
    const hot = Math.floor((t - C.snip) / STEP);
    const sj = Math.max(0, Math.min(HOT.length - 1, hot)), pj = Math.max(0, sj - 1);
    const mv = hot < 0 ? 0 : E.io2(P(t - C.snip - sj * STEP, 0, 0.16));
    // heap of the seven cut scraps, below the slip; scissors park beside it
    const heapY = top + h + 18;
    const slot = (j: number) => ({ x: sx + (j % 2 ? 7 : -7) - 8, y: heapY + j * 5, rot: [-4, 3, 2, -5, 4, -2, 5][j] });
    const arrive = E.io3(P(t, C.snip - 0.8, C.snip - 0.05)), leave = E.io3(P(t, C.snip + HOT.length * STEP + 0.1, C.snip + HOT.length * STEP + 0.8));
    const spX = lerp(right + 4 + 40 * (1 - arrive), left - (compact ? 70 : 70), leave);
    const spY0 = lerp(rowY(HOT[pj]), rowY(HOT[sj]), mv);
    const spY = lerp(spY0, heapY + 14, leave);
    const dt = t - C.snip - sj * STEP;
    const snipK = hot >= 0 && hot < HOT.length && dt > 0.1 && dt < 0.28 ? Math.sin(((dt - 0.1) / 0.18) * Math.PI) : 0;

    return (
      <g style={{ fontFamily: MONO }}>
        {/* wall, ground */}
        <rect x={WALL.l} y={gy - WALL.h - 16} width={WALL.r - WALL.l} height={WALL.h + 16} fill={BODY} stroke={FAINT} />
        <line x1={0} x2={compact ? 360 : 372} y1={gy} y2={gy} stroke={DIM} strokeWidth={1.4} />

        {/* the bet */}
        <line x1={WALL.l + 8} x2={WALL.r - 8} y1={yOf(1)} y2={yOf(1)} stroke={INK} strokeWidth={2.2} strokeLinecap="round" {...drawOn(chalk)} />
        <text x={WALL.l + 10} y={yOf(1) - 8} fontSize={fs + 1} fill={INK} opacity={q(E.o2(P(t, C.bet[0], C.bet[1])))}>I bet: 1.0</text>

        {/* heading poles: only the two the post names */}
        {pen(POLE.src, 0.05, pole)}
        {pen(POLE.rel, 0.9, pole)}
        {pole > 0.98 && (
          <g fontSize={fs} fill={INK}>
            <text x={POLE.src - 14} y={gy + 17}>0.05</text>
            <text x={POLE.src - 14} y={gy + 17 + fs + 3} fill={DIM}>source list</text>
            <text x={POLE.rel + 22} y={gy + 17} textAnchor="end">0.90</text>
            <text x={POLE.rel + 22} y={gy + 17 + fs + 3} textAnchor="end" fill={DIM}>first relaxation</text>
          </g>
        )}

        {/* three run means, one small Haiku head each */}
        {RUNS.map((r, i) => {
          const k = E.i2(P(t, C.runs + i * 0.22, C.runs + i * 0.22 + 0.5));
          const y = lerp(gy - 215, yOf(r.v), k), x = RUN0 + r.dx;
          if (t < C.runs + i * 0.22) return null;
          return (
            <g key={i}>
              <circle cx={x} cy={q(y)} r={7} fill={BODY} stroke={INK} strokeWidth={1.4} />
              <circle cx={x - 2.5} cy={q(y - 1)} r={1} fill={INK} /><circle cx={x + 2.5} cy={q(y - 1)} r={1} fill={INK} />
              <text x={x} y={q(y - 13)} textAnchor="middle" fontSize={fs} fill={INK} opacity={k > 0.98 ? 1 : 0}>{r.v.toFixed(2)}</text>
            </g>
          );
        })}

        <g transform={`translate(${compact ? 48 : 58} ${gy}) scale(${compact ? -0.98 : -1.02} ${compact ? 0.98 : 1.02})`}>
          <Mackenzie x={0} y={0} handUp={hand} frown={0.35 * shr} tilt={-6 * shr} />
        </g>

        {/* part B */}
        <g opacity={q(inB)}>
          <Slip x={sx} y={top + h / 2} w={w} h={h} bars={[]} />
          {Array.from({ length: ROWS }, (_, i) => {
            const j = HOT.indexOf(i), c = cutOf(i), y = rowY(i), k = j < 0 ? 0 : hotK(j);
            const len = (w - 28) * st.len[i];
            if (c > 0) return <rect key={i} x={left + 10} y={y - step / 2 + 2} width={w - 20} height={step - 4} rx={3} fill="none" stroke={FAINT} strokeDasharray="3 3" />;
            return (
              <g key={i}>
                {j >= 0 && <rect x={left + 6} y={y - step / 2 + 1} width={w - 12} height={step - 2} rx={3} fill={OK} opacity={q(0.28 * k)} />}
                <line x1={left + 14} x2={q(left + 14 + len)} y1={y} y2={y} stroke={j >= 0 && k > 0.5 ? INK : DIM} strokeWidth={3.5} strokeLinecap="round" />
              </g>
            );
          })}
          {HOT.map((row, j) => {
            const c = cutAt(j);
            if (t < c) return null;
            const f = E.i2(P(t, c, c + 0.9)), len = (w - 28) * st.len[row], sl = slot(j);
            return (
              <Scrap key={j} x={lerp(left + 14 + len / 2, sl.x, f)} y={lerp(rowY(row), sl.y, f)} w={len + 6} h={step - 5} rot={sl.rot * f + (j % 2 ? 1 : -1) * 10 * Math.sin(f * Math.PI)}>
                <rect x={-(len + 6) / 2} y={-(step - 5) / 2} width={len + 6} height={step - 5} rx={2} fill={MARK} opacity={0.3} />
                <line x1={-len / 2 + 3} x2={len / 2 - 3} y1={0} y2={0} stroke={DIM} strokeWidth={3.5} strokeLinecap="round" />
              </Scrap>
            );
          })}

          {/* three Haikus, one string each to every one of the seven lines */}
          {[0, 1, 2].map((hi) => {
            const fy = L.feet[hi], on = t > C.throw + hi * 0.4 && t < C.throw + hi * 0.4 + 0.9;
            return (
              <g key={hi}>
                <Bench x={L.hx} y={fy} w={44} />
                <Haiku x={L.hx} y={fy} s={hs} raise={on ? 0.3 : 0} card={false} />
              </g>
            );
          })}
          {[0, 1, 2].map((hi) => {
            const a = { x: L.hx + 11 * hs, y: L.feet[hi] - (12 + 12) * hs };
            return HOT.map((row, j) => {
              const k = E.io2(P(t, C.throw + hi * 0.4 + j * 0.07, landAt(hi, j)));
              if (k <= 0) return null;
              const b = { x: left + 4, y: rowY(row) };
              const d = `M${q(a.x)} ${q(a.y)}Q${q((a.x + b.x) / 2)} ${q((a.y + b.y) / 2 + 18)} ${q(b.x)} ${q(b.y)}`;
              return <path key={`${hi}-${j}`} d={d} fill="none" stroke={DIM} strokeWidth={1} opacity={q(1 - 0.7 * Math.min(1, cutOf(row) * 2.8))} {...drawOn(k)} />;
            });
          })}
          {HOT.map((row, j) => {
            if (hotK(j) <= 0) return null;
            if (cutOf(row) > 0) return <circle key={j} cx={left + 4} cy={rowY(row)} r={3.2} fill="none" stroke={DIM} strokeWidth={1} strokeDasharray="2 2" />;
            return <circle key={j} cx={left + 4} cy={rowY(row)} r={3.2} fill={OK} stroke={INK} strokeWidth={1} opacity={q(hotK(j))} />;
          })}
          <text x={sx} y={top - 9} textAnchor="middle" fontSize={fs + 1} fill={INK} opacity={q(E.o2(P(t, C.label[0], C.label[1])))}>same 7 lines</text>
        </g>

        {/* the rewriter */}
        {t > C.snip - 0.9 && <Scissors x={q(spX)} y={q(spY)} s={scale} open={snipK} rot={90} />}
      </g>
    );
  },
});

export default function HeadingBet() {
  return <Figure spec={spec} />;
}
