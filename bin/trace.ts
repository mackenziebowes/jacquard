#!/usr/bin/env bun
// One session, turn by turn: seconds since the previous entry, each tool call, what the model said, what came back.
//   bun trace runs/sessions/<file>.jsonl
const L = (await Bun.file(process.argv[2]).text()).trim().split("\n").map((l) => JSON.parse(l));
let prev = 0;
for (const e of L) {
  const m = e.message; if (!m) continue;
  const t = Date.parse(e.timestamp), dt = prev ? Math.round((t - prev) / 1000) : 0;
  if (m.role === "assistant") {
    const txt = m.content.filter((c: any) => c.type === "text").map((c: any) => c.text).join(" ").replace(/\s+/g, " ").slice(0, 120);
    for (const c of m.content) if (c.type === "toolCall") console.log(`${String(dt).padStart(4)}s ${c.name} ${(c.arguments.command ?? c.arguments.path ?? "").replace(/\s+/g, " ").slice(0, 160)}`);
    if (txt) console.log(`      say: ${txt}`);
  } else if (m.role === "toolResult") console.log(`${String(dt).padStart(4)}s  -> ${JSON.stringify(m.content.filter((c: any) => c.type === "text").map((c: any) => c.text).join(" ")).slice(0, 100)}`);
  prev = t;
}
