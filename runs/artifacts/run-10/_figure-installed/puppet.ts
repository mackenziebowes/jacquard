// A small puppet rig: seeded bodies, a walking gait as a function of phase, and SVG path data for
// tapered limbs. Joints are in body space (pelvis at 0,0, +x is the way they face, y down) at about
// 560 units tall; scale with an SVG transform. Extracted from ~/Explainers videos/small-fire/lib.
import { clamp, lerp, q } from "./time";
import { rng } from "./rng";

export type Joint = readonly [number, number];
export type Joints = Record<"neck" | "head" | "shF" | "shB" | "elF" | "haF" | "elB" | "haB" | "hipF" | "knF" | "anF" | "toF" | "hipB" | "knB" | "anB" | "toB", Joint>;
export type Body = ReturnType<typeof makeBody>;

/** Puppet height in body units, pelvis-to-ground included. Divide your target px height by this for scale. */
export const BODY_HEIGHT = 560;

/** Seeded proportions: the same seed is always the same person. */
export function makeBody(seed: number) {
  const r = rng(seed);
  return {
    seed,
    thigh: r.range(104, 118), shin: r.range(138, 152), foot: r.range(44, 52),
    upper: r.range(74, 84), fore: r.range(70, 78), torso: r.range(180, 198),
    bulk: r.range(0.9, 1.15),
  };
}
/** y of the ground below the pelvis for this body. */
export const groundOf = (B: Body) => B.thigh + B.shin + 6;

// angles measured from straight down, positive = forward (+x)
const from = ([x, y]: Joint, a: number, L: number): Joint => [x + Math.sin(a) * L, y + Math.cos(a) * L];

/**
 * Joint positions for a walk or run. phase in radians (one stride = 2π; physics.walk() supplies it).
 * stride 0 with knee 0 is standing. `reach` lifts the near arm to point or hold something (radians, 0 = down).
 */
export function gait(body: Body, phase: number, { stride = 0.55, knee = 1.1, bob = 8, lean = 0.08, swing = 0.6, reach }: { stride?: number; knee?: number; bob?: number; lean?: number; swing?: number; reach?: number } = {}): Joints {
  const B = body;
  const leg = (p: number) => {
    const a = stride * Math.sin(p);
    const k = 0.08 + knee * clamp(Math.sin(p + 1.2)) ** 1.4;
    const hip: Joint = [0, 0], kn = from(hip, a, B.thigh), an = from(kn, a - k, B.shin);
    return { hip, kn, an, to: from(an, a - k + Math.PI / 2 - 0.25 * clamp(Math.cos(p)), B.foot) };
  };
  const near = leg(phase), far = leg(phase + Math.PI);
  const neck = from([0, 0], Math.PI - lean, B.torso), head = from(neck, Math.PI - lean * 1.5, 48);
  const sh = from([0, 0], Math.PI - lean, B.torso - 16);
  const sw = -swing * Math.sin(phase);
  const elB = from(sh, sw, B.upper), haB = from(elB, sw + 0.5, B.fore);
  const elF = from(sh, reach ?? -sw, B.upper), haF = from(elF, (reach ?? -sw) + (reach === undefined ? 0.5 : 0.1), B.fore);
  const low = Math.max(near.an[1], near.to[1], far.an[1], far.to[1]) + 6;
  const dy = groundOf(B) - low - bob * clamp(Math.sin(phase * 2)) * 0.4;
  const J: Joints = {
    neck, head, shF: [sh[0] + 8, sh[1]], shB: [sh[0] - 10, sh[1] + 2], elF, haF, elB, haB,
    hipF: [near.hip[0] + 8, 0], knF: near.kn, anF: near.an, toF: near.to,
    hipB: [far.hip[0] - 8, 0], knB: far.kn, anB: far.an, toB: far.to,
  };
  for (const k of Object.keys(J) as (keyof Joints)[]) J[k] = [J[k][0], J[k][1] + dy];
  return J;
}

/** Standing still, optionally reaching with the near arm. */
export const stand = (body: Body, reach?: number) => gait(body, 0, { stride: 0, knee: 0, bob: 0, swing: 0, reach });

/** Blend two poses (or any objects of joints and numbers). */
export const lerpPose = <T extends Record<string, Joint | number>>(a: T, b: T, k: number): T =>
  Object.fromEntries(Object.keys(a).map((j) => {
    const A = a[j], Bv = b[j];
    return [j, Array.isArray(A) ? [lerp(A[0], (Bv as Joint)[0], k), lerp(A[1], (Bv as Joint)[1], k)] : lerp(A as number, Bv as number, k)];
  })) as T;

/** SVG path data for a tapered limb through joints, rounded at each joint. Fill it; don't stroke it. */
export function limbPath(pts: readonly Joint[], widths: readonly number[]) {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], wa = widths[i] / 2, wb = widths[i + 1] / 2;
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    d += `M${q(ax + nx * wa)} ${q(ay + ny * wa)}L${q(bx + nx * wb)} ${q(by + ny * wb)}L${q(bx - nx * wb)} ${q(by - ny * wb)}L${q(ax - nx * wa)} ${q(ay - ny * wa)}Z`;
  }
  pts.forEach(([x, y], i) => { const r = q(widths[i] / 2); d += `M${q(x - r)} ${q(y)}a${r} ${r} 0 1 0 ${q(2 * r)} 0a${r} ${r} 0 1 0 ${q(-2 * r)} 0Z`; });
  return d;
}

/**
 * Path data for a whole person in three layers, back to front. Draw `far` slightly dimmer than
 * `near` so crossing limbs read. All three use the same fill.
 */
export function personPaths(J: Joints, body: Body) {
  const w = (v: number) => v * body.bulk;
  const [hx, hy] = J.head, hr = 30;
  return {
    far: limbPath([J.shB, J.elB, J.haB], [w(26), w(20), w(15)]) + limbPath([J.hipB, J.knB, J.anB, J.toB], [w(44), w(32), w(18), 10]),
    body: limbPath([[0, -10], J.neck], [w(70), w(64)]) + limbPath([J.neck, J.head], [w(24), w(22)]) +
      `M${q(hx - hr)} ${q(hy)}a${hr} ${hr} 0 1 0 ${2 * hr} 0a${hr} ${hr} 0 1 0 ${-2 * hr} 0Z`,
    near: limbPath([J.hipF, J.knF, J.anF, J.toF], [w(46), w(34), w(18), 10]) + limbPath([J.shF, J.elF, J.haF], [w(28), w(21), w(16)]),
  };
}
