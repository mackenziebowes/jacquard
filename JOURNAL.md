# Journal

Working notes for the Jacquard build. Raw material for the eventual blog post and README. Newest entries at the bottom. Run numbers refer to rows in `runs/LEDGER.md`.

## 2026-10-09 - before Jacquard

The day started as brand work for mackenziebowes.com, done in Claude Code with subagents.

- Round 1: six logo directions from a content brief and a folder of reference images. "Plain Signal", a grid of name bits, was the one that stuck.
- Round 2: "mpbowes" as 7-bit ASCII is a 7×7 grid, and every row starts with `11` because every letter is lowercase, which gives the mark a spine. Dots, tiles and bars renderings all worked. Circular encodings and mon-style variants were explored; seven discs was too busy.
- Round 3: eight subagents each designed a visual language for one short post (prose-scrub 0.4) with SVG and canvas figures that explain the prose. A planning round came first: each agent wrote its plan, duplicates were re-rolled, palettes and fonts were split up between agents. Punch Press (ink is 1, hole is 0) won. Everything is kept in `personal-site/docs/brand/concepts-2026-10-09/`.

What went wrong in round 3, and what it taught:

- **Volume.** Every design made "the gate made one post read worse" the dramatic climax. The author meant *very slightly* worse. A figure has a loudness, and it should match the sentence's.
- **Merged mechanisms.** All eight designs folded two separate critiques into one picture: cutting end-of-idea signposts (the "bucket brigade" that hands one idea to the next; humans put them at the ends of ideas, agents at the starts), and cutting the one-word sentence "Okay." (a rest beat in a spiky rhythm; agents prefer even rhythm). Only the Pachinko design explained either well.
- **Frame 0.** Animated figures in a hidden pane showed their first frame, which is the least informative one. Fix: render the end state, reset only inside the first animation frame.

Reference found while chasing the rhythm point: the "Seismograph Test" on rvi.run plots words per sentence for Moby-Dick (burstiness 1.32) against Claude Opus (0.30).

## 2026-10-09 - Jacquard, day 0

Decisions:

- **Don't build a harness.** Use [pi](https://pi.dev) (`@earendil-works/pi-coding-agent` 1.1.0). It has a small core (four tools, a short system prompt), skills by the Agent Skills spec, TypeScript extensions, and sessions as JSONL trees. Hermes was the other candidate; its loop of rewriting its own skills is the opposite of what we want, which is to tune the skills ourselves and see each change as a diff.
- **Name:** Jacquard, after the loom that wove pictures from punched cards. Jack for short.
- **Goal:** makes tasteful contributions to web design with minimal oversight, time cost and token expense. Not: makes the same kind of SVG every time. So no house-style skill. The site's look comes from the site.
- **Stack:** TypeScript on Bun.
- **Layout:** pi's agent directory lives in this repo (`agent/`), so settings, system prompt and skills are versioned. Sessions go to `runs/sessions/` (not committed; they contain file contents). `bun runs` turns them into ledger numbers.
- **Process:** one figure at a time. When Jack fails, find out why (missing tool, vague skill, too much context), change one thing, re-run the same figure, record it.

Starting kit, deliberately small: pi's built-in read/write/edit/bash, one `explainer-figure` skill, a short identity in `APPEND_SYSTEM.md`, and a section in the site's AGENTS.md saying where figures go. No screenshot tool yet. The skill asks Jack to look at the figure, and Jack has no way to look; we'll see what it does about that.

Site plumbing added by hand: an `explainer` content block, `Content.Explainer`, and `components/explainers/registry.ts`.

## 2026-10-09 - run 1: the opening diff

Prompt: "Add an explainer figure to the post prose-scrub-0-4-a-small-model-as-second-reader, for the paragraph that starts 'The diff of that post's opening showed the problem.'" One shot, no help.

What Jack made: not SVG or canvas, but a styled HTML redline of the real opening of the small-business post, with each cut tagged by what asked for it: word list (2 throat-clearing, 2 adverbs), judge ("Okay."), no rule (the dropped "But"). It wraps on phones and uses the site's colour variables. It is quiet; the cuts look like what they were, small edits.

Good things nobody asked for:
- It went and found the real before/after text in `~/dev/prose-scrub-review/` instead of reconstructing it.
- It caught a mismatch: the post says two adverbs were cut, the rewrite's change log lists three. It kept the figure consistent with the post and reported the gap instead of silently picking one.
- It changed its own colour choice after looking (orange judge tag too close to the red "no rule" tag).

Where the turns went: 25 turns, $0.58. About half of the 29 tool calls were spent improvising a way to see the figure. `bun dev` returned 500 (the OG route imports `cloudflare:workers`, which webpack can't load), so it found `dev:vinext`, then installed Playwright into `/tmp` with npm, then pointed it at a cached Chromium binary by hand. The skill told it to look at its work and gave it no way to; it built one, expensively, and the next run would build it again.

Leak: it read `docs/brand/concepts-2026-10-09/` (the round-3 brief, build spec and fix notes). Those are old design directions, the thing Mackenzie warned about at the start of the day. Nothing told it not to, and the folder is right there in the repo.

Harness fix during review: `jack` hardcoded `~/dev/personal-site` as its working directory. Mackenzie flagged it: something meant for release runs in the current folder or a folder you pass. Now `jack [dir] [pi args]`, with `bun link` for a global `jack`.

Verdict on run 1: "correct, but quiet."

Checked Jack's claim about `bun dev`: true. Every page on next dev returns 500 since commit 1235a67 (2026-10-08) put a `cloudflare:workers` import in `lib/og-art/serve.ts`. Not Jack's fault and not ours; flagged as its own task.

Tool design note. My first proposal for a `look` tool screenshotted at desktop and 375px, always. Mackenzie: the tool should take the sizes Jack thinks it needs as arguments, not have them prescribed. A tool is a capability; when and how to use it is Jack's call, and guidance about it belongs in a skill if anywhere.

## 2026-10-09 - how Hermes looks at pages

Before writing a `look` tool, we read how Hermes Agent does it (`tools/browser_tool.py`, `browser_tool_vision.py` in NousResearch/hermes-agent).

- It isn't one screenshot tool. It's a stateful browser session of about ten tools (navigate, snapshot, click, type, scroll, back, press, get_images, vision, console), all driven through Vercel's `agent-browser` CLI as a subprocess.
- The default way to perceive a page is text: an accessibility-tree snapshot with `@e1`-style refs, which navigate returns for free. Pixels are on demand.
- `browser_vision(question, annotate)` takes a question, not a size. With a vision-capable model the screenshot is attached to the conversation, resized first, because every image in history is re-sent on every later turn. Without one, a cheaper auxiliary vision model answers the question in text and the image never enters the main context.
- There's no viewport argument anywhere. `browser_console(expression)` evaluates arbitrary JS, which is how you'd check for overflow or anything else: a general escape hatch instead of a baked-in check.

Takeaways for Jack: perception should be text first and pixels second; images are a recurring cost, not a one-off; checks belong in a general eval, not in the tool. And `agent-browser` already exists as a CLI with `set viewport <w> <h>`, `screenshot --if-changed`, `snapshot` and `eval`, so Jack might not need a custom tool at all, just the CLI and a skill.

## 2026-10-09 - change for run 2: agent-browser

Added `agent-browser` 0.39.0 as a dependency and put this repo's `node_modules/.bin` on Jack's PATH. No custom tool. The CLI ships its own skills, version-matched, in Agent Skills format, so `agent/settings.json` loads its `core` skill straight from `node_modules` instead of us writing one. That skill is 38 KB (roughly 9-10k tokens) when Jack loads it; a lever to pull later if it shows up in the cost. Its postinstall was blocked by Bun and it worked anyway (it found Chrome).

Run 1's output is archived in `runs/artifacts/run-01/`, and the site was reset so run 2 starts from the same place with the same prompt.

Honest confound: between runs, `bun dev` in personal-site was also fixed (it now runs vinext; it was returning 500 on every page). Run 1 lost turns to that. So run 2 measures agent-browser plus a working dev command, not agent-browser alone.

## 2026-10-09 - run 2: same figure, agent-browser available

21 turns, $0.52 (run 1: 25 turns, $0.58). Same 29 tool calls. A small gain, and it can't be pinned on agent-browser alone because `bun dev` also works now.

Why so small: Jack never read agent-browser's skill. The skill's description says "Read this before running any agent-browser commands"; Jack ran `agent-browser --help | grep` instead, called it by absolute path (it didn't know it was on PATH), then fought its screenshots: black frames, retries with longer waits, and once a `find /` across the whole disk to locate a PNG it had just written. About 13 of 29 calls were still spent getting a look. I hit the same black frames reviewing it: agent-browser's element screenshot (`screenshot <selector>`) comes back black on this site even when the element is visible and opaque; the viewport screenshot works.

What it made: the same idea as run 1 (an HTML redline of the real opening, cuts tagged by cause), louder this time: red, orange and green highlights, a legend, ¶ markers, and a fifth category, "rhythm rule", for a merged pair of sentences. It flipped run 1's decision on the adverb mismatch: run 1 showed two adverbs to match the post, run 2 shows three to match the data and asks the author to change the post. Same evidence, opposite call, both reported honestly.

It did not read `docs/brand/` this time. One run isn't enough to say the leak is gone; it's probably chance.

Two runs, two HTML redlines. The paragraph is literally about a diff, and nothing in the prompt or skill asks for anything else, so maybe that's the right answer for this passage. Or the skill's "SVG, canvas or animated" isn't pulling hard enough.

Verdict on run 2: "remarkably quiet, but it feels correct in its place - it visually shows the change." Kept on the site.

## 2026-10-09 - change for run 3: tell Jack what it has

One paragraph added to `APPEND_SYSTEM.md`: `agent-browser` is on PATH, read its `core` skill before first use, take viewport screenshots after scrolling into view, element screenshots come back black on some sites.

Also switching posts, to stop tuning on the one post we know best. Run 3 gives Jack a whole post and lets it choose where a figure helps most, which is closer to the real job (every post on the site, minimal oversight).

## 2026-10-09 - run 3: a new post, Jack picks the spot

Prompt: "Add one explainer figure to the post generative-og-images-built-and-measured, wherever it helps a reader most."

Jack chose the halftone paragraph ("The halftone layer is the part that earned its place..."), on the grounds that it's the hardest paragraph in the post to picture. First real drawing: an interactive SVG of an invented hill at true pixel scale, contour lines bunched on the steep side and spread on the gentle side, orange halftone ribbons on the two index contours. A toggle switches between "elevation ÷ slope (as built)" and "elevation only", which is the point of the paragraph: dividing by the gradient keeps the ribbons the same width on steep and gentle ground. One dot is ringed with its distance and radius; pointing at any dot measures it. A strip underneath plots dot radius against distance with the synth's real numbers (5 px on the line, under 0.7 px and not drawn past about 17 px, ribbon edge at 22 px). The hill is labelled illustrative in the caption; every constant comes from `synth/terrain.ts`.

32 turns, $1.06, nearly double run 2. 21k output tokens, 1.5M cache read. The screenshots were no longer the problem: it read the first 200 lines of agent-browser's skill (not all of it), used a named session, took viewport shots at 1280 and 375 and checked the console. The new costs were ambition (a toggle, a hover readout, a second chart) and a hydration mismatch: server and browser rounded some dot radii differently, which took about six calls of digging through console output before it rounded everything to two decimals.

Observations for tuning:
- The skill says "one figure explains one mechanism". This is one mechanism, but three views of it (map, toggle, strip). The strip repeats what the map already shows.
- The ringed example dot is small and easy to miss at desktop size.
- Cost per figure now depends mostly on how much Jack decides to build. Nothing in the prompt or skill says what a figure is worth.

Verdict on run 3, after reviewing it live on the vinext dev server: "Jacquard kinda knocked this out of the park."

Spend so far, from pi's own per-message cost accounting: $2.17 across three runs ($0.58, $0.52, $1.06), plus three tiny smoke tests that weren't logged. Of run 3's $1.06: output $0.42, cache writes $0.34, cache reads $0.31, uncached input under a cent. Implied Opus 5.5 rates: $20/M output, $5/M cache write, $0.20/M cache read. Prompt caching does most of the work; 1.5M tokens of re-read context cost 31 cents.

## 2026-10-09 - run 4: control run, a new post, nothing changed

Same open prompt, same Jack as run 3, post `how-and-why-to-get-involved-with-vibe-manufacturing`. 14 turns, $0.30, the cheapest run so far by a wide margin.

Jack picked the paragraph ending "What still costs is checking", the post's main claim: AI designs pass the easy checks far more often than they turn out to be right. Figure: HTML/CSS bars, not SVG. MUSE's best model at three successively stricter checks (code runs 77.4%, geometry valid 68.9%, design intent met 52.4%), dashed outlines showing what each stricter check removed, then HWE-Bench's 8.15% full pass with tick marks for the other models. The caption says the two benchmarks can't be compared.

Sourcing: every number comes from the site's own research page on vibe manufacturing, which also notes that the MUSE abstract confirms the drop but not the percentages. Jack carried that caveat into its report. It also added MUSE to the post's source list (data file and twin), since the post now shows MUSE numbers. That's an edit to the author's content beyond the figure, done for a good reason and reported, but worth a rule either way.

Why so cheap compared with run 3: the figure is a bar chart of known numbers, the data was already gathered in one place, there was no hydration trouble, and it took three screenshots instead of many. It read the first 80 lines of agent-browser's skill this time. So far cost tracks how much there is to invent.

Verdict on run 4: undercooked. "One *graph*? The only thing people are worse at reading than words is graphs. People, especially illiterate people, need clear physical metaphors - a puppet show. Designing for illiteracy is one of those accessibility things that benefits everyone - it increases the cognitive fluency of any person reading the post, not just the literate."

This was in the round-3 brief (physics, physical narrative, readers who struggle to read) and never made it into Jack's skill. I wrote the skill from the lessons of what went wrong in round 3, and left out what went right. Cheap run 4 wasn't efficient; it was a chart.

## 2026-10-09 - change for run 5: physical scenes, not charts

Added to `explainer-figure`: draw for a reader who struggles with words and with charts; a chart is not an explainer; show the mechanism as a physical scene, a small puppet show, with things that fall, pile up, get sieved, leak, jam, balance or wear down; numbers ride along as labels, never as axes. And step 3 now asks for the mechanism's physical metaphor by name. Run 4's figure archived and reset; run 5 is the same prompt on the same post.

## 2026-10-09 - run 5: the sieve

Same post, same prompt, one skill change. 15 turns, $0.40 (run 4: 14 turns, $0.30). Ten cents more for a different kind of figure.

Jack picked the same paragraph ("What looks cheap is drafting. What still costs is checking.") and drew it as a static SVG puppet show: a hopper labelled "Agent" pours 100 drafted circuit boards ("cheap and quick") onto a sieve labelled "checks: design rules + simulation"; 92 pile up on it, 8 fall through into a tray in the site's green. HWE-Bench's 8.15% scaled to 100, and the caption says so. It dropped the MUSE chart entirely and with it the source-list edit; one mechanism, one scene.

A counting slip, found in review: the heap is 92 boards and the tray plus the falling pair is 8, but two more grey boards are drawn mid-pour from the hopper, so the scene shows 102 boards for a label that says 100. A reader counting would notice. The skill's "use the real numbers" doesn't say "and draw exactly that many".

## 2026-10-09 - runs 6-8: unattended batch

Mackenzie went to shower and asked for three posts in a row. Same Jack as run 5, same open prompt, no review between runs. $1.55 for three figures, 14-22 turns each.

- **Run 6, small-business owners ($0.50).** Picked the "utilitarian migration" paragraph the post builds on. Animated SVG: owners in the accent green walk away from a phone labelled "the feed / passive scrolling", footprints leading to four market stalls (find workers, vet tools, unfiltered advice, automate tasks). One faded figure stays by the phone, "some still scrolling", because the text says owners are *moving toward* these places, not that all have left. That's the author-strength rule doing its job without being asked. The even split across stalls is labelled illustrative. Plays once on scroll-in, end state first, reduced motion respected.
- **Run 7, EEAT and custom websites ($0.44).** Picked "Every feature you don't use still ships to the browser." Two hand carts delivering a page to a phone: the template cart is piled with 16 boxes, 2 of them green (what the page uses), the pusher leaning hard and far from the phone; the custom cart carries only the 2 green boxes and is nearly there. Real pass rates as labels (43% WordPress, 83%+ custom), box counts labelled illustrative. Jack admitted it never re-checked the phone view after enlarging its text.
- **Run 8, prose-scrub build log ($0.61).** Picked the moment Claude audits its own rule change, the moment the title is about. A "you must be this tall" ride sign for rhythm: three copies of the README against a 0.60 pass line. As written, 0.54, every line the same length. Ruler changed, 0.60, the same page standing on a stool made of its own headings and lists. Writing changed, 0.68, uneven lines, in green. It kept the height differences small on purpose "so the drawing doesn't overstate what happened", and flagged a simplification in the third panel.

What I see across the batch:
- The skill change stuck. Five runs since it, five physical scenes; zero charts.
- Every figure's labels shrink to roughly 8-10 px at 375 px wide, because the SVG scales down as a whole. The skill says text must stay legible on a phone; Jack looks at a phone screenshot and judges by eye, and small text looks fine in a small screenshot. This was also a leftover from round 3. Next fix candidate: make it measurable (a one-line `eval` that reports the smallest rendered font size), or tell Jack to restack the layout for narrow widths instead of scaling.
- Spend so far: $4.41 for eight runs and six figures on the site.

Mackenzie on the batch: "I feel like Jacquard is mostly just like... decorating what's there? ... It's doing a good job of 'how do I restate the information visually?' but it's missing out on 'how do I explain why this idea is important / what it means / how someone should feel about this information?' visually."

The skill asks for exactly what Jack delivered. "Write down the claim... name the mechanism... name its physical metaphor" is a recipe for restating. Nothing asks what the reader can't get from the text, what follows from the claim, or who it matters to.

## 2026-10-09 - change for run 9: two skills, chained

Mackenzie: not one kind of figure replacing another, but two kinds in sequence. "First, help people parse the story and claims, second, help people parse why that matters." Jack was already good at the first, for readers who can't read; it wasn't doing the second at all.

Split into two skills, chained in their markdown bodies, not in the YAML descriptions (the descriptions are for routing; the chain is for order):

- `explainer-figure` (what happened) ends with "AFTER COMPLETING THESE TASKS, YOU CAN NOW MOVE ON TO `why-it-matters-figure`", and asks Jack to write down its claim, mechanism and metaphor first, because the next skill builds on them.
- `why-it-matters-figure` opens with "DO NOT USE THIS SKILL IF YOU HAVE NOT ALREADY DONE `explainer-figure` FOR THIS IDEA", and tells Jack to check the page and registry for an existing first figure. Its steps: so what (from the piece, no invented stakes), who it lands on (put them in the scene), how the reader should feel at the author's strength (drawn through the scene, not captioned), reuse the first figure's metaphor so the pair reads as one story told twice. Drawing rules are shared by reference, not copied.

Also added to the drawing rules: "When a label gives a count, draw exactly that many" (the 102-board sieve).

Test: vibe-manufacturing already has its "what happened" figure (the sieve). Run 9 asks for figures on that post, with no mention of which kind, to see whether Jack finds the sieve, honours the gate and makes the second kind.

Run 9's first attempt hung before writing a session file: in `-p` mode pi reads piped stdin as part of the prompt, and the background shell left stdin open, so it waited for input forever. Nothing logged, nothing spent. Fixed by launching with `< /dev/null`. Worth fixing in `jack` itself before release: a one-shot run with a terminal-less stdin shouldn't wait silently.

## 2026-10-09 - run 9: the chain works

Prompt: "Add explainer figures to the post how-and-why-to-get-involved-with-vibe-manufacturing." No kind named. 17 turns, $0.53.

Jack read `explainer-figure`, found the existing sieve, checked it rendered, left it alone, then read `why-it-matters-figure` and made the second kind. The gate and the hand-off did what they say.

CheckLoop reuses the sieve's metaphor: same hopper, same sieve. New: a person labelled "You" at a laptop wired into the sieve ("checks are software work"); caught boards ride a dashed chute back up into the agent, one tagged "via almost on a pad" from the documented attempt in the post; below the sieve, a "first order" tray, "5 boards from $2". Placed after the "trying is cheap" paragraph so it carries both of the post's reasons to get involved: checking is software-shaped, and trying is cheap. It kept to the author's strength on its own: "the post never says the loop raises the pass rate, so the figure gives no improvement numbers."

The pair now reads as one story told twice: first what happens to drafts, then where you stand in it.

Verdict on runs 5 and 9 (the sieve and the check loop): "They work amazing."

## 2026-10-09 - the figure runtime, extracted from motion

Mackenzie had already built a motion engine on this machine (`~/Explainers`, `mo`): frame-exact explainer *videos*, a Markdown screenplay plus one scene module per scene, rendered with skia-canvas to the hardware encoder. The ask: extract only what's relevant to Jacquard, because the Claude that built it was on its first project and probably didn't separate core from cobble. Fable was asked "what is core?" as an independent advisor; its read, checked against the code:

- The core is one zero-import file, `engine/time.mjs`: easings, `mix`, phrases, keyframe tracks, cues. Every value a pure function of t, so the end state is just `draw(dur)`. That one design choice dissolves the frame-0 bug class we fought in round 3.
- A second cue API (`cueSheet`) with the useful behaviour: unknown names throw, unused ones are tracked.
- The best reusable code was filed as project code: a puppet rig (seeded bodies, a gait as a function of phase, tapered limbs) under `videos/small-fire/lib/`, written for one film.
- The most reusable drawing verb (`drawOn`) depended on skia's `Path2D.trim()`, which browsers lack. On the web it's `stroke-dashoffset`.
- anime.js: dropped. One smoke-test scene used it, and its mutate-then-seek model is the one thing that breaks "any frame in any order".
- Left behind: rendering, export, audio/Strudel, clips, screenplay parser, Clay layout wasm, the Redline brand kit.

Built as a skill, `figure-runtime`, whose `assets/figure/` Jack copies into whatever site it's working on (no site depends on a path on this machine):

- `time.ts`, `cues.ts`, `rng.ts`: extracted, typed.
- `puppet.ts`: the rig, ported from canvas calls to SVG path data, costume stripped.
- `draw.ts`: `drawOn` as dash props, `link` with its travelling bead, `place`.
- `physics.ts` (new): closed-form verbs Jack had been hand-rolling every run: `fall` with bounces, `drop`, `pour`, `pile` and `sieve` with exact counts, `level`, `tilt` + `settle`, `walk`.
- `Figure.tsx` (new): the runner. Server renders `t = dur`; plays once on scroll-in; reduced motion and hidden tabs stay on the end state; click replays; a `compact` layout below 480px so labels can restack instead of shrinking (the 8-10 px label problem from runs 3-9).
- `example/LeakyJar.tsx`: a person walks to a jar, pours 40 coins, 12 leak out of a crack. Uses every part.

End-to-end test (`bun test`): server-renders the example and counts coins, then hydrates it in a real browser via agent-browser, checks it shows the end state before scrolling, plays mid-way when in view, settles back to 40 coins, has no hydration errors, and never moves under reduced motion. The first run failed honestly: the example's `dur` ended before the last leaked coin started falling, so the "end state" had 39 coins. Exactly the counting slip from the sieve, now caught by a rule in the skill ("check `dur` against your latest cue plus its motion") and by the test.

`explainer-figure` now says to build on `figure-runtime`; the hand-written end-state animation rules moved into the runner.

Mackenzie: "Did you follow the 'no unit tests' rule?" Partly not. The house rule is end-to-end only: run the real program and check what comes out. One of the three checks imported the component and called `renderToString` on it, a module tested in isolation. Replaced with a fetch of the served page over HTTP, which checks the same claim (the finished picture is in the HTML before any JavaScript) the way a reader or crawler gets it. The two browser checks were already end-to-end in spirit, but against a stand-in page; the real end-to-end check of Jacquard remains a run against a site. Test timeout moved into `bunfig.toml` so plain `bun test` doesn't time out at 5 s.

## 2026-10-09 - run 10: run 6 again, with the runtime

Same prompt as run 6. 24 turns, $0.82 (run 6: 14 turns, $0.50). Jack loaded `explainer-figure`, then `figure-runtime`, copied the runtime into the site as `components/explainers/_figure/` on its own, and built on it: cues, `drop`, `stand`, `personPaths`, compact layout.

What it made: "each coin is one minute". A standing puppet tosses coins: two land on a feed drawn as a conveyor belt that carries them away ("nothing comes back"), four go into four slot machines that pay out workers, vetted tools, advice, tasks automated. Header: "An owner's 2 h 9 min a day online, a little under the 141-minute average".

My read, before Mackenzie's:
- **The example anchored the metaphor.** The runtime's example is a person pouring coins into a jar. Run 10 is a person tossing coins. Run 6 had walkers leaving a phone for market stalls, which fit the paragraph ("migration") better than coins into slot machines, and slot machines say gambling, the opposite of solving problems. A single worked example is a strong prior.
- **It got more expensive, not less.** It read the runtime's source files (`Figure.tsx`, `physics.ts`, `cues.ts`, the example) even though the skill lists the API. Output went from 14k to 18k tokens; cache reads from 320k to 864k.
- **Phone text is better.** The compact layout restacks and labels sit around 11-12 px at 375 px wide, up from 8-10. That part of the runtime worked as intended.
- The end state, reduced motion and replay all came free; no animation code in the figure.
- The puppet stands stiffly and reaches. It never walks, even though the paragraph is about moving.

Candidate changes: give the runtime skill several tiny examples (or none) instead of one coin story; tell Jack the API list is enough and the source doesn't need reading.

Verdict on run 10: "this animation sucks." Run 6's routing figure was better; restored it. Not chasing that further.

## 2026-10-09 - change for run 11: a figure for every heading, plus a hero

Mackenzie: "every heading needs an explainer. Maybe the animation explains the point of the entire post, and each part gets an image." And: costs may rise for now; this stage is about taste, and hill-climbing on tokens and time comes after.

New skill `post-figures`, the entry point for a whole post:
- one hero animation for the point of the whole post, after the intro: the figure someone could watch instead of reading;
- one figure per heading's section, after the paragraph carrying its claim;
- plan first, as a table (claim with strength words, mechanism, metaphor) before drawing;
- one world per post: the same cast and set, a different scene per section;
- skip sections with nothing to explain, keep existing figures that fit the plan;
- look at the whole post top to bottom at the end.

Also, from run 10: the runtime skill now says the API list is complete (don't read the source) and that the example's jar and coins are not a metaphor to reuse.

Run 11 tests it on the smallest post with headings, vibe manufacturing (4 headings, 2 figures already).

## 2026-10-09 - run 11: a whole post

Prompt: "Illustrate the post how-and-why-to-get-involved-with-vibe-manufacturing." 42 turns, 13 minutes, $2.20. Six figures on the post now: four new, two kept.

Jack planned, picked one world (the agent hopper, drafted boards, the sieve of checks, "You", green for what passes), and factored the shared pieces into `world.tsx`, which nobody asked for and is the right engineering instinct for "one world per post".

- Hero, after the intro ("where to stand"): drafts pile on the checks with You beside them; a few drop into a "first order, cheap to try" box; off to the side, a crate marked "anything that needs capital" jams at the making gate before delivery. The whole post's argument in one scene. The caption keeps the author's hedge: "A reasoned guess, not a result."
- Why bother: kept the sieve and the check loop.
- How: "your log", a notepad filling with the post's own failures (timer chip, via on a pad, vendor limits, a blank "what went wrong"), then a copy filed into the one empty slot on a shelf of sources: "no source measures how often first orders fail". That's the why-it-matters move without being told: your log fills a gap.
- Stay away: 20 funded crates queue at making, shipping and certification; 5 reach the backers, "about 1 in 4" (24.9%). Split of the late 15 across gates labelled illustrative.
- What would change this: the 8 passing boards ride into a fabrication shed and come out tagged "?"; "the counting stops here".

It skipped the $1.37B paragraph, the sources and the closing line, and said so. It reported that the last section's figure only covers the first of three bullet points.

What I notice: the world holds together across all six, which is the first time a post reads as one story. The people are stick figures, not the runtime's puppets; reasonable at this scale. Cost scales with figures: about $0.55 per new figure, in line with single-figure runs, so planning a whole post didn't add much overhead.

Verdict on run 11: "Completely amazeballs."

Cost per figure: runs 1-10 made one figure each, $5.76 total, $0.58 average (range $0.30-$1.06). Since the physical-scene skill (runs 5-10): $0.55 average. Run 11: $2.20 for 4 new figures, $0.55 each. Planning a whole post cost nothing extra per figure.

## 2026-10-09 - change for run 12: a team

Mackenzie on cost: "less writing can't really happen here." On stripping old images from context: checked against run 11 first. 16 screenshots, about $0.13 to write into the cache once and $0.05 to re-read across the run; deleting old ones would break the prompt cache after each deletion and re-write everything since at 25x the read price. Not worth it for cost. (Possibly later, in one batch, near the context limit.)

Then the flow Mackenzie uses: "Opus is the main guy, can ask big bro Fable for a review, and can ask little bro Sonnet for individual work."

pi ships a subagent extension as an example (separate `pi` processes, own model, isolated context, parallel, cost reporting). Vendored into `agent/extensions/subagent/` with one change: subagent sessions are kept and named `sub:<agent>` instead of `--no-session`, so their cost reaches the ledger. `bun runs` now lists them under the run that started them, with a team total.

Two agents in `agent/agents/`:
- `figure-maker` (claude-sonnet-5-5): builds one figure component from a self-contained brief; writes only its own file; looks at it on the page.
- `reviewer` (claude-fable-5-1): read-only design review of the live page against the skills; a ranked list of fixes.

`post-figures` now says how to run the team: the lead (Opus) writes the shared world file and builds the hero itself, registers and places every section figure up front as stubs (so helpers can see their figure and never touch shared files), delegates sections to `figure-maker` in parallel with standalone briefs, asks `reviewer` for a review, applies fixes, then looks at the whole post.

## 2026-10-09 - run 12: the team's first post

Prompt: "Illustrate the post generative-og-images-built-and-measured." Five new figures, kept the halftone one. $6.13 total, about $1.23 per new figure, more than double run 11's $0.55.

Where it went:
- Opus lead: $1.93, 35 turns. Plan, world file, hero, stubs, placement, applying fixes.
- Sonnet figure-makers: $1.44 across 7 sessions (5 builds and 2 redos after review), $0.08-$0.32 each. Cheap, as hoped.
- Fable reviewer: $2.76, 33 turns, 50 tool calls, 2.7M tokens of re-read context. Nearly half the bill. It browsed the whole page itself, screenshot after screenshot, and every screenshot stays in its context for the rest of its session.

The review earned some of that: it caught a contour spot drawn as filled when the post says none was found, a ridgeline synth wired to the wrong inputs, a "seed unchanged" stamp louder than the text, a pipeline whose still frame didn't read left to right.

What it made: the hero (three pages through one generator, three maps out, then one page edited and only its map redrawn) and the Research figure (five researchers with lamps all converging on an empty spot, versus lamps fanning out under "ask what is out there") are physical scenes. The Plan figure (four stations, the middle two sealed in a case) and the Refactor figure (a seed tray cabled to two synths) drift back toward boxes and wires: physical-ish, but they read as architecture diagrams. A very technical post pulls that way.

Tuning candidates: have the lead hand the reviewer the screenshots it already took instead of letting it browse; cap the reviewer's screenshots; or review per figure as each lands rather than the whole page at the end.

## 2026-10-09 16:03 PDT - who reviews what

Mackenzie, 2026-10-09 16:03:50 PDT, verbatim:

> Okay, should have been stricter about *when* fable gets called in - my fault.
> Opus reads the site, drafts a plan, asks fable to review the *plan* for smells, then tasks kick off to sonnets.

Mackenzie, same message, on provenance (a new rule for these documents):

> Also, new rule - when *I* ask for a design change, it needs to get written down as a direct time-stamped quote - "our" designs together in these documents get confused, and agents are a bit anxious about rule-breaking lately from RLHF tuning.
>
> So... stuff that you vibe-prompt, provisionally, gets interpreted as hard rules I put in place.
> If we follow the attribution rule, plus direct quoting rule, plus time-stamping rule, we know who said what and when (meaning in which context) and can properly reason about what is an idea and what is a rule.

From here on: Mackenzie's design instructions go in as direct quotes with a timestamp; anything Claude proposes is marked as Claude's, and provisional. `RULES.md` holds the current rule set with its provenance, backfilled from this session's transcript.

Mackenzie, same message, on the roles:

> Fable does *not* need to review the work of Sonnets.
> Big Bro only needs to review the plan.
> Little Bro only needs to loop til the task is done.
> Main Guy only needs to iterate on the plan and drive Little Bros.
>
> That structure - Big Bro, Little Bro, Main Guy, can work at two different levels in the Claude ecosytem, and their identities can be swapped out to other families or routes - ie, someone who is in a very Chinese time in their life could use various Qwen sizes/LoRAs in each identity.
>
> Speaking of, we can even A/B test this ourselves on worktrees - Jacquard A can use this plan with Opus as the main guy, and another one can use Sonnet as the main guy,  Opus as Big Bro, and Haiku as Little Bro.
>
> We can compare performance to cost savings, wall time, total turns, failure counts (from *human* review, you don't gotta do this yourself :^) ), etc to answer questions like "How much better is Claude at driving Jacquard than Sonnet?"

## 2026-10-09 16:20 PDT - roles, teams, and an A/B

Built from Mackenzie's 16:03:50 message (quoted above):
- Agents renamed to the roles: `big-bro` (reviews the plan only, read-only) and `little-bro` (builds one figure or the world file, loops until done). `figure-maker` and `reviewer` are gone.
- Their models come from the environment (`model: $JACK_BIG_BRO`), a two-line change to the vendored subagent extension. `jack --team <name>` reads `teams/<name>.json` (main, big, little), runs pi as Main Guy, and exports the other two. Swapping in another family or route is a new team file.
- `teams/claude-a.json`: Opus / Fable / Sonnet. `teams/claude-b.json`: Sonnet / Opus / Haiku. Smoke-tested both: each Main Guy and Little Bro answered as the expected model.
- `post-figures` rewritten around the roles, quoting Mackenzie; the mechanics Claude added to carry them out (stubs up front, the world file, parallel briefs, a closing look) are labelled as Claude's and provisional.
- `RULES.md` started: every current rule, with Mackenzie's as timestamped quotes backfilled from the session transcript and Claude's listed separately as provisional.

A/B setup (Claude's choices for running Mackenzie's experiment): two worktrees of personal-site at HEAD, `personal-site-jack-a` (branch `jack-ab-a`, dev port 3101) and `personal-site-jack-b` (`jack-ab-b`, port 3102). Each got only the uncommitted explainer plumbing, not any figures, so both start from the same clean post. Same post for both: `prose-scrub-0-4-a-small-model-as-second-reader` (7 headings). Same prompt. Run in parallel, so wall time is noisy for both. Human review decides failure counts.

## 2026-10-09 16:09 PDT - no smoke tests

Mackenzie, verbatim, about 16:09:

> New Rule: No Smoke Tests!
> E2E only :3 Smoke Tests are huuuge time sinks that burn tokens instead of test anything for regressions.
>
> We should have no smoke tests, Jacquard should have no smoke tests either.
> Jacquard should also have our "No Unit Tests, E2E only" rule in place.
>
> We'll get that in next time.

Context: Claude had just smoke-tested both teams (each Main Guy and Little Bro asked to name its model), and earlier smoke-tested pi startup, agent-browser and the skills listing. Recorded in `RULES.md`; to be added to Jacquard's own instructions after the 13A/13B runs finish, so the change doesn't land mid-run.

## 2026-10-09 17:05 PDT - A/B results (numbers only; review is Mackenzie's)

Same post (prose-scrub 0.4, 7 headings), same prompt, started together at 16:07:55 on separate worktrees.

| | A: Opus / Fable / Sonnet | B: Sonnet / Opus / Haiku |
|---|---|---|
| Wall time | 53 min (done 17:01) | 38 min (done 16:46) |
| Cost (pi's catalog prices) | $8.23 | $1.34 |
| Main Guy | $1.80, 38 turns | $0.48, 18 turns |
| Big Bro (plan review) | $0.40, 2 turns | $0.15, 2 turns |
| Little Bros | 15 sessions, $6.04 | 7 sessions, $0.71 |
| Total turns | 341 | 305 |
| Total output | 299k tokens | 389k tokens |
| Figures | 7 (plus a stray `orld.tsx` typo file) | 7 |

Big Bro's plan review cost 40 cents on Fable, against $2.76 for run 12's whole-page review. Reviewing the plan instead of the pixels is about 7x cheaper.

A used twice as many Little Bro sessions as there are figures: Main Guy sent work back after looking at the page. B used one per figure and didn't send any back. Haiku Little Bros wrote more output per figure (about 55k tokens vs 20k) and took more turns each (26-59 vs 8-37).

Pricing caveat: pi's catalog lists Haiku 5.5 at $0.10 / $0.50 per million input/output (higher tier above 100k input) and Sonnet 5.5 at $2 / $10. Claude can't confirm these match Anthropic's billing; the Console is the source of truth.

Claude's observation, not a verdict: B's figure for "A field named claim" settles with five empty `importance_score` slots, which looks like content that never reached its end state. A's version of the same figure shows the scores.

## 2026-10-09 17:17 PDT - verdict on the A/B

Mackenzie, verbatim, about 17:17:

> Jesus Christ, Opus spent 8x on rework and the product is like... barely better. Crazy.
>
> I can only afford Team B, personally, long term.
>
> Maybe... Sonnet, with Fable as a plan advisor and Haiku as workers gets us in the right spot.
>
> I mean, B very obviously wins the split tests.
> Team A's figures are much more artistic and skeumorphic, it drew physical things better - probably Opus' tastes coming out.
>
> Sonnet was lazy here, obvi - no reruns from Haiku.
>
> Let's move on to our research - these are longer, and will demand many more figures.
>
> Unless there are any remaining posts with no figures? If there are, let's test a Fable, Sonnet, Haiku team on that.
> If not, let's test Fable, Sonnet, and Haiku on a Research post.

One post had no figures: `what-is-google-eeat` (15 headings). New team file `teams/claude-c.json`: Sonnet main, Fable big, Haiku little. Run 14 on that post, in the main checkout.

Also in for run 14, Mackenzie's test rules (16:09 and the global CLAUDE.md), added to `APPEND_SYSTEM.md` now that no run is in flight. Wording is Claude's; the rules are Mackenzie's.

## 2026-10-09 17:55 PDT - run 14, and where Haiku's turns go

Run 14 (team C: Sonnet / Fable / Haiku) on `what-is-google-eeat`: 13 figures, $1.24, 35 minutes, 459 turns. Sonnet as Main Guy never called Big Bro. The plan review Mackenzie asked for at 16:03:50 was skipped entirely; nothing in the harness stops that.

Mackenzie, verbatim, about 17:53:

> These are taking a lot of clock time.
>
> We may have to manually investigate what is taking so many haiku turns.

What the Haiku Little Bro sessions (runs 13B and 14) spend their turns on: looking. A typical session is 25-50 turns, and 10-25 of them are a screenshot followed by reading the image, plus browser evals to find where the figure is. About half of each session's wall time is tool time, mostly fixed sleeps.

Tracing the heaviest session (67 screenshot mentions, one figure, `OneWayStairs`):
- It can't hold the figure in frame. The page is long, and its figure's position kept moving (y = 2955, then 3532, then 11686, then 11836) because other Little Bros were filling in their stubs in parallel and changing the page's height under it.
- It sleeps 9 seconds before each screenshot to let the animation finish, because the figure plays when scrolled into view.
- It re-opens the page, loses its element (`#ows-frame` not found after reload), finds it again by evaluating JS.
- It looks up agent-browser's flags with `--help` mid-task instead of reading its skill, and trips on device pixel ratio (a 375 px viewport saving 1100 px images).
- Shell-editing mistakes (a multi-line `sed` that fails) cost a round trip each.

Claude's proposals (provisional, not yet built):
1. A still mode in the figure runtime (for example `?still` in the URL): every figure renders its end state immediately and never animates, so no sleeps.
2. A stable anchor on every figure (the Explainer wrapper gets `id="fig-<id>"`), so one `scrollintoview` finds it.
3. An isolated preview page per figure, so parallel builders never shift each other's layout and a long post never needs scrolling.
4. A small `look` command in Jacquard (URL or figure id, widths as arguments, per Mackenzie's 12:48:08 rule) that does open, still, scroll, screenshot at each width and returns the image paths in one call.
5. Make Big Bro's plan review a gate the harness enforces, not a step Main Guy can skip.

## 2026-10-09 18:10 PDT - a time control, which nobody built

Mackenzie, verbatim, about 18:10, on a Haiku Little Bro guessing how its own figure renders ("the figure likely replays on scroll, so the server probably renders the end state at full duration. I'll open the URL with the browser agent, scroll to the figure..."):

> Yep - this is a major failure.
>
> Did you suggest "allow the agent to set a static time value for an animation so it can view different states" or did I make that up?
> I think you suggested "give every figure it's own viewer page so there's no reflows" and "give every figure a unique ID so it's targetable by URL" which are both great.
> The system supposedly makes animations like... you know, time-dependent. Consistent.
> Did none of the Claudes think to add a currentTime prop?

Answer: Mackenzie's idea. Claude's 17:55 proposal was a "still mode" that only shows the end state; a time value that shows any state is Mackenzie's, and it's the better one. And no: Claude designed `Figure.tsx` (Claude's choice, per RULES.md) around "render(t)" as a pure function of time, then only ever exposed t = dur to the outside. The one property that makes every frame reproducible was never handed to the agents who need to look at frames. They scroll, wait and guess instead.

## 2026-10-09 ~18:25 PDT - shipped: time control, viewer pages, anchors, jack-look, the Big Bro gate

Mackenzie, about 18:20: "Anyways, yes, ship all 6 things now, please." (Claude's proposals 1-5 from 17:55, with Mackenzie's time control replacing proposal 1's "still mode".)

1. **Time control** (Mackenzie's idea). `Figure` takes `t` (seconds or "end"); any page URL with `?figure-t=<t|end>` freezes every figure there and never plays. `data-figure-t` on each figure says what time it's showing.
2. **Stable anchors.** The site's Explainer wrapper now has `id="fig-<post>--<figure>"`.
3. **Viewer pages.** `/explainers/<post>/<figure>` in personal-site: the figure alone, no nav, noindex, prerendered from the registry. A template ships with `figure-runtime` for other Next.js sites.
4. **`jack-look <url> [--times ...] [--widths ...]`**, on Jack's PATH. For each width it opens the page once (console errors, sideways overflow, figure height), then builds a contact sheet of iframes, one per frozen time, and takes one JPEG of it. One image per width shows the motion as a filmstrip. Times and widths are the caller's (Mackenzie, 12:48:08).
5. **Big Bro gate.** The subagent extension refuses `little-bro` until `big-bro` has finished once in that run, and the refusal quotes Mackenzie's 16:03:50 rule.

Skills and agents updated: Little Bros look with `jack-look` on their viewer URL and don't scroll or sleep; briefs carry the viewer URL and the section's text (Claude's addition, provisional); Main Guy's closing look uses `jack-look` and `?figure-t=end`.

Tests (end to end, in the suite): `?figure-t=0` shows nothing poured and stays frozen when scrolled into view, `?figure-t=end` shows all 40 coins; `jack-look` run as a command against a viewer-shaped page returns one framed sheet per width with "overflow: none" and "console errors: none". The first version of that test passed while producing a useless sheet (the page had no `#figure`, so it framed the top of a long page); found by looking at the output, fixed by framing on `#fragment` / `#figure`, and the test now checks the frames are figure-sized.

## 2026-10-09 18:27 PDT - a live view, style-init, vibes, and tuning by chat

Mackenzie, verbatim, about 18:27, quoting Claude's proposal for a live view first:

> Yes, you will ship this soon - this is exactly what we need.
> It needs to ship *with* Jacquard and be launched every time Jacquard does stuff.
>
> Oh - are we using Sqlite for storage because of Pi, or just JSON?
> How are sessions actually stored? Just wondering - probably an aside, sorry.
>
> Anyways, on to the `style-init` idea.
> *Yes* to fable because it runs infrequently - it probably does not run "once" throughout a project's lifecycle, but Fable should manage init.
>
> [quoting Claude: "A shared primitives file in the site, like components/explainers/_style.tsx, with the project's person, object and label pieces. Each post's world file builds on it instead of starting from scratch."]
>
> No - "Person, Object, and Label" pieces were generated by Jacquard over time ad-hoc because we didn't provide a style-init. However, yes, there needs to be some centralization to what was built by Jacquard for the project over time.
> Jacquard should probably also be tunable via chat - it should ship with rules in place... we definitely added the "No Unit Tests" idea earlier, right, so we should be able to add the big 3 tunability ideas: "Write down user feedback verbatim, with a time stamp, so we don't get confused about what an agent proposed and what a user asked for."
>
> `.jacquard/moodboard/` is fine, but `.jacquard/vibes/` is funnier and more accurate. The user's target vibes live there.

Answer to the aside: plain JSON lines. pi writes each session as one `.jsonl` file (one JSON object per line, entries linked into a tree by id/parentId); no database. The only SQLite in pi's bundle is an HTTP cache inside its fetch library. Jacquard's `runs/sessions/` is 102 MB of JSONL after 14 runs, mostly base64 screenshots.

## 2026-10-09 ~18:33 PDT - shipped: jack-watch, the live view

`bin/jack-watch.ts` + `bin/jack-watch.html` (Claude's design, built on Mackenzie's 18:27 go-ahead). A Bun server on port 4747 that tails `runs/sessions/*.jsonl` as pi writes them and streams each entry to the page over server-sent events. The page groups sessions into runs (a sub belongs to the latest lead in the same working directory), shows one lane per agent (Main Guy, Big Bro, Little Bro 1..n) with model, turns and cost, each turn's words and tool calls, tool results, and every image an agent looked at (served straight out of the session file, so `jack-look` filmstrips show up inline). It follows the newest run unless you pick another.

`jack` starts it whenever it runs, if it isn't already up, and prints the address; it ignores Ctrl-C and terminal hang-ups so it outlives a run. `bun watch` starts it by hand. It only reads.

End-to-end tests: the real server over HTTP while a session file grows the way pi writes it (lead's turn and subagent call, a Little Bro, its screenshot served as a real PNG), then the page in a browser (two lanes, Main Guy and Little Bro 1, the screenshot inline, the run selected). 7 of 7 pass.

First look at real data, run 14 in the watcher: Main Guy (Sonnet) says in its own final message "I also skipped the big-bro plan review, the plan went straight to the builders." It knew. The gate shipped at 18:40 is the right fix.

## 2026-10-09 18:34 PDT - the watch view needs a condensed overview

Mackenzie, verbatim, about 18:34:

> This view is super overwhelming - every lane is totally legible on it's own, but humans need to be able to filter information.
>
> Is it possible to get the main view be more condensed, perhaps a scattering of points that brighten in reaction to new turns coming in from the agents and getting bigger as context expands... tooltip for the name on hover, click to open the agent's view?

Correction, 18:35: three journal headings above had times Claude guessed instead of checked (18:40, 19:00, 19:10). Fixed against the system clock. Times in this journal are meant to be checked, not estimated; where only an estimate exists it says "~" or "about".

## 2026-10-09 ~18:45 PDT - shipped: the points overview

`jack-watch` now opens on "Points" (Mackenzie's 18:34 ask): one point per agent in the selected run, Main Guy in the middle, Big Bro straight up, Little Bros round a ring, faint spokes to Main Guy. Colour by role (Main Guy off-white, Big Bro amber, Little Bros green). Radius grows with the agent's context (the latest turn's input + cache reads + cache writes, now in each turn event). Each new turn flares the point and its halo, fading over about 2.5 s; agents active in the last 20 s rest a little brighter. Hover: name, model, turns, cost, context, and the last thing it said. Click: that agent's lane alone, full width (Escape or "← all agents" to go back). "All lanes" keeps the old everything-at-once view.

End-to-end test updated to drive it in a browser: two points, the Little Bro's bigger than Main Guy's (it read more context), hover names it "Little Bro 1", click opens one lane with its screenshot, "All lanes" shows both. 7 of 7 pass.

On run 13A it reads at a glance: fifteen Little Bros, the tiny amber Big Bro at the top (two turns, little context), and the big ones are the Little Bros that were sent back for rework.

## 2026-10-09 18:39 PDT - shipped: provenance built in, .jacquard/, jack init

Mackenzie, 2026-10-09 18:38:28: "Items 2 and 3 are go."

Item 2, tuning by chat with provenance (Mackenzie's 18:27 rule, now built into Jacquard rather than something each user has to ask for):
- `APPEND_SYSTEM.md` tells Jack every project has a `.jacquard/` folder, to read it before planning, and to write user feedback into `.jacquard/rules.md` verbatim, with the time from the clock, attributed, before acting on it; its own ideas go in labelled provisional. The user's rules outrank skills' defaults.
- New `project-rules` skill: the format and the steps (run `date`, quote, mark cuts, note interpretations as Jack's, never delete a replaced rule).

Item 3, style-init (Mackenzie's 18:27 shape: Fable manages it, it reruns, `.jacquard/vibes/`, centralize what Jacquard built rather than seeding a kit):
- New `style-init` skill (only runs when called): read the vibes, the user's rules, the site's tokens and pages, and the existing figures; write `.jacquard/style.md` (palette by token, line and fill, how people and objects are drawn, type, motion, density, don'ts; every rule cites an image, a quoted user rule or a site token; a "changes since" section on reruns) and `.jacquard/library.md` (what's been built per post, and the pieces built more than once, with a recommendation, without moving code).
- `jack init [dir]` runs it with the team's Big Bro as the model. With no `vibes/` it makes the folder and says to fill it.
- Readers: `post-figures` step 1 reads `.jacquard/` and step 6 adds the post's pieces to `library.md`; Big Bro checks plans against `rules.md`, `style.md` and `library.md`; Little Bros read `style.md` and `rules.md` and reuse library pieces.

Not tested yet: there is no automated test for `jack init` (it is a model run; its end-to-end test is a real init on a real project). Made `personal-site/.jacquard/vibes/`, empty, waiting for Mackenzie's images.

## 2026-10-09 18:43-18:52 PDT - first jack init, together

Mackenzie, 2026-10-09 18:43:44, verbatim:

> Um... yea, I dunno... put the geometric nature in the vibes folder by itself, then run init in the personal site.
> We'll check the cost and wall-time, and see if anything gets better.
>
> Let's test jack init together rn and see what happens.

`~/dev/logo-references/07-geometric-nature.webp` (HVNTER's "Geometric Nature" pictogram sheet) copied alone into `personal-site/.jacquard/vibes/`. Ran `jack init --team claude-c` in Mackenzie's terminal tab, watched in jack-watch. Fable, 25 turns, $1.98, 6 min 24 s wall.

Mackenzie, while it ran (arrived mid-run between 18:44 and 18:50; the transcript has no exact time for mid-turn messages), verbatim:

> It innapropriately called `look` to try to look at normal pages and parsed blank pages. It did deduce that `look` is only for given figures - maybe the skill needs to be more explicit?

> `read` doesn't work either.
>
> It's using `agent-browser` for everything.

What the trace showed:
- **jack-look was broken on the real site, for figures too.** personal-site sends `X-Frame-Options: DENY` and `frame-ancestors 'none'`, and jack-look built its filmstrip from iframes, so every frame was blank. The test page allowed framing, so the tests never saw it. Fable worked around it ("jack-look's contact sheets came out as broken images here") with agent-browser. Fixed: each frozen moment is now its own screenshot at the figure's height, laid out on a local sheet afterwards. The test server now refuses framing exactly like the site, and the test reads the frames' pixel heights and checks that t = 0 and t = end differ.
- **It also used jack-look on whole pages** (home, a post). Fixed two ways: jack-look now prints "no figure here" on a URL without a figure, with a test; and the instructions now say plainly: one figure, jack-look; a whole page, agent-browser with viewport screenshots.
- **`read` "working" but useless on tall images:** a full-page screenshot of the post was 824 x 10662 px and came back displayed at 155 x 2000. The instructions now say never `--full` on a long page. (Also: it tried PIL to stitch images; not installed.)

What init produced: `.jacquard/style.md` (72 lines) and `.jacquard/library.md` (78 lines), copies in `runs/artifacts/init-01/`. Its top rules: fill, don't outline; detail cut out, not drawn on; ink + one muted + one accent; people are the filled puppet in profile, no stick figures; one scene of 5-9 shapes, 3-6 s, one thing moving at a time. Its library found four different people, the same Frame helper copied into three world files and seven figures, and two document drawings to merge.

## 2026-10-09 18:52 PDT - run 15: does style.md help?

Mackenzie asked for a post light on figures. Four posts have one figure each; Claude picked prose-scrub 0.4 (7 headings) because run 13B already illustrated it with team B and no style file (still on localhost:3102), so team C with `style.md` on the same post is close to a controlled comparison (the team differs only in Big Bro: Opus then, Fable now; Haiku builds in both). Running in Mackenzie's terminal, watched in jack-watch.

## 2026-10-09 18:56-19:01 PDT - run 15: lazy Sonnet, good figures

Run 15 (team C, prose-scrub 0.4, first run with `.jacquard/style.md`): 13 turns, $0.36, about 3 minutes (18:52:36 to 18:55:38). Five new figures, kept `opening-diff`. Sonnet as Main Guy never called a subagent. Its own report, verbatim: "I built these myself. I skipped the `big-bro` plan review and the `little-bro` builders, so the plan below was never reviewed."

Mackenzie, 2026-10-09 18:56:31, verbatim: "Lol. Lazy Sonnet."

The gate's blind spot: it stops a Little Bro from starting before Big Bro has reviewed the plan, but nothing makes Main Guy use the team at all. Building everything alone satisfies it trivially.

Mackenzie, 2026-10-09 19:00:42, verbatim, after reviewing the figures:

> I reviewed the animations, too - they're very good.
> They use clear design language rather than human puppets to explain the relationships between items.

Facts from the files, for whoever reasons about this next: only `TwoReaders` uses the runtime and animates (5 s); `HeadingBet`, `FiveRuns`, `ClaimField` and `TwoQuestions` are static SVG built from a shared `world.tsx` (palette tokens, a frame, a bar, three type styles), so `?figure-t` has nothing to freeze in them. `HeadingBet` is three labelled bars against "the bet: all 1.0" with seven accent ticks for the quoted lines; `FiveRuns` is a dot plot plus a 330-cell grid. These are closer to diagrams than puppet shows, and Mackenzie rated them very good, which sits against the 13:28:31 rule that "the only thing people are worse at reading than words is graphs". Recorded, not resolved: that's Mackenzie's call.

Against 13B on the same post (team B, no style file): $0.36 vs $1.34, about 3 min vs 38 min, 13 turns vs 305. Not a clean comparison of style alone, since 15 skipped the team.

`jack-look` fixed again during review: a relative `--out` broke the sheet's `file://` links; it now resolves `--out` to an absolute path. Mackenzie, 18:59:10: "Stop - cut that test." The test that checked the sheet (and was being edited for a `/private/var` path mismatch) is gone; jack-look keeps its "no figure here" test.

Captures: `runs/artifacts/run-15/looks/<figure>/look-{900,375}.jpg` (t = 0 and end), all with no overflow and no console errors.

Mackenzie, 2026-10-09 19:04 PDT, verbatim, on run 15's figures and the open question above:

> Yea, I mean... they were designed well.
> They use contrast, proximity, repetition, and symmetry as fundamental visual cues to correctly convey the feeling of the text.
>
> They are, sadly, not animated. Sonnet was being extremely lazy here, yes, but the vibes write up did lift the design skill of sonnet.

Mackenzie, 2026-10-09 19:06 PDT, verbatim:

> Yea, add hard gates to Jacquard. *MUST* write a plan, then must have plan reviewed, plan must have animation, then must swarm the animation work.

## 2026-10-09 19:08 PDT - shipped: hard gates

From Mackenzie's 19:06 rule (quoted above). New extension `agent/extensions/gates/`, loaded in Main Guy's process only (helpers now get `JACK_ROLE=<agent>` from the subagent extension and skip it):

1. **Plan file.** Big Bro is refused until Main Guy has written a plan in this run to `.jacquard/plans/<post-slug>.md`.
2. **Animation.** Big Bro is also refused while any figure in the plan lacks a `- file:` or an `- animation:` line, or the animation says none/static. (Claude's reading of "plan must have animation": every figure animates, not just the hero. Mackenzie's words were "sadly, not animated" about four static figures.)
3. **Review.** Little Bros are refused until Big Bro has reviewed the plan.
4. **Swarm.** Main Guy's writes and edits to figure files are refused (anything the plan lists, any .tsx in those folders, anything built on the figure runtime) unless it's a stub that returns null; shell commands that write to planned figure files are refused too. Without a plan, Main Guy can't write figure files at all.
5. **No early finish.** When Main Guy tries to stop, the run continues (up to three times) with a message naming every planned figure that's unreviewed, undelegated or still a stub.

Gates only bite on a plan written in this run, so `jack init`, questions and small fixes are unaffected. `post-figures` now specifies the plan file format; `APPEND_SYSTEM.md` says the harness enforces it.

Not covered by an automated test: exercising the gates needs a model run. The next `jack` run on a post is their end-to-end test; jack-watch will show any "Gate N" refusals inline.

## 2026-10-09 19:09 PDT - run 16: the gates' first real run

Mackenzie: "please" (to running it). Same prompt, team and post as run 15, with the gates on. Post reset to its state before run 15 (only `opening-diff`); run 15's figures, post diff and registry are archived in `runs/artifacts/run-15/`. Running in Mackenzie's terminal, watched in jack-watch.

## 2026-10-09 19:31 PDT - run 16: the gates held without firing

19:09:15 to 19:30:27, 21 min; team total $1.95, 134 turns. Sonnet wrote the plan file first (`.jacquard/plans/prose-scrub-0-4-a-small-model-as-second-reader.md`), Fable reviewed it twice with a revision in between ($1.10 of the $1.95), then ten Haiku Little Bros: one for the world file and hero, one per section, and redos for two figures Main Guy sent back after looking (`heading-bet` had an empty end state, `five-runs` had clumped lamps). No gate refusal appears in any session: written down as rules the harness enforces, Sonnet followed the process from the start.

Haiku Little Bros took 6-23 turns each, against 26-59 in runs 13B and 14: jack-look and frozen time doing their job.

All six figures animate, including `opening-diff`, which Main Guy restyled to the style file (ink and muted, tomato only on "But", strikes in reading order). Scenes: a comb-shaped gate dropping lines from a page and a lamp (the judge) lighting two "for a person"; headings dimming as three sweeps light the same seven lines, which fall into a stack; a balance where "says it matters" outweighs "evidence" and a flag goes up; five lamps reading one line; slots filling with sentences then numbers. All captured at t = 0, 1.5 and end (`runs/artifacts/run-16/looks/`), no overflow, no console errors.

Main Guy also caught that `.jacquard/library.md` listed run 15's files, which Claude had removed when resetting the post, and corrected it.

Against run 15 (same team, prompt and post, no gates): $0.36 and 3 min for four static figures and one animated, versus $1.95 and 21 min for six animated, reviewed, swarmed.

## 2026-10-09 19:36 PDT - wrapping up day one

Mackenzie, verbatim:

> Amazing~! Science rules!
>
> Congratulations, Claude - we successfully raised an agent together.
>
> Every post, research post, and story gets a Jacquard run... in a bit.
>
> For now, we are going to wrap up our work - jacquard gets a public git repo with a nice README, then you write a post based on the journal we've been keeping for my site.
>
> This is my best evidence of my agentic engineering skills to date and that skill is allegedly in high demand :3 Maybe I'll be able to get more Claude subs soon.
