---
name: post-figures
description: Plan and make the full set of explainer figures for a whole post or page - one animated figure for the point of the whole piece, plus one figure for every headed section. Use when asked to illustrate, add figures to, or explain a whole post or page.
---

# Figures for a whole post

A post gets:

1. **One hero animation** for the point of the entire post: what it argues and why a reader should care. It sits right after the intro, before the first heading. It's the one figure someone could watch instead of reading the post.
2. **One figure for every heading's section**, explaining that section's main claim. Place it after the paragraph that carries the claim, not straight under the heading.

## Plan first

Read the whole post. Then write the plan to `.jacquard/plans/<post-slug>.md` before anything is built: one `## ` section per figure (the hero first), each with these lines:

```markdown
## Hero: <what it shows>
- file: client/components/explainers/<post-slug>/<Name>.tsx
- section: (after the intro) or the heading it belongs to
- kind: what happened | why it matters
- claim: one sentence, with the author's strength words
- mechanism: what moves, piles up, splits, flows or changes, and why
- metaphor: the physical scene
- animation: what moves, in what order, over how long (every figure animates)
- numbers: the post's numbers it may use, or "illustrative"
```

The harness enforces this (Mackenzie, 2026-10-09 19:06: "*MUST* write a plan, then must have plan reviewed, plan must have animation, then must swarm the animation work."): Big Bro won't review a plan whose figures lack a `file` or an `animation`; no Little Bro starts before the review; you can't write figure files yourself except stubs that return null; and you can't finish while a planned figure is undelegated or still a stub.

- **One world per post.** Pick a cast and a set for the whole post (the same people, the same machine, the same landscape) and let each section's figure be a different scene in that world. A reader should feel they're watching one story, not flipping through clip art.
- **Different scenes, not the same scene relabelled.** If two sections would get the same picture, they're probably one idea: give the figure to the section that carries it, and say so for the other.
- **Skip what has nothing to explain**: source lists, a closing line, a section that only lists links. Say which you skipped and why.
- **Keep what works.** If the post already has figures, check them against the plan. Keep the ones that fit, and only replace one if the plan clearly needs something else.

## Roles

You are Main Guy. Mackenzie, 2026-10-09 16:03:50:

> Opus reads the site, drafts a plan, asks fable to review the *plan* for smells, then tasks kick off to sonnets.
> Big Bro only needs to review the plan.
> Little Bro only needs to loop til the task is done.
> Main Guy only needs to iterate on the plan and drive Little Bros.

Your helpers, through the `subagent` tool:

- `big-bro` reviews your plan for smells. Only the plan, never built figures.
- `little-bro` builds one figure (or the world file) from a brief and loops until it's done.

## Steps

1. **Read** the project's `.jacquard/` (`rules.md`, `style.md`, `library.md`), then the post and the site's figure setup. Draft the plan above, following `style.md` and reusing what `library.md` lists. If there's no `style.md`, say so in your report: the project hasn't had `jack init`.
2. **Ask `big-bro`** to review the plan file: give it the post slug, the data file path and the plan's path. Iterate the plan file on its smells; ask again only if you changed a lot.
3. **Set up**: install `figure-runtime` in the site if it isn't there (runtime, viewer page, stable ids), and register and place every planned figure up front as a stub that renders nothing, so each Little Bro has its own viewer URL and never touches shared files. Little Bros can't start until Big Bro has reviewed the plan; the harness refuses them.
4. **World and hero first**: one `little-bro` builds the post's shared world file (the cast and set, e.g. `components/explainers/<slug>/world.tsx`) and the hero. The hero sets the look the others follow.
5. **Then the sections**: one `little-bro` per section figure, in parallel. Each brief must stand alone, since Little Bros haven't seen the post or your plan: post slug, the figure's viewer URL, section heading, the section's text, the claim with the author's strength words, mechanism, metaphor, kind (what happened / why it matters), component path, world file path, and the numbers it may use.
6. **Library**: add to `.jacquard/library.md` what this post added: its world file, the pieces it defines and what they draw, its figures. Note anything that duplicates a piece listed for another post.
7. **Wire up** alt text and captions from their replies. Look at every figure with `jack-look` on its viewer URL (`--times end` is enough for a check), and once at the whole post with `?figure-t=end`. Send anything off back to that figure's Little Bro with what you saw.

Credits: Mackenzie's (2026-10-09 18:10): fixed time for any frame; "give every figure it's own viewer page" and "a unique ID so it's targetable by URL" (Claude's proposals, endorsed). Claude's, provisional: stubs up front, the world file, parallel section briefs, putting the section's text in the brief, the closing look, and the harness gate's wording.
