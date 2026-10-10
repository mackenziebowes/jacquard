"use client";
// What happened with the claim field. Five slots, each tagged `claim`. Haiku's five runs drop into them:
// the first run's number fits, the next four push long scrolls of sentences that jam the slot. I look at
// the jams and wonder if it's laziness. The tags are renamed importance_score, the slots are cut to a
// number-sized opening, and the same five runs go back in and each place a number.
import { Figure, defineFigure, cues, E, P, lerp, q } from "../_figure";
import { Reader, Person, personHead, Ground, Label, INK, FLAG, MUTED, FAINT } from "./world";

const RUNS = [1.0, 1.8, 2.6, 3.4, 4.2]; // first pass: five runs, one per slot
const RERUNS = [6.6, 7.2, 7.8, 8.4, 9.0]; // second pass: the same five runs, renamed slots
const C = cues({ lift: [4.6, 5.1], lazy: [4.8, 5.5], clear: [5.5, 5.9], relabel: [5.9, 6.2], narrow: [5.8, 6.3] });
const BLINKS = [...RUNS, ...RERUNS];

type Lay = {
  G: number; bw: number; pitch: number; cx0: number; binH: number; sw: number; sh: number; cw: number; chipH: number;
  reader: { x: number; y: number }; readerLabel: { x: number; y: number; anchor: "start" | "middle" };
  personX: number; personGround: number; personH: number; tagY: number; tagH: number; tagFont: number; twoLine: boolean;
  minOW: number; left: number; right: number; ground2?: number;
};
const DESK: Lay = {
  G: 262, bw: 108, pitch: 116, cx0: 64, binH: 40, sw: 78, sh: 84, cw: 16, chipH: 11,
  reader: { x: 296, y: 44 }, readerLabel: { x: 322, y: 49, anchor: "start" },
  personX: 612, personGround: 262, personH: 170, tagY: 270, tagH: 16, tagFont: 12, twoLine: false,
  minOW: 18, left: 10, right: 630,
};
const COMPACT: Lay = {
  G: 200, bw: 62, pitch: 68, cx0: 34, binH: 32, sw: 48, sh: 52, cw: 10, chipH: 7,
  reader: { x: 170, y: 36 }, readerLabel: { x: 190, y: 41, anchor: "start" },
  personX: 316, personGround: 372, personH: 118, tagY: 208, tagH: 30, tagFont: 11, twoLine: true,
  minOW: 12, left: 4, right: 336, ground2: 372,
};

// A scroll of sentences: a paper with wavy text lines.
function Scroll({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const n = 6, gap = (h - 12) / (n - 1), L = w - 12;
  const segs = Math.max(1, Math.floor((L - 5) / 5));
  const wave = `q 2.5 -2.5 5 0${" t5 0".repeat(segs - 1)}`;
  return (
    <g>
      <rect x={q(x)} y={q(y)} width={q(w)} height={q(h)} rx={3} style={{ fill: "var(--background)", stroke: MUTED }} strokeWidth={1.2} />
      {Array.from({ length: n }, (_, i) => {
        const yy = y + 6 + i * gap;
        return <path key={i} d={`M${q(x + 6)} ${q(yy)} ${wave}`} fill="none" style={{ stroke: MUTED }} strokeWidth={1.5} strokeLinecap="round" />;
      })}
    </g>
  );
}

function Chip({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect x={q(x)} y={q(y)} width={q(w)} height={q(h)} rx={2} style={{ fill: INK, fillOpacity: 0.75 }} />;
}

function Scene({ t, lay }: { t: number; lay: Lay }) {
  const binX = (i: number) => lay.cx0 + lay.pitch * i;
  const top = lay.G - lay.binH;
  const mouth = { x: lay.reader.x, y: lay.reader.y + 18 };
  const jamTop = lay.G - 6 - lay.sh; // a scroll sits in its slot with its top poking out over the lip
  const chipTop = lay.G - 4 - lay.chipH;
  const isScroll = (i: number) => i > 0;
  const w = (i: number) => (isScroll(i) ? lay.sw : lay.cw);
  const h = (i: number) => (isScroll(i) ? lay.sh : lay.chipH);

  // An item flying from the reader's mouth into slot i, starting at `start`. Top-left corner.
  const fly = (i: number, start: number) => {
    const e = P(t, start, start + 0.45);
    const tx = binX(i) - w(i) / 2, ty = isScroll(i) ? jamTop : chipTop;
    return { x: lerp(mouth.x - w(i) / 2, tx, E.io2(e)), y: lerp(mouth.y, ty, E.i2(e)), e };
  };

  // The slot's lip: open wide, then closed to a number-sized opening.
  const ow = () =>
    lerp(lay.bw - 8, lay.minOW, E.io3(P(t, C.at("narrow"), C.at("narrow") + 0.5)));

  // The lift of Mackenzie's arm and the thought over his head.
  const lift = P(t, C.at("lift"), C.at("lift") + 0.5) * (1 - P(t, C.at("clear"), C.at("clear") + 0.4));
  const lazyOn = P(t, C.at("lazy"), C.at("lazy") + 0.3) * (1 - P(t, C.at("clear"), C.at("clear") + 0.3));
  const relabelled = t >= C.at("relabel");
  const blinking = BLINKS.some((b) => t >= b && t < b + 0.16);
  const lamp = blinking ? 1 : 0.25;
  const head = personHead(lay.personX, lay.personGround, lay.personH);
  const tagW = lay.pitch - 4;

  return (
    <g>
      <Ground x1={lay.left} x2={lay.right} y={lay.G} />
      {lay.ground2 !== undefined && <Ground x1={lay.left} x2={lay.right} y={lay.ground2} />}

      {/* the slots */}
      {Array.from({ length: 5 }, (_, i) => {
        const cx = binX(i), x0 = cx - lay.bw / 2, x1 = cx + lay.bw / 2, o = ow() / 2;
        return (
          <path
            key={i}
            d={`M${q(x0)} ${q(top)}L${q(x0)} ${lay.G}L${q(x1)} ${lay.G}L${q(x1)} ${q(top)}M${q(x0)} ${q(top)}L${q(cx - o)} ${q(top)}M${q(cx + o)} ${q(top)}L${q(x1)} ${q(top)}`}
            fill="none" style={{ stroke: INK }} strokeWidth={1.5} strokeLinejoin="round"
          />
        );
      })}

      {/* the first pass: runs drop in, then the scrolls jam */}
      {RUNS.map((r, i) => {
        const start = r + 0.05, f = fly(i, start);
        if (t < start) return null;
        // pulled out before the relabel: lift and fade
        const c = P(t, C.at("clear"), C.at("clear") + 0.4);
        const op = 1 - c;
        if (op <= 0) return null;
        const x = f.x, y = f.y - 26 * c;
        return (
          <g key={`a${i}`} opacity={q(op, 3)}>
            {isScroll(i) ? <Scroll x={x} y={y} w={w(i)} h={h(i)} /> : <Chip x={x} y={y} w={w(i)} h={h(i)} />}
          </g>
        );
      })}

      {/* the second pass: the same five runs, each places a number */}
      {RERUNS.map((r, i) => {
        const f = fly(i, r + 0.05), landed = t >= r + 0.5;
        if (t < r + 0.05) return null;
        return <Chip key={`b${i}`} x={f.x} y={landed ? chipTop : f.y} w={lay.cw} h={lay.chipH} />;
      })}

      {/* the tags, under the desk */}
      {Array.from({ length: 5 }, (_, i) => {
        const cx = binX(i);
        const jam = i > 0 && t >= RUNS[i] + 0.5 && !relabelled;
        const claimOp = 1 - P(t, C.at("relabel"), C.at("relabel") + 0.3);
        const impOp = P(t, C.at("relabel") + 0.2, C.at("relabel") + 0.5);
        const tx = cx - tagW / 2;
        return (
          <g key={`tag${i}`}>
            <rect x={q(tx)} y={q(lay.tagY)} width={q(tagW)} height={lay.tagH} rx={3}
              fill="none" style={{ stroke: jam ? FLAG : FAINT }} strokeWidth={jam ? 1.6 : 1} />
            {lay.twoLine ? (
              <>
                <text x={q(cx)} y={q(lay.tagY + 13)} textAnchor="middle" fontSize={lay.tagFont} style={{ fill: INK, fillOpacity: q(claimOp, 3) }}>claim</text>
                <text x={q(cx)} y={q(lay.tagY + 13)} textAnchor="middle" fontSize={lay.tagFont} style={{ fill: INK, fillOpacity: q(impOp, 3) }}>importance_</text>
                <text x={q(cx)} y={q(lay.tagY + 25)} textAnchor="middle" fontSize={lay.tagFont} style={{ fill: INK, fillOpacity: q(impOp, 3) }}>score</text>
              </>
            ) : (
              <>
                <text x={q(cx)} y={q(lay.tagY + lay.tagH - 4.5)} textAnchor="middle" fontSize={lay.tagFont} style={{ fill: INK, fillOpacity: q(claimOp, 3) }}>claim</text>
                <text x={q(cx)} y={q(lay.tagY + lay.tagH - 4.5)} textAnchor="middle" fontSize={lay.tagFont} style={{ fill: INK, fillOpacity: q(impOp, 3) }}>importance_score</text>
              </>
            )}
          </g>
        );
      })}

      <Reader x={lay.reader.x} y={lay.reader.y} lamp={lamp} />
      <Label x={lay.readerLabel.x} y={lay.readerLabel.y} anchor={lay.readerLabel.anchor}>small reader x5</Label>

      <Person x={lay.personX} ground={lay.personGround} h={lay.personH} lift={lift} />
      <g opacity={q(lazyOn, 3)}>
        <Label x={head.x - 16} y={head.y - 14} anchor="end">lazy?</Label>
      </g>
    </g>
  );
}

const spec = defineFigure({
  dur: 9.6,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 380 },
  render: (t, _state, ctx) => <Scene t={t} lay={ctx.compact ? COMPACT : DESK} />,
});

export default function ClaimField() {
  return <Figure spec={spec} />;
}
