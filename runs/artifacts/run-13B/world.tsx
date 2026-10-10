// The desk for prose-scrub 0.4. Every figure in this post imports from here, so the page, gate,
// reader, person and rewriter look the same in each one. Import as `from "./world"`.
//
// Work in the figure's viewBox units (the figure's `size`, or `compact` below 480px). Each part is
// an SVG <g>, so put it inside a figure's render(). Colours are CSS variables applied with `style`,
// so they follow light and dark mode. Do not pass colours in; use the palette.
//
// PALETTE (strings for style={{ fill }} / style={{ stroke }})
//   INK     var(--foreground)        cast outlines, live words
//   MUTED   var(--muted-foreground)  the page's bars, labels, idle paths
//   FAINT   var(--border)            the desk line
//   FLAG    var(--accent-a)          the one accent: anything flagged
//
// PARTS
//   <TextLine x y w state? words? dim? />
//       One line of the page: a rounded bar 13 units tall, w wide, top-left at (x, y).
//       state: "plain" (default) | "flag" (the gate caught it: solid accent) | "judge" (the reader
//         flagged it: accent outline with an accent tick at its left)
//       words: short text on the bar, 12 units, about 7 units a character. Keep it under
//         (w - 12) / 7 characters, e.g. "a testament to" needs w >= 110.
//       dim: 0..1 opacity, for lines that have been cut.
//   <Gate x top bottom notches? />
//       The word list: a vertical comb at x (16 wide), from top to bottom. notches is
//       { y, lit? }[], a tooth on the gate's left face at height y (use the centre of the line row
//       it catches). lit 0..1 turns the tooth accent (1 = just snagged, 0.5 = still holding).
//   <Reader x y r? lamp? />
//       Claude Haiku: a round lens-bot on a stalk. Its lamp sits at readerLamp(x, y, r).
//       lamp 0..1 is the eye's brightness. Blink it by driving lamp from your figure's time.
//       r defaults to 15. Use readerLamp to aim a beam or start a link from the lamp.
//   readerLamp(x, y, r) -> { x, y }   the lamp's point.
//   <Person x ground h? lift? />
//       Mackenzie, the one who decides. x is the hip's centre, ground is the y of his feet, h is
//       his height in units (about 200 at desktop, 140 at compact). He faces left, towards the
//       page. lift 0..1 raises his near arm (0 = arms down, 1 = arm out and forward, to point).
//   personHead(x, ground, h) -> { x, y }   the centre of his head, for links and labels.
//   <Rewriter x base s? reach? tip? />   (the arm is straight; it doesn't fold)
//       The rewriter: a small scribe bot with one long pen-arm (a fresh subagent per file).
//       x is its centre, base the floor y, s the scale (1 desktop, about 0.8 compact),
//       reach the arm's longest stretch in units (175 desktop, 240 compact reaches the caught lines).
//       tip is where the pen goes, { x, y }. Without it the pen rests on the desk. The arm is a
//       straight pen-arm: it stretches to the tip, up to reach.
//       rewriterRest(x, base, s) -> { x, y } is the resting tip.
//   <Ground x1 x2 y />
//       The desk line.
//   <Label x y anchor? size? children />
//       A short label in MUTED. anchor "start" | "middle" | "end", size default 12.5.
//
// PEOPLE. `PERSON_SEED` is the one seed for Mackenzie. Do not change it, or he changes between figures.

import { makeBody, groundOf, stand, lerpPose, personPaths, BODY_HEIGHT, q } from "../_figure";

export const INK = "var(--foreground)";
export const MUTED = "var(--muted-foreground)";
export const FAINT = "var(--border)";
export const FLAG = "var(--accent-a)";

export const PERSON_SEED = 7;
const body = makeBody(PERSON_SEED);

/* ---------- the page ---------- */

export function TextLine({ x, y, w, state = "plain", words, dim = 1 }: { x: number; y: number; w: number; state?: "plain" | "flag" | "judge"; words?: string; dim?: number }) {
  const H = 13;
  const flag = state === "flag", judge = state === "judge";
  return (
    <g opacity={q(dim, 3)}>
      <rect
        x={q(x)} y={q(y)} width={q(w)} height={H} rx={H / 2}
        style={{ fill: flag ? FLAG : MUTED, fillOpacity: flag ? 0.85 : 0.3, stroke: judge ? FLAG : undefined }}
        strokeWidth={judge ? 1.6 : undefined}
      />
      {judge && <rect x={q(x - 7)} y={q(y)} width={3} height={H} rx={1.5} style={{ fill: FLAG }} />}
      {words && <text x={q(x + 6)} y={q(y + 10)} fontSize={12} style={{ fill: INK }}>{words}</text>}
    </g>
  );
}

/* ---------- the gate ---------- */

export function Gate({ x, top, bottom, notches = [] }: { x: number; top: number; bottom: number; notches?: { y: number; lit?: number }[] }) {
  return (
    <g>
      <rect x={q(x - 8)} y={q(top)} width={16} height={q(bottom - top)} rx={3} fill="none" style={{ stroke: INK }} strokeWidth={1.5} />
      {notches.map((n, i) => (
        <path
          key={i}
          d={`M${q(x - 8)} ${q(n.y - 5)}L${q(x - 19)} ${q(n.y)}L${q(x - 8)} ${q(n.y + 5)}Z`}
          style={{ fill: FLAG, fillOpacity: q(n.lit ?? 0, 3), stroke: INK }}
          strokeWidth={1.2}
        />
      ))}
    </g>
  );
}

/* ---------- the reader ---------- */

export const readerLamp = (x: number, y: number, r = 15) => ({ x, y: y - r - 6 });

export function Reader({ x, y, r = 15, lamp = 0.25 }: { x: number; y: number; r?: number; lamp?: number }) {
  const L = readerLamp(x, y, r);
  return (
    <g>
      <line x1={q(x)} y1={q(y - r)} x2={q(L.x)} y2={q(L.y + 4)} style={{ stroke: INK }} strokeWidth={1.4} />
      <circle cx={q(x)} cy={q(y)} r={r} fill="none" style={{ stroke: INK }} strokeWidth={1.5} />
      <circle cx={q(x)} cy={q(y + 1)} r={q(r * 0.45)} style={{ fill: INK, fillOpacity: q(0.12 + 0.3 * lamp) }} />
      <circle cx={q(L.x)} cy={q(L.y)} r={4} style={{ fill: INK, fillOpacity: q(0.2 + 0.8 * lamp), stroke: INK }} strokeWidth={1} />
    </g>
  );
}

/* ---------- Mackenzie ---------- */

// The body's lowest point, so the feet sit on `ground` whatever the pose.
const lowY = (J: ReturnType<typeof stand>) => Math.max(J.anF[1], J.toF[1], J.anB[1], J.toB[1]);

export function personHead(x: number, ground: number, h: number) {
  const s = h / BODY_HEIGHT, J = stand(body);
  return { x: q(x - J.head[0] * s), y: q(ground + (J.head[1] - lowY(J)) * s) };
}

export function Person({ x, ground, h, lift = 0 }: { x: number; ground: number; h: number; lift?: number }) {
  const s = h / BODY_HEIGHT;
  const J = lift > 0 ? lerpPose(stand(body), stand(body, 1.1), lift) : stand(body);
  const P = personPaths(J, body);
  const y = ground - lowY(J) * s;
  return (
    <g transform={`translate(${q(x)} ${q(y)}) scale(${q(-s, 4)} ${q(s, 4)})`}>
      <path d={P.far} style={{ fill: INK, fillOpacity: 0.25 }} />
      <path d={P.body} style={{ fill: INK, fillOpacity: 0.6 }} />
      <path d={P.near} style={{ fill: INK, fillOpacity: 0.6 }} />
    </g>
  );
}

/* ---------- the rewriter ---------- */

export const rewriterRest = (x: number, base: number, s = 1) => ({ x: x + 30 * s, y: base - 20 * s });

export function Rewriter({ x, base, s = 1, reach = 175, tip }: { x: number; base: number; s?: number; reach?: number; tip?: { x: number; y: number } }) {
  const sh = { x: x - 8 * s, y: base - 34 * s };
  const target = tip ?? rewriterRest(x, base, s);
  // A straight pen-arm: it stretches to the target, up to `reach`.
  const d = Math.hypot(target.x - sh.x, target.y - sh.y), k = Math.min(1, reach / Math.max(d, 1));
  const p = { x: sh.x + (target.x - sh.x) * k, y: sh.y + (target.y - sh.y) * k };
  return (
    <g>
      <rect x={q(x - 12 * s)} y={q(base - 42 * s)} width={q(24 * s)} height={q(42 * s)} rx={q(8 * s)} fill="none" style={{ stroke: INK }} strokeWidth={1.5} />
      <circle cx={q(x)} cy={q(base - 58 * s)} r={q(11 * s)} fill="none" style={{ stroke: INK }} strokeWidth={1.5} />
      <circle cx={q(x + 3 * s)} cy={q(base - 58 * s)} r={q(2 * s)} style={{ fill: INK }} />
      <line x1={q(sh.x)} y1={q(sh.y)} x2={q(p.x)} y2={q(p.y)} style={{ stroke: INK }} strokeWidth={2.2} strokeLinecap="round" />
      <circle cx={q(p.x)} cy={q(p.y)} r={2} style={{ fill: INK }} />
    </g>
  );
}

/* ---------- the set ---------- */

export function Ground({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return <line x1={q(x1)} y1={q(y)} x2={q(x2)} y2={q(y)} style={{ stroke: FAINT }} strokeWidth={1} />;
}

export function Label({ x, y, anchor = "start", size = 12.5, children }: { x: number; y: number; anchor?: "start" | "middle" | "end"; size?: number; children: string }) {
  return <text x={q(x)} y={q(y)} textAnchor={anchor} fontSize={size} style={{ fill: MUTED }}>{children}</text>;
}
