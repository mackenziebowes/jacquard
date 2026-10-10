"use client";

/**
 * The point of the post: every page gets its own map, drawn from its text and its last-edit date.
 * Three pages pass through one generator and come out as three different maps with no text on them.
 * Then one page is edited, and only that page's map is redrawn; the other two stay as they were.
 * The maps are illustrative, drawn with the world's small terrain; 1200 x 630 is the real size.
 */
import { Figure, defineFigure, cues, E, q, lerp, clamp } from "../_figure";
import { Frame, FG, MUTED, ORANGE, line, type, makeMap, MapCard, PageSheet, pageLines, type MapArt } from "./world";

const C = cues({
  write: [0, 0.8],
  flow: [0.6, 1.7],
  draw: [1.2, 2.5],
  edit: [3.0, 3.6],
  reflow: [3.6, 4.3],
  redraw: [4.1, 5.1],
  verdict: [5.0, 5.5],
});

type Layout = {
  cx: number[]; sw: number; sh: number; sy: number;
  gx: number; gw: number; gy: number; gh: number;
  cw: number; ch: number; cy: number; ly: number;
};

const WIDE: Layout = { cx: [120, 320, 520], sw: 96, sh: 118, sy: 30, gx: 40, gw: 560, gy: 166, gh: 26, cw: 168, ch: 88, cy: 214, ly: 342 };
const NARROW: Layout = { cx: [62, 180, 298], sw: 88, sh: 104, sy: 32, gx: 10, gw: 340, gy: 160, gh: 28, cw: 106, ch: 56, cy: 210, ly: 308 };

type State = { lines: ReturnType<typeof pageLines>[]; wide: MapArt[]; narrow: MapArt[] };

const SEEDS = [11, 23, 37, 58]; // pages A, B, C, then B after its edit

const spec = defineFigure<State>({
  dur: 5.6,
  size: { W: 640, H: 350 },
  compact: { W: 360, H: 318 },
  setup: () => ({
    lines: [pageLines(1, 11), pageLines(2, 9), pageLines(3, 12)],
    wide: SEEDS.map((s) => makeMap(s, WIDE.cw, WIDE.ch, { pitch: 5.2 })),
    narrow: SEEDS.map((s) => makeMap(s, NARROW.cw, NARROW.ch, { pitch: 4.2 })),
  }),
  render: (t, S, { W, compact }) => {
    const L = compact ? NARROW : WIDE;
    const maps = compact ? S.narrow : S.wide;
    const { label, small } = type(compact);
    const kWrite = C.p(t, "write", E.o3);
    const kEdit = C.p(t, "edit", E.io3);
    const kRedraw = C.p(t, "redraw", E.io3);
    const kVerdict = C.p(t, "verdict", E.o3);

    // Bits of each page (its words and date, as numbers) falling through the generator
    const bits = (col: number, a: number, b: number, key: string) => {
      const top = L.sy + L.sh + 4;
      const bottom = L.cy - 4;
      return Array.from({ length: 6 }, (_, i) => {
        const t0 = lerp(a, b - 0.45, i / 5) + col * 0.08;
        const k = clamp((t - t0) / 0.45);
        if (k <= 0 || k >= 1) return null;
        const yy = lerp(top, bottom, E.i2(k));
        const xx = L.cx[col] + ((i % 3) - 1) * 7;
        return <rect key={`${key}${i}`} x={q(xx - 2)} y={q(yy - 2)} width={4} height={4} fill={col === 1 && key === "r" ? ORANGE : FG} fillOpacity={0.7} />;
      });
    };

    return (
      <g>
        <text x={W / 2} y={16} textAnchor="middle" fill={MUTED} style={small}>
          {compact ? "each page: its text and last-edit date" : "Each page goes in as its own text and last-edit date"}
        </text>

        {/* The pages */}
        {L.cx.map((cx, i) => (
          <PageSheet
            key={i}
            x={cx - L.sw / 2}
            y={L.sy}
            w={L.sw}
            h={L.sh}
            lines={S.lines[i]}
            k={clamp(kWrite * 1.3 - i * 0.15)}
            edit={i === 1 ? 4 : undefined}
            editK={i === 1 ? kEdit : 0}
          />
        ))}
        {kEdit > 0 && (
          <text
            x={compact ? L.cx[1] : L.cx[1] + L.sw / 2 + 6}
            y={compact ? L.sy + L.sh + 14 : L.sy + L.sh * 0.42}
            textAnchor={compact ? "middle" : "start"}
            fill={ORANGE}
            opacity={kEdit}
            style={{ ...small, fontWeight: 600 }}
          >
            edited
          </text>
        )}

        {bits(0, C.at("flow"), C.end("flow"), "f")}
        {bits(1, C.at("flow"), C.end("flow"), "f")}
        {bits(2, C.at("flow"), C.end("flow"), "f")}
        {t >= C.at("reflow") && bits(1, C.at("reflow") - 0.08, C.end("reflow"), "r")}

        {/* One generator for every page */}
        <rect x={L.gx} y={L.gy} width={L.gw} height={L.gh} {...line} fill="var(--background)" />
        <text x={W / 2} y={L.gy + L.gh / 2 + 4.5} textAnchor="middle" fill={FG} style={small}>
          {compact ? "generator: text → numbers → terrain" : "one generator: text → numbers → terrain → image"}
        </text>

        {/* The maps */}
        {L.cx.map((cx, i) => {
          const x = cx - L.cw / 2;
          const kDraw = clamp((t - C.at("draw") - i * 0.18) / (C.end("draw") - C.at("draw") - 0.36));
          if (i !== 1) return <MapCard key={i} id={`ptm-${compact ? "n" : "w"}-${i}`} x={x} y={L.cy} map={maps[i]} k={kDraw} />;
          return (
            <g key={i}>
              <MapCard id={`ptm-${compact ? "n" : "w"}-1a`} x={x} y={L.cy} map={maps[1]} k={kDraw} opacity={1 - clamp(kRedraw * 2.5)} />
              {kRedraw > 0 && <MapCard id={`ptm-${compact ? "n" : "w"}-1b`} x={x} y={L.cy} map={maps[3]} k={kRedraw} />}
              {kRedraw > 0 && (
                <rect x={q(x - 3)} y={L.cy - 3} width={L.cw + 6} height={L.ch + 6} fill="none" stroke={ORANGE} strokeWidth={1.2} opacity={kRedraw} />
              )}
            </g>
          );
        })}

        {/* What changed */}
        {L.cx.map((cx, i) => (
          <text
            key={i}
            x={cx}
            y={L.cy + L.ch + 20}
            textAnchor="middle"
            fill={i === 1 ? ORANGE : MUTED}
            opacity={kVerdict}
            style={i === 1 ? { ...label, fontWeight: 600 } : label}
          >
            {i === 1 ? "redrawn" : "unchanged"}
          </text>
        ))}
        <text x={W / 2} y={L.ly} textAnchor="middle" fill={MUTED} style={small}>
          {compact ? "1200 × 630, no text, one per page" : "Out: one 1200 × 630 image per page, with no text on it"}
        </text>
      </g>
    );
  },
});

export default function PageToMap() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
