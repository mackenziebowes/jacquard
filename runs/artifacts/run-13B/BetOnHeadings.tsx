"use client";
// The bet about headings. I expected every heading lamp to blaze at 1.0. The reader's lamps glow
// middling instead, from 0.05 to 0.90. Then three runs blink at the same seven lines in the text,
// and the rewriter cuts those seven.
import { Figure, defineFigure, cues, E, P, track, q } from "../_figure";
import { TextLine, Reader, readerLamp, Person, personHead, Rewriter, rewriterRest, Ground, Label, INK, MUTED, FAINT } from "./world";

const C = cues({ bet: [0.2, 0.8], settle: [2.0, 2.9], read: [3.2, 5.6], judge: 3.6, cut: [6.0, 8.4] });

// Page lines, top to bottom: width in desktop units. SEVEN are the lines the three runs quoted.
const LINES = [200, 150, 236, 120, 210, 170, 180, 240, 130, 190];
const SEVEN = [1, 2, 4, 5, 6, 8, 9];
const WORDS: Record<number, string> = { 2: "changed the plan", 6: "gave it away" }; // short form of the quotes

// Heading lamps, left to right. Only 0.05 and 0.90 come from the runs; the rest are illustrative.
const LEVEL = [0.62, 0.9, 0.41, 0.55, 0.45, 0.05];
const BLINKS = [3.6, 4.1, 4.6]; // three runs, one blink each
const cutAt = (j: number) => C.at("cut") + 0.4 * j;

type Lay = {
  k: number; x0: number; y0: number; dy: number; ground: number; shelfY: number; lampX: number[];
  reader: { x: number; y: number }; rew: { x: number; s: number; reach: number };
  person: { x: number; h: number }; bet: { x: number; y: number }; run: { x: number; y: number };
  means: { x: number; y: number; anchor: "start" | "middle" }; judge: { x: number; y: number; anchor: "start" | "middle" };
  low: { x: number; y: number }; high: { x: number; y: number }; leftEnd: number; rightEnd: number;
};
const DESK: Lay = {
  k: 1, x0: 40, y0: 34, dy: 22, ground: 282, shelfY: 150, lampX: [328, 368, 408, 448, 488, 528],
  reader: { x: 400, y: 236 }, rew: { x: 318, s: 1, reach: 175 }, person: { x: 596, h: 190 },
  bet: { x: 428, y: 96 }, run: { x: 400, y: 268 }, means: { x: 420, y: 200, anchor: "start" },
  judge: { x: 160, y: 272, anchor: "middle" }, low: { x: 528, y: 172 }, high: { x: 368, y: 172 },
  leftEnd: 20, rightEnd: 630,
};
const COMPACT: Lay = {
  k: 0.85, x0: 24, y0: 170, dy: 19, ground: 372, shelfY: 108, lampX: [40, 92, 144, 196, 248, 300],
  reader: { x: 300, y: 200 }, rew: { x: 300, s: 0.8, reach: 240 }, person: { x: 335, h: 140 },
  bet: { x: 170, y: 52 }, run: { x: 300, y: 232 }, means: { x: 24, y: 150, anchor: "start" },
  judge: { x: 24, y: 366, anchor: "start" }, low: { x: 300, y: 128 }, high: { x: 92, y: 128 },
  leftEnd: 6, rightEnd: 354,
};

function Scene({ t, lay }: { t: number; lay: Lay }) {
  const lineY = (i: number) => lay.y0 + lay.dy * i;
  const mid = (i: number) => lineY(i) + 6.5;
  const bodyY = lay.shelfY - 26;

  // The rewriter's pen: rest, then to the right end of each quoted line in turn, then cut.
  const rest = rewriterRest(lay.rew.x, lay.ground, lay.rew.s);
  const T = (j: number) => ({ x: lay.x0 + LINES[SEVEN[j]] * lay.k + 5, y: mid(SEVEN[j]) });
  const keys: [number, { x: number; y: number }, ((x: number) => number)?][] = [[cutAt(0) - 0.6, rest]];
  SEVEN.forEach((_, j) => {
    keys.push([cutAt(j) - 0.3, T(j), E.io3], [cutAt(j), T(j)]);
  });
  keys.push([cutAt(SEVEN.length - 1) + 0.5, rest, E.io3]);
  const tip = track(...keys);

  // The heading lamps: ghost at full (the bet), then the real glow settles to each level.
  const lamps = lay.lampX.map((x, i) => {
    const k = E.io2(P(t, C.at("settle") + 0.06 * i, C.at("settle") + 0.06 * i + 0.8));
    return { x, lv: q(LEVEL[i] * k, 3) };
  });

  // Mackenzie lifts his arm towards the headings during the bet, then lowers it.
  const lift = P(t, C.at("bet"), C.at("bet") + 0.6) * (1 - P(t, C.at("settle"), C.at("settle") + 0.6));

  // Reader: the beam while it reads, and three blinks, one per run.
  const blinking = BLINKS.some((b) => t >= b && t < b + 0.18);
  const lamp = blinking ? 1 : 0.25;
  const readOn = P(t, C.at("read"), C.at("read") + 0.3) * (1 - P(t, 5.2, 5.6));
  const rl = readerLamp(lay.reader.x, lay.reader.y);
  const beamOpacity = 0.07 * readOn * (blinking ? 1 : 0.5);
  const runN = BLINKS.filter((b) => t >= b).length;
  const runShown = runN > 0 && t < 4.9;
  const bothEnds = [lay.lampX[0] - 18, lay.lampX[lay.lampX.length - 1] + 18];

  const head = personHead(lay.person.x, lay.ground, lay.person.h);
  const quotesOn = t >= C.at("judge");

  return (
    <g>
      <Ground x1={lay.leftEnd} x2={lay.rightEnd} y={lay.ground} />
      <line x1={q(lay.lampX[0] - 22)} y1={q(lay.shelfY)} x2={q(lay.lampX[lay.lampX.length - 1] + 22)} y2={q(lay.shelfY)} style={{ stroke: FAINT }} strokeWidth={1} />

      {/* the bet: a ghost lamp at full, left dashed */}
      <polygon
        points={`${q(rl.x)},${q(rl.y)} ${q(bothEnds[0])},${q(lay.shelfY + 4)} ${q(bothEnds[1])},${q(lay.shelfY + 4)}`}
        style={{ fill: INK, fillOpacity: q(beamOpacity) }}
      />
      {lamps.map((L, i) => (
        <g key={i}>
          <line x1={q(L.x)} y1={q(bodyY + 6)} x2={q(L.x)} y2={q(lay.shelfY)} style={{ stroke: INK }} strokeWidth={1.2} />
          <circle cx={q(L.x)} cy={q(bodyY)} r={17} fill="none" style={{ stroke: MUTED }} strokeWidth={1} strokeDasharray="3 3" opacity={0.8} />
          <circle cx={q(L.x)} cy={q(bodyY)} r={q(4 + 13 * L.lv, 2)} style={{ fill: INK, fillOpacity: q(0.1 + 0.5 * L.lv, 3) }} />
          <circle cx={q(L.x)} cy={q(bodyY)} r={5} fill="none" style={{ stroke: INK }} strokeWidth={1.4} />
        </g>
      ))}
      <Label x={lay.bet.x} y={lay.bet.y} anchor="middle">bet: 1.0</Label>
      <Label x={lay.low.x} y={lay.low.y} anchor="middle">0.05</Label>
      <Label x={lay.high.x} y={lay.high.y} anchor="middle">0.90</Label>
      <Label x={lay.means.x} y={lay.means.y} anchor={lay.means.anchor}>means 0.47, 0.52, 0.50</Label>

      {LINES.map((w, i) => {
        const j = SEVEN.indexOf(i);
        if (j < 0) return <TextLine key={i} x={lay.x0} y={lineY(i)} w={w * lay.k} />;
        const cut = t >= cutAt(j);
        const dim = q(1 - 0.55 * P(t, cutAt(j), cutAt(j) + 0.3), 3);
        const state = quotesOn && !cut ? "judge" : "plain";
        return (
          <TextLine
            key={i} x={lay.x0} y={lineY(i)} w={w * lay.k} state={state} dim={dim}
            words={quotesOn && WORDS[i] ? WORDS[i] : undefined}
          />
        );
      })}

      <g opacity={q(P(t, 4.8, 5.2), 3)}>
        <Label x={lay.judge.x} y={lay.judge.y} anchor={lay.judge.anchor}>three runs, same seven lines</Label>
      </g>

      <Rewriter x={lay.rew.x} base={lay.ground} s={lay.rew.s} reach={lay.rew.reach} tip={tip(t)} />
      <Reader x={lay.reader.x} y={lay.reader.y} lamp={lamp} />
      {runShown && <Label x={lay.run.x} y={lay.run.y} anchor="middle">{`run ${runN} of 3`}</Label>}

      <Person x={lay.person.x} ground={lay.ground} h={lay.person.h} lift={lift} />
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

export default function BetOnHeadings() {
  return <Figure spec={spec} />;
}
