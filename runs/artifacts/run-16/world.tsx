"use client";

/**
 * The set for "prose-scrub 0.4: a small model as the second reader". A page of text is drawn as
 * filled bars: a solid light sheet with each line cut out of it (lines are ground-coloured gaps).
 * Two machines read it. The gate is a solid comb with fixed teeth (a word list: it catches only
 * exact shapes). The judge is a small solid lamp on a stalk (a small model): it lights the lines it
 * reads. Ink on the site's black; the accent is for light and for the one flag a person must see.
 *
 * Every piece is a filled silhouette, no outlines. Positions are in the figure's own viewBox units.
 * Labels are never drawn on a filled shape: place them beside the object, with `labels(compact)`.
 *
 *   Frame({ children })                        the figure frame every post figure sits in
 *   FG, MUTED, GROUND, ACCENT, TOMATO          colours (CSS variables). TOMATO = var(--accent-a)
 *   labels(compact) -> { label, small }        font styles: 13 / 11.5 px, compact 15 / 13
 *   Street({ x, y, w, o? })                    ground hairline, w long from (x, y)
 *   pageLines(seed, n) -> PageLine[]           n ragged lines (len 0..1 of the text width), seeded
 *   Page({ x, y, w, lines, pad?, step?, bar? }) a light sheet, bottom edge at y (on the ground),
 *       lines are cut-outs. Each PageLine: { len, state?: "ink" | "dim" | "lit" | "dropped",
 *       k?: 0..1 (for "dropped": how far it has fallen; the rows close up as it goes),
 *       to?: { x, y } (for "dropped": where it lands, page coordinates) }
 *   pageHeight(lines, pad?, step?) -> number   the sheet's height at the current k values
 *   pageRowY(lines, i, y, pad?, step?, bar?) -> number   top of row i's bar, same page
 *   Gate({ x, y, w, lower?, drop?, teeth? })   solid comb hung from a hairline at x: a lintel of
 *       width w with teeth. y is the lintel's top when raised. lower 0..1 moves it down by drop.
 *       teeth: optional array of tooth lengths (default six of 24)
 *   Judge({ x, y, s?, aim?, k?, id, dim? })    a solid lamp on a stalk standing at (x, y) on the ground.
 *       aim: degrees, positive swings the head to the left (down-left at 25). k 0..1 how lit (accent
 *       glow + accent bulb). dim: a muted, unlit variant with no glow. id unique in the figure.
 *   judgeBulb({ x, y, s?, aim? }) -> { x, y }  where the judge's light lands, in figure units
 *
 * Numbers: none in these pieces. Callers choose lengths and state.
 */
import type { ReactNode } from "react";
import { q, rng } from "../_figure";

export const FG = "var(--foreground)";
export const MUTED = "var(--muted-foreground)";
export const GROUND = "var(--background)";
export const ACCENT = "var(--accent)";
export const TOMATO = "var(--accent-a)";

export const labels = (compact: boolean) => ({
  label: { fontFamily: "var(--font-sans)", fontSize: compact ? 15 : 13 } as const,
  small: { fontFamily: "var(--font-sans)", fontSize: compact ? 13 : 11.5 } as const,
});

/** The frame every figure in this post sits in (matches the other explainers). */
export function Frame({ children }: { children: ReactNode }) {
  return <div className="border border-border/60 bg-surface/40 p-3 md:p-5">{children}</div>;
}

/** A ground hairline, w long, from (x, y). */
export function Street({ x, y, w, o = 0.55 }: { x: number; y: number; w: number; o?: number }) {
  return <line x1={q(x)} x2={q(x + w)} y1={q(y)} y2={q(y)} stroke={FG} strokeOpacity={o} strokeWidth={1.25} />;
}

export type PageLine = {
  len: number;
  state?: "ink" | "dim" | "lit" | "dropped";
  k?: number;
  to?: { x: number; y: number };
};

/** n ragged lines for a page: most run near the full width, one in four or so stops short (a paragraph end). */
export function pageLines(seed: number, n: number): PageLine[] {
  const r = rng(seed + 101);
  return Array.from({ length: n }, (_, i) => {
    const end = r.chance(0.22) || i === n - 1;
    return { len: end ? r.range(0.3, 0.6) : r.range(0.84, 1) };
  });
}

/** Rows are one `step` tall; the sheet is `pad` above and below them. A dropped row shrinks as k rises. */
const rowH = (l: PageLine, step: number) => (l.state === "dropped" ? step * (1 - (l.k ?? 0)) : step);

/** The sheet's height for these lines, with dropped rows closed up as far as their k says. */
export function pageHeight(lines: PageLine[], pad = 14, step = 13) {
  return pad * 2 + lines.reduce((s, l) => s + rowH(l, step), 0);
}

/** The top of row i's bar (its cut-out), for a page standing with its bottom edge at y. */
export function pageRowY(lines: PageLine[], i: number, y: number, pad = 14, step = 13, bar = 5) {
  // rows are laid from the bottom up, so a dropped row pulls the rows above it down
  let below = 0;
  for (let j = i + 1; j < lines.length; j++) below += rowH(lines[j], step);
  return y - pad - below - step + (step - bar) / 2;
}

/**
 * A page: a solid light sheet, width w, standing with its bottom edge at y. Each line is a ground-
 * coloured bar cut out of the sheet. `lit` lines are cut in the accent, `dim` lines are faint, and
 * `dropped` lines fall out: the bar travels to `to` and the rows below it close up. For `lit`, k fades
 * the accent in (default 1).
 */
export function Page({ x, y, w, lines, pad = 14, step = 13, bar = 5, inset = 14 }: {
  x: number;
  y: number;
  w: number;
  lines: PageLine[];
  pad?: number;
  step?: number;
  bar?: number;
  inset?: number;
}) {
  const H = pageHeight(lines, pad, step);
  const top = y - H;
  const textW = w - inset * 2;
  return (
    <g>
      <rect x={q(x)} y={q(top)} width={q(w)} height={q(H)} fill={MUTED} />
      {lines.map((l, i) => {
        const by = pageRowY(lines, i, y, pad, step, bar);
        const lw = Math.max(2, textW * l.len);
        if (l.state === "dropped") {
          const k = l.k ?? 0;
          const to = l.to ?? { x: x - 30, y: y - bar };
          const f = k * k; // gravity: it speeds up as it goes
          const sx = x + inset; // it starts where its line is
          const px = sx + (to.x - sx) * k;
          const py = by + (to.y - by) * f;
          return (
            <rect key={i} x={q(px)} y={q(py)} width={q(lw)} height={bar} fill={FG} />
          );
        }
        const cut = l.state === "lit" ? ACCENT : GROUND;
        const op = l.state === "dim" ? 0.4 : 1;
        return (
          <g key={i}>
            <rect x={q(x + inset)} y={q(by)} width={q(lw)} height={bar} fill={GROUND} fillOpacity={op} />
            {l.state === "lit" && <rect x={q(x + inset)} y={q(by)} width={q(lw)} height={bar} fill={cut} fillOpacity={l.k ?? 1} />}
          </g>
        );
      })}
    </g>
  );
}

/**
 * A solid comb hung from a hairline at x. Lintel of width w; teeth hang from it at fixed, even
 * positions. `lower` 0..1 moves the whole comb down by `drop`. The hairline runs up to the top of the figure.
 */
export function Gate({ x, y, w, lower = 0, drop = 80, teeth }: {
  x: number;
  y: number;
  w: number;
  lower?: number;
  drop?: number;
  teeth?: number[];
}) {
  const lens = teeth ?? [24, 24, 24, 24, 24, 24];
  const n = lens.length;
  const cy = y + drop * lower;
  const tw = 6;
  const pitch = (w - tw) / (n - 1 || 1);
  const lintel = 9;
  return (
    <g>
      <line x1={q(x)} x2={q(x)} y1={0} y2={q(y)} stroke={FG} strokeOpacity={0.55} strokeWidth={1.25} />
      <rect x={q(x - w / 2)} y={q(cy)} width={q(w)} height={lintel} fill={FG} />
      {lens.map((len, i) => (
        <rect key={i} x={q(x - w / 2 + i * pitch)} y={q(cy + lintel)} width={tw} height={len} fill={FG} />
      ))}
    </g>
  );
}

/** The judge's light, in figure units: where its bulb sits for a stalk at (x, y) and a given aim. */
export function judgeBulb({ x, y, s = 1, aim = 0 }: { x: number; y: number; s?: number; aim?: number }) {
  const a = (aim * Math.PI) / 180;
  // the pivot is at the top of the stalk; the bulb hangs 50 units along the arm, swung by aim
  return { x: q(x - Math.sin(a) * 50 * s), y: q(y - 92 * s + Math.cos(a) * 50 * s) };
}

/**
 * A small solid lamp on a stalk, standing on the ground at (x, y). The head swings about the top of
 * the stalk by `aim` degrees (positive: to the left). `k` lights the bulb in the accent and spreads
 * a soft glow over what it points at. `dim` draws it unlit, in muted ink, with no glow.
 */
export function Judge({ x, y, s = 1, aim = 0, k = 0, id, dim = false }: {
  x: number;
  y: number;
  s?: number;
  aim?: number;
  k?: number;
  id: string;
  dim?: boolean;
}) {
  const ink = dim ? MUTED : FG;
  const b = judgeBulb({ x, y, s, aim });
  return (
    <g>
      {!dim && (
        <>
          <defs>
            <radialGradient id={id}>
              <stop offset="0" stopColor={ACCENT} stopOpacity={0.26 * k} />
              <stop offset="0.6" stopColor={ACCENT} stopOpacity={0} />
              <stop offset="1" stopColor={ACCENT} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={b.x} cy={b.y} r={q(170 * s)} fill={`url(#${id})`} />
        </>
      )}
      <g transform={`translate(${q(x)} ${q(y)}) scale(${s})`}>
        {/* foot and stalk */}
        <rect x={-12} y={-6} width={24} height={6} fill={ink} />
        <rect x={-3} y={-92} width={6} height={86} fill={ink} />
        {/* the head swings on the pivot: an arm, then a dome shade open at the bottom */}
        <g transform={`translate(0 -92) rotate(${aim})`}>
          <circle r={5} fill={ink} />
          <rect x={-2} y={-2} width={4} height={48} fill={ink} />
          <path d="M-16 46A16 16 0 0 1 16 46Z" fill={ink} />
          <circle cy={50} r={4} fill={ink} />
          {!dim && <circle cy={50} r={4} fill={ACCENT} fillOpacity={k} />}
        </g>
      </g>
    </g>
  );
}
