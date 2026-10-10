"use client";

/**
 * The plan: four stations, one page passing through. Only the first and last stations are wired
 * to anything outside (files and git in, the framework out); the middle two sit together in a
 * sealed case with nothing plugged into them. The six bars are illustrative: six 0-1 features.
 */
import { Figure, defineFigure, cues, E, q, lerp, clamp, rng } from "../_figure";
import { Frame, FG, MUTED, ORANGE, BG, line, type, makeMap, MapCard, PageSheet, pageLines, type MapArt } from "./world";

const C = cues({
  read: [0, 0.8],
  hop1: [0.9, 1.5],
  analyze: [1.5, 2.1],
  hop2: [2.3, 2.9],
  synth: [2.9, 3.9],
  hop3: [4.1, 4.7],
  raster: [4.7, 5.3],
  verdict: [5.2, 5.7],
});

type Lay = {
  W: number;
  st: { x: number; y: number; w: number; h: number }[];
  /** where the travelling item sits for each station */
  at: { x: number; y: number }[];
  /** station label position */
  lab: { x: number; y: number; anchor: "start" | "middle" }[];
  case_: { x: number; y: number; w: number; h: number };
  caseLab: { x: number; y: number; lines: string[]; anchor: "start" | "middle" };
  cab: { x: number; y: number; w: number; h: number }[]; // files, framework
  cable: [number, number, number, number][];
  page: { w: number; h: number };
  map: { w: number; h: number };
};

const WIDE: Lay = {
  W: 640,
  st: [80, 240, 400, 560].map((cx) => ({ x: cx - 56, y: 30, w: 112, h: 96 })),
  at: [80, 240, 400, 560].map((cx) => ({ x: cx, y: 86 })),
  lab: [80, 240, 400, 560].map((cx) => ({ x: cx, y: 51, anchor: "middle" as const })),
  case_: { x: 168, y: 12, w: 304, h: 132 },
  caseLab: { x: 320, y: 166, lines: ["plain code: nothing plugged in"], anchor: "middle" },
  cab: [
    { x: 28, y: 182, w: 104, h: 48 },
    { x: 508, y: 182, w: 104, h: 48 },
  ],
  cable: [
    [80, 126, 80, 182],
    [560, 126, 560, 182],
  ],
  page: { w: 34, h: 44 },
  map: { w: 60, h: 32 },
};

const NARROW: Lay = {
  W: 360,
  st: [8, 88, 168, 248].map((y) => ({ x: 50, y, w: 176, h: 56 })),
  at: [8, 88, 168, 248].map((y) => ({ x: 200, y: y + 28 })),
  lab: [8, 88, 168, 248].map((y) => ({ x: 60, y: y + 33, anchor: "start" as const })),
  case_: { x: 40, y: 80, w: 204, h: 152 },
  caseLab: { x: 254, y: 150, lines: ["plain code:", "nothing", "plugged in"], anchor: "start" },
  cab: [
    { x: 266, y: 14, w: 86, h: 44 },
    { x: 266, y: 254, w: 86, h: 44 },
  ],
  cable: [
    [226, 36, 266, 36],
    [226, 276, 266, 276],
  ],
  page: { w: 28, h: 36 },
  map: { w: 40, h: 22 },
};

type State = { lines: ReturnType<typeof pageLines>; bars: number[]; wide: MapArt; narrow: MapArt };

const NAMES = ["Acquire", "Analyze", "Synthesize", "Rasterize"];

const spec = defineFigure<State>({
  dur: 5.8,
  size: { W: 640, H: 236 },
  compact: { W: 360, H: 316 },
  setup: () => {
    const r = rng(5);
    return {
      lines: pageLines(4, 9),
      bars: Array.from({ length: 6 }, () => r.range(0.25, 1)),
      wide: makeMap(41, WIDE.map.w, WIDE.map.h, { pitch: 3.6 }),
      narrow: makeMap(41, NARROW.map.w, NARROW.map.h, { pitch: 3 }),
    };
  },
  render: (t, S, { compact }) => {
    const L = compact ? NARROW : WIDE;
    const { label, small } = type(compact);
    const tag = compact ? "n" : "w";
    const map = compact ? S.narrow : S.wide;

    const kRead = C.p(t, "read", E.o3);
    const k1 = C.p(t, "hop1", E.io3);
    const kA = C.p(t, "analyze", E.o3);
    const k2 = C.p(t, "hop2", E.io3);
    const kS = C.p(t, "synth");
    const k3 = C.p(t, "hop3", E.io3);
    const kR = C.p(t, "raster", E.o3);
    const kV = C.p(t, "verdict", E.o3);

    // Position of the item: station 0 -> 1 -> 2 -> 3
    const prog = k1 + k2 + k3;
    const i = Math.min(2, Math.floor(prog + 1e-9));
    const f = prog - i;
    const a = L.at[i];
    const b = L.at[i + 1];
    const ix = lerp(a.x, b.x, f);
    const iy = lerp(a.y, b.y, f);

    const pg = L.page;
    const bw = compact ? 4 : 4.5;
    const bg = compact ? 3 : 3.5;
    const bh = compact ? 26 : 32;
    const pw = S.bars.length * bw + (S.bars.length - 1) * bg;

    // Bead travelling along a cable: forward when `k` runs 0 -> 1
    const cable = (n: number, k: number, rev: boolean) => {
      const [x1, y1, x2, y2] = L.cable[n];
      const live = k > 0 && k < 1;
      const u = rev ? 1 - k : k;
      return (
        <g>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={FG} strokeOpacity={0.55} strokeWidth={1.4} />
          <circle cx={x1} cy={y1} r={2.5} fill={BG} stroke={FG} strokeOpacity={0.7} />
          <circle cx={x2} cy={y2} r={2.5} fill={BG} stroke={FG} strokeOpacity={0.7} />
          {live && <circle cx={q(lerp(x1, x2, u))} cy={q(lerp(y1, y2, u))} r={3.2} fill={ORANGE} />}
        </g>
      );
    };

    const box = (n: number) => {
      const s = L.st[n];
      return (
        <g key={n}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} {...line} />
          <text x={L.lab[n].x} y={L.lab[n].y} textAnchor={L.lab[n].anchor} fill={FG} style={label}>
            {compact ? `${n + 1} ${NAMES[n]}` : `${n + 1}  ${NAMES[n]}`}
          </text>
        </g>
      );
    };

    const c = L.case_;
    const cl = L.caseLab;
    const files = L.cab[0];
    const next = L.cab[1];

    return (
      <g>
        {/* The sealed case round stations 2 and 3 */}
        <rect
          x={c.x} y={c.y} width={c.w} height={c.h} rx={14}
          fill={`color-mix(in oklch, ${FG} 5%, transparent)`}
          stroke={FG} strokeOpacity={0.5} strokeWidth={1.2}
        />
        <text x={cl.x} y={cl.y} textAnchor={cl.anchor} fill={MUTED} style={small}>
          {cl.lines.map((s, n) => (
            <tspan key={n} x={cl.x} dy={n === 0 ? 0 : 16}>{s}</tspan>
          ))}
        </text>

        {/* Cables to the outside, only at the two ends */}
        {cable(0, C.p(t, "read"), true)}
        {cable(1, C.p(t, "raster"), false)}

        {/* File cabinet */}
        <g>
          <rect x={files.x} y={files.y} width={files.w} height={files.h} {...line} fill={BG} />
          <line x1={files.x} x2={files.x + files.w} y1={files.y + 14} y2={files.y + 14} {...line} />
          <line x1={files.x + files.w - 26} x2={files.x + files.w - 10} y1={files.y + 7} y2={files.y + 7} stroke={FG} strokeOpacity={0.55} strokeWidth={2} strokeLinecap="round" />
          <text x={files.x + files.w / 2} y={files.y + 34} textAnchor="middle" fill={FG} style={small}>files + git</text>
        </g>
        {/* Framework */}
        <g>
          <rect x={next.x} y={next.y} width={next.w} height={next.h} {...line} fill={BG} />
          <text x={next.x + next.w / 2} y={next.y + next.h / 2 + 4.5} textAnchor="middle" fill={FG} style={small}>Next.js</text>
        </g>

        {[0, 1, 2, 3].map(box)}

        {/* Faded traces: what each station made, left behind once the item has moved on */}
        {k1 > 0 && (
          <g opacity={0.5 * k1}>
            <PageSheet x={q(L.at[0].x - pg.w / 2)} y={q(L.at[0].y - pg.h / 2)} w={pg.w} h={pg.h} lines={S.lines.slice(0, 7)} k={1} />
          </g>
        )}
        {k2 > 0 && (
          <g opacity={0.5 * k2}>
            {S.bars.map((v, n) => (
              <rect
                key={n}
                x={q(L.at[1].x - pw / 2 + n * (bw + bg))}
                y={q(L.at[1].y + bh / 2 - bh * v)}
                width={bw}
                height={q(bh * v)}
                fill={FG}
              />
            ))}
          </g>
        )}
        {k3 > 0 && (
          <g opacity={0.5 * k3}>
            <MapCard id={`sm-${tag}-trace`} x={q(L.at[2].x - L.map.w / 2)} y={q(L.at[2].y - L.map.h / 2)} map={map} k={1} />
          </g>
        )}

        {/* The one page, changing form as it passes */}
        <g>
          {kA < 1 && (
            <g opacity={1 - kA}>
              <PageSheet x={q(ix - pg.w / 2)} y={q(iy - pg.h / 2)} w={pg.w} h={pg.h} lines={S.lines.slice(0, 7)} k={kRead} />
            </g>
          )}
          {kA > 0 && kS < 0.3 && (
            <g opacity={clamp(kA * 1.5) * (1 - clamp(kS / 0.3))}>
              {S.bars.map((v, n) => {
                const h = bh * v * clamp(kA * 1.4 - n * 0.06);
                return (
                  <rect
                    key={n}
                    x={q(ix - pw / 2 + n * (bw + bg))}
                    y={q(iy + bh / 2 - h)}
                    width={bw}
                    height={q(h)}
                    fill={FG}
                    fillOpacity={0.75}
                  />
                );
              })}
            </g>
          )}
          {kS > 0 && kR < 1 && (
            <MapCard
              id={`sm-${tag}-map`}
              x={q(ix - L.map.w / 2)}
              y={q(iy - L.map.h / 2)}
              map={map}
              k={kS}
              opacity={clamp(kS * 4) * (1 - kR)}
            />
          )}
          {kR > 0 && (
            <g opacity={kR}>
              <MapCard id={`sm-${tag}-png`} x={q(ix - L.map.w / 2)} y={q(iy - L.map.h / 2)} map={map} k={1} />
              <rect
                x={q(ix - L.map.w / 2 - 3)} y={q(iy - L.map.h / 2 - 3)}
                width={L.map.w + 6} height={L.map.h + 6}
                fill="none" stroke={ORANGE} strokeWidth={1.2} opacity={kV}
              />
              <text
                x={q(compact ? ix + L.map.w / 2 - 24 : ix)}
                y={q(compact ? iy + L.map.h / 2 + 14 : iy + L.map.h / 2 + 15)}
                textAnchor={compact ? "end" : "middle"}
                fill={ORANGE} opacity={kV} style={{ ...small, fontWeight: 600 }}
              >
                {compact ? "" : "PNG"}
              </text>
            </g>
          )}
        </g>
        {compact && kR > 0 && (
          <text x={L.st[3].x + 10} y={L.st[3].y + 50} fill={ORANGE} opacity={kV} style={{ ...small, fontWeight: 600 }}>
            PNG out
          </text>
        )}
      </g>
    );
  },
});

export default function SealedMiddle() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
