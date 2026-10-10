"use client";

/**
 * The set shared by this post's figures: a page (a sheet of text), the map it becomes
 * (a dark brown card of contour lines with orange halftone ribbons on the index contours,
 * like the real OG images), and the frame and type every figure sits in.
 * Maps here are illustrative: the same idea as the terrain synth, drawn small.
 */
import type { ReactNode } from "react";
import { q, rng, drawOn, clamp } from "../_figure";

export const FG = "var(--foreground)";
export const MUTED = "var(--muted-foreground)";
export const ORANGE = "var(--accent-b)"; // the contour orange, as in HalftoneRibbon
export const BG = "var(--background)";
/** The map's dark brown ground */
export const GROUND = `color-mix(in oklch, ${ORANGE} 13%, #0d0906)`;
export const line = { stroke: FG, strokeOpacity: 0.55, strokeWidth: 1, fill: "none" } as const;

export const type = (compact: boolean) => ({
  label: { fontFamily: "var(--font-sans)", fontSize: compact ? 15 : 13.5 } as const,
  small: { fontFamily: "var(--font-sans)", fontSize: compact ? 13 : 12 } as const,
});

/** The frame every figure in this post sits in (matches HalftoneRibbon). */
export function Frame({ children }: { children: ReactNode }) {
  return <div className="border border-border/60 bg-surface/40 p-3 md:p-5">{children}</div>;
}

/* ---------- Terrain ---------- */

export type MapArt = {
  w: number;
  h: number;
  /** All minor contour lines in one path */
  minor: string;
  /** Index contours, brighter */
  index: string[];
  /** Halftone dots along the index contours */
  dots: { x: number; y: number; r: number }[];
};

const LEVELS = 10;
const INDEX = [4, 8];

/** A seeded elevation field over a w x h card: a few hills plus gentle ripples, max about 1. */
export function field(seed: number, w: number, h: number) {
  const r = rng(seed);
  // Hills spill past the edges, so index contours cross the card the way the real images do
  const hills = Array.from({ length: r.int(6, 9) }, () => ({
    x: r.range(-0.15, 1.15) * w,
    y: r.range(-0.2, 1.2) * h,
    sx: r.range(0.1, 0.32) * w,
    sy: r.range(0.25, 0.75) * h,
    a: r.range(0.35, 1),
  }));
  const ph = [r.range(0, 6), r.range(0, 6)];
  const raw = (x: number, y: number) => {
    let v = 0;
    for (const k of hills) v += k.a * Math.exp(-(((x - k.x) / k.sx) ** 2 + ((y - k.y) / k.sy) ** 2));
    return v + 0.09 * Math.sin(x / (w * 0.09) + ph[0]) * Math.cos(y / (h * 0.14) + ph[1]);
  };
  let max = 0;
  for (let i = 0; i <= 24; i++) for (let j = 0; j <= 12; j++) max = Math.max(max, raw((i / 24) * w, (j / 12) * h));
  return (x: number, y: number) => raw(x, y) / (max * 1.02);
}

const PAIRS: Record<number, [number, number][]> = {
  1: [[3, 0]], 14: [[3, 0]], 2: [[0, 1]], 13: [[0, 1]], 3: [[3, 1]], 12: [[3, 1]],
  4: [[1, 2]], 11: [[1, 2]], 6: [[0, 2]], 9: [[0, 2]], 7: [[3, 2]], 8: [[3, 2]],
  5: [[3, 0], [1, 2]], 10: [[0, 1], [2, 3]],
};

function contour(f: (x: number, y: number) => number, lv: number, w: number, h: number, step: number) {
  let d = "";
  const nx = Math.ceil(w / step);
  const ny = Math.ceil(h / step);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x0 = i * step;
      const y0 = j * step;
      const v00 = f(x0, y0), v10 = f(x0 + step, y0), v11 = f(x0 + step, y0 + step), v01 = f(x0, y0 + step);
      const idx = (v00 > lv ? 1 : 0) | (v10 > lv ? 2 : 0) | (v11 > lv ? 4 : 0) | (v01 > lv ? 8 : 0);
      if (idx === 0 || idx === 15) continue;
      const u = (a: number, b: number) => (lv - a) / (b - a);
      const pt = (e: number): [number, number] =>
        e === 0 ? [x0 + u(v00, v10) * step, y0]
        : e === 1 ? [x0 + step, y0 + u(v10, v11) * step]
        : e === 2 ? [x0 + u(v01, v11) * step, y0 + step]
        : [x0, y0 + u(v00, v01) * step];
      for (const [a, b] of PAIRS[idx]) {
        const [x1, y1] = pt(a);
        const [x2, y2] = pt(b);
        d += `M${q(x1, 1)} ${q(y1, 1)}L${q(x2, 1)} ${q(y2, 1)}`;
      }
    }
  }
  return d;
}

/**
 * Build a map for a seed at card size w x h (call in setup; it is not cheap).
 * `pitch` is the halftone screen spacing in viewBox units.
 */
export function makeMap(seed: number, w: number, h: number, { pitch = 5, step = 3 } = {}): MapArt {
  const f = field(seed, w, h);
  const lv = (k: number) => k / (LEVELS + 1);
  const minor = Array.from({ length: LEVELS }, (_, i) => i + 1)
    .filter((k) => !INDEX.includes(k))
    .map((k) => contour(f, lv(k), w, h, step))
    .join("");
  const index = INDEX.map((k) => contour(f, lv(k), w, h, step));
  const ribbon = pitch * 1.5;
  const rMax = pitch * 0.4;
  const dots: MapArt["dots"] = [];
  const hh = pitch / Math.SQRT2;
  const n = Math.ceil((w + h) / hh);
  for (let a = -n; a <= n; a++) {
    for (let b = -n; b <= n; b++) {
      const x = w / 2 + (a - b) * hh;
      const y = h / 2 + (a + b) * hh;
      if (x < 1 || x > w - 1 || y < 1 || y > h - 1) continue;
      const v = f(x, y);
      const g = Math.hypot(f(x + 1, y) - f(x - 1, y), f(x, y + 1) - f(x, y - 1)) / 2 + 1e-6;
      let best = 0;
      for (const k of INDEX) {
        const dist = Math.abs(v - lv(k)) / g;
        if (dist < ribbon) best = Math.max(best, rMax * Math.pow(1 - dist / ribbon, 1.25));
      }
      if (best >= pitch * 0.1) dots.push({ x: q(x, 1), y: q(y, 1), r: q(best, 2) });
    }
  }
  return { w, h, minor, index, dots };
}

/**
 * A preview card at (x, y), its top-left corner. `k` draws it on (0 = empty ground, 1 = finished):
 * lines trace first, then the dots fill in from left to right.
 */
export function MapCard({ x, y, map, k = 1, opacity = 1, id }: { x: number; y: number; map: MapArt; k?: number; opacity?: number; id: string }) {
  const kl = clamp(k / 0.7);
  const kd = clamp((k - 0.35) / 0.65);
  const reveal = kd * (map.w + 20) - 10;
  return (
    <g transform={`translate(${q(x)} ${q(y)})`} opacity={opacity}>
      <clipPath id={id}>
        <rect width={map.w} height={map.h} />
      </clipPath>
      <rect width={map.w} height={map.h} fill={GROUND} />
      <g clipPath={`url(#${id})`}>
        <path d={map.minor} fill="none" stroke={ORANGE} strokeOpacity={0.38 * kl} strokeWidth={0.6} />
        {map.index.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={ORANGE} strokeOpacity={0.9 * kl} strokeWidth={0.9} />
        ))}
        {map.dots.map((p, i) =>
          p.x < reveal ? <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={ORANGE} /> : null,
        )}
      </g>
      <rect width={map.w} height={map.h} fill="none" stroke={FG} strokeOpacity={0.3} strokeWidth={0.8} />
    </g>
  );
}

/* ---------- The page ---------- */

/** Seeded line lengths (0..1) for a page of text: a few paragraphs of ragged lines. */
export function pageLines(seed: number, n: number) {
  const r = rng(seed + 101);
  return Array.from({ length: n }, (_, i) => {
    const end = r.chance(0.22) || i === n - 1;
    return { len: end ? r.range(0.3, 0.65) : r.range(0.82, 1), gap: end };
  });
}

/**
 * A page of text at (x, y), its top-left corner: a sheet with a title bar and ragged lines.
 * `edit` marks one line as rewritten (index into lines) and `editK` draws the new line in orange.
 */
export function PageSheet({
  x, y, w, h, lines, k = 1, edit, editK = 0,
}: {
  x: number; y: number; w: number; h: number; lines: { len: number; gap: boolean }[];
  k?: number; edit?: number; editK?: number;
}) {
  const pad = w * 0.12;
  const inner = w - pad * 2;
  const lh = (h - pad * 2 - 12) / (lines.length + lines.filter((l) => l.gap).length * 0.5);
  let yy = pad + 12;
  return (
    <g transform={`translate(${q(x)} ${q(y)})`}>
      <rect width={w} height={h} fill={`color-mix(in oklch, ${FG} 6%, transparent)`} stroke={FG} strokeOpacity={0.45} strokeWidth={0.9} />
      <line x1={pad} x2={pad + inner * 0.6} y1={pad + 3} y2={pad + 3} stroke={FG} strokeOpacity={0.75} strokeWidth={2.6} strokeLinecap="round" {...drawOn(k)} />
      {lines.map((l, i) => {
        const ly = yy;
        yy += lh * (l.gap ? 1.5 : 1);
        const edited = i === edit && editK > 0;
        return (
          <g key={i}>
            <line
              x1={pad} x2={q(pad + inner * l.len)} y1={q(ly)} y2={q(ly)}
              stroke={FG} strokeOpacity={0.32 * (edited ? 1 - editK : 1)} strokeWidth={1.6} strokeLinecap="round"
              {...drawOn(clamp(k * 1.4 - (i / lines.length) * 0.4))}
            />
            {edited && (
              <line
                x1={pad} x2={q(pad + inner * 0.9)} y1={q(ly)} y2={q(ly)}
                stroke={ORANGE} strokeWidth={1.8} strokeLinecap="round" {...drawOn(editK)}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
