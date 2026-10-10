"use client";

// "Five runs, averaged": the bench of five Haikus rolls along the bridge test file and holds up cards at each piece.
// Claim: flags land on the planted pieces only; the five agree to within a notch, and it is a different Haiku each time.
// Real numbers: 0.3 x4 and 0.25 x1 (one step on the grid), 158 of 330. Everything else is illustrative.
import { Figure, defineFigure, E, P, q } from "../_figure";
import { Belt, Bench, Card, DIM, FAINT, Haiku, INK, MONO, Slip } from "./world";

// Beats: the bench arrives at piece i, the five raise cards, the verdict flag goes up, the cards go down.
const T0 = 0.5, STEP = 1.75;
const T = (i: number) => T0 + STEP * i; // cards start at piece i
const pieces = [
  { label: ["plain facts"], flag: false, off: 1, bars: [0.8, 0.62, 0.72], big: true },
  { label: ["inflated", "paragraph"], flag: true, off: 3, bars: [0.9, 0.78, 0.85], big: true },
  { label: ["its first", "sentence"], flag: true, off: 0, bars: [0.85, 0.6], big: false },
  { label: ["its second", "sentence"], flag: true, off: 4, bars: [0.8, 0.7], big: false },
  { label: ["empty closing", "sentence"], flag: true, off: 2, bars: [0.08], big: false },
];

type L = { W: number; H: number; compact: boolean };
const land = { W: 740, H: 325 }, port = { W: 360, H: 690 };
const SP = 37;

const spec = defineFigure({
  dur: T(4) + 2.1,
  size: land,
  compact: port,
  render: (t, _s, { compact }: L) => {
    const slipAt = (i: number) => compact ? { x: 105, y: 60 + 118 * i } : { x: 90 + 140 * i, y: 184 };
    // bench position: eases from piece to piece
    let bx = compact ? 264 : slipAt(0).x, by = 0;
    for (let i = 1; i < pieces.length; i++) {
      const k = E.io3(P(t, T(i) - 0.65, T(i) - 0.1));
      if (compact) by += (slipAt(i).y - slipAt(i - 1).y) * k; else bx += (slipAt(i).x - slipAt(i - 1).x) * k;
    }
    const benchY = compact ? slipAt(0).y + 22 + by : 100;
    const sp = compact ? 33 : SP, hs = 1;
    const bw = 5 * sp + 14;

    // which piece is being read, and card raise per Haiku
    const raise = (pi: number, hi: number) => {
      const a = T(pi) + hi * 0.05;
      const up = E.o3(P(t, a, a + 0.35)), down = E.io2(P(t, T(pi) + 1.25, T(pi) + 1.6));
      const notch = pieces[pi].off === hi ? 0.86 : 1; // one Haiku sits a notch off
      return up * (1 - down) * notch;
    };
    const flagK = (pi: number) => (pieces[pi].flag ? E.back(P(t, T(pi) + 0.9, T(pi) + 1.2)) : 0);

    const labY = compact ? 44 : 77, fs = 12, pipY = compact ? 68 : 99;
    return (
      <g style={{ fontFamily: MONO }} transform={compact ? undefined : "translate(0 -25)"}>
        {compact ? <Belt x={10} y={14} w={190} h={590} vertical /> : <Belt x={14} y={208} w={712} h={16} />}

        {pieces.map((pc, i) => {
          const p = slipAt(i);
          const w = compact ? (pc.big ? 170 : 150) : pc.big ? 120 : 100, h = pc.big ? 54 : 40;
          return (
            <g key={i}>
              <Slip x={p.x} y={p.y} w={w} h={h} bars={pc.bars} flag={flagK(i)} />
              {pc.label.map((ln, j) => (
                <text key={j} x={p.x} y={p.y + labY + j * 14} textAnchor="middle" fontSize={fs} fill={INK}
                  stroke="var(--background)" strokeWidth={3} paintOrder="stroke">{ln}</text>
              ))}
              {/* quiet trace of the five cards: one a notch lower, a different one each time */}
              <g opacity={q(E.o2(P(t, T(i) + 1.4, T(i) + 1.8)))}>
                {[0, 1, 2, 3, 4].map((hi) => (
                  <rect key={hi} x={p.x - 20 + hi * 10 - 3} y={p.y + pipY + (pc.off === hi ? 4 : 0)} width={6} height={8} rx={1}
                    fill={pc.off === hi ? INK : "none"} stroke={pc.off === hi ? INK : DIM} strokeWidth={1.2} />
                ))}
                {i === 1 && (
                  <text x={p.x} y={p.y + pipY + 24} textAnchor="middle" fontSize={11} fill={DIM}
                    stroke="var(--background)" strokeWidth={3} paintOrder="stroke">
                    {[0, 1, 2, 3, 4].map((hi) => (pc.off === hi ? "0.25" : "0.3")).join(" ")}
                  </text>
                )}
              </g>
            </g>
          );
        })}

        {/* the bench rolls along on little wheels */}
        <g>
          <Bench x={bx} y={benchY} w={bw} label="5 runs, averaged" fs={11} />
          {[-0.4, 0.4].map((f) => <circle key={f} cx={q(bx + f * bw)} cy={benchY + 18} r={4} fill="none" stroke={DIM} strokeWidth={1.5} />)}
          {[0, 1, 2, 3, 4].map((hi) => {
            const pi = Math.min(4, Math.max(0, Math.floor((t - T0 + 0.7) / STEP)));
            const r = raise(pi, hi);
            const show = pi === 1 ? (pieces[1].off === hi ? "0.25" : "0.3") : undefined;
            const hx = bx + (hi - 2) * sp;
            return (
              <g key={hi}>
                <Haiku x={q(hx)} y={benchY} s={hs} raise={r} card={false} />
                {r > 0.02 && <Card x={q(hx + 11 * hs)} y={q(benchY + (-13 - 40 * r) * hs)} s={hs} value={show} w={show ? 30 : 22} />}
              </g>
            );
          })}
        </g>

        <g opacity={q(E.o2(P(t, T(4) + 1.4, T(4) + 1.9)))}>
          <text x={compact ? 180 : 370} y={compact ? 642 : 326} textAnchor="middle" fontSize={13} fill={INK}>158 of 330 scores agreed</text>
          <text x={compact ? 180 : 370} y={compact ? 662 : 343} textAnchor="middle" fontSize={12} fill={DIM}>(bridge file + last post)</text>
        </g>
        <line x1={0} x2={0} y1={0} y2={0} stroke={FAINT} />
      </g>
    );
  },
});

export default function FiveRuns() {
  return <Figure spec={spec} />;
}
