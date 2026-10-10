"use client";
// The hero: one page through the gate. The word list snags three lines (two bad, one good "I found."),
// the rewriter cuts all three, the survivors close up, the reader blinks five times and flags two
// lines the gate could never see, and the flags go to me, not to the rewriter.
import { Figure, defineFigure, cues, E, P, lerp, track, link, drawOn, q } from "../_figure";
import { TextLine, Gate, Reader, readerLamp, Person, personHead, Rewriter, rewriterRest, Ground, Label, INK, FLAG, MUTED } from "./world";

const cutA = 2.6, cutB = 3.1, cutC = 3.6; // the three cuts, in order down the page
const C = cues({ slide: 0.3, reflow: [4.2, 5.0], judge: 6.9, handoff: [7.4, 8.4], shrug: [8.4, 9.0] });

// hit: the word list catches it. judge: the reader flags it (after the gate has passed it).
const LINES = [
  { len: 150 },
  { len: 120, judge: true },
  { len: 160, hit: true, words: "a testament to" },
  { len: 140 },
  { len: 110, hit: true, words: "I found." },
  { len: 170, judge: true },
  { len: 130, hit: true },
  { len: 110 },
];
const CUT = [2, 4, 6]; // indices of the caught lines, in cut order
const CUT_T = [cutA, cutB, cutC];
const PASS = LINES.map((_, i) => i).filter((i) => !LINES[i].hit);
const BLINKS = [0, 1, 2, 3, 4].map((i) => 5.1 + 0.36 * i); // five blinks, one per run

type Lay = {
  k: number; x0: number; GX: number; OX: number; ground: number; rowY0: number; outY0: number; pileX: number;
  reader: { x: number; y: number }; readerLabel: { x: number; y: number; anchor: "start" | "middle" }; spread: number;
  personX: number; personH: number; gateLabel: { x: number; y: number };
  rew: { x: number; s: number; reach: number }; leftEnd: number; rightEnd: number;
};
const DESK: Lay = {
  k: 1, x0: 40, GX: 300, OX: 384, ground: 282, rowY0: 60, outY0: 110, pileX: 40,
  reader: { x: 470, y: 44 }, readerLabel: { x: 494, y: 49, anchor: "start" }, spread: 110,
  personX: 600, personH: 200, gateLabel: { x: 300, y: 24 },
  rew: { x: 350, s: 1, reach: 175 }, leftEnd: 20, rightEnd: 620,
};
const COMPACT: Lay = {
  k: 0.7, x0: 14, GX: 140, OX: 178, ground: 350, rowY0: 60, outY0: 110, pileX: 14,
  reader: { x: 232, y: 40 }, readerLabel: { x: 232, y: 84, anchor: "middle" }, spread: 60,
  personX: 326, personH: 140, gateLabel: { x: 140, y: 24 },
  rew: { x: 178, s: 0.8, reach: 240 }, leftEnd: 6, rightEnd: 354,
};

const GATE_TOP = 36, GATE_BOTTOM = 230;

function Scene({ t, lay }: { t: number; lay: Lay }) {
  const rowTop = (i: number) => lay.rowY0 + 20 * i;
  const centre = (i: number) => rowTop(i) + 6.5;
  const outTop = (k: number) => lay.outY0 + 20 * k;
  const slotTop = (j: number) => lay.ground - 13 - 15 * j;
  const T = (i: number) => ({ x: lay.GX - 34, y: centre(i) }); // the pen lands on the line's right end

  // The rewriter's pen: rest, then to each caught line in turn.
  const rest = rewriterRest(lay.rew.x, lay.ground, lay.rew.s);
  const tip = track<{ x: number; y: number }>(
    [cutA - 0.4, rest],
    [cutA - 0.2, T(CUT[0]), E.io3], [cutA, T(CUT[0])],
    [cutB - 0.25, T(CUT[1]), E.io3], [cutB, T(CUT[1])],
    [cutC - 0.25, T(CUT[2]), E.io3], [cutC, T(CUT[2])],
    [cutC + 0.4, rest, E.io3],
  );

  // Each line: where it is at time t, and how it looks.
  const lineAt = (i: number) => {
    const ln = LINES[i], w = ln.len * lay.k, s = C.at("slide") + 0.1 * i;
    const travel = P(t, s, s + 1);
    if (ln.hit) {
      const idx = CUT.indexOf(i), cutT = CUT_T[idx];
      const stop = lay.GX - 22 - w;
      const x = lerp(lay.x0, stop, E.io3(travel));
      if (t < cutT) return { x, y: rowTop(i), state: "flag" as const, dim: 1, words: ln.words };
      // Cut: slide left off the gate along its own row, then drop onto the pile (never through a live line).
      const h = P(t, cutT, cutT + 0.25), v = P(t, cutT + 0.25, cutT + 0.75);
      return { x: lerp(stop, lay.pileX, E.io2(h)), y: lerp(rowTop(i), slotTop(idx), E.i2(v)), state: "plain" as const, dim: q(1 - 0.55 * P(t, cutT + 0.75, cutT + 1), 3), words: ln.words };
    }
    const judged = !!ln.judge && t >= C.at("judge");
    return {
      x: lerp(lay.x0, lay.OX, E.io3(travel)),
      y: lerp(rowTop(i), outTop(PASS.indexOf(i)), C.p(t, "reflow", E.io3)),
      state: judged ? ("judge" as const) : ("plain" as const), dim: 1, words: undefined,
    };
  };

  // Reader: five blinks while it reads, then the beam and the flags.
  const blinking = BLINKS.some((b) => t >= b && t < b + 0.18);
  const lamp = blinking ? 1 : 0.25;
  const readOn = P(t, 4.9, 5.1) * (1 - P(t, 6.9, 7.3));
  const beamOpacity = 0.07 * readOn * (blinking ? 1 : 0.4);
  const rl = readerLamp(lay.reader.x, lay.reader.y);
  const body = { x: lay.reader.x, y: lay.reader.y + 17 };

  // Handoff: the flags go to Mackenzie.
  const head = personHead(lay.personX, lay.ground, lay.personH);
  const hk = C.p(t, "handoff", E.io2);
  const path = link(body, head, 1);
  const bead = link(body, head, hk).bead;
  const handing = t >= C.at("handoff") && hk < 1;

  return (
    <g>
      <Ground x1={lay.leftEnd} x2={lay.rightEnd} y={lay.ground} />
      <Gate x={lay.GX} top={GATE_TOP} bottom={GATE_BOTTOM} notches={CUT.map((i) => {
        const cutT = CUT_T[CUT.indexOf(i)], arrive = C.at("slide") + 0.1 * i + 1;
        const lit = t < arrive || t >= cutT ? 0 : 1 - 0.5 * P(t, arrive, arrive + 0.6);
        return { y: centre(i), lit };
      })} />
      <Label x={lay.gateLabel.x} y={lay.gateLabel.y} anchor="middle">word list</Label>

      <path d={path.d} fill="none" style={{ stroke: MUTED }} strokeWidth={1} {...drawOn(hk)} />
      <polygon
        points={`${q(rl.x)},${q(rl.y)} ${q(lay.reader.x - lay.spread)},${q(lay.outY0 + 6)} ${q(lay.reader.x + lay.spread)},${q(lay.outY0 + 6)}`}
        style={{ fill: INK, fillOpacity: q(beamOpacity) }}
      />

      {PASS.map((i) => { const L = lineAt(i); return <TextLine key={i} {...L} w={LINES[i].len * lay.k} />; })}
      {CUT.map((i) => { const L = lineAt(i); return <TextLine key={i} {...L} w={LINES[i].len * lay.k} />; })}

      <Rewriter x={lay.rew.x} base={lay.ground} s={lay.rew.s} reach={lay.rew.reach} tip={tip(t)} />
      <Reader x={lay.reader.x} y={lay.reader.y} lamp={lamp} />
      <Label x={lay.readerLabel.x} y={lay.readerLabel.y} anchor={lay.readerLabel.anchor}>small reader x5</Label>

      {handing && <circle cx={q(bead.x)} cy={q(bead.y)} r={3.5} style={{ fill: FLAG }} />}
      <Person x={lay.personX} ground={lay.ground} h={lay.personH} lift={C.p(t, "shrug", E.io3)} />
      <Label x={head.x} y={head.y - 24} anchor="middle">me</Label>
    </g>
  );
}

const spec = defineFigure({
  dur: 9.2,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 380 },
  render: (t, _state, ctx) => <Scene t={t} lay={ctx.compact ? COMPACT : DESK} />,
});

export default function Hero() {
  return <Figure spec={spec} />;
}
