---
name: figure-runtime
description: A small React runtime for animated SVG/canvas explainer figures - time, cues, seeded randomness, closed-form physics (fall, pile, sieve, pour, level, tilt, walk) and a puppet rig. Use when building any figure with motion, physical objects or people.
---

# Figure runtime

A figure is a pure function of time: `render(t, state, ctx)` returns SVG for any `t` in `[0, dur]`. The runner does the rest: the server renders `t = dur` (the finished picture ships in the HTML), it plays from 0 once when scrolled into view, stays on the end state under reduced motion or a hidden tab, and replays on click. You never write animation loops, timers or end-state logic.

## Install once per site

1. Copy `assets/figure/` (next to this file) into the site, beside its other figure components (for example `components/explainers/_figure/`), unless it's already there. It needs only React. Don't edit the copied files to suit one figure; if the runtime is missing something, say so in your report.
2. Give every figure a **viewer page** that shows it alone, so nobody has to scroll a long post to see it and parallel builders never shift each other's layout. `assets/example/viewer-page.tsx` is one for a Next.js App Router site: `/explainers/<post>/<figure>`.
3. Give every figure's wrapper on the post a **stable id** (for example `fig-<post>--<figure>`) so it can be linked to.

## Looking at a figure

Any moment of any figure is one URL: add `?figure-t=<seconds>` or `?figure-t=end` and every figure on that page freezes there and never plays. (The `t` prop on `<Figure>` does the same in code.) Look with `jack-look`, choosing the moments and widths you need:

```bash
jack-look http://localhost:3000/explainers/<post>/<figure> --times 0,0.8,1.6,end --widths 1280,375
```

It prints one image per width with your moments side by side, plus console errors and sideways overflow. Read the images. Don't scroll pages or sleep waiting for animations.

`jack-look` is only for one figure: a viewer URL, or a page URL whose `#fragment` is the figure's id. On a URL with neither it says "no figure here". For whole pages use `agent-browser` (see `APPEND_SYSTEM`).

## Write a figure

The API below is complete; you don't need to read the runtime's source. `assets/example/LeakyJar.tsx` shows the API in use. Its jar and coins are not a metaphor to reuse: pick your scene from the passage, never from the example. The shape:

```tsx
"use client";
import { Figure, defineFigure, cues, E, pile, drop, place, q } from "../_figure";

const C = cues({ pour: 0, land: [0.8, 1.6], verdict: 2.2 }); // named beats; unknown names throw
const spec = defineFigure({
  dur: 2.8,                                  // must cover every motion, or the end state is missing things
  size: { W: 640, H: 300 },                  // viewBox
  compact: { W: 360, H: 320 },               // below 480px wide: restack and enlarge labels, don't shrink
  setup: () => ({ /* seeded layouts, bodies, piles: anything that doesn't change with t */ }),
  render: (t, state, { W, H, compact }) => <g>{/* SVG */}</g>,
});
export default function MyFigure() { return <Figure spec={spec} />; }
```

Use `draw: (g, t, state, ctx) => void` instead of `render` for canvas (hundreds of particles). Colours come from the site's CSS variables and `currentColor`; text inherits the page font.

## The kit (all in `figure/index.ts`)

- **time**: `E` easings (`o3`, `io3`, `back`, `spring()`, `bezier()`), `P(t,a,b)` progress, `lerp`, `mix` (numbers, arrays, objects, `#hex`), `track([t,v],[t,v,ease]…)` keyframes, phrases `ramp/seq/delay/loop`, `q()` rounding, `hash/noise1`.
- **cues**: `cues({...})` then `C.p(t, id, ease?)`, `C.at`, `C.span`, `C.on(t,a,b)`, `C.since`. Name beats after the story ("pour", "leak", "verdict").
- **rng**: `rng(seed)` with `range/int/pick/chance/shuffle`. Never `Math.random()`.
- **physics** (closed form, any `t` stands alone; px, seconds, y down):
  - `fall(t, {from, to, t0, bounce})` height under gravity, with bounces
  - `drop(t, {from, to, t0, bounce})` an object travelling to its resting `{x, y, r}`; `.started`, `.landed`
  - `pour(n, {t0, rate})` start times for a stream of n things
  - `pile(n, {cx, base, w, h, step})` exactly n resting places in a heap, bottom first
  - `sieve(n, pass, seed)` exactly `pass` of n flagged, seeded order
  - `level(t, {t0, start, rate})` a fill rising or draining
  - `tilt(left, right)` a beam's resting angle; `settle(t, {t0, from, to})` springs to it
  - `walk(t, {x0, to, t0, speed})` position and gait phase
- **puppet**: `makeBody(seed)`, `gait(body, phase)` walking, `stand(body, reach?)`, `personPaths(J, body)` gives `far/body/near` path data. Body space is ~560 tall (`BODY_HEIGHT`) with the pelvis at 0,0: scale with `place(x, y, 0, px / BODY_HEIGHT)` and put the pelvis at `groundY - (body.thigh + body.shin + 6) * scale`.
- **draw**: `drawOn(k)` props to draw a stroke on; `link(a, b, k)` a curved connector plus a `bead` travelling it; `place(x, y, deg, scale)` a transform string.

## Rules

- `render` must depend only on `t`, `state` and `ctx`. No `Date.now()`, no state kept between frames.
- Round numbers you print into attributes with `q()` when they come from trig or physics, or React may report a hydration mismatch.
- When a label gives a count, the scene has exactly that many things. `pile` and `sieve` return exact counts; use them.
- Check `dur` against your latest cue plus its motion. The end state is `t = dur`; anything still in flight then is missing from the picture.
