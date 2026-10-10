"use client";

// Hero: two readers in series, then a rewrite that cuts a little too much.
// Claim: the gate catches listed words; five asks of a small model catch habits no list can see; on his own
// posts the cleanup made one place worse, and he ships it anyway.
import { Figure, defineFigure, E, P, lerp, q } from "../_figure";
import { Belt, Bench, DIM, Gate, Haiku, INK, MONO, Mackenzie, Scrap, Slip, SLIP, SLIP_BIG, CH } from "./world";

// Beats, in seconds. The belt is a train of slips that shifts one pitch in (s: -1 -> 0), rests while each machine
// works on the slip under it, then shifts one pitch on (s: 0 -> 1) so the cut slip arrives at Mackenzie.
const C = {
  belt_in: [0, 1.2], stamp: [1.4, 2.5], inked: 1.9,
  cards: [2.6, 3.3], flag: [3.5, 3.9], cards_down: [4.5, 5.0],
  descend: [4.4, 4.9], snip: 5.0, settle: [5.2, 5.8], lift: [5.9, 6.3],
  belt_out: [6.4, 7.8], frown: [7.9, 8.9], label: [8.7, 9.5],
} as const;

type L = {
  W: number; H: number; compact: boolean; vertical: boolean;
  at: (idx: number) => { x: number; y: number }; pitch: number;
  slip: { w: number; h: number; fs: number };
};
const land: L = { W: 740, H: 296, compact: false, vertical: false, at: (i) => ({ x: 96 + 156 * i, y: 262 }), pitch: 156, slip: SLIP };
const port: L = { W: 360, H: 810, compact: true, vertical: true, at: (i) => ({ x: 130, y: 140 + 190 * i }), pitch: 190, slip: SLIP_BIG };

// Scissors, local: two crossed halves, each a blade plus a shank ending in a finger loop. Origin = pivot, blades down.
function Shears({ x, y, s, open, rot, armFrom }: { x: number; y: number; s: number; open: number; rot: number; armFrom: [number, number] }) {
  const a = 6 + 14 * open;
  const half = (sign: number) => (
    <g transform={`rotate(${q(sign * a)})`}>
      <path d="M0 -3 L-4.5 3 L-1.5 44 L1 44 L4 3 Z" transform={`scale(${sign} 1)`} fill="var(--background)" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d={`M0 -3 L${sign * 4} -22`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <ellipse cx={sign * 6} cy={-31} rx={6.5} ry={9} transform={`rotate(${sign * 10} ${sign * 6} -31)`} fill="none" stroke={INK} strokeWidth={2.6} />
    </g>
  );
  return (
    <g>
      <line x1={armFrom[0]} y1={armFrom[1]} x2={q(x)} y2={q(y - 40 * s)} stroke={DIM} strokeWidth={4} strokeLinecap="round" />
      <g transform={`translate(${q(x)} ${q(y)}) rotate(${q(rot)}) scale(${s})`}>
        {half(-1)}{half(1)}
        <circle r={2.4} fill={INK} />
      </g>
    </g>
  );
}

const slips = [
  { id: "E", k: -1, bars: [0.7, 0.5, 0.75] },
  { id: "A", k: 0, bars: [0.8, 0.62, 0.72] },
  { id: "B", k: 1, bars: [0.75, 0.7, 0.55] },
  { id: "C", k: 2, bars: [] as number[] },
  { id: "G", k: 3, bars: [0.6, 0.75, 0.45] },
];

const spec = defineFigure({
  dur: 9.8,
  size: { W: land.W, H: land.H },
  compact: { W: port.W, H: port.H },
  render: (t, _s, { compact }) => {
    const L = compact ? port : land;
    const { w, h, fs } = L.slip;
    const sh = -1 + E.io3(P(t, C.belt_in[0], C.belt_in[1])) + E.io3(P(t, C.belt_out[0], C.belt_out[1])) + 0; // -1 -> 0 -> 1
    const phase = sh * L.pitch;
    const pos = (k: number) => L.at(k + sh);
    const A0 = L.at(0), B0 = L.at(1), C0 = L.at(2);
    const bottom = (y: number) => y + h / 2;

    // gate
    const press = E.io2(P(t, C.stamp[0], lerp(C.stamp[0], C.stamp[1], 0.4))) - E.io2(P(t, lerp(C.stamp[0], C.stamp[1], 0.6), C.stamp[1]));
    const mark = E.o3(P(t, C.inked, C.inked + 0.25));
    // judge: five identical Haikus, same card each, brief
    const raise = (i: number) => E.o3(P(t, C.cards[0] + i * 0.05, C.cards[1] + i * 0.05)) * (1 - E.io2(P(t, C.cards_down[0], C.cards_down[1])));
    const flag = E.back(P(t, C.flag[0], C.flag[1]));
    // rewriter
    const down = E.io2(P(t, C.descend[0], C.descend[1])) * (1 - E.io2(P(t, C.lift[0], C.lift[1])));
    const snipK = (a: number) => { const d = t - a; return d < 0 || d > 0.3 ? 0 : Math.sin((d / 0.3) * Math.PI); };
    const open = Math.max(snipK(C.snip - 0.35), snipK(C.snip - 0.05)) + 0.35 * down * (t < C.snip - 0.4 ? 1 : 0);
    const cut = t >= C.snip + 0.05;
    const slide = E.io3(P(t, C.settle[0], C.settle[1]));
    const fell = P(t, C.snip + 0.05, C.snip + 0.6);

    // text layout inside slip C (mono)
    const cw = fs * CH, left = -w / 2 + (compact ? 14 : 12);
    const y1 = compact ? -6 : -5, y2 = compact ? 14 : 13;
    const piece = 10 * cw; // "Okay. But "
    const cutX = left + piece;
    const hov = compact ? 70 : 62; // hover lift of the scissors pivot above its cutting height
    const pivotDown = C0.y + 2 - (compact ? 1.5 : 1.3) * 40;
    const pvx = C0.x + cutX, pvy = pivotDown - hov * (1 - down);

    const floor = compact ? { x: 222, y: 786 } : { x: 585, y: 342 };
    // mackenzie
    const fr = E.io2(P(t, C.frown[0], C.frown[1]));
    const mk = compact ? { x: 308, y: 790 } : { x: 690, y: 342 };

    const gateW = compact ? w + 20 : 156;
    const sp = compact ? 46 : 30, hs = compact ? 1.15 : 1;
    const hx = (i: number) => B0.x + (i - 2) * sp;
    const feet = B0.y - (compact ? 90 : 82);

    return (
      <g style={{ fontFamily: MONO }} transform={compact ? undefined : "translate(0 -70)"}>
        <defs>
          <clipPath id="tr-clip">
            {compact ? <rect x={0} y={0} width={L.W} height={750} /> : <rect x={10} y={0} width={640} height={400} />}
          </clipPath>
        </defs>

        {compact ? <Belt x={25} y={0} w={210} h={750} vertical phase={phase} /> : <Belt x={10} y={289} w={640} h={16} phase={phase} />}

        {/* machines */}
        <Gate x={A0.x} y={bottom(A0.y)} press={press} width={gateW} fs={compact ? 13 : 12} />
        <Bench x={B0.x} y={feet} w={5 * sp + 14} label="judge × 5" fs={compact ? 12 : 11} />
        {[0, 1, 2, 3, 4].map((i) => <Haiku key={i} x={hx(i)} y={feet} s={hs} raise={raise(i)} />)}

        {/* slips */}
        <g clipPath="url(#tr-clip)">
          {slips.map((sl) => {
            const p = pos(sl.k);
            if (sl.id === "C") {
              return (
                <Slip key={sl.id} x={p.x} y={p.y} w={w} h={h} bars={[]}>
                  {cut ? null : <text x={left} y={y1} fontSize={fs} fill={INK}>Okay. But</text>}
                  <text x={q(left + piece - slide * piece * (cut ? 1 : 0))} y={y1} fontSize={fs} fill={INK}>{cut ? "Where is" : "where is"}</text>
                  <text x={left} y={y2} fontSize={fs} fill={INK}>that, exactly?</text>
                </Slip>
              );
            }
            return <Slip key={sl.id} x={p.x} y={p.y} w={w} h={h} bars={sl.bars} mark={sl.id === "A" ? mark : 0} flag={sl.id === "B" ? flag : 0} />;
          })}
        </g>
        {cut && (
          <Scrap x={q(lerp(C0.x + left + piece / 2, floor.x, E.o2(fell)))} y={q(lerp(C0.y + y1, floor.y, E.i2(fell)))} w={piece + 4} h={fs + 8}
            rot={-9 * E.o2(fell)}>
            <text x={0} y={fs * 0.35} textAnchor="middle" fontSize={fs} fill={INK}>Okay. But</text>
          </Scrap>
        )}

        <Shears x={pvx} y={pvy} s={compact ? 1.5 : 1.3} open={open} rot={-8 * (1 - down)} armFrom={[C0.x + (compact ? 80 : 60), compact ? C0.y - 160 : C0.y - 142]} />

        <Mackenzie x={mk.x} y={mk.y} frown={0.7 * fr} tilt={-5 * fr} />
        <text x={compact ? 130 : 640} y={compact ? 778 : 322} textAnchor={compact ? "middle" : "end"} fontSize={11}
          fill={DIM} opacity={q(E.o2(P(t, C.label[0], C.label[1])))}>0.4.0 shipped</text>
      </g>
    );
  },
});

export default function TwoReaders() {
  return <Figure spec={spec} />;
}
