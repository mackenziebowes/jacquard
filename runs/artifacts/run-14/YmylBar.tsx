"use client";

// Two gates on the same street. The low bar ("hiking trails") is a hop for anyone who has walked the
// trail. The high bar ("which medication") is out of reach for the same walker, who stops, hops short
// and leaves. A walker with a licence badge comes in from the right and goes over it.
import { Figure, defineFigure, cues, E, P, gait, stand, lerp, clamp, makeBody, BODY_HEIGHT, q } from "../_figure";
import { Frame, Street, Person, labels, FG, MUTED, PAPER, ACCENT } from "./world";

// Beats in seconds. The walker is sent off at 5.4s, the licensed walker's badge lights at 8.0s.
const C = cues({ no: [5.4, 5.9], lit: [8.0, 8.5], chip: [8.3, 8.8] });

const experienced = makeBody(31);
const licensed = makeBody(32);

// A segment of the walk: from x0 to x1 between times a and b. A hop lifts the walker by `hop` px at its middle.
type Seg = { a: number; b: number; x0: number; x1: number; flip: boolean; hop?: number };

// Where a walker is at time t, along its segments.
function trace(t: number, segs: Seg[], stride: number) {
  let x = segs[0].x0, y = 0, flip = segs[0].flip, moving = false, air = false, phase = 0;
  for (const s of segs) {
    if (t < s.a) break;
    x = lerp(s.x0, s.x1, clamp((t - s.a) / (s.b - s.a)));
    flip = s.flip;
    if (t < s.b) {
      const u = clamp((t - s.a) / (s.b - s.a));
      y = s.hop ? s.hop * Math.sin(Math.PI * u) : 0;
      air = !!s.hop;
      moving = !s.hop && s.x0 !== s.x1;
      phase = (2 * Math.PI * Math.abs(x - s.x0)) / stride;
      break;
    }
    y = 0;
  }
  return { x, y, flip, moving, air, phase };
}

/** A high-jump bar on two posts, its feet at (cx, G). h is the bar's height above the ground. */
function Gate({ cx, G, h, o = 1 }: { cx: number; G: number; h: number; o?: number }) {
  const hw = 22;
  return (
    <g opacity={o}>
      <path d={`M${q(cx - hw)} ${q(G)}V${q(G - h - 10)}M${q(cx + hw)} ${q(G)}V${q(G - h - 10)}`} stroke={FG} strokeWidth={2} />
      <path d={`M${q(cx - hw)} ${q(G - h)}H${q(cx + hw)}`} stroke={FG} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
}

const spec = defineFigure({
  dur: 9.5,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 210 },
  setup: () => ({}),
  render: (t, _S, { W, H, compact }) => {
    const u = W / 640;
    const PH = compact ? 80 : 118; // a walker's height in px
    const s = PH / BODY_HEIGHT;
    const G = compact ? 176 : H - 38; // the ground line
    const stride = 0.45 * PH;
    const gA = 0.27 * W, gB = 0.7 * W; // gate centres
    const hLow = 0.4 * PH, hHigh = 1.0 * PH; // the bars
    const L = labels(compact);

    // The experienced walker: over the low gate, then up to the high one, a short hop, and back out left.
    const A = trace(t, [
      { a: 0, b: 1.6, x0: -40 * u, x1: gA - 44, flip: false },
      { a: 1.6, b: 2.5, x0: gA - 44, x1: gA + 44, flip: false, hop: 0.6 * PH },
      { a: 2.5, b: 4.2, x0: gA + 44, x1: gB - 44, flip: false },
      { a: 4.2, b: 4.7, x0: gB - 44, x1: gB - 44, flip: false },
      { a: 4.7, b: 5.4, x0: gB - 44, x1: gB - 44, flip: false, hop: 0.45 * PH },
      { a: 5.4, b: 7.5, x0: gB - 44, x1: -60 * u, flip: true },
    ], stride);

    // The licensed walker: in from the right, over the high gate (leftwards), then stops.
    const B = trace(t, [
      { a: 5.4, b: 7.1, x0: W + 40, x1: gB + 44, flip: true },
      { a: 7.1, b: 8.0, x0: gB + 44, x1: gB - 44, flip: true, hop: 1.2 * PH },
      { a: 8.0, b: 9.5, x0: gB - 44, x1: gB - 44, flip: true },
    ], stride);

    const pose = (w: typeof A, body: typeof experienced) =>
      w.air ? stand(body, 2.4) : w.moving ? gait(body, w.phase) : stand(body);

    const lit = C.p(t, "lit", E.io3);
    const chip = C.p(t, "chip", E.io2);
    const no = P(t, C.at("no"), C.at("no") + 0.4);
    const chipW = compact ? 56 : 64, chipH = compact ? 18 : 20;

    return (
      <g>
        <defs>
          <clipPath id="ymyl-bar-clip">
            <rect width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#ymyl-bar-clip)">
          <Street x={0} y={G} w={W} />
          <Gate cx={gA} G={G} h={hLow} />
          <Gate cx={gB} G={G} h={hHigh} />
          <text x={gA} y={G + (compact ? 16 : 20)} textAnchor="middle" {...L.label} fill={MUTED}>hiking trails</text>
          <text x={gB} y={G + (compact ? 16 : 20)} textAnchor="middle" {...L.label} fill={MUTED}>which medication</text>

          {/* the experienced walker: boots, no badge */}
          <Person x={A.x} y={G - A.y} s={s} body={experienced} J={pose(A, experienced)} flip={A.flip} />

          {/* the licensed walker, with a badge on the chest that lights */}
          <Person x={B.x} y={G - B.y} s={s} body={licensed} J={pose(B, licensed)} flip={B.flip}>
            <rect x={6} y={-152} width={40} height={50} rx={4} fill={PAPER} stroke={FG} strokeWidth={7} />
            <rect x={16} y={-140} width={20} height={22} fill={ACCENT} fillOpacity={0.15 + 0.85 * lit} />
            <path d="M18 -106H34" stroke={FG} strokeWidth={6} />
          </Person>

          {/* the mark over the high bar where the first walker stops */}
          <text x={gB} y={G - hHigh - 16} textAnchor="middle" {...L.label} fill={MUTED} opacity={no}>no</text>

          {/* a chip over the licensed walker once the badge lights */}
          <g opacity={chip} transform={`translate(${q(B.x - chipW / 2)} ${q(G - PH - 36)})`}>
            <rect width={chipW} height={chipH} rx={4} fill={PAPER} stroke={ACCENT} strokeWidth={1.25} />
            <text x={chipW / 2} y={chipH / 2 + 4} textAnchor="middle" {...L.small} fill={FG}>licence</text>
          </g>
        </g>
      </g>
    );
  },
});

export default function YmylBar() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
