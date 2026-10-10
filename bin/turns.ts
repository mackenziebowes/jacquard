#!/usr/bin/env bun
// Sessions side by side: tool calls sorted by kind, and minutes spent waiting on the model vs on tools.
//   bun turns runs/sessions/a.jsonl runs/sessions/b.jsonl ...
// For each session: classify every tool call, and time spent waiting on the model vs on tools.
const files = process.argv.slice(2);
const kind = (name: string, a: any): string => {
  if (name !== "bash") return name === "read" && /\.(png|jpe?g)$/.test(a.path ?? "") ? "read image" : name;
  const c: string = a.command ?? "";
  if (/agent-browser[^|;&]*screenshot/.test(c)) return "bash: screenshot";
  if (/agent-browser[^|;&]*(eval|errors|console)/.test(c)) return "bash: browser eval/errors";
  if (/agent-browser/.test(c)) return "bash: browser other";
  if (/tsc/.test(c)) return "bash: typecheck";
  if (/\bsleep\b|wait/.test(c)) return "bash: sleep/wait";
  if (/curl|bun dev|vite/.test(c)) return "bash: server";
  if (/python3|sed -i|cat >/.test(c)) return "bash: edit via shell";
  if (/^(cat|head|sed -n|grep|ls|wc|find)/.test(c.trim())) return "bash: read/search";
  return "bash: other";
};
for (const f of files) {
  const L = (await Bun.file(f).text()).trim().split("\n").map((l) => JSON.parse(l));
  const counts: Record<string, number> = {};
  let model = "", modelMs = 0, toolMs = 0, prev = 0, lastRole = "";
  for (const e of L) {
    const m = e.message; if (!m) continue;
    const t = Date.parse(e.timestamp);
    if (prev) { if (m.role === "assistant") modelMs += t - prev; else if (m.role === "toolResult") toolMs += t - prev; }
    prev = t;
    if (m.role === "assistant") { model = m.model; for (const c of m.content) if (c.type === "toolCall") { const k = kind(c.name, c.arguments); counts[k] = (counts[k] ?? 0) + 1; } }
  }
  const total = (Date.parse(L.at(-1).timestamp) - Date.parse(L[0].timestamp)) / 60000;
  console.log(`\n${f.split("/").pop()!.slice(0, 19)} ${model}  ${total.toFixed(1)} min  (model ${(modelMs / 60000).toFixed(1)} min, tools ${(toolMs / 60000).toFixed(1)} min)`);
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)}  ${k}`);
}
