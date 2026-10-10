"use client";

// Two photos are pinned to a board. A rater's lens passes over the stock one, a handshake with a
// watermark across it, and doesn't stop. It moves on to the keeper's own photo: the dock, with the
// tide mark chalked on the post. The tick lands and the frame lights. Only first-hand work gets the stop.
import { Figure, defineFigure, cues, E, P, lerp, q, drawOn } from "../_figure";
import { Frame, LINE, FG, MUTED, PAPER, GROUND, ACCENT } from "./world";

// Beats in seconds: the lens passes over the stock photo (pass), moves to the dock (settle), the frame
// lights (lit), and the tick is drawn (tick).
const C = cues({ pass: [0.5, 1.9], settle: [2.3, 3.1], lit: [3.1, 3.7], tick: [3.2, 3.6] });

const spec = defineFigure({
  dur: 4.2,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 250 },
  setup: () => ({}),
  render: (t, _S, { W, H, compact }) => {
    // Wide: two frames side by side on a board. Compact: the same, narrower.
    const L = compact
      ? { b: { x: 14, y: 14, w: 332, h: 214 }, fw: 136, fh: 128, fx: [30, 194], fy: 40, label: 200, lens: 15, fs: 11 }
      : { b: { x: 40, y: 30, w: 560, h: 240 }, fw: 200, fh: 150, fx: [90, 350], fy: 72, label: 252, lens: 22, fs: 13 };
    const lab = { fontFamily: "var(--font-sans)", fontSize: compact ? 13 : 12 } as const;
    const fy = L.fy;
    const cy = fy + L.fh / 2; // the lens rides at the middle of the frames

    // The lens: across the stock frame and out past it, then over to the dock frame.
    const x0 = L.fx[0] - 40, x1 = L.fx[0] + L.fw + 40, x2 = L.fx[1] + L.fw / 2;
    const lensX =
      t < C.at("settle")
        ? lerp(x0, x1, E.io2(C.p(t, "pass")))
        : lerp(x1, x2, E.io2(C.p(t, "settle")));
    const lensY = cy;
    const k = C.p(t, "lit", E.io2); // the dock frame lights up
    const tickK = C.p(t, "tick", E.io2);
    const stockFade = 1 - 0.35 * C.p(t, "pass", E.io2); // the stock frame quietly dims once passed over

    const pinY = fy - 7;

    return (
      <g>
        <defs>
          <clipPath id="eeat-photo-clip">
            <rect width={W} height={H} />
          </clipPath>
          <radialGradient id="eeat-photo-glow">
            <stop offset="0" stopColor={ACCENT} stopOpacity={0.26 * k} />
            <stop offset="1" stopColor={ACCENT} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g clipPath="url(#eeat-photo-clip)">
          {/* the board */}
          <rect x={q(L.b.x)} y={q(L.b.y)} width={L.b.w} height={L.b.h} rx={4} fill={PAPER} {...LINE} strokeWidth={1.25} />

          {/* the stock frame, dimmed once the lens has passed */}
          <g opacity={stockFade}>
            <PhotoFrame x={L.fx[0]} y={fy} w={L.fw} h={L.fh} />
            <Stock x={L.fx[0] + 10} y={fy + 10} w={L.fw - 20} h={L.fh - 20} fs={L.fs} />
          </g>

          {/* the keeper's frame: its outline takes the accent as it lights */}
          <ellipse cx={q(L.fx[1] + L.fw / 2)} cy={q(fy + L.fh / 2)} rx={q(L.fw * 0.85)} ry={q(L.fh * 0.8)} fill="url(#eeat-photo-glow)" />
          <PhotoFrame x={L.fx[1]} y={fy} w={L.fw} h={L.fh} accent={k} />
          <Dock x={L.fx[1] + 10} y={fy + 10} w={L.fw - 20} h={L.fh - 20} fs={L.fs} />

          {/* pins */}
          {L.fx.map((x, i) => (
            <g key={i}>
              <circle cx={q(x + L.fw / 2)} cy={q(pinY)} r={compact ? 4 : 5} fill={FG} />
              <circle cx={q(x + L.fw / 2 - 1.2)} cy={q(pinY - 1.2)} r={1.2} fill={GROUND} />
            </g>
          ))}

          {/* the tick, badged on the corner of the keeper's frame */}
          <g opacity={k}>
            <circle cx={q(L.fx[1] + L.fw)} cy={q(fy)} r={compact ? 11 : 13} fill={PAPER} stroke={ACCENT} strokeWidth={1.25} />
            <path
              d={`M${q(L.fx[1] + L.fw - 5)} ${q(fy)}L${q(L.fx[1] + L.fw - 1.5)} ${q(fy + 4)}L${q(L.fx[1] + L.fw + 5)} ${q(fy - 4)}`}
              fill="none"
              stroke={FG}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              {...drawOn(tickK)}
            />
          </g>

          {/* labels */}
          <text x={q(L.fx[0] + L.fw / 2)} y={L.label} textAnchor="middle" {...lab} fill={MUTED}>
            stock
          </text>
          <text x={q(L.fx[1] + L.fw / 2)} y={L.label} textAnchor="middle" {...lab} fill={FG}>
            our dock
          </text>

          {/* the rater's lens */}
          <g transform={`translate(${q(lensX)} ${q(lensY)})`}>
            <line x1={L.lens * 0.7} y1={L.lens * 0.7} x2={L.lens * 1.6} y2={L.lens * 1.6} stroke={FG} strokeWidth={5} strokeLinecap="round" />
            <circle r={L.lens} fill={PAPER} fillOpacity={0.35} stroke={FG} strokeWidth={1.75} />
          </g>
        </g>
      </g>
    );
  },
});

/** A photo frame, its outline in ink, or in the accent when `accent` is lit (0..1). */
function PhotoFrame({ x, y, w, h, accent = 0 }: { x: number; y: number; w: number; h: number; accent?: number }) {
  return (
    <g>
      <rect x={q(x)} y={q(y)} width={w} height={h} fill={GROUND} stroke={FG} strokeWidth={1.25} />
      {accent > 0 && <rect x={q(x - 2)} y={q(y - 2)} width={w + 4} height={h + 4} fill="none" stroke={ACCENT} strokeOpacity={accent} strokeWidth={2} />}
    </g>
  );
}

/** A stock photo: a handshake silhouette in a plain field, with a diagonal watermark across it. */
function Stock({ x, y, w, h, fs }: { x: number; y: number; w: number; h: number; fs: number }) {
  const X = (f: number) => q(x + f * w), Y = (f: number) => q(y + f * h);
  return (
    <g>
      <rect x={q(x)} y={q(y)} width={w} height={h} fill={MUTED} fillOpacity={0.14} />
      {/* two sleeves reaching in */}
      <path d={`M${X(0)} ${Y(0.58)}L${X(0.32)} ${Y(0.44)}L${X(0.42)} ${Y(0.62)}L${X(0.08)} ${Y(0.84)}Z`} fill={FG} fillOpacity={0.6} />
      <path d={`M${X(1)} ${Y(0.52)}L${X(0.68)} ${Y(0.42)}L${X(0.58)} ${Y(0.6)}L${X(0.92)} ${Y(0.8)}Z`} fill={FG} fillOpacity={0.6} />
      {/* the clasp */}
      <path
        d={`M${X(0.36)} ${Y(0.56)}Q${X(0.5)} ${Y(0.38)} ${X(0.64)} ${Y(0.54)}Q${X(0.6)} ${Y(0.7)} ${X(0.5)} ${Y(0.68)}Q${X(0.4)} ${Y(0.72)} ${X(0.36)} ${Y(0.56)}Z`}
        fill={FG}
        fillOpacity={0.85}
      />
      {/* the watermark */}
      <text
        x={q(x + w / 2)}
        y={q(y + h / 2)}
        textAnchor="middle"
        transform={`rotate(-28 ${q(x + w / 2)} ${q(y + h / 2)})`}
        fontFamily="var(--font-sans)"
        fontSize={fs + 4}
        letterSpacing={3}
        fill={FG}
        fillOpacity={0.35}
      >
        STOCK
      </text>
    </g>
  );
}

/** The keeper's own photo: the dock, its posts, and the tide mark chalked on one of them. */
function Dock({ x, y, w, h, fs }: { x: number; y: number; w: number; h: number; fs: number }) {
  const X = (f: number) => q(x + f * w), Y = (f: number) => q(y + f * h);
  return (
    <g>
      <rect x={q(x)} y={q(y)} width={w} height={h} fill={MUTED} fillOpacity={0.08} />
      {/* water */}
      {[0.6, 0.7, 0.8, 0.9].map((f, i) => (
        <path key={i} d={`M${X(0.04 + i * 0.03)} ${Y(f)}H${X(0.3)}M${X(0.42)} ${Y(f + 0.03)}H${X(0.9)}`} stroke={FG} strokeOpacity={0.3} strokeWidth={1} />
      ))}
      {/* the boat, its hull and mast */}
      <path d={`M${X(0.58)} ${Y(0.56)}H${X(0.94)}L${X(0.86)} ${Y(0.66)}H${X(0.64)}Z`} fill={FG} fillOpacity={0.8} />
      <path d={`M${X(0.76)} ${Y(0.56)}V${Y(0.2)}`} stroke={FG} strokeWidth={1.25} />
      <path d={`M${X(0.76)} ${Y(0.22)}L${X(0.88)} ${Y(0.5)}H${X(0.76)}Z`} fill={FG} fillOpacity={0.35} />
      {/* the dock: deck and two posts */}
      <rect x={X(0.06)} y={Y(0.44)} width={q(0.62 * w)} height={q(0.04 * h)} fill={FG} fillOpacity={0.8} />
      <rect x={X(0.14)} y={Y(0.44)} width={q(0.03 * w)} height={q(0.46 * h)} fill={FG} fillOpacity={0.8} />
      <rect x={X(0.36)} y={Y(0.44)} width={q(0.03 * w)} height={q(0.46 * h)} fill={FG} fillOpacity={0.8} />
      {/* the tide mark, chalked across the posts at the high line */}
      <path
        d={`M${X(0.08)} ${Y(0.56)}Q${X(0.15)} ${Y(0.53)} ${X(0.22)} ${Y(0.565)}T${X(0.38)} ${Y(0.555)}`}
        fill="none"
        stroke={GROUND}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="7 2 3 2"
      />
      <text x={X(0.6)} y={Y(0.14)} fontFamily="var(--font-serif)" fontStyle="italic" fontSize={fs} fill={FG} fillOpacity={0.7}>
        high tide
      </text>
    </g>
  );
}

export default function RealPhoto() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
