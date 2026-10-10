"use client";

// Why it matters: the cut setups were doing a job. A reader walks the opening of the post twice, once as written
// (a staircase of slips, steps down smoothly) and once after the cleanup (the signpost, "Okay." and "But" cut and
// tossed aside, so the drops are bare and the reader stumbles a little). Then the judge's flag on "Okay." goes to
// Mackenzie's hand, not to the scissors, which stay parked.
import { Figure, defineFigure, E, P, lerp, q, link, drawOn, walk } from "../_figure";
import { BODY, DIM, FAINT, INK, MARK, MONO, PAPER, PAPER_EDGE, Mackenzie, Scissors, Scrap, Slip } from "./world";

// Beats, in seconds.
const T = {
  walk1: 0.6, // reader walks the stairs as written
  toFound: [4.6, 5.1], snip1: [5.2, 5.4], fly1: [5.4, 6.1],
  toOkay: [5.7, 6.2], snip2: [6.35, 6.55], fly2: [6.55, 7.25],
  toBut: [6.8, 7.3], snip3: [7.5, 7.7], fly3: [7.7, 8.4],
  close: [8.0, 8.8], home: [8.0, 8.9],
  walk2: 9.0, // reader walks the cleaned stairs
  flag: [11.0, 11.5], travel: [11.6, 12.8], hand: [11.4, 12.5], labels: [12.2, 12.9],
  dur: 13.4,
};

type L = {
  W: number; H: number; compact: boolean; fs: number; th: number; sc: number; x0: number;
  ws: number; wf: number; wd: number; wo: number; wl: number; wBut: number;
  y: [number, number]; // lane tops
  mk: { x: number; y: number }; home: { x: number; y: number };
  aside: { found: { x: number; y: number }; but: { x: number; y: number }; okay: { x: number; y: number } };
  long: { before: string[]; after: string[] };
};
const STEP = 10, T0 = 124;
const land: L = {
  W: 740, H: 462, compact: false, fs: 13, th: 34, sc: 0.19, x0: 16,
  ws: 60, wf: 78, wd: 62, wo: 66, wl: 231, wBut: 31,
  y: [0, 240], mk: { x: 690, y: 240 + 198 }, home: { x: 470, y: 240 + 96 },
  aside: { found: { x: 420, y: 240 + 188 }, but: { x: 482, y: 240 + 188 }, okay: { x: 566, y: 240 + 188 } },
  long: { before: ["But where is that, exactly?"], after: ["Where is that, exactly?"] },
};
const port: L = {
  W: 360, H: 690, compact: true, fs: 12, th: 44, sc: 0.2, x0: 12,
  ws: 34, wf: 66, wd: 50, wo: 56, wl: 120, wBut: 0,
  y: [0, 244], mk: { x: 280, y: 668 }, home: { x: 64, y: 590 },
  aside: { found: { x: 304, y: 244 + 198 }, but: { x: 244, y: 244 + 198 }, okay: { x: 298, y: 244 + 170 } },
  long: { before: ["But where is", "that, exactly?"], after: ["Where is", "that, exactly?"] },
};

const SPEED = 140, STRIDE = 50;
const sstep = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };

type Stone = { x: number; w: number; level: number };
const groundAt = (x: number, stones: Stone[], top0: number) => {
  let i = stones.findIndex((s) => x >= s.x && x < s.x + s.w);
  if (i < 0) i = x < stones[0].x ? 0 : stones.length - 1;
  const here = top0 + STEP * stones[i].level, nx = stones[i + 1];
  if (!nx) return here;
  return lerp(here, top0 + STEP * nx.level, sstep((x - (nx.x - 10)) / 12));
};

// Mackenzie reading his own post: the world's line-drawn figure, half size, facing right, stepping on the gait phase.
function Reader({ x, ground, sc, phase, env, lean, flail }: { x: number; ground: number; sc: number; phase: number; env: number; lean: number; flail: number }) {
  const s = sc * 3; // ~half Mackenzie's height
  // Two legs like Mackenzie's: hips 6 either side, feet ~14 either side at rest, a slight knee bend; walking swings the thigh and folds the shin.
  const leg = (ph: number, side: number) => {
    const a = side * 0.22 * (1 - 0.6 * env) + 0.5 * env * Math.sin(ph), lift = env * Math.max(0, Math.cos(ph)) * 0.9;
    const hip = { x: 7 * side, y: -88 };
    const k = { x: hip.x + 44 * Math.sin(a), y: hip.y + 44 * Math.cos(a) };
    const b = a - side * 0.16 * (1 - env) - 0.1 * env - lift;
    const f = { x: k.x + 44 * Math.sin(b), y: Math.min(0, k.y + 44 * Math.cos(b)) };
    return `M${q(hip.x)} ${hip.y} L${q(k.x)} ${q(k.y)} L${q(f.x)} ${q(f.y)} l5 0`;
  };
  const arm = (ph: number, out: number) => {
    const a = -0.45 * env * Math.sin(ph) + out;
    return `M0 -132 L${q(22 * Math.sin(a))} ${q(-132 + 22 * Math.cos(a))} L${q(40 * Math.sin(a + 0.25))} ${q(-132 + 40 * Math.cos(a + 0.25))}`;
  };
  const out = 1.3 * Math.min(1, flail); // front arm flung forward at the bare drop
  const bob = 2 * env * Math.abs(Math.sin(phase));
  return (
    <g transform={`translate(${q(x)} ${q(ground)}) scale(${s}) rotate(${q(lean * 0.75)})`} stroke={INK} strokeWidth={2.2 / 1.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <g transform={`translate(0 ${q(bob)})`}>
        <path d={arm(phase + Math.PI, 0)} opacity={0.6} />
        <path d={leg(phase + Math.PI, -1)} opacity={0.6} />
        <path d="M-14 -138 Q0 -146 14 -138 L11 -86 L-11 -86 Z" fill={BODY} />
        <path d={leg(phase, 1)} />
        <path d={arm(phase, out)} />
        <circle cx={0} cy={-154} r={13} fill="var(--background)" />
        <circle cx={4} cy={-157} r={1} fill={INK} stroke="none" /><circle cx={10} cy={-157} r={1} fill={INK} stroke="none" />
      </g>
    </g>
  );
}

function Stone({ x, top, floor, w, lines, fs, bars, opacity = 1 }: { x: number; top: number; floor: number; w: number; lines?: string[]; fs: number; bars?: boolean; opacity?: number }) {
  return (
    <g opacity={q(opacity)}>
      <rect x={q(x)} y={q(top)} width={q(w)} height={q(floor - top)} rx={3} fill={PAPER} stroke={PAPER_EDGE} />
      {lines?.map((s, i) => <text key={i} x={q(x + 8)} y={q(top + 17 + i * (fs + 3))} fontSize={fs} fill={INK}>{s}</text>)}
      {bars && [0.7, 0.5].map((b, i) => <line key={i} x1={q(x + 6)} x2={q(x + 6 + (w - 12) * b)} y1={top + 12 + i * 9} y2={top + 12 + i * 9} stroke={DIM} strokeWidth={3} strokeLinecap="round" />)}
    </g>
  );
}

const spec = defineFigure({
  dur: T.dur,
  size: { W: land.W, H: land.H },
  compact: { W: port.W, H: port.H },
  render: (t, _s, { compact }) => {
    const L = compact ? port : land;
    const { fs, th, sc, x0 } = L;
    const [Y1, Y2] = L.y;
    const top1 = Y1 + T0, top2 = Y2 + T0;
    const F1 = top1 + 4 * STEP + th, F2 = top2 + 4 * STEP + th;

    // stone layout: lane 1 as written; lane 2 starts identical then closes up as the cuts land
    const cl = E.io3(P(t, T.close[0], T.close[1]));
    const gone1 = t >= T.fly1[0], gone2 = t >= T.fly2[0], gone3 = t >= T.fly3[0];
    const xs = x0, xf = xs + L.ws, xd = xf + L.wf, xo = xd + L.wd, xl = xo + L.wo;
    const wl2 = L.wl - L.wBut * cl;
    const lane1: Stone[] = [{ x: xs, w: L.ws, level: 0 }, { x: xf, w: L.wf, level: 1 }, { x: xd, w: L.wd, level: 2 }, { x: xo, w: L.wo, level: 3 }, { x: xl, w: L.wl, level: 4 }];
    const dx = L.wf * cl, dl = (L.wf + L.wo) * cl;
    const lane2Now = { d: xd - dx, l: xl - dl };
    const final: Stone[] = [{ x: xs, w: L.ws, level: 0 }, { x: xd - L.wf, w: L.wd, level: 2 }, { x: xl - L.wf - L.wo, w: L.wl - L.wBut, level: 4 }];

    // readers
    const endX = (st: Stone[]) => st[st.length - 1].x + st[st.length - 1].w - 40;
    const rx0 = xs + 24;
    const r1 = walk(t, { x0: rx0, to: endX(lane1), t0: T.walk1, speed: SPEED, stride: STRIDE });
    const r2 = walk(t, { x0: rx0, to: endX(final), t0: T.walk2, speed: SPEED, stride: STRIDE });
    const env = (w: typeof r1, t0: number, to: number) => P(t, t0, t0 + 0.25) * (1 - P(t, t0 + Math.abs(to - rx0) / SPEED - 0.3, t0 + Math.abs(to - rx0) / SPEED));
    const e1 = env(r1, T.walk1, endX(lane1)), e2 = env(r2, T.walk2, endX(final));
    // the lurch: a damped swing forward just after each bare drop
    const lurch = (edge: number, amp: number) => {
      const tau = t - (T.walk2 + (edge - rx0) / SPEED);
      return tau < 0 ? 0 : amp * Math.exp(-4.5 * tau) * Math.sin(9 * tau);
    };
    const lu = lurch(final[1].x - 4, 0.55) + lurch(final[2].x - 4, 1);
    const g2 = groundAt(r2.x, final, top2) + 5 * Math.abs(lu);

    // scissors: home -> found slab -> okay slab -> "But" -> home
    const homeP = { x: L.home.x, y: L.home.y };
    const above = (cx: number, top: number) => ({ x: cx, y: top - 24 });
    const pF = above(xf + 26, top2 + STEP), pO = above(xo + 20, top2 + 3 * STEP), pB = above(xl + 10, top2 + 4 * STEP);
    const sx = (a: { x: number; y: number }, b: { x: number; y: number }, k: number) => ({ x: lerp(a.x, b.x, E.io3(k)), y: lerp(a.y, b.y, E.io3(k)) });
    let sp = homeP;
    if (t < T.toOkay[0]) sp = sx(homeP, pF, P(t, T.toFound[0], T.toFound[1]));
    else if (t < T.toBut[0]) sp = sx(pF, pO, P(t, T.toOkay[0], T.toOkay[1]));
    else if (t < T.home[0]) sp = sx(pO, pB, P(t, T.toBut[0], T.toBut[1]));
    else sp = sx(pB, homeP, P(t, T.home[0], T.home[1]));
    const snip = (a: number) => { const d = t - a; return d < 0 || d > 0.2 ? 0 : Math.sin((d / 0.2) * Math.PI); };
    const open = Math.max(snip(T.snip1[0]), snip(T.snip1[1] - 0.1), snip(T.snip2[0]), snip(T.snip2[1] - 0.1), snip(T.snip3[0]), snip(T.snip3[1] - 0.1));

    // tossed scraps
    const A = L.aside;
    const scrap = (id: "found" | "okay" | "but", label: string, from: { x: number; y: number }, span: readonly number[], w: number, rot: number) => {
      const k = P(t, span[0], span[1]);
      if (k <= 0) return null;
      const to = A[id], e = E.io2(k);
      const arc = 46 * Math.sin(Math.PI * e);
      return (
        <Scrap key={id} x={lerp(from.x, to.x, e)} y={lerp(from.y, to.y, e) - arc} w={w} h={fs + 7} rot={rot * e}>
          <text x={0} y={fs * 0.35} textAnchor="middle" fontSize={fs} fill={INK}>{label}</text>
        </Scrap>
      );
    };
    const cw = fs * 0.6;

    // final beat: the judge's flag on "Okay." goes to Mackenzie
    const hu = E.io2(P(t, T.hand[0], T.hand[1]));
    const handAbs = { x: L.mk.x + (-26 + 6 * hu) * 0.95 - 24, y: L.mk.y - (92 + 50 * hu) * 0.95 - 16 };
    const cardFrom = { x: A.okay.x, y: A.okay.y - 24 };
    const tk = E.io3(P(t, T.travel[0], T.travel[1]));
    const lk = link(cardFrom, handAbs, tk, { bend: 0.5, vertical: compact });
    const lkFull = link(cardFrom, handAbs, 1, { bend: 0.5, vertical: compact });
    const fk = E.back(P(t, T.flag[0], T.flag[1]));
    const flying = t >= T.flag[0];
    const slipPos = tk > 0 ? lk.bead : cardFrom;
    const lab = E.o2(P(t, T.labels[0], T.labels[1]));
    const slightly = E.o2(P(t, T.walk2 + (final[2].x - rx0) / SPEED, T.walk2 + (final[2].x - rx0) / SPEED + 0.8));

    return (
      <g style={{ fontFamily: MONO }}>
        {/* lane captions and floors */}
        <text x={L.x0} y={Y1 + 14} fontSize={11} fill={DIM}>as written</text>
        <text x={L.x0} y={Y2 + 14} fontSize={11} fill={DIM}>cleaned, rule kept</text>
        <line x1={6} x2={L.W - 6} y1={F1} y2={F1} stroke={FAINT} />
        <line x1={6} x2={L.W - 6} y1={F2} y2={F2} stroke={FAINT} />

        {/* lane 1: as written */}
        <Stone x={xs} top={top1} floor={F1} w={L.ws} fs={fs} bars />
        <Stone x={xf} top={top1 + STEP} floor={F1} w={L.wf} fs={fs} lines={["I found."]} />
        <Stone x={xd} top={top1 + 2 * STEP} floor={F1} w={L.wd} fs={fs} lines={["data"]} />
        <Stone x={xo} top={top1 + 3 * STEP} floor={F1} w={L.wo} fs={fs} lines={["Okay."]} />
        <Stone x={xl} top={top1 + 4 * STEP} floor={F1} w={L.wl} fs={fs} lines={L.long.before} />
        <Reader x={r1.x} ground={groundAt(r1.x, lane1, top1)} sc={sc} phase={r1.phase} env={e1} lean={0} flail={0} />

        {/* lane 2: cut, then closed up */}
        <Stone x={xs} top={top2} floor={F2} w={L.ws} fs={fs} bars />
        {!gone1 && <Stone x={xf} top={top2 + STEP} floor={F2} w={L.wf} fs={fs} lines={["I found."]} />}
        <Stone x={lane2Now.d} top={top2 + 2 * STEP} floor={F2} w={L.wd} fs={fs} lines={["data"]} />
        {!gone2 && <Stone x={xo} top={top2 + 3 * STEP} floor={F2} w={L.wo} fs={fs} lines={["Okay."]} />}
        <Stone x={lane2Now.l} top={top2 + 4 * STEP} floor={F2} w={wl2} fs={fs} lines={gone3 ? L.long.after : L.long.before} />
        <Reader x={r2.x} ground={g2} sc={sc} phase={r2.phase} env={e2} lean={20 * lu} flail={1.1 * Math.abs(lu)} />

        {scrap("found", "I found.", { x: xf + L.wf / 2, y: top2 + STEP + 14 }, T.fly1, 8 * cw + 8, -9)}
        {scrap("okay", "Okay.", { x: xo + L.wo / 2, y: top2 + 3 * STEP + 14 }, T.fly2, 5 * cw + 8, 6)}
        {gone3 && scrap("but", compact ? "But" : "But", { x: xl + 14, y: top2 + 4 * STEP + 14 }, T.fly3, 3 * cw + 8, -7)}

        <text x={endX(final)} y={top2 + 4 * STEP - 106} textAnchor="middle"
          fontSize={11} fill={DIM} opacity={q(slightly)}>slightly worse</text>

        {/* judge flag to a person, not to the scissors */}
        {t >= T.travel[0] - 0.05 && <path d={lkFull.d} fill="none" stroke={FAINT} strokeWidth={1.2} {...drawOn(tk)} />}
        <Scissors x={sp.x} y={sp.y} s={1.1} open={open} rot={-6} armFrom={[sp.x + 26, compact ? sp.y - 60 : Y2 + 16]} />
        <text x={compact ? L.home.x : L.home.x} y={compact ? L.home.y + 54 : L.home.y + 52} textAnchor="middle" fontSize={11} fill={DIM}>rewriter</text>

        <Mackenzie x={L.mk.x} y={L.mk.y} s={0.95} handUp={hu} />
        <text x={L.mk.x} y={L.mk.y + 16} textAnchor="middle" fontSize={11} fill={DIM} style={{ display: compact ? "block" : "block" }}>Mackenzie</text>
        {flying && (
          <Slip x={slipPos.x} y={slipPos.y} w={58} h={30} bars={[]} flag={fk} rot={0}>
            <text x={-29 + 8} y={4} fontSize={fs} fill={INK}>Okay.</text>
          </Slip>
        )}
        <text x={compact ? 12 : cardFrom.x - 10} y={compact ? F2 + 38 : F2 + 30} textAnchor="start" fontSize={11} fill={DIM} opacity={q(lab)}>judge flag, to a person</text>
      </g>
    );
  },
});

export default function CleanReadsWorse() {
  return <Figure spec={spec} />;
}
