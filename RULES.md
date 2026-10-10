# Rules and where they came from

Every rule Jacquard follows, and who made it. Agents tend to treat anything written in their instructions as a hard rule, so this file keeps two kinds apart:

- **Mackenzie's rules**: direct quotes, with the time they were said (PDT). These are rules.
- **Claude's choices**: things Claude proposed or wrote while building Jacquard. These are provisional ideas, open to change without asking anyone.

Mackenzie's rule for this file, 2026-10-09 16:03:50:

> when *I* ask for a design change, it needs to get written down as a direct time-stamped quote - "our" designs together in these documents get confused, and agents are a bit anxious about rule-breaking lately from RLHF tuning.

Times before 16:03 were backfilled from the Claude Code session transcript.

## Mackenzie's rules

**Goal.** 2026-10-09 12:28:20:
> The goal state is "makes tasteful contributions to web design with minimal oversight, time cost, and token expense".
> It is not, to be clear, "makes the same kind of SVG every time,"

**General, not a house style.** 2026-10-09 12:28:20:
> there should probably *not* be a punch-press skill specifically, nor an author-weight skill.
> We want Jacquard to be a more general agent that makes explainer svgs and animations, possibly dogfooding our local motion engine for live web use.

**Harness.** 2026-10-09 12:22:35:
> we are *not* building a harness from scratch right now. We just need a harness that lets us tune skills, context, and review session logs.

**Stack.** 2026-10-09 12:22:35:
> we do typescript on bun in this house

**Where jack runs.** About 2026-10-09 12:37 (sent mid-turn; time is approximate):
> `bun jack` should *not* run pi in ~/dev/personal-site - that's a smelly hardcoded local location for something we're planning to release.
> The cli or binary or whatever should, if no location argument is passed, run in the current folder... and also take a location argument, obvi :3

**Tools take the agent's choices as arguments.** 2026-10-09 12:48:08:
> Jaqcuard's "look" tool should probably have arguments to look at sizes that it feels it needs, rather than us prescribing them.

**Physical scenes, not charts.** 2026-10-09 13:28:31:
> The only thing people are worse at reading than words is graphs.
> People, especially illiterate people, need clear physical metaphors - a puppet show.
> Designing for illiteracy is one of those accessibility things that benefits everyone - it increases the cognitive fluency of any person reading the post, not just the literate.

**What made run 15's static figures good.** 2026-10-09 19:04 (on figures closer to diagrams than puppet shows):
> They use contrast, proximity, repetition, and symmetry as fundamental visual cues to correctly convey the feeling of the text.
>
> They are, sadly, not animated. Sonnet was being extremely lazy here, yes, but the vibes write up did lift the design skill of sonnet.
(Claude's note: this sits beside the 13:28:31 "graphs" rule rather than replacing it; how the two combine is Mackenzie's to say.)

**Two kinds of figure, in order.** 2026-10-09 13:45:31:
> I think we need both rules in place, they should happen sequentially - first, help people parse the story and claims, second, help people parse why that matters.

**Two chained skills.** 2026-10-09 13:47:28:
> Should be two skills, please, and you can daisy-chain them.
> In the second, you can put text like "DO NOT USE THIS SKILL IF YOU HAVE NOT ALREADY DONE..." in the top, near the description... probably not in the tool description *itself*, like in the yaml, but just inside the normal markdown.
> The first skill should call out the second at the end - "AFTER COMPLETING THESE TASKS, YOU CAN NOW MOVE ON TO..."

**Runtime: only the core of the motion engine, for the web.** 2026-10-09 14:32:07:
> Extract only the stuff that's relevant for Jacquard from that package, please [...] Especially given that we're asking for physical narratives for web deployment rather than video.

**Every heading, plus a hero.** 2026-10-09 14:50:46:
> every heading needs an explainer.
> Maybe the animation explains the point of the entire post, and each part of the paragraph gets an image?
(Claude read "each part" as each heading's section.)

**Taste before cost, for now.** 2026-10-09 14:50:46:
> I'm okay with costs rising temporarily - we're experimenting to figure out "taste" now before we start hillclimbing on "for minimal tokens and time"

**Roles.** 2026-10-09 16:03:50:
> Opus reads the site, drafts a plan, asks fable to review the *plan* for smells, then tasks kick off to sonnets.
> Fable does *not* need to review the work of Sonnets.
> Big Bro only needs to review the plan.
> Little Bro only needs to loop til the task is done.
> Main Guy only needs to iterate on the plan and drive Little Bros.
> [...] their identities can be swapped out to other families or routes

**Team choice.** 2026-10-09 about 17:17:
> I can only afford Team B, personally, long term.
>
> Maybe... Sonnet, with Fable as a plan advisor and Haiku as workers gets us in the right spot.

**Time control for figures.** 2026-10-09 about 18:10:
> Did you suggest "allow the agent to set a static time value for an animation so it can view different states" or did I make that up?
> [...] The system supposedly makes animations like... you know, time-dependent. Consistent.
> Did none of the Claudes think to add a currentTime prop?
(The idea is Mackenzie's. Also endorsed in the same message, both Claude's proposals: "give every figure it's own viewer page so there's no reflows" and "give every figure a unique ID so it's targetable by URL".)

**A live view ships with Jacquard.** 2026-10-09 about 18:27 (of Claude's proposal for a live session view in the browser):
> Yes, you will ship this soon - this is exactly what we need.
> It needs to ship *with* Jacquard and be launched every time Jacquard does stuff.

**Watch view: a condensed overview first.** 2026-10-09 about 18:34:
> Is it possible to get the main view be more condensed, perhaps a scattering of points that brighten in reaction to new turns coming in from the agents and getting bigger as context expands... tooltip for the name on hover, click to open the agent's view?

**Style-init, managed by Fable.** 2026-10-09 about 18:27:
> *Yes* to fable because it runs infrequently - it probably does not run "once" throughout a project's lifecycle, but Fable should manage init.

**Not a person/object/label kit; centralize what Jacquard built.** 2026-10-09 about 18:27:
> No - "Person, Object, and Label" pieces were generated by Jacquard over time ad-hoc because we didn't provide a style-init. However, yes, there needs to be some centralization to what was built by Jacquard for the project over time.

**Tunable via chat, with provenance built in.** 2026-10-09 about 18:27:
> Jacquard should probably also be tunable via chat - it should ship with rules in place [...] "Write down user feedback verbatim, with a time stamp, so we don't get confused about what an agent proposed and what a user asked for."

**Vibes folder.** 2026-10-09 about 18:27:
> `.jacquard/moodboard/` is fine, but `.jacquard/vibes/` is funnier and more accurate. The user's target vibes live there.

**Hard gates.** 2026-10-09 19:06:
> Yea, add hard gates to Jacquard. *MUST* write a plan, then must have plan reviewed, plan must have animation, then must swarm the animation work.

**Tests.** From Mackenzie's global instructions (`~/.claude/CLAUDE.md`):
> No unit tests or integration tests. End-to-end tests only.

**No smoke tests.** 2026-10-09 about 16:09 (time the message arrived):
> New Rule: No Smoke Tests!
> E2E only :3 Smoke Tests are huuuge time sinks that burn tokens instead of test anything for regressions.
>
> We should have no smoke tests, Jacquard should have no smoke tests either.
> Jacquard should also have our "No Unit Tests, E2E only" rule in place.
>
> We'll get that in next time.

In Jacquard's `APPEND_SYSTEM.md` from run 14 (2026-10-09 ~17:18), together with the end-to-end-only rule.

## Claude's choices (provisional)

Written by Claude while building; change freely.

- `explainer-figure`: write the claim with the author's strength words; a figure must not be louder than the author. (From the round-3 feedback that the designs overweighted "reads worse"; Mackenzie's words then were feedback on those designs, and Claude turned them into this rule.)
- `explainer-figure`: name the mechanism, then its physical metaphor; use real numbers, label invented ones illustrative; draw exactly the count a label gives; match the host page's tokens; legible at 375px.
- `why-it-matters-figure`: its four steps (so what, who it lands on, how to feel at the author's strength, reuse the first figure's metaphor) and "if the piece never makes that turn, don't make the figure".
- `post-figures`: plan as a table first; one world per post; skip sections with nothing to explain; keep existing figures that fit; place figures after the paragraph that carries the claim; look at the whole post at the end.
- `post-figures`: register and place every section figure up front as stubs so helpers never touch shared files.
- `figure-runtime`: its whole API and design (end state server-rendered, play once on scroll, compact layout below 480px, click to replay, no anime.js). Fable advised on what was core; Claude chose the shape.
- `APPEND_SYSTEM.md`: the identity paragraph, and the agent-browser hints (read its skill first; viewport screenshots, scroll into view first).
- Hard gates' mechanics: the plan file path and format, "every figure animates" as the reading of "plan must have animation", stubs allowed under ~400 characters, three nudges before giving up.
- Opus 5.5 at medium thinking as the default lead.
- `agent-browser` with its own shipped skill as the way to look at pages (Mackenzie approved shipping it, 12:58:52: "Yep, that's correct. Ship that change, adding the agent-browser :3").
