"use client";

/**
 * The refactor: one plain-JSON description (ArtSeed, five compartments), many drawers.
 * An analyzer fills the tray from a page; the terrain synth wires up to Entropy, Features and Marks
 * and leaves Series unused; a second synth, ridgelines, wires to Entropy, Features, Marks and Series.
 * The point is the empty Series socket on one and the live one on the other. Facts feeds neither. The seed is not touched when the second synth is added.
 * The ridgeline card is deliberately rough: its tall central spike runs off the top, as in the post.
 * Series values and ridge heights are made up for the picture.
 */
import { Figure, defineFigure, cues, E, q, rng, link, drawOn, clamp } from "../_figure";
import { Frame, FG, MUTED, ORANGE, GROUND, line, type, makeMap, MapCard, PageSheet, pageLines, type MapArt } from "./world";

const C = cues({
  analyze: [0, 1.2],
  fill: [1.0, 1.8],
  wireT: [1.9, 2.7],
  printT: [2.7, 3.9],
  wireR: [4.3, 5.1],
  printR: [5.1, 6.3],
  same: [6.3, 6.9],
});

const NAMES = ["Entropy", "Facts", "Features", "Marks", "Series"];
const TERRAIN_READS = [0, 2, 3];
const RIDGE_READS = [0, 2, 3, 4];
const ROWS = 12;

type P = { x: number; y: number };

/** Elbow cable from a to b with its bend at m (a y for top-down cables, an x for side-on ones), and the point k of the way along */
function elbow(a: P, b: P, m: number, vertical: boolean, k: number) {
  const pts: P[] = vertical
    ? [a, { x: a.x, y: m }, { x: b.x, y: m }, b]
    : [a, { x: m, y: a.y }, { x: m, y: b.y }, b];
  const lens = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = lens.reduce((u, v) => u + v, 0);
  let rest = total * clamp(k);
  let bead = b;
  for (let i = 0; i < lens.length; i++) {
    if (rest <= lens[i]) {
      const f = lens[i] ? rest / lens[i] : 0;
      bead = { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f };
      break;
    }
    rest -= lens[i];
  }
  return { d: "M" + pts.map((p) => `${q(p.x)} ${q(p.y)}`).join("L"), bead };
}

type State = {
  lines: ReturnType<typeof pageLines>;
  wide: MapArt;
  narrow: MapArt;
  gain: number[];
  dots: { row: number; u: number }[];
};

/** Made-up sentence-length profile, 64 points, 0-1, with one tall spike near the middle */
const series = (i: number) => {
  const s = 0.32 + 0.2 * Math.sin(i / 5) + 0.12 * Math.sin(i / 1.7 + 1) + (i >= 30 && i <= 33 ? 0.62 : 0);
  return clamp(s, 0, 1.2);
};

function RidgeCard({ x, y, w, h, k, S, id }: { x: number; y: number; w: number; h: number; k: number; S: State; id: string }) {
  const rows = Array.from({ length: ROWS }, (_, j) => {
    const base = h * (0.2 + (0.76 * j) / (ROWS - 1));
    const amp = h * 0.3 * S.gain[j];
    const pts = Array.from({ length: 64 }, (_, i) => [q((i / 63) * w, 1), q(base - amp * series(i), 1)] as const);
    return { base, pts };
  });
  const kl = clamp(k / 0.75);
  return (
    <g transform={`translate(${q(x)} ${q(y)})`}>
      <clipPath id={id}>
        <rect width={w} height={h} />
      </clipPath>
      <rect width={w} height={h} fill={GROUND} />
      <g clipPath={`url(#${id})`}>
        {rows.map((r, j) => {
          const o = clamp(kl * ROWS * 0.6 - j * 0.6);
          const d = "M" + r.pts.map((p) => p.join(" ")).join("L");
          return (
            <path key={j} d={`${d}L${w} ${h + 4}L0 ${h + 4}Z`} fill={GROUND} stroke={ORANGE} strokeOpacity={0.9 * o} strokeWidth={0.9} opacity={o} />
          );
        })}
        {k > 0.7 &&
          S.dots.map((d, i) => {
            const idx = Math.round(d.u * 63);
            const p = rows[d.row].pts[idx];
            return <circle key={i} cx={p[0]} cy={p[1]} r={2} fill={ORANGE} opacity={clamp((k - 0.7) / 0.3)} />;
          })}
      </g>
      <rect width={w} height={h} fill="none" stroke={FG} strokeOpacity={0.3} strokeWidth={0.8} />
    </g>
  );
}

/** A tiny glyph for what each compartment holds, in a box of w x h at (x, y) */
function Glyph({ i, x, y, w, h }: { i: number; x: number; y: number; w: number; h: number }) {
  const st = { stroke: FG, strokeOpacity: 0.5, strokeWidth: 1.4, strokeLinecap: "round" as const, fill: "none" };
  if (i === 0)
    return <g fill={FG} fillOpacity={0.5}>{[0, 1, 2].map((n) => <rect key={n} x={x + n * 10} y={y + h / 2 - 3} width={6} height={6} />)}</g>;
  if (i === 1)
    return <g {...st}>{[0, 1, 2].map((n) => <line key={n} x1={x} x2={x + w * (n === 2 ? 0.5 : 0.9)} y1={y + 2 + n * (h / 3)} y2={y + 2 + n * (h / 3)} />)}</g>;
  if (i === 2)
    return <g fill={FG} fillOpacity={0.5}>{[0.5, 0.9, 0.3, 0.7, 0.55, 0.8].map((v, n) => <rect key={n} x={x + n * (w / 6.5)} y={y + h - h * v} width={w / 9} height={h * v} />)}</g>;
  if (i === 3)
    return <g fill={FG} fillOpacity={0.5}>{[[0.1, 0.7], [0.4, 0.3], [0.7, 0.6], [0.9, 0.2]].map(([u, v], n) => <circle key={n} cx={x + u * w} cy={y + v * h} r={2.4} />)}</g>;
  return <polyline {...st} points={Array.from({ length: 16 }, (_, n) => `${q(x + (n / 15) * w, 1)},${q(y + h * (1 - clamp(series(n * 4))), 1)}`).join(" ")} />;
}

const spec = defineFigure<State>({
  dur: 7.1,
  size: { W: 640, H: 392 },
  compact: { W: 360, H: 430 },
  setup: () => {
    const r = rng(9);
    return {
      lines: pageLines(4, 7),
      wide: makeMap(5, 168, 88, { pitch: 5.2 }),
      narrow: makeMap(5, 120, 62, { pitch: 4.2 }),
      gain: Array.from({ length: ROWS }, () => r.range(0.7, 1.3)),
      dots: [[2, 0.2], [5, 0.62], [7, 0.8], [9, 0.14], [10, 0.5], [3, 0.92]].map(([row, u]) => ({ row, u })),
    };
  },
  render: (t, S, { W, compact }) => {
    const { label, small } = type(compact);
    const kAn = C.p(t, "analyze", E.io3);
    const kFill = C.p(t, "fill", E.o3);
    const kWT = C.p(t, "wireT", E.io3);
    const kPT = C.p(t, "printT");
    const kWR = C.p(t, "wireR", E.io3);
    const kPR = C.p(t, "printR");
    const kSame = C.p(t, "same", E.o3);
    const cw = compact ? 120 : 168;
    const ch = compact ? 62 : 88;

    // Positions: compartments (and where a cable leaves each), machines (and where each socket sits)
    const comps = NAMES.map((n, i) =>
      compact
        ? { x: 14, y: 82 + i * 38, w: 136, h: 34, out: { x: 150, y: 82 + i * 38 + 17 } }
        : { x: 52 + i * 108, y: 100, w: 104, h: 52, out: { x: 104 + i * 108, y: 152 } },
    );
    const T = compact ? { x: 196, y: 68, w: 156, h: 182 } : { x: 40, y: 232, w: 270, h: 140 };
    const R = compact ? { x: 196, y: 260, w: 156, h: 140 } : { x: 330, y: 232, w: 270, h: 140 };
    const tSock = compact
      ? [88, 112, 136, 160].map((yy) => ({ x: T.x, y: yy }))
      : [70, 130, 190, 250].map((xx) => ({ x: xx, y: T.y }));
    const rSock = compact
      ? [290, 312, 334, 356].map((yy) => ({ x: R.x, y: yy }))
      : [380, 450, 520, 575].map((xx) => ({ x: xx, y: R.y }));
    const tCard = compact ? { x: T.x + 18, y: T.y + 112 } : { x: T.x + (T.w - cw) / 2, y: T.y + 30 };
    const rCard = compact ? { x: R.x + 18, y: R.y + 68 } : { x: R.x + (R.w - cw) / 2, y: R.y + 30 };
    const vert = !compact;

    // Each cable leaves its compartment from its own point, and bends at its own height (or column),
    // so no two run together: terrain's three, then the ridgeline's four (Series is live there).
    const o = comps.map((c) => c.out);
    const wires = compact
      ? [
          { a: { x: 150, y: 94 }, b: tSock[0], m: 192, k: kWT, key: "t0" },
          { a: { x: 150, y: 165 }, b: tSock[1], m: 154, k: kWT, key: "t2" },
          { a: { x: 150, y: 208 }, b: tSock[2], m: 158, k: kWT, key: "t3" },
          { a: { x: 150, y: 104 }, b: rSock[0], m: 186, k: kWR, key: "r0" },
          { a: { x: 150, y: 185 }, b: rSock[1], m: 178, k: kWR, key: "r2" },
          { a: { x: 150, y: 218 }, b: rSock[2], m: 170, k: kWR, key: "r3" },
          { a: o[4], b: rSock[3], m: 162, k: kWR, key: "r4" },
        ]
      : [
          { a: { x: o[0].x - 12, y: o[0].y }, b: tSock[0], m: 180, k: kWT, key: "t0" },
          { a: { x: o[2].x - 12, y: o[2].y }, b: tSock[1], m: 192, k: kWT, key: "t2" },
          { a: { x: o[3].x - 12, y: o[3].y }, b: tSock[2], m: 204, k: kWT, key: "t3" },
          { a: { x: o[0].x + 12, y: o[0].y }, b: rSock[0], m: 220, k: kWR, key: "r0" },
          { a: { x: o[2].x + 12, y: o[2].y }, b: rSock[1], m: 208, k: kWR, key: "r2" },
          { a: { x: o[3].x + 12, y: o[3].y }, b: rSock[2], m: 196, k: kWR, key: "r3" },
          { a: o[4], b: rSock[3], m: 184, k: kWR, key: "r4" },
        ];

    // The analyzer chain
    const sheet = compact ? { x: 14, y: 8, w: 42, h: 54 } : { x: 40, y: 6, w: 52, h: 66 };
    const an = compact ? { x: 82, y: 20, w: 92, h: 30 } : { x: 120, y: 24, w: 110, h: 34 };
    const traySrc = { x: an.x + an.w / 2, y: an.y + an.h };
    const trayDst = { x: compact ? 140 : 175, y: compact ? 82 : 100 };
    const l1 = link({ x: sheet.x + sheet.w, y: an.y + an.h / 2 }, { x: an.x, y: an.y + an.h / 2 }, 1);
    const l2 = link(traySrc, trayDst, 1, { vertical: true });
    const bead = (a: { x: number; y: number }, b: { x: number; y: number }, k: number, v = false) => {
      if (k <= 0 || k >= 1) return null;
      const p = link(a, b, k, { vertical: v }).bead;
      return <circle cx={p.x} cy={p.y} r={3} fill={ORANGE} />;
    };

    return (
      <g>
        {/* page -> analyzer -> tray */}
        <PageSheet x={sheet.x} y={sheet.y} w={sheet.w} h={sheet.h} lines={S.lines} k={clamp(kAn * 3)} />
        <path d={l1.d} {...line} {...drawOn(clamp(kAn * 3))} />
        <rect x={an.x} y={an.y} width={an.w} height={an.h} {...line} fill="var(--background)" />
        <text x={an.x + an.w / 2} y={an.y + an.h / 2 + 4.5} textAnchor="middle" fill={FG} style={label}>analyzer</text>
        <path d={l2.d} {...line} {...drawOn(clamp(kAn * 2 - 0.6))} />
        {bead({ x: sheet.x + sheet.w, y: an.y + an.h / 2 }, { x: an.x, y: an.y + an.h / 2 }, clamp(kAn * 2.2))}
        {bead(traySrc, trayDst, clamp(kAn * 2 - 1), true)}
        <text x={compact ? 14 : 580} y={compact ? 76 : 92} textAnchor={compact ? "start" : "end"} fill={MUTED} style={small}>
          {compact ? "ArtSeed" : "ArtSeed - one plain-JSON packet"}
        </text>

        {/* the tray */}
        {comps.map((c, i) => {
          const o = clamp((kFill * 5 - i) / 1);
          const reads = (TERRAIN_READS.includes(i) && kWT > 0) || (RIDGE_READS.includes(i) && kWR > 0);
          return (
            <g key={i} opacity={0.25 + 0.75 * o}>
              <rect x={c.x} y={c.y} width={c.w} height={c.h} fill={`color-mix(in oklch, ${FG} 5%, transparent)`} stroke={reads ? ORANGE : FG} strokeOpacity={reads ? 0.8 : 0.45} strokeWidth={1} />
              <text x={c.x + 8} y={c.y + (compact ? 22 : 18)} fill={FG} style={label}>{NAMES[i]}</text>
              <g opacity={o}>
                {compact ? (
                  i === 1 ? <text x={c.x + c.w - 8} y={c.y + 22} textAnchor="end" fill={MUTED} style={small}>alt text</text>
                  : <Glyph i={i} x={c.x + c.w - 52} y={c.y + 9} w={44} h={16} />
                ) : (
                  <Glyph i={i} x={c.x + 10} y={c.y + 27} w={c.w - 20} h={16} />
                )}
              </g>
            </g>
          );
        })}
        {!compact && (
          <text x={comps[1].out.x} y={comps[1].out.y + 16} textAnchor="middle" fill={MUTED} opacity={kFill} style={small}>
            only feeds alt text
          </text>
        )}

        {/* machines */}
        {[
          { m: T, name: "terrain synth", socks: tSock },
          { m: R, name: "ridgeline synth", socks: rSock },
        ].map(({ m, name }) => (
          <g key={name}>
            <rect x={m.x} y={m.y} width={m.w} height={m.h} fill="var(--background)" stroke={FG} strokeOpacity={0.55} strokeWidth={1} />
            <text x={m.x + 10} y={m.y + (compact ? 20 : 20)} fill={FG} style={{ ...label, fontWeight: 600 }}>{name}</text>
          </g>
        ))}
        {/* terrain's Series socket stays empty */}
        <circle cx={tSock[3].x} cy={tSock[3].y} r={4} fill="var(--background)" stroke={MUTED} strokeDasharray="2 2" />
        <text
          x={compact ? tSock[3].x + 10 : T.x + T.w - 10}
          textAnchor={compact ? "start" : "end"}
          y={compact ? tSock[3].y + 4.5 : tSock[3].y + 20}
          fill={MUTED}
          style={small}
        >
          Series: unused
        </text>

        {/* cables */}
        {wires.map((w) => {
          const L = elbow(w.a, w.b, w.m, vert, 1);
          const bd = elbow(w.a, w.b, w.m, vert, w.k).bead;
          return (
            <g key={w.key}>
              <path d={L.d} {...line} strokeOpacity={0.6} {...drawOn(w.k)} />
              {w.k > 0 && w.k < 1 && <circle cx={bd.x} cy={bd.y} r={3} fill={ORANGE} />}
              {w.k >= 1 && <circle cx={w.b.x} cy={w.b.y} r={4} fill={ORANGE} />}
            </g>
          );
        })}

        {/* printed cards */}
        <MapCard id={`ost-t-${compact ? "n" : "w"}`} x={tCard.x} y={tCard.y} map={compact ? S.narrow : S.wide} k={kPT} opacity={kPT > 0 ? 1 : 0} />
        <RidgeCard id={`ost-r-${compact ? "n" : "w"}`} x={rCard.x} y={rCard.y} w={cw} h={ch} k={kPR} S={S} />

        {/* the end beat */}
        <text x={compact ? 346 : 580} y={compact ? 38 : 45.5} textAnchor="end" fill={FG} opacity={kSame} style={label}>
          seed unchanged
        </text>
      </g>
    );
  },
});

export default function OneSeedTwoSynths() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
