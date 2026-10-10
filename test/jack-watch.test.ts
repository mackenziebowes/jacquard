// The live view, used the way a person uses it: the real jack-watch server over HTTP and in a browser,
// while a session file grows the way pi writes it.
import { test, expect, beforeAll, afterAll } from "bun:test";
import { join } from "node:path";
import { mkdtempSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";

const repo = join(import.meta.dir, "..");
const dir = mkdtempSync(join(tmpdir(), "sessions-"));
const port = 4800 + (process.pid % 100);
const lead = join(dir, "2026-10-09T00-00-00-000Z_lead.jsonl");
const sub = join(dir, "2026-10-09T00-00-05-000Z_sub.jsonl");
const line = (o: unknown) => JSON.stringify(o) + "\n";
const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
let server: ReturnType<typeof Bun.spawn>;
const ab = (...args: string[]) => Bun.spawnSync([join(repo, "node_modules/.bin/agent-browser"), ...args], { env: { ...process.env, AGENT_BROWSER_SESSION: `watch-test-${process.pid}` } }).stdout.toString().trim();

beforeAll(async () => {
  appendFileSync(lead, line({ type: "session", version: 3, id: "L", timestamp: "2026-10-09T00:00:00.000Z", cwd: "/site" }) + line({ type: "session_info", id: "n", timestamp: "2026-10-09T00:00:00.100Z", name: "run-99 test" }));
  server = Bun.spawn(["bun", join(repo, "bin/jack-watch.ts")], { env: { ...process.env, JACK_WATCH_PORT: String(port), JACK_SESSIONS_DIR: dir }, stdout: "pipe" });
  for (let i = 0; i < 50; i++) { if (await fetch(`http://localhost:${port}/`).then((r) => r.ok, () => false)) break; await Bun.sleep(100); }
});
afterAll(() => { ab("close"); server.kill(); });

test("streams a run as pi writes it: main guy's turn, a little bro, and its screenshot", async () => {
  const res = await fetch(`http://localhost:${port}/events`);
  const reader = res.body!.getReader();
  let seen = "";
  const until = async (needle: string) => { while (!seen.includes(needle)) seen += new TextDecoder().decode((await reader.read()).value); };
  await until('"history"');
  expect(seen).toContain("run-99 test");

  appendFileSync(lead, line({ type: "message", id: "a1", timestamp: "2026-10-09T00:00:01.000Z", message: { role: "assistant", model: "claude-sonnet-5-5", content: [{ type: "text", text: "Plan drafted." }, { type: "toolCall", id: "c1", name: "subagent", arguments: { agent: "big-bro", task: "review the plan" } }], usage: { output: 10, cost: { total: 0.01 } } } }));
  await until("Plan drafted.");
  expect(seen).toContain("→ big-bro: review the plan");

  appendFileSync(sub, line({ type: "session", version: 3, id: "S", timestamp: "2026-10-09T00:00:05.000Z", cwd: "/site" }) + line({ type: "session_info", id: "m", timestamp: "2026-10-09T00:00:05.100Z", name: "sub:little-bro" })
    + line({ type: "message", id: "a2", timestamp: "2026-10-09T00:00:06.000Z", message: { role: "assistant", model: "claude-haiku-5-5", content: [{ type: "toolCall", id: "c2", name: "read", arguments: { path: "/tmp/look-375.jpg" } }], usage: { output: 5, cacheRead: 90000, cost: { total: 0.001 } } } })
    + line({ type: "message", id: "r2", timestamp: "2026-10-09T00:00:07.000Z", message: { role: "toolResult", toolCallId: "c2", toolName: "read", isError: false, content: [{ type: "text", text: "Read image file" }, { type: "image", data: png, mimeType: "image/png" }] } }));
  await until("/img?");
  const img = seen.match(/\/img\?[^"]+/)![0].replace(/\\u0026/g, "&");
  const r = await fetch(`http://localhost:${port}${img}`);
  expect(r.headers.get("content-type")).toBe("image/png");
  expect((await r.arrayBuffer()).byteLength).toBe(Buffer.from(png, "base64").length);
  reader.cancel();
});

test("the page opens on points, one per agent; hover names it; click opens its lane; all lanes shows both", () => {
  ab("open", `http://localhost:${port}/`);
  ab("wait", "1500");
  const ev = (js: string) => JSON.parse(ab("eval", js));
  expect(Number(ev("document.querySelectorAll('#overview .node').length"))).toBe(2);
  expect(ev("document.getElementById('runs').selectedOptions[0].textContent")).toContain("run-99 test");
  // the Little Bro's point is bigger than Main Guy's: its turn read more context
  const radii = JSON.parse(ev("JSON.stringify([...document.querySelectorAll('#overview .node .body')].map((c) => +c.getAttribute('r')))"));
  expect(radii[1]).toBeGreaterThan(radii[0]);
  // hover shows the name
  ab("hover", "#overview .node:nth-of-type(2) .body");
  expect(ev("document.getElementById('tip').textContent")).toContain("Little Bro 1");
  // click opens that agent alone, with its screenshot
  ab("click", "#overview .node:nth-of-type(2) .body");
  ab("wait", "300");
  expect(Number(ev("document.querySelectorAll('.lane').length"))).toBe(1);
  expect(ev("document.querySelector('.lane h2').textContent")).toContain("Little Bro 1");
  expect(Number(ev("document.querySelectorAll('.shot img').length"))).toBe(1);
  // all lanes
  ab("click", "#v-lanes");
  ab("wait", "300");
  expect(Number(ev("document.querySelectorAll('.lane').length"))).toBe(2);
});
