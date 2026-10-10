#!/usr/bin/env bun
// Runs pi as Jacquard: config, skills and session logs come from this repo, so every
// tuning change is a diff and every run is a file we can read back.
//
//   jack [dir] [--team name] [pi args...]   work in dir (default: the current directory)
//   jack                                      interactive, default team
//   jack ../site --team claude-b -p "..."     one-shot with another team (teams/<name>.json)
//   jack init [dir]                           Big Bro reads .jacquard/vibes/ and writes style.md and library.md
import { existsSync, mkdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const repo = resolve(import.meta.dir, "..");
// `bun run` moves into the package root; INIT_CWD is where the user actually was.
const here = process.env.INIT_CWD ?? process.cwd();

const args = process.argv.slice(2);

// `jack init`: style-init runs as Big Bro (Mackenzie, 2026-10-09 18:27: "Fable should manage init").
const init = args[0] === "init";
if (init) args.shift();

// Who plays Main Guy, Big Bro and Little Bro (teams/<name>.json). Main Guy is the model pi runs;
// the subagent extension reads the other two from the environment.
const t = args.indexOf("--team");
const teamName = t >= 0 ? args.splice(t, 2)[1] : "claude-a";
const team = await Bun.file(join(repo, "teams", `${teamName}.json`)).json();
let target = here;
if (args[0] && !args[0].startsWith("-")) {
  const dir = resolve(here, args[0]);
  if (existsSync(dir) && statSync(dir).isDirectory()) {
    target = dir;
    args.shift();
  }
}
if (init) {
  const vibes = join(target, ".jacquard/vibes");
  if (!existsSync(vibes)) {
    mkdirSync(vibes, { recursive: true });
    console.error(`jacquard: made ${vibes} - put your reference images there, then run jack init again.`);
    process.exit(0);
  }
  args.unshift("--model", team.big, "--name", `init ${basename(target)}`);
  if (!args.includes("-p")) args.push("-p", "/skill:style-init");
} else if (!args.includes("--model")) args.unshift("--model", team.main);

// The live view ships with Jacquard and starts whenever Jacquard does (Mackenzie, 2026-10-09 ~18:27).
// It outlives this run, so watching continues across runs; it only reads runs/sessions.
const watchPort = Number(process.env.JACK_WATCH_PORT ?? 4747);
const watching = await fetch(`http://localhost:${watchPort}/`, { signal: AbortSignal.timeout(500) }).then((r) => r.ok, () => false);
if (!watching) {
  Bun.spawn(["bun", join(repo, "bin/jack-watch.ts")], {
    stdio: ["ignore", Bun.file(join(repo, "runs/watch.log")), Bun.file(join(repo, "runs/watch.log"))],
    env: { ...process.env, JACK_WATCH_PORT: String(watchPort) },
  }).unref();
}
console.error(`jacquard: watch this run at http://localhost:${watchPort}`);

const proc = Bun.spawn([join(repo, "node_modules/.bin/pi"), ...args], {
  cwd: target,
  stdio: ["inherit", "inherit", "inherit"],
  env: {
    ...process.env,
    PI_CODING_AGENT_DIR: join(repo, "agent"),
    PI_CODING_AGENT_SESSION_DIR: join(repo, "runs/sessions"),
    PI_TELEMETRY: "0",
    JACK_TEAM: teamName,
    JACK_BIG_BRO: team.big,
    JACK_LITTLE_BRO: team.little,
    // Tools Jack shells out to (agent-browser, jack-look) come from this repo, not the target site.
    PATH: `${join(repo, "bin")}:${join(repo, "node_modules/.bin")}:${process.env.PATH}`,
  },
});
process.exit(await proc.exited);
