#!/usr/bin/env bun
// Summarize pi session logs: one row per run with turns, tool calls, tokens and cost.
// Subagent sessions (named "sub:<agent>") are listed under the run that started them (same working
// directory), and the run's row gets a team total.
//
//   bun runs              every run in runs/sessions
//   bun runs <file.jsonl> one session, plus its tool calls in order
import { Glob } from "bun";
import { basename, join, resolve } from "node:path";

type Usage = { input: number; output: number; cacheRead: number; cacheWrite: number; cost: { total: number } };
type Stats = { file: string; name: string; start: string; cwd: string; model: string; turns: number; tools: string[]; input: number; output: number; cacheRead: number; cacheWrite: number; cost: number };

const repo = resolve(import.meta.dir, "..");
const arg = process.argv[2];
const files = arg
  ? [resolve(arg)]
  : [...new Glob("**/*.jsonl").scanSync(join(repo, "runs/sessions"))].map((f) => join(repo, "runs/sessions", f));

async function read(file: string): Promise<Stats> {
  const lines = (await Bun.file(file).text()).trim().split("\n").map((l) => JSON.parse(l));
  const s: Stats = { file, name: "", start: lines[0]?.timestamp ?? "", cwd: lines[0]?.cwd ?? "", model: "", turns: 0, tools: [], input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0 };
  for (const e of lines) {
    if (e.type === "session_info" && e.name) s.name = e.name;
    const m = e.type === "message" ? e.message : null;
    const u: Usage | undefined = m?.usage ?? (e.type === "usage" ? e.usage : undefined);
    if (u) { s.input += u.input; s.output += u.output; s.cacheRead += u.cacheRead; s.cacheWrite += u.cacheWrite; s.cost += u.cost.total; }
    if (m?.role === "assistant") {
      s.turns++;
      s.model = m.model;
      for (const c of m.content) if (c.type === "toolCall") s.tools.push(c.name);
    }
  }
  return s;
}

const k = (n: number) => `${(n / 1000).toFixed(1)}k`;
const row = (s: Stats) =>
  `${s.model}  turns ${s.turns}  tools ${s.tools.length}  in ${k(s.input)}  out ${k(s.output)}  cache r/w ${k(s.cacheRead)}/${k(s.cacheWrite)}  $${s.cost.toFixed(3)}`;

const all = (await Promise.all(files.map(read))).sort((a, b) => a.start.localeCompare(b.start));
const runs: { lead: Stats; subs: Stats[] }[] = [];
for (const s of all) {
  // a subagent belongs to the latest lead that started before it in the same working directory
  const parent = s.name.startsWith("sub:") ? runs.findLast((r) => r.lead.cwd === s.cwd) : undefined;
  if (parent) parent.subs.push(s);
  else runs.push({ lead: s, subs: [] });
}

for (const { lead, subs } of runs) {
  console.log(`${basename(lead.file)}  ${lead.name ? `"${lead.name}"  ` : ""}${row(lead)}`);
  for (const s of subs) console.log(`    ${s.name}  ${row(s)}`);
  if (subs.length) {
    const team = [lead, ...subs].reduce((t, s) => ({ turns: t.turns + s.turns, out: t.out + s.output, cost: t.cost + s.cost }), { turns: 0, out: 0, cost: 0 });
    console.log(`    team total  turns ${team.turns}  out ${k(team.out)}  $${team.cost.toFixed(3)}`);
  }
  if (arg) console.log("  " + lead.tools.join(" → "));
}
