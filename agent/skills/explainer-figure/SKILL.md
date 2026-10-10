---
name: explainer-figure
description: Make an SVG, canvas or animated figure that shows what a piece of writing says - its story and claims - as a physical scene. Use when asked to illustrate, diagram or animate a post, page or passage.
---

# Explainer figure: what happened

Draw for a reader who struggles with words and with charts. Charts are the only thing harder to read than prose, so a chart is not an explainer. Show the idea as a physical scene, a small puppet show: things with weight that fall, pile up, get sieved, leak, jam, balance or wear down, and people or machines doing what the passage says they do. A reader should get the point from the scene before reading a single label. Numbers ride along as labels on the scene, never as axes. This helps every reader, not only the ones who struggle.

This figure helps the reader parse the story and its claims. One figure explains one mechanism; if a piece holds two ideas, pick the one it's built on.

## Before drawing

1. Read the whole piece once, then the passage closely.
2. Write down the claim the figure will carry, in one sentence, with the author's own strength words ("slightly", "probably", "about").
3. Name the mechanism: what moves, piles up, splits, flows or changes, and why. Then name its physical metaphor: the everyday object or scene that behaves the same way. A figure that only restates the text as boxes, arrows or bars is not an explainer.

## Drawing

- The figure must not be louder than the author's sentence. A small effect gets drawn small.
- Use the piece's real numbers when it has them. If you need a number it doesn't give, show it as illustrative, never as data. When a label gives a count, draw exactly that many.
- Match the host page: its colours, type and spacing. Read its design tokens before choosing any.
- Text inside the figure stays legible on a 375px-wide phone.
- Build on `figure-runtime` (load it): it handles time, playback, the end state and reduced motion, and gives you physics and puppets for the scene. Prefer SVG; canvas for many particles or per-pixel work.
- Motion is optional, but a physical scene usually reads better when the reader sees it happen once.
- Give the figure a literal alt description of what it shows.

## Done

The figure builds, renders without console errors, has no horizontal overflow at 375px, and you have looked at it.

**AFTER COMPLETING THESE TASKS, YOU CAN NOW MOVE ON TO `why-it-matters-figure`:** a second figure that shows the reader why the claim you just drew matters. Write down this figure's claim, mechanism and metaphor before you load it; it builds on them.
