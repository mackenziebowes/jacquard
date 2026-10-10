// Hard gates for Main Guy. Mackenzie, 2026-10-09 19:06:
//   "Yea, add hard gates to Jacquard. *MUST* write a plan, then must have plan reviewed, plan must have
//    animation, then must swarm the animation work."
//
// The plan is a file Main Guy writes in this run, `.jacquard/plans/<post-slug>.md`, one `## ` section
// per figure with at least
//   - file: path/to/Figure.tsx
//   - animation: what moves, in what order, over how long
// and, for a figure already on the page that the plan keeps as it is,
//   - status: keep
//
// A run can cover several posts: every plan written in the run is gated on its own.
// 1. Big Bro won't review until a plan exists and every figure in every plan has a file and an animation.
// 2. No Little Bro starts until Big Bro has reviewed it.
// 3. Main Guy can't write figure files (anything the plan lists, any .tsx in those folders, anything built
//    on the figure runtime) except as empty stubs. Without a plan, it can't write figure files at all.
// 4. Main Guy can't finish while a planned figure is unreviewed, undelegated (unless kept) or still a stub.
// Big Bro and Little Bros run in their own pi processes with JACK_ROLE set, where none of this applies.
// Runs that never write a plan (jack init, questions, small fixes) only meet gate 3.
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

type Fig = { title: string; file: string; animation: string; status: string };
const STATIC = /^(none|n\/a|static|no|-)\.?$/i;
const STUB_MAX = 400;
const PLAN = /(?:^|[\s"'`=(])([^\s"'`]*\.jacquard\/plans\/[^\s"'`)]+\.md)/;

function parse(path: string): Fig[] {
  if (!existsSync(path)) return [];
  const figs: Fig[] = [];
  let cur: Fig | null = null;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const h = line.match(/^##\s+(.+)/);
    if (h) { cur = { title: h[1]!.trim(), file: "", animation: "", status: "" }; figs.push(cur); continue; }
    const kv = line.match(/^\s*[-*]\s*(file|animation|status)\s*:\s*(.*)$/i);
    if (cur && kv) cur[kv[1]!.toLowerCase() as "file" | "animation" | "status"] = kv[2]!.trim().replace(/^`|`$/g, "");
  }
  return figs;
}

const kept = (f: Fig) => /^keep/i.test(f.status);
// Plans always live in the project's .jacquard/plans/. A path seen in a bash command may be relative to a
// directory the command cd'd into, which the gate can't see, so only the file name is trusted.
const planPath = (cwd: string, p: string) => resolve(cwd, ".jacquard/plans", basename(p));
const isStub = (content: string) => content.length <= STUB_MAX && /return\s+null/.test(content);

export default function gates(pi: ExtensionAPI) {
  if (process.env.JACK_ROLE) return; // a helper's own process: no gates there

  // every plan file Main Guy writes in this run (one per post; a run can cover several posts)
  const plans = new Set<string>();
  const reviewed = new Set<string>(); // plans Big Bro has reviewed
  const delegated = new Set<string>(); // planned file basenames named in a Little Bro brief
  let nudges = 0;

  type Planned = Fig & { plan: string; abs: string };
  const planned = (cwd: string): Planned[] =>
    [...plans].flatMap((plan) => parse(plan).map((f) => ({ ...f, plan, abs: f.file ? resolve(cwd, f.file) : "" })));
  const isFigureFile = (cwd: string, path: string, content: string) => {
    const abs = resolve(cwd, path);
    if (/registry\.tsx?$/.test(abs) || /\.jacquard\//.test(abs)) return false;
    const files = new Set(planned(cwd).map((f) => f.abs).filter(Boolean)), dirs = new Set([...files].map(dirname));
    return files.has(abs) || (abs.endsWith(".tsx") && dirs.has(dirname(abs))) || /defineFigure|<Figure\b/.test(content);
  };

  pi.on("tool_call", async (event, ctx) => {
    const cwd = ctx.cwd, input = event.input as Record<string, any>;

    if (event.toolName === "subagent") {
      const calls: { agent: string; task?: string }[] = input.tasks ?? input.chain ?? [input];
      for (const c of calls) {
        if (c.agent === "big-bro") {
          for (const p of plans) if (!existsSync(p)) plans.delete(p); // a path that never became a file can't block review
          if (!plans.size) return { block: true, reason: "Gate 1: no plan written in this run. Write the plan to .jacquard/plans/<post-slug>.md (one file per post): one `## ` section per figure with `- file:` and `- animation:` lines (see post-figures). Then send it to big-bro." };
          for (const plan of plans) {
            const fs = parse(plan);
            if (!fs.length) return { block: true, reason: `Gate 1: ${plan} has no figures. One \`## \` section per figure.` };
            const missing = fs.filter((f) => !f.file || !f.animation || STATIC.test(f.animation)).map((f) => f.title);
            if (missing.length) return { block: true, reason: `Gate 1: every figure in a plan needs a file and an animation (what moves, in what order, over how long). Missing in ${plan} for: ${missing.join("; ")}. Fix it, then send it to big-bro.` };
          }
          const unnamed = [...plans].filter((p) => !reviewed.has(p) && !String(c.task ?? "").includes(p.replace(/.*\.jacquard\//, ".jacquard/")));
          if (unnamed.length) c.task = `${c.task ?? ""}\n\nPlans to review: ${unnamed.join(", ")}.`;
        }
        if (c.agent === "little-bro") {
          const task = String(c.task ?? "");
          const mine = planned(cwd).filter((f) => f.file && task.includes(basename(f.file)));
          const unreviewed = mine.length ? mine.filter((f) => !reviewed.has(f.plan)) : [...plans].filter((p) => !reviewed.has(p)).map((plan) => ({ plan }));
          if (!reviewed.size || unreviewed.length) return { block: true, reason: `Gate 2: Big Bro hasn't reviewed ${unreviewed.length ? [...new Set(unreviewed.map((f) => f.plan))].join(", ") : "the plan"}. Send it to big-bro, revise it on its notes, then start Little Bros.` };
          for (const f of mine) delegated.add(basename(f.file));
        }
      }
      return undefined;
    }

    if (event.toolName === "write" || event.toolName === "edit") {
      const path = String(input.path ?? "");
      if (/\.jacquard\/plans\/[^/]+\.md$/.test(path)) { plans.add(planPath(cwd, path)); return undefined; }
      const content = String(input.content ?? "") + JSON.stringify(input.edits ?? "") + String(input.newText ?? "");
      if (!isFigureFile(cwd, path, content)) return undefined;
      if (event.toolName === "write" && isStub(String(input.content ?? ""))) return undefined;
      return { block: true, reason: `Gate 3: ${path} is a figure file. Main Guy writes the plan, stubs (a component that returns null) and the wiring; Little Bros build figures.${plans.size ? " Put it in a little-bro brief." : " Write the plan first (see post-figures)."}` };
    }

    if (event.toolName === "bash") {
      const cmd = String(input.command ?? "");
      const writes = /(>|\btee\b|sed\s+-i|python3?\b|perl\s+-i|\bcp\b|\bmv\b|<<)/.test(cmd);
      const p = cmd.match(PLAN);
      if (writes && p) plans.add(planPath(cwd, p[1]!));
      const hit = planned(cwd).find((f) => f.file && cmd.includes(basename(f.file)));
      if (writes && hit && !p) return { block: true, reason: `Gate 3: that command writes to a planned figure file (${basename(hit.file)}). Little Bros build figures; Main Guy delegates.` };
    }
    return undefined;
  });

  pi.on("tool_result", async (event) => {
    if (event.toolName !== "subagent" || event.isError) return undefined;
    const input = event.input as Record<string, any>;
    const tasks = (input.tasks ?? input.chain ?? [input]).filter((c: any) => c.agent === "big-bro").map((c: any) => String(c.task ?? ""));
    // a review covers the plans its brief named; a brief naming none covers every plan written so far
    for (const plan of plans) if (tasks.some((t: string) => t.includes(basename(plan)) || !/\.jacquard\/plans\//.test(t))) reviewed.add(plan);
    return undefined;
  });

  // Gate 4: no finishing with planned figures unreviewed, undelegated or still stubs
  pi.on("agent_before_settle", async (_event, ctx) => {
    if (!plans.size || nudges >= 3) return undefined;
    const open = planned(ctx.cwd).filter((f) => {
      if (!f.file) return false;
      const stub = !existsSync(f.abs) || isStub(readFileSync(f.abs, "utf8"));
      return !reviewed.has(f.plan) || (!kept(f) && !delegated.has(basename(f.file))) || stub;
    });
    if (!open.length) return undefined;
    nudges++;
    const unreviewed = [...new Set(open.filter((f) => !reviewed.has(f.plan)).map((f) => f.plan))];
    return {
      continue: true,
      entries: [{
        type: "custom_message", customType: "jacquard-gate", display: true,
        content: `Gate 4: you can't finish yet. ${unreviewed.length ? `Big Bro hasn't reviewed ${unreviewed.join(", ")}. ` : ""}These planned figures aren't built by Little Bros yet: ${open.map((f) => `${f.title} (${f.file})`).join("; ")}. ${unreviewed.length ? "Send those plans to big-bro, then delegate each figure to a little-bro." : "Delegate each to a little-bro, in parallel, with a full brief, and wait for them."}`,
      }],
    };
  });
}
