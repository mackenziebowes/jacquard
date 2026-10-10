"use client";

/**
 * Hero. The same page goes past two readers. The word-list gate cuts the lines it can name
 * (dashes, stock phrases, signposts) and the rewrite follows. The judge asks Haiku five times
 * about the two habits no list can see, and its flags are left for a person: it never hands
 * them to a rewriter on its own.
 */
import { Figure, defineFigure, cues, E, P, lerp, q } from "../_figure";
import { Frame, Bar, FG, MUTED, ACCENT, CUT, label, small } from "./world";

const LINES = [0.9, 0.78, 0.86, 0.5, 0.92, 0.7, 0.84, 0.44, 0.88, 0.6];
const GATE = [1, 4, 7]; // cut by the word list
const JUDGE = [2, 8]; // flagged by the judge
const X = 40, Y0 = 36, STEP = 24, FULL = 250;

const C = cues({ lines: 0, sweep: 1.1, cut: 1.5, readers: 3.1, flag: 3.7 });

const spec = defineFigure({
  dur: 5,
  size: { W: 460, H: 340 },
  render: (t) => {
    const sweepX = lerp(X - 8, X + FULL + 14, C.p(t, "sweep", E.io2) * P(t, 1.1, 2.6));
    return (
      <g>
        {LINES.map((f, i) => {
          const y = Y0 + i * STEP;
          const shown = P(t, i * 0.07, i * 0.07 + 0.35);
          const gate = GATE.includes(i);
          const judge = JUDGE.includes(i);
          const cutK = gate ? E.io2(P(t, 1.5 + GATE.indexOf(i) * 0.25, 2.3 + GATE.indexOf(i) * 0.25)) : 0;
          const hit = gate && sweepX > X + f * FULL * 0.5;
          const flagged = judge && P(t, 3.7 + JUDGE.indexOf(i) * 0.35, 4.1 + JUDGE.indexOf(i) * 0.35) > 0;
          const fill = hit ? CUT : flagged ? ACCENT : MUTED;
          return (
            <g key={i} opacity={q(shown, 2)}>
              <Bar x={X} y={y} w={f * FULL * (1 - 0.82 * cutK)} fill={fill} opacity={hit ? lerp(0.9, 0.5, cutK) : flagged ? 1 : 0.7} />
              {judge &&
                [0, 1, 2, 3, 4].map((k) => {
                  const p = E.o3(P(t, 3.1 + k * 0.1 + JUDGE.indexOf(i) * 0.35, 3.5 + k * 0.1 + JUDGE.indexOf(i) * 0.35));
                  return <circle key={k} cx={X + FULL + 24 + k * 12} cy={y + 3.5} r={3.5} fill={ACCENT} opacity={q(p, 2)} />;
                })}
            </g>
          );
        })}
        {/* the gate's sweep */}
        <rect x={q(sweepX, 1)} y={Y0 - 10} width={2} height={LINES.length * STEP} fill={CUT} opacity={q(0.7 * P(t, 1.1, 1.3) * (1 - P(t, 2.5, 2.7)), 2)} />

        {/* legend */}
        <g opacity={q(P(t, 1.4, 1.9), 2)}>
          <rect x={X} y={296} width={9} height={9} fill={CUT} />
          <text x={X + 16} y={305} fill={FG} style={label}>gate: cuts what a list can name</text>
        </g>
        <g opacity={q(P(t, 3.3, 3.8), 2)}>
          <circle cx={X + 4.5} cy={324} r={4.5} fill={ACCENT} />
          <text x={X + 16} y={329} fill={FG} style={label}>judge: five readers flag, a person decides</text>
        </g>
      </g>
    );
  },
});

export default function TwoReaders() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
