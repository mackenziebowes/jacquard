// Named beats on a figure's timeline. Unknown names throw, and every lookup is recorded so a figure
// can be checked for beats it declares but never uses. Merged from ~/Explainers time.cues() and
// screenplay.cueSheet().
//
//   const C = cues({ pour: 0, land: [0.8, 1.6], verdict: 2.2 });
//   C.p(t, "land", E.o3)   // 0..1 through the "land" span (or `dur` seconds from "pour")
import type { Ease } from "./time";

export type CueDef = Record<string, number | readonly [number, number]>;
export type Cues = ReturnType<typeof cues>;

export function cues(def: CueDef) {
  const used = new Set<string>();
  const get = (id: string): [number, number | null] => {
    const c = def[id];
    if (c === undefined) throw new Error(`no cue "${id}" (known: ${Object.keys(def).join(", ") || "none"})`);
    used.add(id);
    return typeof c === "number" ? [c, null] : [c[0], c[1]];
  };
  const startOf = (id: string) => get(id)[0];
  return {
    used,
    ids: () => Object.keys(def),
    unused: () => Object.keys(def).filter((id) => !used.has(id)),
    has: (id: string) => id in def,
    at: startOf,
    end: (id: string) => { const [a, b] = get(id); if (b == null) throw new Error(`cue "${id}" has no end`); return b; },
    span: (id: string): [number, number] => { const [a, b] = get(id); return [a, b ?? a]; },
    /** 0..1 progress through the cue's span, or through `dur` seconds from its start. */
    p: (t: number, id: string, easeOrDur?: Ease | number, ease: Ease = (x) => x) => {
      const [a, b] = get(id);
      const dur = typeof easeOrDur === "number" ? easeOrDur : (b ?? a) - a;
      const e = typeof easeOrDur === "function" ? easeOrDur : ease;
      return e(dur <= 0 ? (t >= a ? 1 : 0) : Math.min(1, Math.max(0, (t - a) / dur)));
    },
    /** t is in [start of a, start of b). */
    on: (t: number, a: string, b: string) => t >= startOf(a) && t < startOf(b),
    since: (t: number, id: string) => t - startOf(id),
  };
}
