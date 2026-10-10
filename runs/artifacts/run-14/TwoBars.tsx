"use client";

// Two reported cases, not a trend. Each has a before bar and an after bar, the before bar is the
// baseline (1x). Kopp's after bar is 15x its before, so it is cut: the upper part sits apart on the
// break, and the figure says so. Pure Visibility's after bar is 1.85x and is drawn to scale.
import { Figure, defineFigure, cues, E, q } from "../_figure";
import { Frame, Street, labels, FG, MUTED } from "./world";

// Beats in seconds. Before bars rise, Kopp's after bar rises and is cut, then Pure's rises, then the words.
const C = cues({ before: [0.2, 1.0], kopp: [1.2, 2.4], cut: [2.4, 2.8], pure: [2.6, 3.4], words: [3.6, 4.2] });

const BAR = 56; // a bar's width at s = 1
const GAP = 8; // between a case's before and after bars
const BASE = 36; // the before bar, 1x
const PURE = 1.85 * BASE; // Pure Visibility's after bar, to scale
const KOPP_LOW = 96; // the part of Kopp's bar below the cut
const KOPP_GAP = 13; // the break in the bar
const KOPP_UP = 54; // the part above the cut

/** A zigzag line from x0 to x1 at height y, for the edge of a break. */
function zigzag(x0: number, x1: number, y: number, su: number) {
  const n = 8, step = (x1 - x0) / n;
  let d = `M${q(x0)} ${q(y)}`;
  for (let i = 1; i <= n; i++) d += `L${q(x0 + step * i)} ${q(y + (i % 2 ? -4 : 4) * su)}`;
  return d;
}

const spec = defineFigure({
  dur: 4.6,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 210 },
  setup: () => ({}),
  render: (t, _S, { W, H, compact }) => {
    const su = compact ? 0.72 : 1;
    const G = H - (compact ? 74 : 80); // the ground line
    const L = labels(compact);
    const bw = BAR * su, gap = GAP * su;

    const before = E.io2(C.p(t, "before"));
    const kopp = C.p(t, "kopp", E.io3);
    const cut = C.p(t, "cut", E.io2);
    const pure = C.p(t, "pure", E.io3);
    const words = C.p(t, "words", E.io2);

    // Each case: centre x, the name lines, the bars' heights and whether the after bar is cut.
    const cases = [
      { cx: W * 0.27, lines: ["Kopp Online Marketing,", "6 months:", "+1,400% visibility"], after: "kopp" as const },
      { cx: W * 0.73, lines: ["Pure Visibility,", "3 months:", "+85% organic traffic"], after: "pure" as const },
    ];

    return (
      <g>
        <defs>
          <clipPath id="eeat-two-bars-clip">
            <rect width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#eeat-two-bars-clip)">
          <Street x={0} y={G} w={W} />
          {cases.map((c) => {
            const bx = c.cx - gap / 2 - bw; // before bar, left edge
            const ax = c.cx + gap / 2; // after bar, left edge
            const bh = BASE * su * before;
            const lowH = KOPP_LOW * su;
            const upH = KOPP_UP * su;
            const brk = KOPP_GAP * su;
            const pH = PURE * su * pure;
            return (
              <g key={c.after}>
                {/* before: the 1x baseline */}
                <rect x={q(bx)} y={q(G - bh)} width={q(bw)} height={q(bh)} fill={MUTED} />
                <text x={q(bx + bw / 2)} y={G + 14 * su + (compact ? 4 : 2)} textAnchor="middle" {...L.small} fill={MUTED} opacity={words}>
                  before
                </text>
                {/* after */}
                {c.after === "pure" ? (
                  <rect x={q(ax)} y={q(G - pH)} width={q(bw)} height={q(pH)} fill={FG} />
                ) : (
                  <g>
                    {/* the part below the break, rising with the bar */}
                    <rect x={q(ax)} y={q(G - lowH * kopp)} width={q(bw)} height={q(lowH * kopp)} fill={FG} />
                    {/* the part above the break, sitting apart once the cut is made */}
                    <rect x={q(ax)} y={q(G - lowH - brk - upH * cut)} width={q(bw)} height={q(upH * cut)} fill={FG} />
                    {/* the two cut edges, zigzag, across the bar */}
                    <g opacity={cut} fill="none" stroke={FG} strokeWidth={1.5 * su}>
                      <path d={zigzag(ax - 5 * su, ax + bw + 5 * su, G - lowH, su)} />
                      <path d={zigzag(ax - 5 * su, ax + bw + 5 * su, G - lowH - brk, su)} />
                    </g>
                    <text x={q(ax + bw + 8 * su)} y={q(G - lowH - brk / 2 + 4)} {...L.small} fill={MUTED} opacity={cut}>
                      not to scale
                    </text>
                  </g>
                )}
                <text x={q(ax + bw / 2)} y={G + 14 * su + (compact ? 4 : 2)} textAnchor="middle" {...L.small} fill={MUTED} opacity={words}>
                  after
                </text>
                {/* the case, in words */}
                {c.lines.map((line, i) => (
                  <text
                    key={i}
                    x={q(c.cx)}
                    y={q(G + (compact ? 34 : 38) + i * (compact ? 18 : 19))}
                    textAnchor="middle"
                    {...L.label}
                    fill={i === 2 ? FG : MUTED}
                    opacity={words}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      </g>
    );
  },
});

export default function TwoBars() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
