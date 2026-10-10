"use client";

import { useEffect, useRef, useState } from "react";
import { E, P, q } from "../_figure";

/**
 * Word-level diff of the opening of "Where small business owners hang out online",
 * before and after one prose-scrub rewrite round (prose-scrub-review/2026-10-09).
 * Kept text is ink, cut text is struck through in muted ink, and the one cut no rule asked for
 * ("But") is tomato. Each cut carries a small tag naming the rule or judge flag behind it.
 * Plays once when scrolled into view: cuts strike through in reading order over about 3.5 s,
 * and the tags fade in with them. The end state is still; ?figure-t=<s|end> freezes any frame.
 */

const DUR = 3.5; // seconds for the whole pass
const STRIKE = 0.45; // seconds each strike takes to draw across its words

type Cause = "throat" | "adverb" | "judge" | "rhythm" | "none";

const RULE: Record<Cause, string> = {
  throat: "throat-clearing rule",
  adverb: "adverb rule",
  judge: "judge",
  rhythm: "rhythm rule",
  none: "no rule",
};

type Piece =
  | string
  | { del: string; cause: Cause }
  | { ins: string };

type Cut = { del: string; cause: Cause; at: number };
type Placed = string | Cut | { ins: string };

const raw: { label: string; pieces: Piece[] }[] = [
  {
    label: "Intro",
    pieces: [
      "I wanted to know where my customers ",
      { del: "actually", cause: "adverb" },
      " spend their time online",
      { del: ". Not", cause: "rhythm" },
      { ins: ", as opposed to" },
      " where marketing blogs say they are",
      { del: " - where they", cause: "rhythm" },
      " ",
      { del: "really", cause: "adverb" },
      { del: " are", cause: "rhythm" },
      ". So I went looking for data. ",
      { del: "Here's what I found.", cause: "throat" },
    ],
  },
  {
    label: "¶ 2",
    pieces: [
      "…where do they ",
      { del: "actually", cause: "adverb" },
      " show up? The marketing world loves to talk about \u201cmeeting your customers where they are.\u201d ",
      { del: "Okay.", cause: "judge" },
      " ",
      { del: "But", cause: "none" },
      " ",
      { ins: "W" },
      "here is that, exactly?",
    ],
  },
  {
    label: "¶ 3",
    pieces: [
      "…and about 50 other sources. ",
      { del: "Here's what I learned.", cause: "throat" },
    ],
  },
];

// Number each cut in reading order, so the strikes stagger across the whole figure.
let cutCount = 0;
const blocks = raw.map((b) => ({
  label: b.label,
  pieces: b.pieces.map((p): Placed =>
    typeof p !== "string" && "del" in p ? { ...p, at: cutCount++ } : p,
  ),
}));
const CUTS = cutCount;
const startOf = (k: number) => (CUTS > 1 ? (k * (DUR - STRIKE)) / (CUTS - 1) : 0);

/** Playhead in seconds: plays once when scrolled into view, rests at DUR otherwise. */
function usePlayhead() {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(DUR); // the server and first paint show the end state
  const replay = useRef<() => void>(() => {});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const v = new URLSearchParams(window.location.search).get("figure-t");
    if (v !== null) {
      const n = v === "end" || Number.isNaN(Number(v)) ? DUR : Math.min(DUR, Math.max(0, Number(v)));
      setT(n);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0, playing = false;
    const stop = () => { cancelAnimationFrame(raf); playing = false; setT(DUR); };
    replay.current = () => {
      if (playing) return;
      playing = true;
      let start = -1;
      const tick = (now: number) => {
        if (start < 0) start = now;
        const s = (now - start) / 1000;
        if (s >= DUR) return stop();
        setT(s);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { io.disconnect(); replay.current(); } },
      { threshold: 0.4 },
    );
    io.observe(el);
    const onHide = () => { if (document.hidden && playing) stop(); };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return { ref, t, replay: () => replay.current() };
}

function CutWord({ c, t }: { c: Cut; t: number }) {
  const start = startOf(c.at);
  const strike = E.io3(P(t, start, start + STRIKE));
  const tag = E.io3(P(t, start + 0.1, start + 0.1 + 0.4));
  const target = c.cause === "none" ? "var(--accent-a)" : "var(--muted-foreground)";
  const pct = q(strike * 100);
  return (
    <>
      <del
        className="no-underline"
        style={{
          color: pct === 0 ? "var(--foreground)" : `color-mix(in oklch, ${target} ${pct}%, var(--foreground))`,
          textDecorationLine: "none",
          backgroundImage: "linear-gradient(currentColor, currentColor)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 55%",
          backgroundSize: `${pct}% 1.5px`,
        }}
      >
        {c.del}
      </del>
      <span
        className="ml-1 mr-0.5 inline-block whitespace-nowrap rounded-[2px] border px-1 align-[0.12em] font-sans text-[0.6rem] leading-[1.5] tracking-[0.02em]"
        style={{
          color: "var(--muted-foreground)",
          borderColor: "color-mix(in oklch, var(--muted-foreground) 45%, transparent)",
          opacity: tag,
        }}
      >
        {RULE[c.cause]}
      </span>
    </>
  );
}

export default function OpeningDiff() {
  const { ref, t, replay } = usePlayhead();
  return (
    <div
      ref={ref}
      className="border border-border/60 bg-surface/40 p-4 md:p-6"
      onClick={() => t >= DUR && replay()}
      aria-hidden
    >
      <div className="space-y-4">
        {blocks.map((b) => (
          <div key={b.label} className="md:flex md:gap-5">
            <div className="mb-1 shrink-0 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-foreground/45 md:mb-0 md:w-12 md:pt-[0.3rem]">
              {b.label}
            </div>
            <p className="text-[0.88rem] leading-[1.85] text-foreground">
              {b.pieces.map((p, i) =>
                typeof p === "string" ? (
                  <span key={i}>{p}</span>
                ) : "del" in p ? (
                  <CutWord key={i} c={p} t={t} />
                ) : (
                  <ins
                    key={i}
                    className="text-foreground no-underline"
                    style={{
                      textDecorationLine: "underline",
                      textDecorationColor: "var(--foreground)",
                      textDecorationThickness: "1.5px",
                      textUnderlineOffset: "3px",
                    }}
                  >
                    {p.ins}
                  </ins>
                ),
              )}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-border/40 pt-4 font-sans text-[0.68rem] leading-[1.6] text-muted-foreground">
        Struck words were cut in this round. The tag names the rule or judge flag behind each cut.
      </p>
    </div>
  );
}
