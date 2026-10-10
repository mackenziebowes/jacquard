// Hard gates for Main Guy. Mackenzie, 2026-10-09 19:06:
//   "Yea, add hard gates to Jacquard. *MUST* write a plan, then must have plan reviewed, plan must have
//    animation, then must swarm the animation work."
//
// The plan is a file Main Guy writes in this run, `.jacquard/plans/<post-slug>.md`, one `## ` section
// per figure with at least
//   - file: path/to/Figure.tsx
//   - animation: what moves, in what order, over how long
//
// 1. Big Bro won't review until this run's plan exists and every figure in it has a file and an animation.
// 2. No Little Bro starts until Big Bro has reviewed it.
// 3. Main Guy can't write figure files (anything the plan lists, any .tsx in those folders, anything built
//    on the figure runtime) except as empty stubs. Without a plan, it can't write figure files at all.
// 4. Main Guy can't finish while a planned figure is undelegated or still a stub.
// Big Bro and Little Bros run in their own pi processes with JACK_ROLE set, where none of this applies.
// Runs that never write a plan (jack init, questions, small fixes) only meet gate 3.
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

type Fig = { title: string; file: string; animation: string };
const STATIC = /^(none|n\/a|static|no|-)\.?$/i;
const STUB_MAX = 400;
const PLAN = /(?:^|[\s"'`=(])([^\s"'`]*\.jacquard\/plans\/[^\s"'`)]+\.md)/;

function parse(path: string): Fig[] {
  if (!existsSync(path)) return [];
  const figs: Fig[] = [];
  let cur: Fig | null = null;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const h = line.match(/^##\s+(.+)/);
    if (h) { cur = { title: h[1].trim(), file: "", animation: "" }; figs.push(cur); continue; }
    const kv = line.match(/^\s*[-*]\s*(file|animation)\s*:\s*(.*)$/i);
    if (cur && kv) cur[kv[1].toLowerCase() as "file" | "animation"] = kv[2].trim().replace(/^`|`$/g, "");
  }
  return figs;
}

const isStub = (content: string) => content.length <= STUB_MAX && /return\s+null/.test(content);

export default function gates(pi: ExtensionAPI) {
  if (process.env.JACK_ROLE) return; // a helper's own process: no gates there

  let plan: string | undefined; // the plan file Main Guy wrote in this run
  let reviewed = false;
  const delegated = new Set<string>(); // planned file basenames named in a Little Bro brief
  let nudges = 0;

  const figs = () => (plan ? parse(plan) : []);
  const plannedFiles = (cwd: string) => new Set(figs().filter((f) => f.file).map((f) => resolve(cwd, f.file)));
  const isFigureFile = (cwd: string, path: string, content: string) => {
    const abs = resolve(cwd, path);
    if (/registry\.tsx?$/.test(abs) || /\.jacquard\//.test(abs)) return false;
    const files = plannedFiles(cwd), dirs = new Set([...files].map(dirname));
    return files.has(abs) || (abs.endsWith(".tsx") && dirs.has(dirname(abs))) || /defineFigure|<Figure\b/.test(content);
  };

  pi.on("tool_call", async (event, ctx) => {
    const cwd = ctx.cwd, input = event.input as Record<string, any>;

    if (event.toolName === "subagent") {
      const calls: { agent: string; task?: string }[] = input.tasks ?? input.chain ?? [input];
      for (const c of calls) {
        if (c.agent === "big-bro") {
          if (!plan) return { block: true, reason: "Gate 1: no plan written in this run. Write the plan to .jacquard/plans/<post-slug>.md: one `## ` section per figure with `- file:` and `- animation:` lines (see post-figures). Then send it to big-bro." };
          const fs = figs();
          if (!fs.length) return { block: true, reason: `Gate 1: ${plan} has no figures. One \`## \` section per figure.` };
          const missing = fs.filter((f) => !f.file || !f.animation || STATIC.test(f.animation)).map((f) => f.title);
          if (missing.length) return { block: true, reason: `Gate 1: every figure in the plan needs a file and an animation (what moves, in what order, over how long). Missing for: ${missing.join("; ")}. Edit ${plan}, then send it to big-bro.` };
          if (!String(c.task ?? "").includes(".jacquard/plans/")) c.task = `${c.task ?? ""}\n\nThe plan is in ${plan}.`;
        }
        if (c.agent === "little-bro") {
          if (!reviewed) return { block: true, reason: "Gate 2: Big Bro hasn't reviewed the plan. Send the plan file to big-bro, revise it on its notes, then start Little Bros." };
          for (const f of figs()) if (f.file && String(c.task ?? "").includes(basename(f.file))) delegated.add(basename(f.file));
        }
      }
      return undefined;
    }

    if (event.toolName === "write" || event.toolName === "edit") {
      const path = String(input.path ?? "");
      if (/\.jacquard\/plans\/[^/]+\.md$/.test(path)) { plan = resolve(cwd, path); return undefined; }
      const content = String(input.content ?? "") + JSON.stringify(input.edits ?? "") + String(input.newText ?? "");
      if (!isFigureFile(cwd, path, content)) return undefined;
      if (event.toolName === "write" && isStub(String(input.content ?? ""))) return undefined;
      return { block: true, reason: `Gate 3: ${path} is a figure file. Main Guy writes the plan, stubs (a component that returns null) and the wiring; Little Bros build figures.${plan ? " Put it in a little-bro brief." : " Write the plan first (see post-figures)."}` };
    }

    if (event.toolName === "bash") {
      const cmd = String(input.command ?? "");
      const writes = /(>|\btee\b|sed\s+-i|python3?\b|perl\s+-i|\bcp\b|\bmv\b|<<)/.test(cmd);
      const p = cmd.match(PLAN);
      if (writes && p) plan = resolve(cwd, p[1]);
      const hit = [...plannedFiles(cwd)].find((f) => cmd.includes(basename(f)));
      if (writes && hit && !p) return { block: true, reason: `Gate 3: that command writes to a planned figure file (${basename(hit)}). Little Bros build figures; Main Guy delegates.` };
    }
    return undefined;
  });

  pi.on("tool_result", async (event) => {
    if (event.toolName !== "subagent" || event.isError) return undefined;
    const input = event.input as Record<string, any>;
    if ((input.tasks ?? input.chain ?? [input]).some((c: any) => c.agent === "big-bro")) reviewed = true;
    return undefined;
  });

  // Gate 4: no finishing with planned figures unreviewed, undelegated or still stubs
  pi.on("agent_before_settle", async (_event, ctx) => {
    if (!plan || nudges >= 3) return undefined;
    const open = figs().filter((f) => {
      if (!f.file) return false;
      const abs = resolve(ctx.cwd, f.file);
      const stub = !existsSync(abs) || isStub(readFileSync(abs, "utf8"));
      return !reviewed || !delegated.has(basename(f.file)) || stub;
    });
    if (!open.length) return undefined;
    nudges++;
    const why = !reviewed ? "big-bro hasn't reviewed the plan" : "these planned figures aren't built by Little Bros yet";
    return {
      continue: true,
      entries: [{
        type: "custom_message", customType: "jacquard-gate", display: true,
        content: `Gate 4: you can't finish yet: ${why}: ${open.map((f) => `${f.title} (${f.file})`).join("; ")}. ${!reviewed ? "Send the plan to big-bro, then delegate each figure to a little-bro." : "Delegate each to a little-bro, in parallel, with a full brief, and wait for them."}`,
      }],
    };
  });
}
