"use client";

// A field named claim. Five slots stand in a row, one for each run. Under the field name "claim" four
// slots take sentences (muted two-line bars) and one takes a number. The name changes to
// importance_score, the sentences clear, and all five slots refill with numbers, accent on the row.
import { Figure, defineFigure, E, P, q } from "../_figure";
import { Frame, labels, FG, MUTED, GROUND, ACCENT } from "./world";

const N = 5;
const SENT = [0, 1, 3, 4]; // the slots that take a sentence under "claim"
const SENT_AT = [0.4, 0.6, 0.8, 1.0]; // when each sentence lands
const NUM_CLAIM = 2; // the one slot that gets a number under "claim"
const NUM_AT = 1.2;
const CLEAR = [2.0, 2.3]; // the claim row clears
const SWAP_IN = [2.3, 2.7]; // importance_score comes in
const REFILL = (i: number) => 2.8 + i * 0.25; // the five numbers land in turn
const ACC = [3.9, 4.3]; // accent builds on the complete row

const spec = defineFigure({
  dur: 4.5,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 240 },
  setup: () => ({}),
  render: (t, _S, { W, compact }) => {
    const L = labels(compact);
    const cw = compact ? 56 : 84; // one slot's width
    const gap = compact ? 12 : 18;
    const row = N * cw + (N - 1) * gap;
    const x0 = (W - row) / 2;
    const floor = compact ? 134 : 164; // the slots' floor
    const cellH = compact ? 44 : 50;
    const labelY = floor - (compact ? 54 : 70);
    const countY = floor + (compact ? 22 : 52);
    const numS = compact ? 24 : 28; // a number block's side
    const mid = W / 2;

    const clear = 1 - P(t, CLEAR[0], CLEAR[1]); // 1 while the claim row is there, 0 once cleared
    const claimOp = clear * P(t, 0, 0.4);
    const swapOp = P(t, SWAP_IN[0], SWAP_IN[1]);
    const countEmpty = P(t, 1.5, 1.9) * clear;
    const countDone = P(t, 4.1, 4.5);
    const accent = P(t, ACC[0], ACC[1]);

    const slotX = (i: number) => x0 + i * (cw + gap);

    // a sentence: two muted lines, the first with two word gaps cut out
    const sentence = (x: number, o: number) => {
      const ix = x + 8;
      const iw = cw - 16;
      const top = floor - 30;
      return (
        <g opacity={o}>
          <rect x={q(ix)} y={q(top)} width={q(iw)} height={7} fill={MUTED} />
          <rect x={q(ix + iw * 0.36)} y={q(top)} width={3} height={7} fill={GROUND} />
          <rect x={q(ix + iw * 0.7)} y={q(top)} width={3} height={7} fill={GROUND} />
          <rect x={q(ix)} y={q(top + 13)} width={q(iw * 0.6)} height={7} fill={MUTED} />
        </g>
      );
    };

    // a number: a solid block with a notch cut down its middle, like a digit
    const number = (x: number, fill: string, o: number, accentOn = 0) => {
      const bx = x + (cw - numS) / 2;
      return (
        <g opacity={o}>
          <rect x={q(bx)} y={q(floor - numS + (1 - o) * -8)} width={numS} height={numS} fill={fill} />
          <rect x={q(bx + numS * 0.42)} y={q(floor - numS * 0.8 + (1 - o) * -8)} width={numS * 0.16} height={numS * 0.6} fill={GROUND} />
          {accentOn > 0 && (
            <rect x={q(bx)} y={q(floor - numS + (1 - o) * -8)} width={numS} height={numS} fill={ACCENT} fillOpacity={accentOn} />
          )}
        </g>
      );
    };

    return (
      <g>
        {/* the field name, and the count under the row */}
        <text x={q(mid)} y={q(labelY)} textAnchor="middle" {...L.label} fill={FG} opacity={claimOp}>
          claim
        </text>
        <text x={q(mid)} y={q(labelY)} textAnchor="middle" {...L.label} fill={FG} opacity={swapOp}>
          importance_score
        </text>
        <text x={q(mid)} y={q(countY)} textAnchor="middle" {...L.label} fill={FG} opacity={countEmpty}>
          4 of 5 empty
        </text>
        <text x={q(mid)} y={q(countY)} textAnchor="middle" {...L.label} fill={FG} opacity={countDone}>
          5 of 5 complete
        </text>

        {/* the five slots: a floor and two cheeks each */}
        {Array.from({ length: N }, (_, i) => {
          const x = slotX(i);
          return (
            <g key={i}>
              <rect x={q(x)} y={q(floor)} width={q(cw)} height={3} fill={MUTED} />
              <rect x={q(x)} y={q(floor - cellH)} width={3} height={q(cellH)} fill={MUTED} />
              <rect x={q(x + cw - 3)} y={q(floor - cellH)} width={3} height={q(cellH)} fill={MUTED} />
            </g>
          );
        })}

        {/* under "claim": sentences in four slots, a number in one */}
        {SENT.map((i, k) => (
          <g key={`s${i}`}>{sentence(slotX(i), P(t, SENT_AT[k], SENT_AT[k] + 0.35) * clear)}</g>
        ))}
        <g>{number(slotX(NUM_CLAIM), FG, P(t, NUM_AT, NUM_AT + 0.35) * clear)}</g>

        {/* under "importance_score": five numbers, refilled in turn, the row accented once complete */}
        {Array.from({ length: N }, (_, i) => {
          const p = P(t, REFILL(i), REFILL(i) + 0.3) * swapOp;
          return <g key={`n${i}`}>{number(slotX(i), FG, p, accent)}</g>;
        })}
      </g>
    );
  },
});

export default function ClaimField() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
