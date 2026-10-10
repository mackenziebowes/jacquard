#!/usr/bin/env bun
// Live view of Jacquard's sessions in a browser: every run, every agent (Main Guy, Big Bro, Little Bros),
// each step as it happens, screenshots inline. `jack` starts it if it isn't running.
//
//   jack-watch            serves http://localhost:4747 (JACK_WATCH_PORT to change)
//
// It reads runs/sessions/*.jsonl, the files pi writes, and never writes anything itself.
import { join, resolve, basename } from "node:path";
import { readdirSync, statSync, openSync, readSync, closeSync, watch } from "node:fs";

const repo = resolve(import.meta.dir, "..");
const dir = process.env.JACK_SESSIONS_DIR ?? join(repo, "runs/sessions");
const port = Number(process.env.JACK_WATCH_PORT ?? 4747);
const RECENT_MS = 24 * 3600 * 1000;

type Ev = Record<string, unknown> & { kind: string; file: string; at: string };
const history: Ev[] = [];
const clients = new Set<ReadableStreamDefaultController>();
const tails = new Map<string, { offset: number; rest: string }>();
const lines = new Map<string, number>(); // "<file>/<entryId>" -> byte offset of that line, for serving images
const pendingRead = new Map<string, string>(); // toolCallId -> path read, to label images

const short = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "…" : s);
const send = (e: Ev) => {
  history.push(e);
  const msg = `data: ${JSON.stringify(e)}\n\n`;
  for (const c of clients) try { c.enqueue(msg); } catch { clients.delete(c); }
};

function summarize(file: string, entry: any, offset: number) {
  const at = entry.timestamp ?? "";
  if (entry.type === "session") return send({ kind: "session", file, at, cwd: entry.cwd });
  if (entry.type === "session_info" && entry.name) return send({ kind: "name", file, at, name: entry.name });
  const m = entry.type === "message" ? entry.message : null;
  if (!m) return;
  if (entry.id) lines.set(`${file}/${entry.id}`, offset);
  if (m.role === "assistant") {
    const text = m.content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n");
    const tools = m.content.filter((c: any) => c.type === "toolCall").map((c: any) => {
      if (c.name === "read" && c.arguments?.path) pendingRead.set(c.id, c.arguments.path);
      const a = c.arguments ?? {};
      const brief = c.name === "subagent"
        ? (a.tasks ?? a.chain ?? [a]).map((x: any) => `→ ${x.agent}: ${x.task ?? ""}`).join("\n")
        : String(a.command ?? a.path ?? "");
      return { name: c.name, brief: short(brief, 400), more: brief.length > 400 };
    });
    const u = m.usage ?? {};
    // context this turn = everything the model read: fresh input plus cache reads and writes
    send({ kind: "turn", file, at, model: m.model, e: entry.id, text: short(text, 1200), more: text.length > 1200, tools, cost: u.cost?.total ?? 0, out: u.output ?? 0, ctx: (u.input ?? 0) + (u.cacheRead ?? 0) + (u.cacheWrite ?? 0) });
  } else if (m.role === "toolResult") {
    const images = m.content.map((c: any, i: number) => (c.type === "image" ? i : -1)).filter((i: number) => i >= 0);
    const text = m.content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n");
    send({ kind: "result", file, at, tool: m.toolName, error: !!m.isError, e: entry.id, text: short(text, 400), more: text.length > 400, images: images.map((i: number) => `/img?f=${encodeURIComponent(file)}&e=${entry.id}&i=${i}`), label: pendingRead.get(m.toolCallId) ?? "" });
  }
}

function tail(file: string) {
  const path = join(dir, file), size = statSync(path).size;
  const t = tails.get(file) ?? { offset: 0, rest: "" };
  if (size <= t.offset) return;
  const fd = openSync(path, "r"), buf = Buffer.alloc(size - t.offset);
  readSync(fd, buf, 0, buf.length, t.offset); closeSync(fd);
  let pos = t.offset - Buffer.byteLength(t.rest);
  const parts = (t.rest + buf.toString("utf8")).split("\n");
  t.rest = parts.pop() ?? "";
  for (const line of parts) {
    const lineOffset = pos;
    pos += Buffer.byteLength(line) + 1;
    if (!line.trim()) continue;
    try { summarize(file, JSON.parse(line), lineOffset); } catch { /* partial or foreign line */ }
  }
  t.offset = size;
  tails.set(file, t);
}

function scan() {
  const now = Date.now();
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".jsonl")).sort()) {
    if (!tails.has(f) && now - statSync(join(dir, f)).mtimeMs > RECENT_MS) { tails.set(f, { offset: statSync(join(dir, f)).size, rest: "" }); continue; }
    tail(f);
  }
}
scan();
try { watch(dir, () => scan()); } catch { /* polling below covers it */ }
setInterval(scan, 1000);

// one session line, read back from disk by its offset: images and full texts stay out of the stream
function entry(file: string, id: string) {
  const off = lines.get(`${file}/${id}`);
  if (off === undefined) return null;
  const fd = openSync(join(dir, basename(file)), "r"), chunk: Buffer[] = [];
  let p = off;
  for (;;) { const b = Buffer.alloc(1 << 20), n = readSync(fd, b, 0, b.length, p); if (!n) break; const nl = b.subarray(0, n).indexOf(10); if (nl >= 0) { chunk.push(b.subarray(0, nl)); break; } chunk.push(b.subarray(0, n)); p += n; }
  closeSync(fd);
  return JSON.parse(Buffer.concat(chunk).toString("utf8")).message;
}

function image(file: string, id: string, i: number) {
  const c = entry(file, id)?.content[i];
  if (!c) return new Response("not found", { status: 404 });
  return new Response(Buffer.from(c.data, "base64"), { headers: { "content-type": c.mimeType ?? "image/png", "cache-control": "max-age=86400" } });
}

Bun.serve({
  port,
  idleTimeout: 0,
  fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === "/events") {
      let ctrl: ReadableStreamDefaultController;
      return new Response(new ReadableStream({
        start(c) { ctrl = c; c.enqueue(`data: ${JSON.stringify({ kind: "history", events: history })}\n\n`); clients.add(c); },
        cancel() { clients.delete(ctrl); },
      }), { headers: { "content-type": "text/event-stream", "cache-control": "no-cache" } });
    }
    if (u.pathname === "/full") {
      // the untruncated text of one step: part is "text" (what it said or returned) or "tool:<n>" (its nth tool call)
      const m = entry(u.searchParams.get("f") ?? "", u.searchParams.get("e") ?? ""), part = u.searchParams.get("part") ?? "text";
      if (!m) return new Response("not found", { status: 404 });
      let out = m.content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n");
      if (part.startsWith("tool:")) {
        const a = m.content.filter((c: any) => c.type === "toolCall")[Number(part.slice(5))]?.arguments ?? {};
        out = a.tasks || a.chain || a.agent ? (a.tasks ?? a.chain ?? [a]).map((x: any) => `→ ${x.agent}: ${x.task ?? ""}`).join("\n\n") : String(a.command ?? a.path ?? JSON.stringify(a, null, 2));
      }
      return new Response(out, { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    if (u.pathname === "/img") return image(u.searchParams.get("f") ?? "", u.searchParams.get("e") ?? "", Number(u.searchParams.get("i")));
    if (u.pathname === "/") return new Response(Bun.file(join(import.meta.dir, "jack-watch.html")));
    return new Response("not found", { status: 404 });
  },
});
// started by `jack` in the user's terminal: Ctrl-C there or closing the tab shouldn't take the view down with it
process.on("SIGINT", () => {});
process.on("SIGHUP", () => {});
console.log(`jack-watch: http://localhost:${port}`);
