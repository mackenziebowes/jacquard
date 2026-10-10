# What Jacquard has built here

Index, not code. Written by `jack init`, 2026-10-09 18:48. Add to it when you build something; reuse before you build.

## Runtime

`client/components/explainers/_figure/` is the figure runtime from the `figure-runtime` skill (`/Users/mpbowes/dev/jacquard/agent/skills/figure-runtime/`), imported as `../_figure`:

- `Figure.tsx`: `defineFigure({ dur, size, compact?, setup?, render | draw })` and `<Figure spec />`. A figure is a pure function of `t`; the server renders `t = dur`, it plays once on scroll-in, stays still under reduced motion, replays on click. `?figure-t=<s|end>` freezes every figure on a page. Under 480 px wide the figure gets `compact: true` and the `compact` viewBox.
- `time.ts`: `clamp`, `P`, `lerp`, `remap`, `q`, `E` easings, phrases (`ramp`, `seq`, `delay`, `loop`, `track`...).
- `cues.ts`: `cues({ name: t | [t0, t1] })` to name moments.
- `rng.ts`: `rng(seed)` with `range`, `chance`.
- `physics.ts`: `fall`, `drop`, `pour`, `pile`, `sieve`, `level`, `tilt`, `settle`, `walk`.
- `puppet.ts`: `makeBody(seed)`, `gait`, `stand`, `personPaths`, `BODY_HEIGHT` (560), `groundOf`.
- `draw.ts`: `drawOn(k)`, `link`, `place`.

Viewer: `/explainers/<post>/<figure>` shows one figure alone (`client/app/explainers/[post]/[figure]/page.tsx`). Registry: `client/components/explainers/registry.ts`. Placement in a post: `{ type: "explainer", id, alt, caption? }` in `client/content/posts/data/<slug>.ts`, rendered by `client/components/themed/Content/Explainer.tsx` (a `<figure>` 52 rem wide, caption at 0.78 rem / 55%).

## Per post

### what-is-google-eeat (13 figures, all animated, world: `world.tsx`)

A small-town market street. Pieces:
- `Street(x, y, w)`: ground hairline.
- `Stall(x, y, s, variant "real" | "template", sign, keeper)`: 100 x 152 stall with scalloped awning; real has lettering, photos, a keeper; template is grey with blank panels.
- `Lantern(x, y, s, k, id)`: hung lamp, `k` 0..1 lit, radial accent glow.
- `Person(x, y, s, body, J, flip, children)`: filled puppet silhouette via `personPaths`; children in body units.
- `Rater(..., tick)`: Person with a clipboard, cut-out lines, draw-on tick.
- Constants `FG MUTED PAPER GROUND ACCENT STALL_W STALL_H LINE`, `labels(compact)`, `Frame`.

Figures: `hero-trust-street`, `trust-footing`, `medic-slide`, `ymyl-bar`, `experience-added`, `real-photo`, `plumb-line`, `cited-stall`, `honest-door`, `rater-loop`, `one-way-stairs`, `unseen-stall`, `two-bars`. `RaterLoop` also draws inline: a hopper-topped "algorithm" box, a plug and socket, a row of result cards.

### how-and-why-to-get-involved-with-vibe-manufacturing (6 figures, world: `world.tsx`)

Drafting and checking boards. Pieces:
- `Board(x, y, r, pass)`: 13 x 8 drafted board with two dots; accent when it passes.
- `Hopper(cx, y, label)`: the agent, an outlined trapezoid with "Agent" in it.
- `Sieve(x, y, w, text)`: outlined bar of checks with a label.
- `Person(x, y, reach)`: hairline stick figure.
- `Crate(x, y, w, h)`: outlined box with an X.
- `Gate(x, y, h, text)`: two posts and a lintel.
- Constants `TW TH FG MUTED ACCENT line`, `type(compact)`, `Frame`.

Figures: `draft-sieve` (static), `check-loop` (static), `where-to-stand`, `first-order-log`, `capital-road`, `count-stops-here`.

### generative-og-images-built-and-measured (6 figures, world: `world.tsx`)

Pages becoming contour maps. Pieces:
- `field`, `makeMap(seed, w, h)`, `MapCard(x, y, map, k, id)`: seeded terrain, minor and index contours, orange halftone dots on a brown ground (the only raw hex in the figures: `#0d0906`, `#060403`).
- `pageLines(seed, n)`, `PageSheet(x, y, w, h, lines, k, edit, editK)`: outlined page with ragged lines, one line redrawable in orange.
- Constants `FG MUTED ORANGE (--accent-b) BG GROUND line`, `type(compact)`, `Frame`.

Figures: `halftone-ribbon` (interactive, 340 lines, its own frame and controls), `page-to-map`, `no-text-on-the-card`, `sealed-middle`, `leading-lamp`, `one-seed-two-synths`.

### Single-figure posts (no world file)

- `eeat-requires-custom-websites/shipped-weight`: static. Inline: a stick figure pulling a cart of outlined boxes, a phone, dashed speed lines.
- `prose-scrub-built-by-the-agent-it-gates/height-check`: static. Inline: three filled pages as bars against a dashed pass line, mono numbers.
- `prose-scrub-0-4-a-small-model-as-second-reader/opening-diff`: static text diff with a colour legend (tomato, orange, emerald, grey).
- `where-small-business-owners-hang-out-online/leaving-the-feed`: animated with its own rAF/IntersectionObserver, not the runtime. Inline: an outlined phone with feed cards, filled-head stick figures walking, four outlined booths with icons.

## Repeated pieces

Built more than once. The recommendation is which copy fits `style.md` (flat filled silhouettes); nothing has been moved or merged.

| Piece | Copies | Fits style.md best |
|---|---|---|
| **Person** | `what-is-google-eeat/world.tsx` `Person` (filled puppet via `personPaths`); `vibe-manufacturing/world.tsx` `Person` (hairline stick); `ShippedWeight` inline stick; `LeavingTheFeed` inline stick with filled head | **eeat `Person`**. The others are stick figures, which style.md rules out. If it's lifted to a shared place, it needs nothing from the eeat set but `FG`. |
| **Frame** (`border border-border/60 bg-surface/40 p-3 md:p-5`) | Three identical `Frame` components in the three world files, plus the same classes inline in the 7 standalone / older figures | Any; they're identical. Candidate for `_figure/`. |
| **type / labels helper** | `type(compact)` in vibe-manufacturing (15/14, 13/12.5) and OG (15/13.5, 13/12); `labels(compact)` in eeat (15/13, 13/11.5) | Same shape, sizes differ by a point. One helper with style.md's sizes (label 13.5, small 12; compact 15/13). |
| **Page / document** | OG `PageSheet` (outlined, draw-on lines); `HeightCheck` inline pages (filled bar with cut-out lines); `RaterLoop` inline handbook; `Rater` clipboard (filled, cut-out lines) | **`HeightCheck` / `Rater` approach**: filled with lines cut out. `PageSheet` has the better API (seeded `pageLines`, an editable line). |
| **Stall / booth** | eeat `Stall` (outlined, scalloped awning, 100 x 152); `LeavingTheFeed` four outlined booths with icons | eeat `Stall` for shape and API; both need redrawing as fills to meet style.md. |
| **Phone** | `ShippedWeight` inline; `LeavingTheFeed` inline (with feed cards) | Neither is filled. `LeavingTheFeed`'s has the more useful detail (cards inside). |
| **Hopper / funnel** | vibe-manufacturing `Hopper`; `RaterLoop` inline hopper on the algorithm box | `Hopper` (has the API); redraw as a solid trapezoid with a slot. |
| **Ground line** | eeat `Street`; a bare `<line>` in every other figure | `Street`, trivially. |
| **Box / crate / card** | vibe-manufacturing `Crate` (X-braced); `ShippedWeight` cart boxes; `RaterLoop` result cards; `Board` | None is a general piece; `Board` is the most reused within its post. |

Consolidate first: **Person** (four drawings, one good one), then **Frame + type** (identical code in three worlds), then **Page**.
