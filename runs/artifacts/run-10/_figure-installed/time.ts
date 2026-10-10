// Time and motion. Every value is a pure function of absolute time t (seconds), so any frame
// renders identically in any order, and the end state is just `draw(dur)`.
// Extracted from ~/Explainers engine/time.mjs.
//
//   const pop = seq(ramp(0, 1.1, 0.25, E.o3), ramp(1.1, 1, 0.2, E.io2));   // a Phrase
//   pop.at(0.3)                                                             // sample it
//   const cam = track([0, { x: 0 }], [2, { x: 400 }, E.io4]);               // absolute keyframes

export type Ease = (x: number) => number;
export type Phrase<T> = { dur: number; at: (t: number) => T };
type Mixable = number | string | readonly number[] | { [k: string]: unknown };

/* ---------- scalar helpers ---------- */
export const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
/** 0..1 progress of t through [a, b]. */
export const P = (t: number, a: number, b: number) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const inv = (a: number, b: number, v: number) => (v - a) / (b - a);
export const remap = (v: number, a: number, b: number, c: number, d: number, ease: Ease = (x) => x) => lerp(c, d, ease(P(v, a, b)));
/** Round for SVG attributes. Server and browser must print identical numbers or React reports a hydration mismatch. */
export const q = (n: number, digits = 2) => { const f = 10 ** digits; return Math.round(n * f) / f; };
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** Smooth value noise in [0, 1]. */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 57.3), hash(i + 1 + seed * 57.3), u);
};
export const stagger = (i: number, step: number, base = 0) => base + i * step;

/* ---------- easing ---------- */
export const E = {
  lin: (x: number) => x,
  i2: (x: number) => x * x, i3: (x: number) => x ** 3, i4: (x: number) => x ** 4,
  o2: (x: number) => 1 - (1 - x) ** 2, o3: (x: number) => 1 - (1 - x) ** 3, o4: (x: number) => 1 - (1 - x) ** 4, o5: (x: number) => 1 - (1 - x) ** 5,
  io2: (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2),
  io3: (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2),
  io4: (x: number) => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2),
  expo: (x: number) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x)),
  sine: (x: number) => 0.5 - Math.cos(Math.PI * x) / 2,
  back: (x: number, s = 1.4) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2,
  /** cubic-bezier(x1, y1, x2, y2), the curves designers type into CSS. */
  bezier(x1: number, y1: number, x2: number, y2: number): Ease {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (u: number) => ((ax * u + bx) * u + cx) * u, Y = (u: number) => ((ay * u + by) * u + cy) * u, dX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let u = x;
      for (let i = 0; i < 6; i++) { const e = X(u) - x, d = dX(u); if (Math.abs(e) < 1e-6 || !d) break; u -= e / d; }
      return Y(clamp(u));
    };
  },
  /** Damped spring step response in seconds, settling at 1. zeta < 1 overshoots. */
  spring({ zeta = 0.5, omega = 14 } = {}): Ease {
    return (t) => {
      if (zeta < 1) { const wd = omega * Math.sqrt(1 - zeta * zeta); return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t)); }
      return 1 - Math.exp(-omega * t) * (1 + omega * t);
    };
  },
  steps: (n: number): Ease => (x) => Math.min(1, Math.floor(x * n) / (n - 1 || 1)),
};

/* ---------- value interpolation: numbers, arrays, plain objects, "#hex" colours ---------- */
const hex = (s: string) => {
  let h = s.slice(1); if (h.length <= 4) h = [...h].map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return h.length === 8 ? [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, (n & 255) / 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
};
export const rgba = (c: readonly number[]) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${+(c[3] ?? 1).toFixed(4)})`;
export function mix<T extends Mixable>(a: T, b: T, k: number): T {
  if (typeof a === "number") return (a + ((b as number) - a) * k) as T;
  if (typeof a === "string" && a[0] === "#") return rgba(mix(hex(a), hex(b as string), k)) as T;
  if (Array.isArray(a)) return a.map((v, i) => mix(v, (b as readonly number[])[i], k)) as unknown as T;
  if (a && typeof a === "object") {
    const o: Record<string, unknown> = {}, A = a as Record<string, Mixable>, B = b as Record<string, Mixable>;
    for (const key in B) o[key] = key in A ? mix(A[key], B[key], k) : B[key];
    return o as T;
  }
  return k < 1 ? a : b;
}

/* ---------- phrases: { dur, at(localTime) }, sampling clamped to [0, dur] ---------- */
const phrase = <T>(dur: number, at: (t: number) => T): Phrase<T> => ({ dur, at: (t) => at(clamp(t, 0, dur)) });
export const hold = <T>(v: T, dur = 0) => phrase(dur, () => v);
export const ramp = <T extends Mixable>(from: T, to: T, dur: number, ease: Ease = E.io3) => phrase(dur, (t) => mix(from, to, ease(dur ? t / dur : 1)));
export const curve = <T>(fn: (k: number, t: number) => T, dur = 1) => phrase(dur, (t) => fn(dur ? t / dur : 1, t));
export const springTo = <T extends Mixable>(from: T, to: T, dur = 1, opts?: { zeta?: number; omega?: number }) => { const s = E.spring(opts); return phrase(dur, (t) => mix(from, to, s(t))); };
export function seq<T>(...ps: Phrase<T>[]): Phrase<T> {
  const dur = ps.reduce((n, p) => n + p.dur, 0);
  return phrase(dur, (t) => {
    let acc = 0;
    for (const p of ps) { if (t <= acc + p.dur || p === ps[ps.length - 1]) return p.at(t - acc); acc += p.dur; }
    return ps[ps.length - 1].at(t);
  });
}
export const delay = <T>(p: Phrase<T>, d: number) => phrase(p.dur + d, (t) => p.at(t - d));
export const speed = <T>(p: Phrase<T>, f: number) => phrase(p.dur / f, (t) => p.at(t * f));
export const reverse = <T>(p: Phrase<T>) => phrase(p.dur, (t) => p.at(p.dur - t));
export const loop = <T>(p: Phrase<T>, n = Infinity): Phrase<T> => ({ dur: p.dur * n, at: (t) => (t >= p.dur * n ? p.at(p.dur) : p.at(((t % p.dur) + p.dur) % p.dur)) });
export const pingpong = <T>(p: Phrase<T>, n = Infinity) => loop(seq(p, reverse(p)), n);
export const map = <T, U>(p: Phrase<T>, fn: (v: T, t: number) => U) => phrase(p.dur, (t) => fn(p.at(t), t));
/** Place a phrase on the absolute timeline: before t0 it holds its first value, after, its last. */
export const at = <T>(p: Phrase<T>, t0: number) => (t: number) => p.at(t - t0);

/* ---------- absolute keyframe tracks: track([t, v], [t, v, easeIntoThisKey], ...) -> (t) => v ---------- */
export function track<T extends Mixable>(...keys: [number, T, Ease?][]) {
  keys.sort((a, b) => a[0] - b[0]);
  return (t: number): T => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e = E.io3] = keys[i];
      if (t <= t1) { const [t0, v0] = keys[i - 1]; return mix(v0, v1, e(P(t, t0, t1))); }
    }
    return keys[keys.length - 1][1];
  };
}
