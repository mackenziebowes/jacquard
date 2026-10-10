# Style for figures on mackenziebowes.com

Written by `jack init`, 2026-10-09 18:48. Sources: one vibe image (`vibes/07-geometric-nature.webp`, "Geometric Nature", HVNTER 2023: a sheet of ~90 nature pictograms, flat cream silhouettes on near-black), the site's tokens in `client/app/globals.css` and `client/styles/colors.css`, the site's AGENTS.md, and the 29 figures already in `client/components/explainers/`. No `rules.md` exists yet, so nothing below is a user instruction; it is all inferred and the user can overrule any of it.

The one-line version: **flat cream silhouettes on the site's black, built from circles, half-discs, leaves and arcs; one accent colour used for one thing; no outlines.**

## Palette

- **Ground** is the page: `var(--background)` (dark: `deepspace-bg`, oklch 0.082). Figures sit in a frame of `bg-surface/40` + `border-border/60`, the same frame every existing figure uses. Don't paint another ground behind the figure. (Site tokens; every existing figure.)
- **Ink** is `var(--foreground)` (dark: `zinc-100`), solid, 100% opacity for the thing the figure is about. The vibe sheet is one cream ink on black with nothing in between (`07-geometric-nature.webp`).
- **Second ink**, for things that matter less (the other stalls, the pile that failed, a label for context): `var(--muted-foreground)` (dark: `zinc-400`), or ink at 0.55 opacity, which is what the existing figures do. Pick one per figure, not both.
- **Accent**: `var(--accent)` (emerald) for the one thing the reader should find: the lit lantern, the 8 that pass, the "you". One accent per figure, on at most one idea. (Site `--accent`; `DraftSieve`, `HeroTrustStreet`, `HeightCheck` all do this and it reads.)
- **Warning / cut**: `var(--accent-a)` (tomato) only for something removed or wrong (`OpeningDiff` uses it for cut text). `var(--accent-b)` (orange) belongs to the generative-OG post, whose real images are orange contours; don't use it elsewhere.
- **Off limits**: raw hex colours (two slipped into the OG world as a brown map ground; don't add more), gradients other than a soft radial glow for light, any third hue in one figure. The site is "dark and nearly monochrome" (AGENTS.md) and the vibe sheet has exactly two colours.
- Light mode exists (`:root` is light, dark is `prefers-color-scheme`). Tokens flip it for free; opacities on `--foreground` survive the flip, hard colours don't.

## Line and fill

- **Fill, don't outline.** Every pictogram on the vibe sheet is a solid shape; edges are where cream meets black, never a stroke. Draw a stall as a filled awning over a filled counter with a black gap between them, not a wireframe. The puppet people in `what-is-google-eeat` are already filled; the hairline-outlined stalls, crates, phones and carts in the other posts are the thing to move away from. (`07-geometric-nature.webp`; contrast `RaterLoop`, `ShippedWeight`.)
- **Counter-shapes carry the detail.** Eyes, windows, the lines on a page, the gap between petals: all cut out of the fill in ground colour, as `Rater`'s clipboard already does (`fill={FG}` with `GROUND`-coloured lines). No thin strokes drawn on top of fills.
- **Geometry**: circles, half-discs, quarter-arcs, leaf (two arcs), rounded rectangles with one square side, triangles. Repeat a unit (a row of dots, a fan of leaves, three bars of a hill) rather than drawing a detailed thing once. (Vibe sheet: trees are stacked triangles, hills are stacked half-discs, suns are a disc with triangle rays, flowers are rings of discs.)
- **Where a stroke is unavoidable** (a ground line, a dimension line, a plumb line, a leader to a label): 1-1.5 px, ink at 0.55, square ends, no arrowheads unless the figure is about direction. That's the hairline the existing figures use for ground and leaders; keep it to those jobs.
- **Corners**: either fully round (a disc) or fully square. The site's `--radius` is 0; the vibe sheet's rectangles are square except where a shape is a rounded blob. No 4 px corner radii.
- **No texture, no hatching, no drop shadows.** Halftone dots are allowed only when the subject is halftone (`HalftoneRibbon`).

## People and objects

- **A person** is a filled silhouette about 7-8 heads tall, in profile, head a plain disc separated from the body by a thin black gap, limbs as tapered solid shapes, no face. That's `_figure/puppet.ts` + `personPaths` as used in `what-is-google-eeat/world.tsx`'s `Person`: use it. Stick figures (a circle on a line, as in `ShippedWeight`, `LeavingTheFeed`, vibe-manufacturing's `Person`) are off the style now. The vibe sheet draws animals this way: one solid body, one gap for the neck, eye as a cut-out dot (the goose, the heron, the crow).
- **A machine or a container** (hopper, sieve, phone, cart, crate, stall): one solid outer shape with its openings cut out. A hopper is a solid trapezoid with a black slot; a phone is a rounded rectangle with a smaller black rectangle cut from it; a crate is a square with a black X cut through. Keep one piece of recognisable detail (the awning scallops, the lamp's finial) and drop the rest.
- **A document or page**: a solid light rectangle with black lines cut out, 4-8 lines, first line heavier. `PageSheet` in the OG world has the right idea but is outlined; `HeightCheck`'s filled page is closer.
- **Ground**: a single hairline, or better, a solid low shape (the vibe sheet's hills are stacked half-discs, its water is three wavy bands). Things stand on it; nothing floats unless it's falling.
- **Light / glow**: a radial gradient in the accent from 0.26 to 0, as `Lantern` does. The only place a gradient belongs.
- **Scale**: about 100-160 px tall for a principal object at the 52 rem frame width; a person is 120-150 px (`s = 150 / BODY_HEIGHT`). Below that, silhouettes lose their shape.

## Type in figures

- **Font**: `var(--font-sans)` (Inter, the site's label font) for everything inside a figure. `var(--font-serif)` (Space Grotesk, the display font) only for one title word on a thing, e.g. the "Agent" on the hopper, if at all. `var(--font-mono)` for numbers that are measurements (`HeightCheck`'s 0.54 / 0.60 / 0.68). (Site tokens; existing figures, 22 of 26 text uses are `--font-sans`.)
- **Sizes**: label 13-14 px, small 11.5-12.5 px at full width; 15 / 13 in `compact` (under 480 px). Never scale a label down with the figure; restack instead. That's the `type(compact)` / `labels(compact)` helper every world file already defines. Weight 400; 600 for a single headline word.
- **Case**: sentence case, lowercase where natural ("no socket", "92 caught"). Caps only for a tiny tag on an object ("OPEN"). Hyphens, never dashes, as in the prose (AGENTS.md).
- **Placement**: labels sit beside or under their object, left-aligned to it or centred under it, never inside a filled silhouette. Two levels at most: a label and a muted sub-line under it ("8 pass / every check"). No legend boxes unless the figure is a chart (`OpeningDiff`).
- **Count**: a figure carries at most 5-6 labels; the picture should work with them covered. The vibe sheet has no labels at all.

## Motion

- **Length**: 3-6 s, one playthrough; the existing figures run 3.0-10 s and the long ones (`HonestDoor` 10, `YmylBar` 9.5) feel long. The server renders the end state, so the last frame is the figure; every earlier frame is a way of getting there.
- **One thing moves at a time.** A pour, then a settle, then the label. Overlap only a cause and its effect (the lantern lights as the queue forms).
- **Easing**: physical where something falls, pours or walks (`_figure/physics.ts`); `E.io3` for reveals; no bounce on anything that isn't an object landing. Silhouettes move as whole shapes: translate, rotate, scale; don't morph them.
- **Reveal**: fade or slide in solid shapes; `drawOn` (stroke-dash drawing) only for the hairlines it was made for (a tick, a leader), since silhouettes have no stroke to draw.
- **Quiet after**: nothing loops. Reduced motion shows the end state, which the runtime handles.

## Density and space

- **One scene, one idea, 5-9 shapes.** The vibe sheet's single pictograms are made of 3-12 primitives; a figure is a few of those on a ground line. `DraftSieve` (hopper, pile, sieve, tray, three labels) is about the ceiling.
- **Margins**: at least 24 px of empty ground inside the frame on every side; the frame itself is `p-3 md:p-5`.
- **Height**: 300-460 px at full width. The site's post column is 52 rem; a figure wider than it is tall should be about 2:1 to 2.4:1.
- **Compact (< 480 px)**: restack vertically or drop a secondary element; don't shrink the whole scene.
- **Negative space is a shape**: leave black between parts (neck gap, the slot in the hopper, the gap between awning and counter). It's what makes silhouettes read.

## Don't

- Don't outline things in hairlines. (Vibe sheet; the biggest gap between it and the current figures.)
- Don't draw stick figures.
- Don't use more than ink + one muted + one accent in a figure.
- Don't put text on top of a filled shape.
- Don't add textures, shadows, 3-D, perspective or isometric views; everything is flat and frontal or in strict profile.
- Don't invent a background colour or paint a sky; the page is the sky.
- Don't use em or en dashes in labels or captions.
- Don't polish the current label-style OG images (AGENTS.md); figures and OG art are separate jobs.

## Changes since

First version; nothing to diff.
