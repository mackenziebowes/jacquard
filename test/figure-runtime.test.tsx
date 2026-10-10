// The figure runtime's example figure, served as a page and used the way a reader uses it: fetched over
// HTTP, then loaded and scrolled in a real browser. The page is a small stand-in host; the real end-to-end
// check of Jacquard is a run against a site, recorded in runs/LEDGER.md.
import { test, expect, beforeAll, afterAll } from "bun:test";
import { renderToString } from "react-dom/server";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import LeakyJar from "../agent/skills/figure-runtime/assets/example/LeakyJar";

const repo = join(import.meta.dir, "..");
const ab = join(repo, "node_modules/.bin/agent-browser");
const session = `jacquard-test-${process.pid}`;
const sh = (...args: string[]) => {
  const p = Bun.spawnSync([ab, ...args], { env: { ...process.env, AGENT_BROWSER_SESSION: session } });
  return p.stdout.toString().trim();
};
const rects = () => Number(JSON.parse(sh("eval", "document.querySelectorAll('svg rect').length")));

let server: ReturnType<typeof Bun.serve>;
beforeAll(async () => {
  const out = mkdtempSync(join(tmpdir(), "figure-"));
  const built = await Bun.build({ entrypoints: [join(import.meta.dir, "fixtures/leaky-jar.entry.tsx")], outdir: out, target: "browser", naming: "entry.js" });
  if (!built.success) throw new AggregateError(built.logs, "build failed");
  const html = `<!doctype html><meta charset="utf-8"><style>:root{--accent:#3ddc97}body{background:#0b0b0c;color:#e8e6e1;margin:0;padding:40px 16px}</style>
<div style="height:1400px">scroll down</div><div id="root" style="max-width:640px">${renderToString(<LeakyJar />)}</div><div style="height:800px"></div><script type="module" src="/entry.js"></script>`;
  // a viewer page: the figure alone at the top, the way a site's /explainers/<post>/<figure> serves it
  const viewer = html.replace('<div style="height:1400px">scroll down</div><div id="root"', '<div id="figure"><div id="root"').replace('</div><div style="height:800px"></div>', '</div></div>');
  server = Bun.serve({ port: 0, fetch: (req) => { const p = new URL(req.url).pathname; // pages refuse to be framed, like many real sites (and Mackenzie's) do
  return p === "/" || p === "/viewer" ? new Response(p === "/" ? html : viewer, { headers: { "content-type": "text/html", "x-frame-options": "DENY", "content-security-policy": "frame-ancestors 'none'" } }) : Bun.file(join(out, p)).exists().then((ok) => ok ? new Response(Bun.file(join(out, p))) : new Response("", { status: 404 })); } });
});
afterAll(() => { sh("close"); server?.stop(); });

test("the served HTML already holds the end state: all 40 coins and the verdict, before any JavaScript", async () => {
  const html = await (await fetch(`http://localhost:${server.port}/`)).text();
  expect(html.match(/<rect/g)?.length).toBe(40);
  expect(html.replace(/<!-- -->/g, "")).toContain("28 kept · 12 leaked");
});

test("in a browser it shows the end state before scrolling, plays from 0 in view, and ends on the same state", () => {
  sh("open", `http://localhost:${server.port}/`);
  sh("wait", "500");
  expect(rects()).toBe(40); // hydrated, not yet in view: still the finished picture
  const errors = sh("errors");
  expect(errors).not.toMatch(/hydrat/i);
  sh("eval", "document.getElementById('root').scrollIntoView()");
  sh("wait", "1200");
  expect(rects()).toBeLessThan(40); // mid-play: the person is still walking, coins not all poured
  sh("wait", "5000");
  expect(rects()).toBe(40);
});

test("with reduced motion it never leaves the end state", () => {
  sh("set", "media", "dark", "reduced-motion");
  sh("open", `http://localhost:${server.port}/`);
  sh("eval", "document.getElementById('root').scrollIntoView()");
  sh("wait", "1200");
  expect(rects()).toBe(40);
});

test("?figure-t freezes the figure at that moment and it never plays", () => {
  sh("set", "media", "dark");
  sh("open", `http://localhost:${server.port}/?figure-t=0`);
  sh("wait", "500");
  expect(rects()).toBe(0); // t = 0: the person hasn't poured anything yet
  sh("eval", "document.getElementById('root').scrollIntoView()");
  sh("wait", "2000");
  expect(rects()).toBe(0); // in view, still frozen
  sh("open", `http://localhost:${server.port}/?figure-t=end`);
  sh("wait", "500");
  expect(rects()).toBe(40);
});

test("jack-look says so when a URL has no figure to frame", () => {
  const p = Bun.spawnSync([join(repo, "bin/jack-look"), `http://localhost:${server.port}/`, "--widths", "900", "--out", mkdtempSync(join(tmpdir(), "look-"))], {
    env: { ...process.env, PATH: `${join(repo, "node_modules/.bin")}:${process.env.PATH}` },
  });
  expect(p.stdout.toString()).toContain("no figure here");
});
