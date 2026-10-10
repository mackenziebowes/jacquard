"use client";
// The test on my own posts. Five desks, one page each. Each finding the gate raised is an accent scrap
// on its desk, so the litter counts are the gate's own before numbers. The rewriter (a fresh subagent
// per file) walks the row and sweeps the scraps into each desk's bin, and the counts it leaves behind
// are the after numbers. The resume is the control: it has no findings, so the rewriter never goes
// to its desk. The small-business bin also takes one good line that was lying on the litter.
import { Figure, defineFigure, track, pile, lerp, P, E, q, type Ease } from "../_figure";
import { TextLine, Rewriter, rewriterRest, Ground, Label, INK, MUTED, FLAG } from "./world";

type Pt = { x: number; y: number };
type Pos = { x: number; base: number };
type Item = { cx: number; cy: number; r: number; gone: boolean; bar?: boolean; T0: number };

const DESKS = [
  { name: "E-E-A-T", before: 9, after: 0, good: false },
  { name: "OG images", before: 4, after: 2, good: false },
  { name: "Vibe manufacturing", before: 1, after: 0, good: false },
  { name: "small business", before: 14, after: 1, good: true },
  { name: "resume (control)", before: 0, after: 0, good: false },
];
const VISITED = 4; // the rewriter never goes to the resume desk
const RW_X = 78; // where the rewriter stands on each desk, in desk units
const BIN = { x: 9, y: -4 }; // where a swept piece drops in, in desk units
const WIDTHS = [30, 26, 34, 22]; // the page's bars, in desk units

// Two layouts. Desktop is one row; compact stacks the last two desks underneath.
const LAY_D = DESKS.map((_, i) => ({ ox: 10 + 128 * i, gy: 200, k: 1 }));
const LAY_C = DESKS.map((_, i) => (i < 3 ? { ox: 2 + 118 * i, gy: 140, k: 0.92 } : { ox: 61 + 118 * (i - 3), gy: 300, k: 0.92 }));

// The litter, built once in desk units (ground y = 0, the page rises above it).
// Bottom row first: the first `after` scraps stay, the rest get swept, top of the pile first.
const visits = DESKS.slice(0, VISITED).map((d, i) => {
  const litter = pile(d.before, { cx: 108, base: 0, w: 4.5, h: 4, gap: 1, step: 2, seed: i + 3 });
  const items: Item[] = litter.map((p, k) => ({ cx: p.x, cy: p.y, r: p.r, gone: k >= d.after, T0: 0 }));
  const sweep: Item[] = items.filter((it) => it.gone).reverse();
  if (d.good) sweep.push({ cx: 104, cy: -21.5, r: 0, gone: true, bar: true, T0: 0 });
  return { i, items, sweep, ws: undefined as number | undefined, we: undefined as number | undefined };
});

// The timeline: walk to the next desk, sweep it, pause, repeat.
let clock = 0.5;
for (const v of visits) {
  if (v.i > 0) { v.ws = clock; v.we = clock + 0.5; clock += 0.5; }
  const gap = Math.min(0.2, 1 / v.sweep.length);
  v.sweep.forEach((it, k) => { it.T0 = clock + 0.3 + k * gap; });
  clock = v.sweep[v.sweep.length - 1].T0 + 0.45 + 0.15;
}
const DUR = clock + 0.3;

const at = (L: { ox: number; gy: number; k: number }[], i: number): Pos => ({ x: L[i].ox + RW_X * L[i].k, base: L[i].gy });
const glob = (L: { ox: number; gy: number; k: number }[], i: number, it: Item): Pt => ({ x: L[i].ox + it.cx * L[i].k, y: L[i].gy + it.cy * L[i].k });

function posTrack(L: typeof LAY_D) {
  const keys: [number, Pos, Ease?][] = [[0, at(L, 0)]];
  for (const v of visits) if (v.ws !== undefined) keys.push([v.ws, at(L, v.i - 1)], [v.we!, at(L, v.i), E.io3]);
  return track(...keys);
}

function penTrack(L: typeof LAY_D, s: number) {
  const rest = (i: number) => rewriterRest(at(L, i).x, at(L, i).base, s);
  const keys: [number, Pt, Ease?][] = [[0, rest(0)]];
  for (const v of visits) {
    if (v.ws !== undefined) keys.push([v.ws, rest(v.i - 1)], [v.we!, rest(v.i)]);
    v.sweep.forEach((it) => keys.push([it.T0 - 0.2, glob(L, v.i, it)]));
    keys.push([v.sweep[v.sweep.length - 1].T0 + 0.45, glob(L, v.i, v.sweep[v.sweep.length - 1])]);
  }
  const last = visits[visits.length - 1];
  keys.push([DUR, rest(last.i)]);
  return track(...keys);
}

// One piece of litter (or the good line). Still litter sits on its pile; swept litter slides to the bin and goes in.
function Piece({ it, t }: { it: Item; t: number }) {
  const moving = it.gone;
  const x = moving ? lerp(it.cx, BIN.x, E.io2(P(t, it.T0, it.T0 + 0.35))) : it.cx;
  const y = moving ? lerp(it.cy, BIN.y, E.i2(P(t, it.T0 + 0.3, it.T0 + 0.5))) : it.cy;
  const op = moving ? 1 - P(t, it.T0 + 0.4, it.T0 + 0.5) : 1;
  if (it.bar) {
    return (
      <g transform={`translate(${q(x)} ${q(y)})`} opacity={q(op, 3)}>
        <TextLine x={-15} y={-6.5} w={30} />
        <path d="M16 0L18.5 3L23 -3" fill="none" style={{ stroke: INK }} strokeWidth={1.4} />
      </g>
    );
  }
  return (
    <g transform={`translate(${q(x)} ${q(y)}) rotate(${q(it.r)})`} opacity={q(op, 3)}>
      <rect x={-2.25} y={-2} width={4.5} height={4} rx={1} style={{ fill: FLAG }} />
    </g>
  );
}

function Scene({ t, compact }: { t: number; compact: boolean }) {
  const L = compact ? LAY_C : LAY_D;
  const s = L[0].k;
  const pos = posTrack(L)(t);
  const walking = visits.some((v) => v.ws !== undefined && t >= v.ws && t <= v.we!);
  const tip = walking ? rewriterRest(pos.x, pos.base, s) : penTrack(L, s)(t);

  return (
    <g>
      {compact ? (
        <>
          <Ground x1={2} x2={358} y={140} />
          <Ground x1={61} x2={297} y={300} />
        </>
      ) : (
        <Ground x1={4} x2={656} y={200} />
      )}

      {DESKS.map((d, i) => {
        const l = L[i], v = visits.find((w) => w.i === i);
        return (
          <g key={i}>
            <g transform={`translate(${q(l.ox)} ${q(l.gy)}) scale(${q(l.k, 3)})`}>
              <path d="M2 -14L4 0L14 0L16 -14" fill="none" style={{ stroke: INK }} strokeWidth={1.2} />
              <rect x={22} y={-96} width={44} height={96} rx={3} fill="none" style={{ stroke: MUTED }} strokeWidth={1} />
              {[-84, -66, -48, -30].map((y, k) => <TextLine key={k} x={28} y={y} w={WIDTHS[(i + k) % WIDTHS.length]} />)}
              {v?.items.filter((it) => !it.gone).map((it, j) => <Piece key={`k${j}`} it={it} t={t} />)}
              {v?.sweep.map((it, j) => <Piece key={`s${j}`} it={it} t={t} />)}
            </g>
            <Label x={q(l.ox + 64 * l.k)} y={l.gy + 18} anchor="middle" size={12}>{d.name}</Label>
            <Label x={q(l.ox + 64 * l.k)} y={l.gy + 33} anchor="middle" size={12}>{`${d.before} to ${d.after}`}</Label>
          </g>
        );
      })}

      <Label x={10} y={18} anchor="start" size={12}>rewriter: a fresh subagent per file</Label>
      <Rewriter x={pos.x} base={pos.base} s={s} reach={175} tip={tip} />
    </g>
  );
}

const spec = defineFigure({
  dur: DUR,
  size: { W: 660, H: 300 },
  compact: { W: 360, H: 350 },
  render: (t, _state, ctx) => <Scene t={t} compact={ctx.compact} />,
});

export default function TestOnMyPosts() {
  return <Figure spec={spec} />;
}
