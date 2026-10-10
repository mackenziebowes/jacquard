# Jacquard

An agent that adds explainer figures to web pages: small SVG scenes and animations that show what a post says, then why it matters. Jack for short, after the loom that wove pictures from punched cards.

It was built in one day, 2026-10-09, by Mackenzie Bowes and Claude, one figure at a time: run it, look at what it made, find out why it went wrong, change one thing, run it again. [JOURNAL.md](JOURNAL.md) is that day in order, [runs/LEDGER.md](runs/LEDGER.md) has every run's cost and verdict, and [RULES.md](RULES.md) says which rules came from the person and which from the agent.

## What it does

Point it at a post and it plans and builds a set of figures: one animated hero for the point of the whole post, and one figure per section. Figures are physical scenes rather than charts (things fall, pile up, get sieved, balance), drawn in the style of the project and played once when they scroll into view.

```bash
jack ~/dev/my-site -p "Illustrate the post my-post-slug."
```

## How it works

Jacquard is a configuration of [pi](https://pi.dev), not a harness of its own. This repo is pi's agent directory (`agent/`) plus a few tools.

**Three roles.** Main Guy plans and drives. Big Bro reviews the plan, and only the plan. Little Bros each build one figure and loop until it's done. Who plays each role is a team file, so any model family can fill them:

```json
{ "main": "claude-sonnet-5-5", "big": "claude-fable-5-1", "little": "claude-haiku-5-5" }
```

**Hard gates.** A pi extension enforces the order: a plan file must exist, every figure in it must have an animation, Big Bro must review it, only Little Bros may write figure files, and Main Guy can't finish while a planned figure is unbuilt. Written as prompts, these were skipped; as gates, they were followed without ever firing.

**Skills, chained.** `post-figures` plans a whole post. `explainer-figure` draws what happened and hands off to `why-it-matters-figure`, which refuses to start until the first exists. `figure-runtime` is the drawing kit. `style-init` and `project-rules` keep a project's taste.

**A figure runtime.** Copied into each site it works on. A figure is a pure function of time, so the server renders the finished picture, any moment can be frozen with `?figure-t=1.5`, and reduced motion just shows the end. It comes with closed-form physics (fall, pile, sieve, pour, tilt, walk), a puppet rig, and named cues, extracted from an earlier video engine.

**Looking.** `jack-look <figure url> --times 0,1.5,end --widths 1280,375` returns one image per width with the chosen moments side by side, plus console errors and overflow. Agents choose the moments and widths.

**Watching.** `jack` starts a live view at `localhost:4747`: one point per agent, brightening on each turn and growing with its context. Click one to read its steps and see what it looked at.

**A project folder.** Each site gets `.jacquard/`:

- `vibes/` - reference images you choose.
- `style.md` - rules for the project's figures, each citing the image, quote or design token it came from. Written by `jack init`.
- `library.md` - what Jacquard has already built there, so it reuses instead of redrawing.
- `rules.md` - your feedback, quoted word for word with the time you said it, kept apart from the agent's own ideas.
- `plans/` - one plan per post.

## Setup

Needs [Bun](https://bun.sh) and an Anthropic API key.

```bash
bun install
cp agent/auth.example.json agent/auth.json   # reads the key from the macOS keychain (service anthropic-api-key); or set ANTHROPIC_API_KEY
bun link                                      # puts `jack` on your PATH
```

## Use

```bash
jack init [dir]                    # Big Bro turns <dir>/.jacquard/vibes/ into style.md and library.md
jack [dir] --team claude-c         # interactive, in dir or the current folder
jack [dir] -p "Illustrate the post <slug>."
bun runs                           # every run with its helpers: turns, tokens, cost
bun watch                          # the live view, if jack didn't start it
bun run test                       # end-to-end tests
```

Teams live in `teams/`. The three tried so far, each on one whole post:

| Team | Main Guy | Big Bro | Little Bro | Cost | Wall time |
|---|---|---|---|---|---|
| `claude-a` | Opus | Fable | Sonnet | $8.23 | 53 min |
| `claude-b` | Sonnet | Opus | Haiku | $1.34 | 38 min |
| `claude-c` | Sonnet | Fable | Haiku | $1.95 | 21 min (gated, every figure animated) |

## Layout

- `agent/` - pi's agent directory: `APPEND_SYSTEM.md`, `settings.json`, `skills/`, `agents/` (big-bro, little-bro), `extensions/` (gates, subagent).
- `agent/skills/figure-runtime/assets/` - the runtime a site gets, an example figure and a viewer page template.
- `bin/` - `jack`, `jack-look`, `jack-watch`, `runs`, `trace`, `turns`.
- `teams/` - who plays which role.
- `runs/` - the ledger, each run's final report, and copies of what each run built.
- `test/` - end-to-end tests: the runtime in a real browser, `jack-look` as a command, the live view over HTTP.

The subagent extension is adapted from pi's example (MIT), with sessions kept, models read from the environment, and helpers told their role.

## License

MIT. See [LICENSE](LICENSE).
