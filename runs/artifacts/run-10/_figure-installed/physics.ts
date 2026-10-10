// Physical verbs as closed-form functions of time. Nothing is integrated frame by frame, so any t
// renders on its own and the end state is exact. Units: px, seconds, y grows downward (SVG).
import { clamp, lerp, E } from "./time";
import { rng } from "./rng";

export type Pt = { x: number; y: number };
export type Placed = Pt & { r: number };

/** Seconds to fall height h from rest. */
export const fallTime = (h: number, g = 2400) => Math.sqrt((2 * Math.max(0, h)) / g);

/**
 * Height of something dropped from rest at y=`from` onto a floor at y=`to`, starting at t0.
 * `bounce` is restitution (0 = thud, 0.4 = lively); bounces stop once they're under a pixel.
 */
export function fall(t: number, { from, to, t0 = 0, g = 2400, bounce = 0 }: { from: number; to: number; t0?: number; g?: number; bounce?: number }) {
  const s = t - t0;
  if (s <= 0) return from;
  const T = fallTime(to - from, g);
  if (s < T) return from + 0.5 * g * s * s;
  let v = g * T * bounce, u = s - T;
  while (v > 0 && (v * v) / (2 * g) > 1) {
    const flight = (2 * v) / g;
    if (u < flight) return to - (v * u - 0.5 * g * u * u);
    u -= flight; v *= bounce;
  }
  return to;
}

/**
 * One object travelling from `from` to its resting place `to`: falls under gravity, drifts across
 * in x over the same time, turns to its resting angle. `started` is false before t0, `landed` once down.
 */
export function drop(t: number, { from, to, t0 = 0, g = 2400, bounce = 0, r0 = 0 }: { from: Pt; to: Placed; t0?: number; g?: number; bounce?: number; r0?: number }) {
  const T = fallTime(to.y - from.y, g), k = T ? clamp((t - t0) / T) : 1;
  return {
    x: lerp(from.x, to.x, k),
    y: fall(t, { from: from.y, to: to.y, t0, g, bounce }),
    r: lerp(r0, to.r, E.o2(k)),
    started: t >= t0,
    landed: t >= t0 + T,
  };
}

/** When each of n items starts moving: a steady pour from t0 at `rate` per second, with seeded jitter. */
export function pour(n: number, { t0 = 0, rate = 30, jitter = 0.3, seed = 1 } = {}) {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => t0 + (i + r.range(-jitter, jitter) * 0.5) / rate);
}

/**
 * Resting places for n items in a heap on the floor at y=`base`, centred on cx, bottom row first
 * (drop them in this order). Each row is `step` items narrower than the one below.
 * Returns exactly n slots: a label that says 92 gets 92 things.
 */
export function pile(n: number, { cx, base, w, h, gap = 2, step = 2, seed = 1, wobble = 6 }: { cx: number; base: number; w: number; h: number; gap?: number; step?: number; seed?: number; wobble?: number }): Placed[] {
  const r = rng(seed);
  let bottom = 1;
  const capacity = (b: number) => { let s = 0; for (let k = b; k > 0; k -= step) s += k; return s; };
  while (capacity(bottom) < n) bottom++;
  const out: Placed[] = [];
  for (let row = 0, k = bottom; out.length < n; row++, k -= step) {
    const count = Math.min(k, n - out.length), width = count * (w + gap) - gap;
    for (let i = 0; i < count; i++) {
      out.push({
        x: cx - width / 2 + i * (w + gap) + w / 2 + r.range(-1, 1) * gap,
        y: base - row * (h + gap) - h / 2,
        r: row === 0 ? r.range(-2, 2) : r.range(-wobble, wobble),
      });
    }
  }
  return out;
}

/** Which of n items get through a filter: exactly `pass` of them, in a seeded order. */
export function sieve(n: number, pass: number, seed = 1) {
  const flags = Array.from({ length: n }, (_, i) => i < pass);
  return rng(seed).shuffle(flags);
}

/** A fill level that rises (rate > 0) or drains (rate < 0) from t0, held between min and max. */
export const level = (t: number, { t0 = 0, start = 0, rate = 0.5, min = 0, max = 1 } = {}) => clamp(start + rate * Math.max(0, t - t0), min, max);

/** Resting tilt of a beam with these weights on each end, in radians (positive = right side down). */
export const tilt = (left: number, right: number, max = 0.35) => (left + right ? max * clamp((right - left) / (right + left), -1, 1) : 0);

/** Spring from one value to another starting at t0 (overshoots when zeta < 1). Use for tilts, snaps, landings. */
export function settle(t: number, { t0 = 0, from, to, zeta = 0.45, omega = 10 }: { t0?: number; from: number; to: number; zeta?: number; omega?: number }) {
  return t <= t0 ? from : lerp(from, to, E.spring({ zeta, omega })(t - t0));
}

/** Someone walking from x0 at `speed` px/s from t0, stopping at `to` if given. phase feeds puppet gait(). */
export function walk(t: number, { x0, to, t0 = 0, speed = 90, stride = 70 }: { x0: number; to?: number; t0?: number; speed?: number; stride?: number }) {
  const dir = to === undefined || to >= x0 ? 1 : -1;
  const far = to === undefined ? Infinity : Math.abs(to - x0);
  const d = Math.min(far, speed * Math.max(0, t - t0));
  return { x: x0 + dir * d, phase: (2 * Math.PI * d) / stride, moving: t > t0 && d < far, dir };
}
