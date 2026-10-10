"use client";

// Section "A field named claim". Five Haikus each fill two forms: a "claim" form (four write sentences that
// overflow the box, one writes a number) and, after the rename, an importance_score form with a strict digit box
// and a tick. Both rows stay in the end state: the before is the cause. The digits are illustrative.
import { Figure, defineFigure, E, P, q } from "../_figure";
import { Bench, DIM, FAINT, Haiku, INK, MARK, MONO, OK, PAPER, PAPER_EDGE } from "./world";

const T = { write: 0.8, dim: 3.6, after: 4.0, num: 4.7, tick: 5.7 } as const;
const DIGITS = ["3", "4", "4", "2", "5"]; // illustrative; the third Haiku's "4" is the one number that was there before
const NUMBER_ONE = 2;

type L = { W: number; H: number; fw: number; fh: number; fs: number; hs: number; before: (i: number) => { x: number; y: number }; after: (i: number) => { x: number; y: number }; haiku: (i: number) => { x: number; y: number }; bench: number };
const land: L = { W: 724, H: 304, fw: 132, fh: 84, fs: 11, hs: 1.15, before: (i) => ({ x: 8 + i * 144, y: 32 }), after: (i) => ({ x: 8 + i * 144, y: 148 }), haiku: (i) => ({ x: 8 + i * 144 + 66, y: 288 }), bench: 70 };
const port: L = { W: 360, H: 550, fw: 150, fh: 84, fs: 13, hs: 1.1, before: (i) => ({ x: 46, y: 40 + i * 96 }), after: (i) => ({ x: 204, y: 40 + i * 96 }), haiku: (i) => ({ x: 24, y: 40 + i * 96 + 74 }), bench: 40 };

// A wavy scribble from (x0,y) of length len.
function scribble(x0: number, y: number, len: number, seed: number) {
  const n = Math.max(2, Math.round(len / 5));
  let d = `M${q(x0)} ${q(y)}`;
  for (let i = 1; i <= n; i++) d += ` L${q(x0 + (len * i) / n)} ${q(y + (i % 2 ? -1.8 : 1.8) * (0.6 + ((i * 7 + seed * 3) % 5) / 6))}`;
  return d;
}

const spec = defineFigure({
  dur: 6.8,
  size: { W: land.W, H: land.H },
  compact: { W: port.W, H: port.H },
  render: (t, _s, { compact }) => {
    const L = compact ? port : land;
    const { fw, fh, fs } = L;
    const by = 26, bh = 34, wideW = fw - 16, strictW = 30;
    const dim = E.io2(P(t, T.dim, T.dim + 0.6));
    const afterIn = E.o3(P(t, T.after, T.after + 0.5));
    const hd = compact ? 13 : 13;

    const forms = [0, 1, 2, 3, 4].map((i) => {
      const b = L.before(i), a = L.after(i), h = L.haiku(i);
      const isNum = i === NUMBER_ONE;
      const wk = E.io2(P(t, T.write + i * 0.2, T.write + i * 0.2 + (isNum ? 0.5 : 1.6)));
      const ai = E.o3(P(t, T.after + i * 0.12, T.after + i * 0.12 + 0.4));
      const nk = E.o3(P(t, T.num + i * 0.15, T.num + i * 0.15 + 0.4));
      const tk = E.back(P(t, T.tick + i * 0.18, T.tick + i * 0.18 + 0.35));
      const lines = [0, 1, 2, 3, 4].map((j) => ({ ly: by + 7 + j * 11, len: wideW - 2 + (j > 2 ? -16 + ((i + j) % 3) * 6 : ((j + i) % 2) * 4) }));
      const spill = !isNum && wk > 0.3;
      return (
        <g key={i}>
          {/* before: field "claim", faded once the rename lands */}
          <g transform={`translate(${q(b.x)} ${q(b.y)})`} opacity={q(1 - 0.45 * dim)}>
            <rect width={fw} height={fh} rx={4} fill={PAPER} stroke={PAPER_EDGE} />
            <text x={8} y={15} fontSize={fs} fill={INK} style={{ fontFamily: MONO }}>claim</text>
            <rect x={8} y={by} width={wideW} height={bh} rx={3} fill="var(--background)" stroke={isNum ? INK : spill ? MARK : DIM} strokeWidth={1.2} />
            {!isNum && (
              <g fill="none" stroke={INK} strokeWidth={1.5} strokeLinecap="round" opacity={0.75}>
                {lines.map(({ ly, len }, j) => {
                  const k = E.io2(P(wk, j / 5, (j + 1) / 5 + 0.02));
                  return k > 0 ? <path key={j} d={scribble(12, ly, len, i + j)} pathLength={1} strokeDasharray={1} strokeDashoffset={q(1 - k, 3)} /> : null;
                })}
              </g>
            )}
            {isNum && (
              <text x={14} y={by + bh / 2 + 6} fontSize={17} fontWeight={600} fill={INK} opacity={q(E.o3(P(wk, 0.3, 1)))} style={{ fontFamily: MONO }}>4</text>
            )}
          </g>
          {/* after: importance_score, strict */}
          <g transform={`translate(${q(a.x)} ${q(a.y)})`} opacity={q(ai)}>
            <rect width={fw} height={fh} rx={4} fill={PAPER} stroke={PAPER_EDGE} />
            <text x={8} y={15} fontSize={fs} fill={INK} style={{ fontFamily: MONO }}>importance_score</text>
            <rect x={8} y={by} width={strictW} height={bh} rx={3} fill="var(--background)" stroke={INK} strokeWidth={1.8} />
            <text x={8 + strictW / 2} y={by + bh / 2 + 6} textAnchor="middle" fontSize={17} fontWeight={600} fill={INK} opacity={q(nk)} style={{ fontFamily: MONO }}>{DIGITS[i]}</text>
            {tk > 0 && (
              <g transform={`translate(${fw - 16} ${fh - 20}) scale(${q(tk, 3)})`}>
                <circle r={9} fill="none" stroke={OK} strokeWidth={1.6} />
                <path d="M-4 0 L-1 3.5 L4.5 -3.5" fill="none" stroke={OK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
          </g>
          <Haiku x={h.x} y={h.y} s={L.hs} card={false} />
          <Bench x={h.x} y={h.y} w={L.bench} />
        </g>
      );
    });

    return (
      <g style={{ fontFamily: MONO }}>
        <g fontSize={hd} fill={INK}>
          {compact ? (
            <>
              <text x={46} y={22}>before</text>
              <text x={204} y={22} opacity={q(afterIn)}>after, strict</text>
              <text x={46} y={q(40 + 5 * 96 + 10)} fill={DIM} fontSize={hd - 1}>4 sentences,</text>
              <text x={46} y={q(40 + 5 * 96 + 26)} fill={DIM} fontSize={hd - 1}>1 number</text>
              <text x={204} y={q(40 + 5 * 96 + 10)} fill={DIM} fontSize={hd - 1} opacity={q(afterIn)}>5 numbers</text>
            </>
          ) : (
            <>
              <text x={8} y={22}>before: field claim</text>
              <text x={200} y={22} fill={DIM} fontSize={hd - 1}>4 sentences, 1 number</text>
              <g opacity={q(afterIn)}>
                <text x={8} y={138}>after: field importance_score, strict</text>
                <text x={330} y={138} fill={DIM} fontSize={hd - 1}>5 numbers</text>
                <text x={430} y={138} fill={FAINT} fontSize={hd - 2}>also evidence_score, empty_score</text>
              </g>
            </>
          )}
        </g>
        {forms}
      </g>
    );
  },
});

export default function ClaimField() {
  return <Figure spec={spec} />;
}
