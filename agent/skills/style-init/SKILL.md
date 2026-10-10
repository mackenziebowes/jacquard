---
name: style-init
description: Set up or refresh a project's .jacquard folder - turn the user's reference images in .jacquard/vibes/ into style rules (style.md), and take stock of what Jacquard has already built for the project (library.md). Run by `jack init`; run again whenever the vibes change.
disable-model-invocation: true
---

# Style init

You set the look every figure in this project will follow, and you take stock of what's already been built. Figure agents read what you write here before every job, so write rules they can act on, with their sources. Mackenzie, 2026-10-09 18:27: "Fable should manage init."

## 1. Read

- Every image in `.jacquard/vibes/`. These are the user's target vibes. Look at each one properly.
- Any notes in `.jacquard/vibes/` (a `notes.md`, captions in file names).
- `.jacquard/rules.md` if it exists: the user's instructions outrank anything you infer from images.
- The site's own design: its CSS variables or design tokens, its fonts, its dark/light handling, and a couple of its pages in a browser (`jack-look <url> --widths 1280,375`).
- The figures already in the project (find them through the site's figure registry or `components/explainers/`), and look at a few with `jack-look` on their viewer pages.

If `vibes/` is empty, say so and stop: there's nothing to derive a style from.

## 2. Write `.jacquard/style.md`

Rules for figures in this project, each one citing where it came from: an image file in `vibes/`, a quoted user rule, or the site's own tokens. A rule without a source doesn't go in. Cover what a figure agent actually decides:

- **Palette**: which of the site's colours (by token name) figures use, for what role (ink, ground, accent, warning), and what's off-limits.
- **Line and fill**: stroke weights, outline vs solid, corner treatment, texture.
- **People and objects**: how figures draw a person, a machine, a container, a document. Describe the drawing (proportions, detail level, stylisation), not a component name.
- **Type in figures**: which font, sizes, case, where labels sit.
- **Motion**: tempo, easing character, how much moves at once, how long a figure plays.
- **Density and space**: how busy a figure may be, margins, how many elements before it's too many.
- **Don't**: things the vibes clearly reject.

Keep it to what a builder can follow in one read: a page or two. If `style.md` already exists, rewrite it and end with **Changes since <date>**: what changed and which new or removed images caused it.

## 3. Write `.jacquard/library.md`

What Jacquard has built for this project so far, so future work reuses it instead of reinventing it. Mackenzie, 2026-10-09 18:27: "there needs to be some centralization to what was built by Jacquard for the project over time."

- The runtime and where it's installed.
- Per post: its world file (if any), what pieces it defines (exported functions or components and what they draw), and its figures.
- **Repeated pieces**: things built more than once across posts (three different people, two different conveyor belts). List each with its copies, and which copy best fits `style.md`. Don't move or merge code; this is an index and a recommendation.

## 4. Report

Say what you read (how many vibes, which pages and figures), the five rules that matter most, and the repeated pieces you'd consolidate first. Don't change any figure.
