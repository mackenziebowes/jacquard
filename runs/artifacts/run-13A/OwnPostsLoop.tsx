"use client";

// Section "Testing it on my own posts": the loop, as a track. The belt bends into a stadium: gate (inks), judge
// bench, scissors (cut), then back round for another go, up to three rounds. The small-business slip comes in with
// 14 marks and leaves with 1 and a small crease; the resume (control) rides straight through, no marks, no scissors.
// Claim: the loop found real things to fix, and it also made the small-business post worse.
// Counts 14, 1, 0 and the tray labels are from the post's table. Marks left between rounds, the lap count of 2
// and the crease are illustrative.
import { Figure, defineFigure, E, P, q } from "../_figure";
import { Bench, DIM, FAINT, Gate, Haiku, INK, MARK, MONO, Mark, PAPER, PAPER_EDGE, BODY, Scissors, Scrap, Slip } from "./world";

type Pt = [number, number];
type L = {
  compact: boolean; W: number; H: number; laneW: number; r: number;
  a0: number; aA: number; aB: number; aG: number; aN: number; aS: number; aE: number; bDrop: number;
  pt: (a: number, b: number) => Pt;
  slip: { w: number; h: number; fs: number };
  cols: number; speed: number;
};
const T = 165;
const land: L = {
  compact: false, W: 760, H: 395, laneW: 66, r: 60, a0: 30, aA: 110, aB: 505, aG: 195, aN: 340, aS: 455, aE: 670, bDrop: 87,
  pt: (a, b) => [a, T + b], slip: { w: 140, h: 58, fs: 10 }, cols: 7, speed: 330,
};
const port: L = {
  compact: true, W: 360, H: 935, laneW: 130, r: 88, a0: 45, aA: 125, aB: 625, aG: 245, aN: 415, aS: 580, aE: 780, bDrop: 165,
  pt: (a, b) => [100 + b, a], slip: { w: 120, h: 82, fs: 11 }, cols: 5, speed: 330,
};

// removal order of the 14 mark slots: first 10 fall at round 1, next 3 at round 2, slot 4 stays
const ORDER = [3, 10, 0, 7, 12, 5, 9, 1, 13, 6, 2, 11, 8];
const ROUND1 = 10;

type Wp = { tA: number; tD: number; d: number; kind: "start" | "gate" | "bench" | "scis" | "exit"; lap: number };
type Sched = { res: Wp[]; sb: Wp[]; loops: number; len: number; dur: number; tRes: number; tSb: number };

function build(l: L): Sched {
  const len = 2 * (l.aB - l.aA) + 2 * Math.PI * l.r;
  const mk = (ts: number, loops: number, dw: [number, number, number]): Wp[] => {
    const out: Wp[] = [{ tA: ts, tD: ts, d: -120, kind: "start", lap: 0 }];
    let t = ts, d = -120;
    const go = (nd: number, dwell: number, kind: Wp["kind"], lap: number) => {
      t += (Math.abs(nd - d) / l.speed) * 1.12; d = nd;
      out.push({ tA: t, tD: t + dwell, d, kind, lap }); t += dwell;
    };
    for (let k = 0; k <= loops; k++) {
      go(l.aG - l.a0 + k * len, dw[0], "gate", k);
      go(l.aN - l.a0 + k * len, dw[1], "bench", k);
      go(l.aS - l.a0 + k * len, dw[2], "scis", k);
    }
    go(l.aE - l.a0 + loops * len, 0, "exit", loops);
    return out;
  };
  const res = mk(0.3, 0, [0.45, 0.45, 0.45]);
  const sb = mk(2.2, 1, [1.1, 1.2, 1.4]);
  const tRes = res[res.length - 1].tA, tSb = sb[sb.length - 1].tA;
  return { res, sb, loops: 1, len, dur: tSb + 2.0, tRes, tSb };
}
const cache = new Map<boolean, Sched>();
const sched = (l: L) => { let s = cache.get(l.compact); if (!s) { s = build(l); cache.set(l.compact, s); } return s; };

function dAt(wp: Wp[], t: number) {
  if (t <= wp[0].tD) return wp[0].d;
  for (let i = 1; i < wp.length; i++) {
    if (t < wp[i].tA) return wp[i - 1].d + (wp[i].d - wp[i - 1].d) * E.io2(P(t, wp[i - 1].tD, wp[i].tA));
    if (t <= wp[i].tD) return wp[i].d;
  }
  return wp[wp.length - 1].d;
}

// abstract track position: a along the straight, b across (towards the return lane)
function track(l: L, d: number, loops: number): { a: number; b: number } {
  const e = l.aA - l.a0, S = l.aB - l.aA, r = l.r, len = 2 * S + 2 * Math.PI * r;
  if (d <= e) return { a: l.a0 + d, b: 0 };
  if (d >= l.aB - l.a0 + loops * len) return { a: l.a0 + d - loops * len, b: 0 };
  let m = (d - e) % len;
  if (m <= S) return { a: l.aA + m, b: 0 };
  m -= S;
  if (m <= Math.PI * r) { const th = m / r; return { a: l.aB + r * Math.sin(th), b: r - r * Math.cos(th) }; }
  m -= Math.PI * r;
  if (m <= S) return { a: l.aB - m, b: 2 * r };
  m -= S;
  const th = m / r;
  return { a: l.aA - r * Math.sin(th), b: r + r * Math.cos(th) };
}

const bump = (t: number, a: number, b: number) => { const p = P(t, a, b); return E.io2(P(p, 0.1, 0.35)) - E.io2(P(p, 0.65, 0.9)); };
const snipK = (t: number, a: number) => { const d = t - a; return d < 0 || d > 0.28 ? 0 : Math.sin((d / 0.28) * Math.PI); };

function slotPos(l: L, i: number): Pt {
  const { cols } = l;
  if (cols === 7) return [(i % 7 - 3) * 18, -17 + Math.floor(i / 7) * 18];
  const row = Math.floor(i / 5), c = i % 5, n = row === 2 ? 4 : 5;
  return [(c - (n - 1) / 2) * 19, -24 + row * 18];
}

const spec = defineFigure({
  dur: Math.max(sched(land).dur, sched(port).dur),
  size: { W: land.W, H: land.H },
  compact: { W: port.W, H: port.H },
  render: (t, _s, { compact }) => {
    const l = compact ? port : land;
    const S = sched(l);
    const { w, h, fs } = l.slip;
    const P2 = (a: number, b: number) => l.pt(a, b);
    const sw = compact ? 0 : 1;

    // ---- track drawing
    const r = l.r, hl = l.laneW / 2;
    const m = (a: number, b: number) => { const [x, y] = P2(a, b); return `${q(x)} ${q(y)}`; };
    const arcA = `A ${r} ${r} 0 0 ${sw} `;
    const loopD = `M ${m(l.aA, 0)} L ${m(l.aB, 0)} ${arcA}${m(l.aB, 2 * r)} L ${m(l.aA, 2 * r)} ${arcA}${m(l.aA, 0)} Z`;
    const entryD = `M ${m(l.a0 - 130, 0)} L ${m(l.aA, 0)}`;
    const exitD = `M ${m(l.aB, 0)} L ${m(l.aE + 36, 0)}`;
    const resD = dAt(S.res, t), sbD = dAt(S.sb, t);
    const phase = resD + sbD;
    const ribbons = [loopD, entryD, exitD];

    // ---- slips
    const posOf = (d: number, loops: number) => { const p = track(l, d, loops); return P2(p.a, p.b); };
    const resTray = E.io2(P(t, S.tRes + 0.2, S.tRes + 1.1));
    const resPos = (() => { const p = track(l, resD, 0); return P2(p.a, p.b + l.bDrop * resTray); })();
    const sbPos = posOf(sbD, S.loops);

    // ---- machine activity
    const act = (wps: Wp[], kind: Wp["kind"], f: (w: Wp) => number) => wps.filter((x) => x.kind === kind).reduce((s, x) => s + f(x), 0);
    const press = act(S.res, "gate", (x) => bump(t, x.tA, x.tD)) + act(S.sb, "gate", (x) => bump(t, x.tA, x.tD));
    const raise = (i: number) => act(S.sb, "bench", (x) => { const p = P(t, x.tA + 0.15 + i * 0.05, x.tD - 0.1); return E.o3(P(p, 0, 0.35)) * (1 - E.io2(P(p, 0.7, 1))); });
    const scis = S.sb.filter((x) => x.kind === "scis");
    const down = scis.reduce((s, x) => s + bump(t, x.tA, x.tD), 0);
    const open = scis.reduce((s, x) => { const dw = x.tD - x.tA; return s + Math.max(snipK(t, x.tA + 0.42 * dw), snipK(t, x.tA + 0.58 * dw)) + 0.3 * bump(t, x.tA, x.tD); }, 0);
    const gate1 = S.sb.find((x) => x.kind === "gate")!;
    const cut = (lap: number) => { const x = scis[lap]; return x.tA + 0.55 * (x.tD - x.tA); };

    // gate (centre of the lane, slip bottom)
    const [gx, gy] = P2(l.aG, 0);
    const [bx, by] = P2(l.aN, 0);
    const [sx, sy] = P2(l.aS, 0);
    const sp = compact ? 34 : 26, hs = compact ? 1.1 : 1;
    const feet = by - h / 2 - (compact ? 33 : 19) - 14;
    const hov = compact ? 58 : 62;
    const pivotY = sy - h / 2 - 38 - hov * (1 - Math.min(1, down));

    // ---- small-business marks: slot i exists from its ink time until its cut time
    const inkT = (i: number) => gate1.tA + 0.4 * (gate1.tD - gate1.tA) + i * 0.035;
    const rank = (i: number) => ORDER.indexOf(i); // -1 = stays
    const remT = (i: number) => { const k = rank(i); return k < 0 ? Infinity : k < ROUND1 ? cut(0) + k * 0.05 : cut(1) + (k - ROUND1) * 0.06; };
    const slots = Array.from({ length: 14 }, (_, i) => i);
    const crease = E.o3(P(t, cut(1) + 0.5, cut(1) + 1.0));
    const rounds = [t >= cut(0) ? 1 : 0, t >= cut(1) ? 1 : 0];

    const sbNameY = compact ? 33 : 24;
    const barRows = compact ? [-24, -12, 0] : [-17, -8, 1];
    const labelFade = (t0: number) => E.o3(P(t, t0, t0 + 0.5));
    const tinyW = compact ? 150 : 118, tinyH = compact ? 26 : 20, tfs = compact ? 11.5 : 10;
    const tiny = [["E-E-A-T 9 to 0"], ["OG images 4 to 2"], ["Vibe 1 to 0"]];
    const tinyXY = (i: number): Pt => compact ? [180, 872 + i * 31] : [670, 330 + i * 24];
    const [exX, exY] = P2(l.aE, 0);
    const [rtX, rtY] = P2(l.aE, l.bDrop);
    const center: Pt = compact ? [P2(0, 2 * r)[0], 480] : [(l.aA + l.aB) / 2, T + r];

    return (
      <g style={{ fontFamily: MONO }}>
        <defs><clipPath id="opl-clip"><rect x={0} y={0} width={l.W} height={l.H} /></clipPath></defs>
        <g clipPath="url(#opl-clip)">
          {/* the track */}
          {ribbons.map((d, i) => <path key={`e${i}`} d={d} fill="none" stroke={FAINT} strokeWidth={l.laneW + 2} strokeLinejoin="round" />)}
          {ribbons.map((d, i) => <path key={`f${i}`} d={d} fill="none" stroke={BODY} strokeWidth={l.laneW} strokeLinejoin="round" />)}
          {ribbons.map((d, i) => (
            <path key={`t${i}`} d={d} fill="none" stroke={FAINT} strokeWidth={l.laneW - 4} strokeDasharray="1.2 26.8" strokeDashoffset={q(-phase, 1)} opacity={0.45} />
          ))}
          {ribbons.map((d, i) => <path key={`c${i}`} d={d} fill="none" stroke={BODY} strokeWidth={l.laneW - 14} strokeLinejoin="round" />)}
          <path d={loopD} fill="none" stroke={BODY} strokeWidth={0} />

          {/* centre of the loop */}
          {compact ? (
            <g fill={DIM} fontSize={12} textAnchor="middle" transform={`translate(${q(P2(0, 2 * r)[0])} 0)`}>
              <text x={0} y={470}>up to</text><text x={0} y={486}>3 rounds</text>
              {[0, 1, 2].map((k) => <circle key={k} cx={(k - 1) * 14} cy={503} r={4.2} fill={k < 2 && rounds[k] ? INK : "none"} stroke={DIM} strokeWidth={1.3} />)}
            </g>
          ) : (
            <g fill={DIM} fontSize={12} textAnchor="middle">
              <text x={center[0]} y={center[1] - 2}>up to 3 rounds</text>
              {[0, 1, 2].map((k) => <circle key={k} cx={center[0] + (k - 1) * 14} cy={center[1] + 13} r={4} fill={k < 2 && rounds[k] ? INK : "none"} stroke={DIM} strokeWidth={1.3} />)}
            </g>
          )}

          {/* machines */}
          <Gate x={gx} y={gy + h / 2} press={Math.min(1, press)} width={compact ? 160 : 120} fs={12} />
          <Bench x={bx} y={feet} w={5 * sp + 14} label="judge × 5" fs={compact ? 12 : 11} />
          {[0, 1, 2, 3, 4].map((i) => <Haiku key={i} x={bx + (i - 2) * sp} y={feet} s={hs} raise={Math.min(1, raise(i))} />)}

          {/* resume: control */}
          <Slip x={resPos[0]} y={resPos[1]} w={w} h={h} bars={[]}>
            {[0.8, 0.62, 0.72].map((b, i) => (
              <line key={i} x1={-w / 2 + 14} x2={q(-w / 2 + 14 + (w - 28) * b)} y1={barRows[i]} y2={barRows[i]} stroke={DIM} strokeWidth={3.5} strokeLinecap="round" />
            ))}
            <text x={0} y={sbNameY} textAnchor="middle" fontSize={fs} fill={INK}>résumé (control)</text>
          </Slip>

          {/* small business */}
          <Slip x={sbPos[0]} y={sbPos[1]} w={w} h={h} bars={[]}>
            {slots.map((i) => {
              if (t >= remT(i)) return null;
              const k = E.o3(P(t, inkT(i), inkT(i) + 0.25));
              const [px, py] = slotPos(l, i);
              return <Mark key={i} x={px} y={py} s={0.8} k={k} />;
            })}
            {crease > 0 && (
              <g opacity={q(crease)}>
                <path d={`M ${w / 2 - 34} ${-h / 2} L ${w / 2 - 26} ${-h / 2 + 9} L ${w / 2 - 18} ${-h / 2} Z`} fill="var(--background)" stroke={PAPER_EDGE} strokeWidth={1} />
                <line x1={w / 2 - 26} y1={-h / 2 + 9} x2={w / 2 - 30} y2={h / 2 - 22} stroke={DIM} strokeWidth={1} strokeDasharray="2 3" />
              </g>
            )}
            <text x={0} y={sbNameY} textAnchor="middle" fontSize={fs} fill={INK}>small business</text>
          </Slip>

          {/* scraps: one for each mark cut off */}
          {ORDER.map((i, k) => {
            const t0 = remT(i);
            if (t < t0) return null;
            const p = P(t, t0, t0 + 0.8);
            if (p >= 1) return null;
            const [px, py] = slotPos(l, i);
            const [cx0, cy0] = P2(l.aS, 0);
            const rot = (k % 2 ? 1 : -1) * (10 + 14 * (k % 3)) * E.o2(p);
            return (
              <Scrap key={i} x={cx0 + px + (k % 2 ? 1 : -1) * 10 * E.o2(p)} y={cy0 + py + 70 * E.i2(p)} w={20} h={16} rot={rot} opacity={1 - P(p, 0.55, 1)}>
                <Mark x={0} y={0} s={0.55} k={1} />
              </Scrap>
            );
          })}

          <Scissors x={sx} y={pivotY} s={1.25} open={Math.min(1, open)} rot={-8 * (1 - Math.min(1, down))} armFrom={[sx + (compact ? 70 : 60), pivotY - 36]} />
          <text x={sx + 34} y={sy - h / 2 - 38 - hov - 12} fontSize={11} fill={DIM}>rewrite</text>

          {/* the tray at the exit */}
          <g fontSize={compact ? 12 : 11} fill={INK} textAnchor="middle">
            <text x={exX} y={exY + h / 2 + 15} opacity={q(labelFade(S.tSb + 0.3))}>14 to 1, worse</text>
            <text x={rtX} y={rtY + h / 2 + 15} opacity={q(labelFade(S.tRes + 1.0))}>0 marks, untouched</text>
          </g>
          {tiny.map(([name], i) => {
            const p = E.o3(P(t, S.tSb + 0.5 + i * 0.18, S.tSb + 1.0 + i * 0.18));
            const [tx, ty] = tinyXY(i);
            return (
              <Scrap key={i} x={tx} y={ty - 24 * (1 - p)} w={tinyW} h={tinyH} opacity={p}>
                <text x={0} y={tfs * 0.36} textAnchor="middle" fontSize={tfs} fill={INK}>{name}</text>
              </Scrap>
            );
          })}
        </g>
      </g>
    );
  },
});
void MARK; void PAPER;

export default function OwnPostsLoop() {
  return <Figure spec={spec} />;
}
