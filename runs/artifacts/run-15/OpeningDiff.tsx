"use client";

/**
 * Word-level diff of the opening of "Where small business owners hang out online",
 * before and after one prose-scrub rewrite round (prose-scrub-review/2026-10-09).
 * Each cut is coloured by what asked for it.
 */

type Cause = "throat" | "adverb" | "judge" | "rhythm" | "none";

type Piece =
  | string
  | { del: string; cause: Cause }
  | { ins: string };

const causes: { key: Cause; label: string; color: string }[] = [
  { key: "throat", label: "Throat-clearing rule", color: "var(--accent-a)" },
  { key: "adverb", label: "Adverb rule", color: "var(--accent-b)" },
  { key: "judge", label: "Judge", color: "var(--accent)" },
  { key: "rhythm", label: "Rhythm rule", color: "var(--muted-foreground)" },
  { key: "none", label: "No rule", color: "var(--foreground)" },
];

const colorOf = (c: Cause) => causes.find((x) => x.key === c)!.color;

const blocks: { label: string; pieces: Piece[] }[] = [
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

function Del({ text, cause }: { text: string; cause: Cause }) {
  const color = colorOf(cause);
  return (
    <del
      className="rounded-[2px] px-[1px] no-underline"
      style={{
        color,
        textDecorationLine: "line-through",
        textDecorationColor: color,
        textDecorationThickness: "1.5px",
        backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)`,
        outline: cause === "none" ? `1px dashed ${color}` : undefined,
        outlineOffset: cause === "none" ? "1px" : undefined,
        opacity: cause === "rhythm" ? 0.85 : 1,
      }}
    >
      {text}
    </del>
  );
}

export default function OpeningDiff() {
  return (
    <div className="border border-border/60 bg-surface/40 p-4 md:p-6" aria-hidden>
      <div className="space-y-4">
        {blocks.map((b) => (
          <div key={b.label} className="md:flex md:gap-5">
            <div className="mb-1 shrink-0 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-foreground/45 md:mb-0 md:w-12 md:pt-[0.3rem]">
              {b.label}
            </div>
            <p className="text-[0.88rem] leading-[1.85] text-foreground/80">
              {b.pieces.map((p, i) =>
                typeof p === "string" ? (
                  <span key={i}>{p}</span>
                ) : "del" in p ? (
                  <Del key={i} text={p.del} cause={p.cause} />
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

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/40 pt-4 font-sans text-[0.68rem] text-foreground/60">
        <span className="text-foreground/45">Cut by:</span>
        {causes.map((c) => (
          <span key={c.key} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[2px]"
              style={{
                backgroundColor: `color-mix(in oklch, ${c.color} 30%, transparent)`,
                border:
                  c.key === "none"
                    ? `1px dashed ${c.color}`
                    : `1px solid ${c.color}`,
              }}
            />
            {c.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-[2px] w-3"
            style={{ backgroundColor: "var(--foreground)" }}
          />
          Added by the rewriter
        </span>
      </div>
    </div>
  );
}
