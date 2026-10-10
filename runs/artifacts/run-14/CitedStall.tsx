"use client";

// Authoritativeness is reputation: other people point at you. A market street with one real stall in
// the middle and four things that can point at it (a newspaper, a directory board, a chamber plaque,
// a star-review card). Each sends a line to the stall in turn, and the stall lights as they arrive.
// A customer asks a passer-by who's good, and the passer-by points at it. The stall at the far left,
// that nobody points to, stays dim.
import { Figure, defineFigure, cues, E, P, lerpPose, stand, makeBody, link, drawOn, q, type Pt } from "../_figure";
import { Frame, Street, Stall, Lantern, Person, labels, FG, MUTED, PAPER, ACCENT, LINE } from "./world";

// Beats in seconds. Each pointer sends its line in POINT_S, the stall lights as each lands, then the
// customer asks and the passer-by points.
const C = cues({ ask: [4.5, 4.9], point: [5.3, 5.9] });
const SEND = [0.6, 1.6, 2.6, 3.6]; // when each pointer starts its line
const TRAVEL = 0.7; // seconds for a line to reach the stall

// Layout in wide units (px at s = 1). Phone units are the same layout at K, with a margin.
const WIDE = { W: 640, H: 300, k: 1, ox: 0 };
const NARROW = { W: 360, H: 230, k: 0.56, ox: 24 };
const GROUND_PAD = 34; // wide: ground line this far above the bottom
const GROUND_PAD_N = 16;
const LONE = 12; // the stall nobody points to, left edge
const REAL = 286; // the stall that gets pointed to, left edge
const CUST = 262, PASS = 420; // customer and passer-by, centres

const spec = defineFigure({
  dur: 6.4,
  size: { W: WIDE.W, H: WIDE.H },
  compact: { W: NARROW.W, H: NARROW.H },
  setup: () => ({
    keeper: makeBody(7),
    customer: makeBody(22),
    passer: makeBody(11),
  }),
  render: (t, S, { W, H, compact }) => {
    const { k, ox } = compact ? NARROW : WIDE;
    const G = H - (compact ? GROUND_PAD_N : GROUND_PAD);
    const X = (u: number) => ox + u * k; // wide x to px
    const Y = (v: number) => G - v * k; // height above the ground, wide units, to px
    const L = labels(compact);

    // The four pointers: where each one sits and where its line starts.
    const target: Pt = { x: X(REAL + 50), y: Y(138) };
    const pointers: { at: Pt; draw: "news" | "board" | "plaque" | "card" }[] = [
      { at: { x: X(168), y: Y(52) }, draw: "news" },
      { at: { x: X(236), y: Y(76) }, draw: "board" },
      { at: { x: X(440), y: Y(100) }, draw: "plaque" },
      { at: { x: X(512), y: Y(88) }, draw: "card" },
    ];

    // Light: each landed line adds a quarter of the stall's light.
    const landed = SEND.map((s) => P(t, s + TRAVEL, s + TRAVEL + 0.3));
    const lit = landed.reduce((a, b) => a + b, 0) / SEND.length;
    const litE = E.io2(lit);

    // The passer-by turns to point once the question is asked.
    const point = E.io2(P(t, C.at("point"), C.at("point") + 0.6));
    const passJ = lerpPose(stand(S.passer), stand(S.passer, Math.PI / 2), point);

    const bubble = P(t, C.at("ask"), C.at("ask") + 0.25);
    const bw = 100 * k, bh = 26 * k;
    const bx = X(200) - bw / 2; // up and to the left of the customer's head, clear of the sign
    const by = Y(130) - bh / 2;

    return (
      <g>
        <Street x={0} y={G} w={W} />
        {/* the lone stall, never pointed to: grey, dim the whole time */}
        <Stall x={X(LONE)} y={G} s={k} variant="template" o={0.3} />
        <text x={X(LONE + 50)} y={Y(160)} textAnchor="middle" {...L.small} fill={MUTED} opacity={0.9}>
          no one points
        </text>

        {/* the glow and the lines go behind the stall they point to */}
        <ellipse cx={q(X(REAL + 50))} cy={q(G + 1)} rx={q(120 * k)} ry={q(7 * k)} fill={ACCENT} opacity={0.16 * litE} />
        <Lantern x={X(REAL + 50)} y={Y(178)} s={k} k={litE} id="eeat-cited-glow" />

        {pointers.map((p, i) => {
          const start = SEND[i];
          const ln = link(p.at, target, E.io2(P(t, start, start + TRAVEL)), { bend: 0.45 });
          const travelling = t > start && t < start + TRAVEL;
          return (
            <g key={i}>
              <path d={ln.d} fill="none" stroke={FG} strokeOpacity={0.5} strokeWidth={1.25} {...drawOn(E.io2(P(t, start, start + TRAVEL)))} />
              {travelling && <circle cx={ln.bead.x} cy={ln.bead.y} r={q(3.5 * k + 1)} fill={ACCENT} />}
            </g>
          );
        })}

        <Stall x={X(REAL)} y={G} s={k} variant="real" sign="Pell's Mending" keeper={{ body: S.keeper }} o={0.3 + 0.7 * litE} />

        {/* the four pointers, drawn plain in ink */}
        <Newspaper cx={X(168)} G={G} k={k} />
        <Board cx={X(236)} G={G} k={k} />
        <Plaque cx={X(440)} G={G} k={k} />
        <StarCard cx={X(512)} G={G} k={k} />

        {/* a customer asks, a passer-by points at the stall */}
        <Person x={X(CUST)} y={G + 16 * k} s={0.19 * k} body={S.customer} J={stand(S.customer)} />
        <g opacity={bubble}>
          <rect x={q(bx)} y={q(by)} width={q(bw)} height={q(bh)} rx={4} fill={PAPER} {...LINE} strokeWidth={1.25} />
          <text x={q(X(200))} y={q(by + bh / 2 + 5 * k)} textAnchor="middle" {...L.small} fill={FG}>
            who&apos;s good?
          </text>
        </g>
        <Person x={X(PASS)} y={G + 16 * k} s={0.19 * k} body={S.passer} J={passJ} flip />
      </g>
    );
  },
});

/** A star for the review card, centre (x, y), radius r. */
function star(x: number, y: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    pts.push(`${q(x + Math.cos(a) * rr)},${q(y + Math.sin(a) * rr)}`);
  }
  return pts.join(" ");
}

/** A newspaper box on the ground, its masthead and columns in ink. */
function Newspaper({ cx, G, k }: { cx: number; G: number; k: number }) {
  return (
    <g>
      <rect x={q(cx - 17 * k)} y={q(G - 46 * k)} width={q(34 * k)} height={q(46 * k)} fill={PAPER} {...LINE} strokeWidth={1.25} />
      <rect x={q(cx - 13 * k)} y={q(G - 40 * k)} width={q(26 * k)} height={q(6 * k)} fill={FG} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={q(cx - 11 * k)} y={q(G - (29 - i * 7) * k)} width={q(22 * k)} height={q(2 * k)} fill={FG} fillOpacity={0.7} />
      ))}
    </g>
  );
}

/** A freestanding directory board on two posts, with its listings. */
function Board({ cx, G, k }: { cx: number; G: number; k: number }) {
  return (
    <g>
      <path d={`M${q(cx - 16 * k)} ${q(G)}V${q(G - 22 * k)}M${q(cx + 16 * k)} ${q(G)}V${q(G - 22 * k)}`} stroke={FG} strokeWidth={2} />
      <rect x={q(cx - 27 * k)} y={q(G - 70 * k)} width={q(54 * k)} height={q(48 * k)} fill={PAPER} {...LINE} strokeWidth={1.25} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={q(cx - 21 * k)} y={q(G - (63 - i * 8) * k)} width={q(42 * k)} height={q(3 * k)} fill={FG} fillOpacity={0.7} />
      ))}
    </g>
  );
}

/** A chamber of commerce plaque on a short post. */
function Plaque({ cx, G, k }: { cx: number; G: number; k: number }) {
  return (
    <g>
      <path d={`M${q(cx)} ${q(G)}V${q(G - 64 * k)}`} stroke={FG} strokeWidth={2} />
      <rect x={q(cx - 26 * k)} y={q(G - 94 * k)} width={q(52 * k)} height={q(30 * k)} fill={PAPER} {...LINE} strokeWidth={1.25} />
      <circle cx={q(cx)} cy={q(G - 79 * k)} r={q(6 * k)} fill="none" stroke={FG} strokeWidth={1.25} />
      <path d={`M${q(cx - 15 * k)} ${q(G - 70 * k)}H${q(cx + 15 * k)}`} stroke={FG} strokeWidth={1.25} />
    </g>
  );
}

/** A review card with five stars, on a stand. */
function StarCard({ cx, G, k }: { cx: number; G: number; k: number }) {
  return (
    <g>
      <path d={`M${q(cx)} ${q(G)}V${q(G - 22 * k)}`} stroke={FG} strokeWidth={2} />
      <rect x={q(cx - 23 * k)} y={q(G - 82 * k)} width={q(46 * k)} height={q(58 * k)} fill={PAPER} {...LINE} strokeWidth={1.25} />
      {[-18, -9, 0, 9, 18].map((dx) => (
        <polygon key={dx} points={star(cx + dx * k, G - 54 * k, 4.2 * k)} fill={FG} />
      ))}
    </g>
  );
}

export default function CitedStall() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
