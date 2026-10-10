// Drawing verbs for SVG figures. Everything takes progress k (0..1) so a figure reads as
// "how far along is this thing right now". From ~/Explainers engine/components/kit.mjs, rewritten for SVG.
import { clamp, q } from "./time";
import type { Pt } from "./physics";

/**
 * Props that show the first k of a path's length. Spread onto any <path>, <line>, <circle> or <polyline>:
 *   <path d={d} {...drawOn(k)} stroke="currentColor" fill="none" />
 */
export const drawOn = (k: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: q(1 - clamp(k), 4) });

const bez = (p0: number, p1: number, p2: number, p3: number, u: number) => { const v = 1 - u; return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3; };

/**
 * A curved connector from a to b. Returns path data plus `bead`, the point k of the way along it by
 * arc length (for something travelling the link: a parcel, a signal, a coin).
 */
export function link(a: Pt, b: Pt, k = 1, { bend = 0.5, vertical = false } = {}) {
  const c1 = vertical ? { x: a.x, y: a.y + (b.y - a.y) * bend } : { x: a.x + (b.x - a.x) * bend, y: a.y };
  const c2 = vertical ? { x: b.x, y: b.y - (b.y - a.y) * bend } : { x: b.x - (b.x - a.x) * bend, y: b.y };
  const d = `M${q(a.x)} ${q(a.y)}C${q(c1.x)} ${q(c1.y)} ${q(c2.x)} ${q(c2.y)} ${q(b.x)} ${q(b.y)}`;
  const pts: (Pt & { L: number })[] = [];
  let L = 0;
  for (let i = 0; i <= 40; i++) {
    const u = i / 40, x = bez(a.x, c1.x, c2.x, b.x, u), y = bez(a.y, c1.y, c2.y, b.y, u);
    if (i) L += Math.hypot(x - pts[i - 1].x, y - pts[i - 1].y);
    pts.push({ x, y, L });
  }
  const target = L * clamp(k), j = Math.max(1, pts.findIndex((p) => p.L >= target)), p0 = pts[j - 1], p1 = pts[j] ?? p0;
  const f = (target - p0.L) / Math.max(1e-6, p1.L - p0.L);
  return { d, length: L, bead: { x: q(p0.x + (p1.x - p0.x) * f), y: q(p0.y + (p1.y - p0.y) * f) } };
}

/** SVG transform string for something at (x, y) turned r degrees about its own centre. */
export const place = (x: number, y: number, r = 0, s = 1) => `translate(${q(x)} ${q(y)})${r ? ` rotate(${q(r)})` : ""}${s !== 1 ? ` scale(${q(s, 4)})` : ""}`;
