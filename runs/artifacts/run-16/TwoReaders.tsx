"use client";

// Hero. A page of text slides in. The word-list gate lowers over it and three lines, the ones that
// match its teeth, fall out; the rest close up. The judge swings round and lights two lines, and a
// tag hands them to a person. Ends still.
import { Figure, defineFigure, cues, E, lerp, q } from "../_figure";
import { Frame, Street, Page, Gate, Judge, pageLines, pageRowY, labels, FG, MUTED, type PageLine } from "./world";

const C = cues({
  slide: [0, 1.5],
  lower: [1.5, 2.4],
  fall: [2.2, 3.2],
  judge: [3.0, 3.8],
  light: [3.6, 4.2],
  tag: [4.1, 4.6],
});

const SEED = 4;
const N = 12;
const CAUGHT = [1, 4, 7]; // the lines the gate's teeth match
const LIT = [5, 9]; // the two lines the judge flags for a person

const spec = defineFigure({
  dur: 4.6,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 320 },
  setup: () => ({ lines: pageLines(SEED, N) }),
  render: (t, S, { W, H, compact }) => {
    const L = labels(compact);
    // full width: the gate and page sit left of centre, the judge at the right.
    // compact: the same three, restacked tighter, the gate over the page and the judge at the edge.
    const G = compact ? H - 40 : H - 32; // the ground line
    const sw = compact ? 130 : 150; // sheet width
    const gw = compact ? 150 : 170; // gate lintel width
    const gx = compact ? 155 : W * 0.48; // the gate hangs over the sheet's final place
    const gy = compact ? 60 : 30; // the lintel's top before it lowers
    const jx = compact ? 340 : W * 0.86;
    const js = compact ? 0.85 : 1;
    const sheetX = lerp(-200, gx - sw / 2, E.io3(C.p(t, "slide")));
    const lower = E.io3(C.p(t, "lower"));
    const fall = C.p(t, "fall");
    const aim = lerp(-35, 36, E.io3(C.p(t, "judge")));
    const lit = C.p(t, "light", E.io2);
    const tag = C.p(t, "tag", E.io2);

    // Landing spots for the caught lines: a stack on the ground, each one ending just left of the sheet.
    let j = 0;
    const lines: PageLine[] = S.lines.map((l, i) => {
      if (CAUGHT.includes(i)) {
        const to = { x: sheetX - 12 - (sw - 28) * l.len, y: G - 5 - j * 8 };
        j++;
        return { ...l, state: "dropped", k: fall, to };
      }
      if (LIT.includes(i)) return { ...l, state: "lit", k: lit };
      return { ...l, state: "ink" };
    });

    // The tag sits level with the midpoint of the two flagged rows, once the page has closed up.
    const [r0, r1] = LIT.map((i) => pageRowY(lines, i, G) + 2.5);
    const tagY = (r0 + r1) / 2 + 4;
    const gateLabel = gx + gw / 2 + 10;

    return (
      <g>
        <defs>
          <clipPath id="prose-two-readers-clip">
            <rect width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#prose-two-readers-clip)">
          <Street x={0} y={G} w={W} />

          {/* the page, sliding in from the left, then closing up as its lines fall */}
          <Page x={sheetX} y={G} w={sw} lines={lines} />

          {/* the gate: a hairline up to a comb of teeth, lowered over the page */}
          <Gate x={gx} y={gy} w={gw} lower={lower} drop={compact ? 36 : 52} />
          <text x={q(gateLabel)} y={gy + 14} {...L.label} fill={FG} opacity={C.p(t, "lower", E.io2)}>
            word list
          </text>
          <text x={q(gateLabel)} y={gy + 30} {...L.small} fill={MUTED} opacity={C.p(t, "lower", E.io2)}>
            exact shapes only
          </text>

          {/* the judge: a solid lamp on a stalk, swung over the page */}
          <Judge x={jx} y={G} s={js} aim={aim} k={lit} id="prose-two-readers-glow" />
          <text x={q(compact ? W - 4 : jx)} y={G + 22} textAnchor={compact ? "end" : "middle"} {...L.small} fill={MUTED}>
            small model
          </text>

          {/* the hand-off */}
          <text x={q(sheetX + sw + 12)} y={q(tagY)} {...L.label} fill={FG} opacity={tag}>
            for a person
          </text>
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
