# Runs

Everything Jack has done. The raw sessions and their HTML exports stay on the machine that ran them (they hold full transcripts, local paths and file contents); this repo keeps the ledger, each run's final report and copies of what it built.

- `sessions/*.jsonl` - every pi session, exactly as pi wrote it: the lead (Main Guy) and every subagent (Big Bro, Little Bro) are separate files. A subagent's file is named in its `session_info` entry as `sub:big-bro` or `sub:little-bro`; it belongs to the lead run that started before it in the same working directory.
- `html/` - the same sessions exported with `pi --export`, readable in a browser: `run-14-main.html`, `run-14-little-bro-07.html` and so on. Run 13 and 14 are exported; export any other with `node_modules/.bin/pi --export runs/sessions/<file>.jsonl runs/html/<name>.html`.
- `run-NN.out` - what the lead printed at the end of each one-shot run (its report).
- `artifacts/run-NN/` - copies of the figure components each run wrote, plus screenshots Claude took while reviewing.
- `LEDGER.md` - one row per run: cost, turns, verdict.

Tools for reading them:

- `bun runs` - every run with its subagents underneath, turns, tokens and cost.
- `bun turns <file>...` - per session: tool calls by kind, minutes on the model vs on tools.
- `bun trace <file>` - one session turn by turn: seconds between steps, each command, what came back.
