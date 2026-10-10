#!/usr/bin/env bun
// Look at one figure at the moments and widths you choose, in one call.
//
//   jack-look <url> [--times 0,1.2,end] [--widths 1280,375] [--out dir]
//
// <url> is a figure's viewer page (/explainers/<post>/<figure>), or a page URL with a #fragment that
// points at the figure (e.g. /posts/<post>#fig-<post>--<figure>). It is for figures, not whole pages:
// for a whole page, use agent-browser. Each time is frozen with ?figure-t=<t>, so nothing plays and
// nothing needs waiting for. Prints one contact-sheet image per width (every time side by side,
// labelled), plus console errors and sideways overflow per width.
//
// Each frame is its own screenshot, laid out on a local sheet afterwards, so it works on sites that
// refuse to be framed (X-Frame-Options / frame-ancestors).
import { join, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";

const argv = process.argv.slice(2);
const opt = (name: string, def: string) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv.splice(i, 2)[1] : def; };
const times = opt("times", "end").split(",").map((s) => s.trim());
const widths = opt("widths", "1280,375").split(",").map(Number);
const out = resolve(opt("out", join(tmpdir(), `jack-look-${Date.now()}`))); // absolute: the sheet links frames by file:// path
const url = argv[0];
if (!url) { console.error("usage: jack-look <figure viewer url | page url#figure-id> [--times 0,1.2,end] [--widths 1280,375] [--out dir]"); process.exit(2); }
mkdirSync(out, { recursive: true });

const session = `jack-look-${process.pid}`;
const ab = (...args: string[]) => {
  const p = Bun.spawnSync(["agent-browser", ...args], { env: { ...process.env, AGENT_BROWSER_SESSION: session } });
  return (p.stdout.toString() + p.stderr.toString()).trim();
};
const withT = (t: string) => { const u = new URL(url); u.searchParams.set("figure-t", t); return u.toString(); };

// Put the figure at the top of the viewport and report where it is. With a #fragment, that element;
// otherwise #figure (viewer pages); otherwise nothing: this isn't a figure.
const FRAME = `(() => {
  const el = (location.hash && document.querySelector(location.hash)) || document.getElementById("figure");
  if (!el) return JSON.stringify({ found: false, overflow: document.documentElement.scrollWidth - innerWidth });
  window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + scrollY - 16));
  const r = el.getBoundingClientRect();
  return JSON.stringify({ found: true, top: Math.round(r.top), h: Math.ceil(r.height), overflow: document.documentElement.scrollWidth - innerWidth });
})()`;
const frame = () => JSON.parse(JSON.parse(ab("eval", FRAME)));

try {
  for (const w of widths) {
    // the figure at its end state: errors, overflow, and how tall it is at this width
    ab("set", "viewport", String(w), "900", "1");
    ab("open", withT("end"));
    ab("wait", "1000");
    const probe = frame();
    const errors = ab("errors");
    if (!probe.found) console.log(`${w}px: no figure here (no #fragment and no #figure). jack-look frames one figure; for a whole page use agent-browser. Showing the top of the page.`);
    const h = probe.found ? Math.min(probe.top + probe.h + 16, 4000) : 900;

    // one screenshot per frozen moment, at exactly the figure's height
    ab("set", "viewport", String(w), String(h), "1");
    const frames: string[] = [];
    for (const t of times) {
      ab("open", withT(t));
      ab("wait", "800");
      if (probe.found) frame();
      const f = join(out, `frame-${w}-${t}.png`);
      ab("screenshot", f);
      frames.push(f);
    }

    // lay the frames side by side on a local sheet and take one picture of it
    const scale = Math.min(1, 800 / w), cols = Math.max(1, Math.min(times.length, Math.floor(1600 / (w * scale))));
    const cellW = Math.round(w * scale);
    const cells = times.map((t, i) => `<div><div class="l">t = ${t} · ${w}px</div><img src="file://${frames[i]}" width="${cellW}"></div>`).join("");
    const sheet = join(out, `sheet-${w}.html`);
    await Bun.write(sheet, `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:12px;background:#222;font:12px system-ui;color:#ddd;display:grid;grid-template-columns:repeat(${cols},${cellW}px);gap:12px;align-items:start}.l{margin-bottom:4px}img{display:block}</style>${cells}`);
    ab("set", "viewport", String(cols * cellW + (cols - 1) * 12 + 24), "200", "1"); // --full grows to the frames
    ab("open", `file://${sheet}`);
    ab("wait", "300");
    const img = join(out, `look-${w}.jpg`);
    ab("screenshot", "--full", "--screenshot-format", "jpeg", "--screenshot-quality", "70", img);

    console.log(`${w}px: ${img}`);
    console.log(`  overflow: ${probe.overflow > 0 ? `${probe.overflow}px sideways` : "none"}`);
    console.log(`  console errors: ${/no (page )?errors|^$/i.test(errors) ? "none" : errors.split("\n").slice(0, 5).join(" | ")}`);
  }
} finally {
  ab("close");
}
