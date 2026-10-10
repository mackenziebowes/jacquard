// THE READING ROOM - shared world for the prose-scrub 0.4 figures.
//
// Cast (all upright SVG, origin noted per piece; x, y are in the figure's viewBox, `s` scales about the origin):
//   Belt       a conveyor strip (horizontal or vertical) with ticks that can slide by `phase`.
//   Slip       a pale paper slip (paragraph or sentence) riding the belt: grey text bars, optional children text,
//              optional tomato `mark` (the gate's ink) and `flag` (a judge's flag). Origin = slip centre.
//   Gate       the stamping machine over the belt with a word-list stencil. It only INKS; `press` 0..1 lowers the stamp.
//              Origin = belt surface under the stamp (slip bottom).
//   Haiku      one of five identical small readers ("the Haikus") on a Bench. `raise` 0..1 lifts a card.
//              Origin = feet. Card is the number card they hold (blank glyph unless `value` is given).
//   Bench      the plank the Haikus stand on, with an optional label. Origin = plank centre top.
//   Mackenzie  the author, a taller line figure. `frown` 0..1, `tilt` degrees of head, `handUp` 0..1 and `card` for the hand.
//              Faces left (toward the belt). Origin = feet.
//   Scissors   the rewriter: scissors on an arm. `open` 0..1, `rot` degrees; `armFrom` is the absolute anchor of the arm.
//              Only the scissors cut. Origin = pivot.
//   Scrap      a little cut-off strip of paper (for what the scissors drop).
// Colours: ink (text, lines), dim (quiet lines), paper (slip fill), mark (tomato, sparingly), ok (emerald, one highlight).

import type { ReactNode } from "react";
import { q } from "../_figure";

export const INK = "var(--foreground)";
export const DIM = "color-mix(in oklab, var(--foreground) 45%, transparent)";
export const FAINT = "color-mix(in oklab, var(--foreground) 22%, transparent)";
export const PAPER = "color-mix(in oklab, var(--foreground) 11%, var(--background))";
export const PAPER_EDGE = "color-mix(in oklab, var(--foreground) 38%, transparent)";
export const BODY = "color-mix(in oklab, var(--foreground) 7%, var(--background))";
export const MARK = "var(--accent-a)";
export const OK = "var(--accent)";
export const MONO = "var(--font-mono), ui-monospace, monospace";

/** Slip sizes: normal for desktop, `big` when the slip carries readable text (also used in compact layouts). */
export const SLIP = { w: 148, h: 54, fs: 12 };
export const SLIP_BIG = { w: 186, h: 62, fs: 14 };
/** Mono character width as a fraction of font size, for laying text out in pieces. */
export const CH = 0.6;

const lineW = { fontFamily: MONO } as const;

export function Belt({ x, y, w, h, vertical = false, phase = 0 }: { x: number; y: number; w: number; h: number; vertical?: boolean; phase?: number }) {
  // x,y = top-left. Ticks slide along the long axis by `phase` (px).
  const gap = 22, n = Math.ceil((vertical ? h : w) / gap) + 1, off = ((phase % gap) + gap) % gap;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={BODY} stroke={FAINT} />
      {Array.from({ length: n }, (_, i) => {
        const d = i * gap + off - gap;
        if (d < 4 || d > (vertical ? h : w) - 4) return null;
        return vertical
          ? <line key={i} x1={x + 4} x2={x + w - 4} y1={q(y + d)} y2={q(y + d)} stroke={FAINT} strokeWidth={1} />
          : <line key={i} y1={y + 3} y2={y + h - 3} x1={q(x + d)} x2={q(x + d)} stroke={FAINT} strokeWidth={1} />;
      })}
    </g>
  );
}

export function Mark({ x, y, s = 1, k = 1 }: { x: number; y: number; s?: number; k?: number }) {
  // The gate's ink: a small tomato dash in a ring. k = 0..1 grows it.
  if (k <= 0) return null;
  return (
    <g transform={`translate(${q(x)} ${q(y)}) scale(${q(s * (0.6 + 0.4 * k), 3)})`} opacity={q(Math.min(1, k * 2))}>
      <circle r={9} fill="none" stroke={MARK} strokeWidth={1.8} />
      <line x1={-5} x2={5} y1={0} y2={0} stroke={MARK} strokeWidth={2.6} strokeLinecap="round" />
    </g>
  );
}

export function Flag({ x, y, s = 1, k = 1 }: { x: number; y: number; s?: number; k?: number }) {
  // A small tomato pennant on a pole; origin = foot of the pole. k = 0..1 raises it.
  if (k <= 0) return null;
  const h = 34 * k;
  return (
    <g transform={`translate(${q(x)} ${q(y)}) scale(${s})`}>
      <line x1={0} x2={0} y1={0} y2={q(-h)} stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
      <path d={`M0 ${q(-h)} L${q(16 * k)} ${q(-h + 6 * k)} L0 ${q(-h + 12 * k)} Z`} fill={MARK} />
    </g>
  );
}

export function Slip({ x, y, w = SLIP.w, h = SLIP.h, rot = 0, bars = [0.8, 0.62, 0.72], barsOpacity = 1, mark = 0, flag = 0, opacity = 1, children }: {
  x: number; y: number; w?: number; h?: number; rot?: number; bars?: number[]; barsOpacity?: number; mark?: number; flag?: number; opacity?: number; children?: ReactNode;
}) {
  const pad = 14, n = bars.length, step = n > 1 ? (h - 2 * 14) / (n - 1) : 0;
  return (
    <g transform={`translate(${q(x)} ${q(y)})${rot ? ` rotate(${q(rot)})` : ""}`} opacity={opacity}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} fill={PAPER} stroke={PAPER_EDGE} strokeWidth={1} />
      {bars.map((b, i) => (
        <line key={i} x1={-w / 2 + pad} x2={q(-w / 2 + pad + (w - 2 * pad) * b)} y1={q(-h / 2 + 14 + i * step)} y2={q(-h / 2 + 14 + i * step)}
          stroke={DIM} strokeWidth={3.5} strokeLinecap="round" opacity={barsOpacity} />
      ))}
      {children}
      <Mark x={0} y={q(-h / 2 + 14)} k={mark} />
      <Flag x={q(w / 2 - 12)} y={q(-h / 2 + 2)} k={flag} />
    </g>
  );
}

export function Scrap({ x, y, w, h = 18, rot = 0, opacity = 1, children }: { x: number; y: number; w: number; h?: number; rot?: number; opacity?: number; children?: ReactNode }) {
  // x,y = centre of a cut-off strip of paper.
  return (
    <g transform={`translate(${q(x)} ${q(y)})${rot ? ` rotate(${q(rot)})` : ""}`} opacity={q(opacity)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2} fill={PAPER} stroke={PAPER_EDGE} strokeWidth={1} />
      {children}
    </g>
  );
}

export function Gate({ x, y, s = 1, press = 0, width = 190, label = "gate", fs = 12 }: { x: number; y: number; s?: number; press?: number; width?: number; label?: string; fs?: number }) {
  // Origin = belt surface under the stamp. Posts at +-width/2, crossbeam at 130 up, a stencil plate on a rod.
  const half = width / 2, top = -128;
  const headY = -92 + 36 * press; // plate underside travels from hovering to touching the slip top (54 above the belt)
  return (
    <g transform={`translate(${q(x)} ${q(y)}) scale(${s})`}>
      <line x1={-half} x2={-half} y1={0} y2={top} stroke={DIM} strokeWidth={3} strokeLinecap="round" />
      <line x1={half} x2={half} y1={0} y2={top} stroke={DIM} strokeWidth={3} strokeLinecap="round" />
      <rect x={-half - 6} y={top - 16} width={width + 12} height={18} rx={4} fill={PAPER} stroke={PAPER_EDGE} />
      <text x={0} y={top - 3} textAnchor="middle" fontSize={fs} fill={INK} style={{ fontFamily: MONO }}>{label}</text>
      <line x1={0} x2={0} y1={top + 2} y2={q(headY - 12)} stroke={DIM} strokeWidth={3} />
      <g transform={`translate(0 ${q(headY)})`}>
        <rect x={-24} y={-12} width={48} height={12} rx={2} fill={PAPER} stroke={INK} strokeWidth={1.2} />
        {/* stencil: the word list cut into the plate */}
        {[-15, -5, 5, 15].map((c) => <rect key={c} x={c - 3} y={-8} width={6} height={4} rx={1} fill={BODY} />)}
      </g>
    </g>
  );
}

export function Card({ x, y, s = 1, value, w = 22, h = 17 }: { x: number; y: number; s?: number; value?: string; w?: number; h?: number }) {
  // Origin = bottom-centre of the card (where the hand grips). With no `value` it shows a plain bar.
  return (
    <g transform={`translate(${q(x)} ${q(y)}) scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={2.5} fill="var(--foreground)" opacity={0.9} />
      {value
        ? <text x={0} y={-h / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--background)" style={lineW}>{value}</text>
        : <line x1={-w / 2 + 6} x2={w / 2 - 6} y1={-h / 2} y2={-h / 2} stroke="var(--background)" strokeWidth={3} strokeLinecap="round" />}
    </g>
  );
}

export function Bench({ x, y, w, label, fs = 11 }: { x: number; y: number; w: number; label?: string; fs?: number }) {
  // x,y = centre of the plank's top edge.
  return (
    <g>
      <rect x={q(x - w / 2)} y={y} width={w} height={14} rx={3} fill={PAPER} stroke={PAPER_EDGE} />
      {label && <text x={x} y={y + 11} textAnchor="middle" fontSize={fs} fill={INK} style={lineW}>{label}</text>}
    </g>
  );
}

export function Haiku({ x, y, s = 1, raise = 0, card = true, value }: { x: number; y: number; s?: number; raise?: number; card?: boolean; value?: string }) {
  // One small identical reader. Origin = feet. A card rides the raised hand.
  const hand = { x: 11, y: -12 - 40 * raise };
  return (
    <g transform={`translate(${q(x)} ${q(y)}) scale(${s})`}>
      <path d="M-9 0 L-7 -28 Q0 -33 7 -28 L9 0 Z" fill={BODY} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <line x1={-6} x2={-6} y1={-28} y2={-14} stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
      <line x1={7} y1={-26} x2={q(hand.x)} y2={q(hand.y)} stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
      <circle cx={0} cy={-39} r={8} fill={BODY} stroke={INK} strokeWidth={1.4} />
      <circle cx={-3} cy={-40} r={1.1} fill={INK} /><circle cx={3} cy={-40} r={1.1} fill={INK} />
      {card && raise > 0.02 && <Card x={hand.x} y={hand.y - 1} value={value} />}
    </g>
  );
}

export function Mackenzie({ x, y, s = 1, frown = 0, tilt = 0, handUp = 0, card, standing = true }: { x: number; y: number; s?: number; frown?: number; tilt?: number; handUp?: number; card?: ReactNode; standing?: boolean }) {
  // The author. Origin = feet, about 190 tall, facing left. frown/tilt are meant to stay slight.
  const lh = { x: -26 + 6 * handUp, y: -92 - 50 * handUp }; // left (belt-side) hand
  const mouthY = -149, mouth = `M-9 ${mouthY + 3 * frown} Q-5 ${q(mouthY - 3 * frown + 1.5)} -1 ${mouthY + 3 * frown}`;
  void standing;
  return (
    <g transform={`translate(${q(x)} ${q(y)}) scale(${s})`} stroke={INK} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <line x1={-6} y1={-88} x2={-9} y2={0} /><line x1={6} y1={-88} x2={9} y2={0} />
      <line x1={-11} y1={0} x2={-3} y2={0} /><line x1={5} y1={0} x2={13} y2={0} />
      <path d="M-14 -138 Q0 -146 14 -138 L11 -86 L-11 -86 Z" fill={BODY} />
      <path d={`M-12 -134 L${q(lh.x)} ${q(lh.y)}`} />
      <line x1={12} y1={-134} x2={16} y2={-94} />
      {card && <g transform={`translate(${q(lh.x)} ${q(lh.y)})`} stroke="none">{card}</g>}
      <g transform={`rotate(${q(tilt)} 0 -140)`}>
        <circle cx={0} cy={-154} r={13} fill="var(--background)" />
        <g strokeWidth={1.6}>
          <circle cx={-6} cy={-157} r={1} fill={INK} stroke="none" /><circle cx={3} cy={-157} r={1} fill={INK} stroke="none" />
          <line x1={q(-9)} y1={q(-162 + 1.6 * frown)} x2={q(-3)} y2={q(-162 - 0.6 * frown)} opacity={q(frown)} />
          <path d={mouth} transform="translate(0 -3)" />
        </g>
      </g>
    </g>
  );
}

export function Scissors({ x, y, s = 1, open = 0, rot = 0, armFrom }: { x: number; y: number; s?: number; open?: number; rot?: number; armFrom?: [number, number] }) {
  // The rewriter. Origin = pivot; blades point down, finger loops up. Only these cut.
  const a = 6 + 14 * open;
  const half = (sign: number) => (
    <g transform={`rotate(${q(sign * a)})`}>
      <path d="M0 -3 L-4.5 3 L-1.5 44 L1 44 L4 3 Z" transform={`scale(${sign} 1)`} fill="var(--background)" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d={`M0 -3 L${sign * 4} -22`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <ellipse cx={sign * 6} cy={-31} rx={6.5} ry={9} transform={`rotate(${sign * 10} ${sign * 6} -31)`} fill="none" stroke={INK} strokeWidth={2.6} />
    </g>
  );
  return (
    <g>
      {armFrom && <line x1={armFrom[0]} y1={armFrom[1]} x2={q(x)} y2={q(y - 28 * s)} stroke={DIM} strokeWidth={3} strokeLinecap="round" />}
      <g transform={`translate(${q(x)} ${q(y)}) rotate(${q(rot)}) scale(${q(s * 0.72)})`}>
        {half(-1)}{half(1)}
        <circle r={2.4} fill={INK} />
      </g>
    </g>
  );
}
