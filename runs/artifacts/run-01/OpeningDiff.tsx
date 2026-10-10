"use client";

/**
 * The opening of "Where Small Business Owners Hang Out Online" before and after
 * the prose-scrub rewrite, as a word-level diff. Each cut is tagged with what
 * asked for it: the word list, the judge, or nothing at all.
 * Text from prose-scrub-review/2026-10-09 (before/ and after/ copies).
 */

type Source = "list" | "judge" | "none" | "rewrite";

type Seg =
  | string
  | { cut: string; by: Source; tag: string }
  | { add: string };

const STYLE: Record<Source, { text: string; tag: string }> = {
  list: {
    text: "text-foreground/45 decoration-foreground/70",
    tag: "text-foreground/60",
  },
  judge: {
    text: "text-accent/80 decoration-accent",
    tag: "text-accent",
  },
  none: {
    text: "text-accent-a/85 decoration-accent-a",
    tag: "text-accent-a",
  },
  rewrite: {
    text: "text-foreground/35 decoration-foreground/40",
    tag: "text-foreground/45",
  },
};

const PARAGRAPHS: (Seg[] | "skip")[] = [
  [
    "I wanted to know where my customers ",
    { cut: "actually", by: "list", tag: "adverb" },
    " spend their time online",
    {
      cut: ". Not where marketing blogs say they are - where they really are.",
      by: "rewrite",
      tag: "rewritten",
    },
    { add: ", as opposed to where marketing blogs say they are." },
    " So I went looking for data. ",
    { cut: "Here's what I found.", by: "list", tag: "throat-clearing" },
  ],
  "skip",
  [
    "But I kept running into the same question: if I want to reach these people - or help them reach their customers - where do they ",
    { cut: "actually", by: "list", tag: "adverb" },
    " show up? The marketing world loves to talk about \u201cmeeting your customers where they are.\u201d ",
    { cut: "Okay.", by: "judge", tag: "judge: adds nothing" },
    " ",
    { cut: "But", by: "none", tag: "no rule" },
    " ",
    { cut: "where", by: "none", tag: "" },
    " ",
    { add: "Where" },
    " is that, exactly?",
  ],
  [
    "So I pulled the research. Not blog posts about blog posts - actual data from DataReportal, \u2026 and about 50 other sources. ",
    { cut: "Here's what I learned.", by: "list", tag: "throat-clearing" },
  ],
];

const LEGEND: { by: Source; label: string; note: string }[] = [
  { by: "list", label: "Word list", note: "2 throat-clearing, 2 adverbs" },
  { by: "judge", label: "Judge", note: "1 sentence" },
  { by: "none", label: "No rule", note: "1 word, rewriter's own call" },
];

function Segment({ seg }: { seg: Seg }) {
  if (typeof seg === "string") return <>{seg}</>;
  if ("add" in seg) {
    return (
      <ins className="text-foreground underline decoration-foreground/30 underline-offset-[3px]">
        {seg.add}
      </ins>
    );
  }
  const s = STYLE[seg.by];
  return (
    <>
      <del
        className={`${s.text} line-through decoration-[1.5px]`}
      >
        {seg.cut}
      </del>
      {seg.tag && (
        <sup
          className={`${s.tag} ml-1 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.1em] whitespace-nowrap`}
        >
          {seg.tag}
        </sup>
      )}
    </>
  );
}

export default function OpeningDiff() {
  return (
    <div className="border border-border/60 bg-surface/40 px-4 py-5 sm:px-6">
      <ul className="mb-5 flex flex-wrap gap-x-6 gap-y-2 border-b border-border/40 pb-4">
        {LEGEND.map((l) => (
          <li key={l.by} className="flex items-baseline gap-2">
            <span
              className={`${STYLE[l.by].tag} font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em]`}
            >
              {l.label}
            </span>
            <span className="text-[0.75rem] text-foreground/55">{l.note}</span>
          </li>
        ))}
      </ul>

      <div className="max-w-[40rem] space-y-3 text-[0.88rem] leading-[1.9] text-foreground/80">
        {PARAGRAPHS.map((p, i) =>
          p === "skip" ? (
            <p
              key={i}
              className="font-sans text-[0.65rem] uppercase tracking-[0.12em] text-foreground/35"
            >
              one paragraph unchanged
            </p>
          ) : (
            <p key={i} className={i === 0 ? "italic" : undefined}>
              {p.map((seg, j) => (
                <Segment key={j} seg={seg} />
              ))}
            </p>
          ),
        )}
      </div>
    </div>
  );
}
