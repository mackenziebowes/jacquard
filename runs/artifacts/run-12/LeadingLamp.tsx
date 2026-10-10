"use client";

/**
 * Research. Left, what happened: the brief named our choice (contour art), so all five researchers
 * swung their lamps to the contour patch and the rest of the field stayed dark. Right, the rule we
 * kept: a brief that asks what is out there, five lamps fanned across the whole field. The contour spot is an empty dashed outline in both panels: no live site was found using it. The right
 * panel is the rule, not a rerun: the post does not say the research was redone.
 */
import { Figure, defineFigure, cues, E, q, lerp, clamp } from "../_figure";
import { Frame, FG, MUTED, ORANGE, GROUND, line, type } from "./world";

const C = cues({
  briefA: [0, 0.6],
  swingA: [0.7, 2.0],
  briefB: [3.0, 3.6],
  swingB: [3.7, 5.0],
  labels: [4.8, 5.4],
});

const N = 5;
const PATCH = 2; // which of the five things in the field is the contour patch
const NAMES = ["plant", "disc", "contour", "wordmark", "chart"];
const PH = 262; // panel height
const FT = 72; // field top (panel space)
const FB = 238; // field bottom
const IY = 122; // item row centre
const LY = 226; // lamp height

type State = Record<string, never>;

const spec = defineFigure<State>({
  dur: 5.6,
  size: { W: 640, H: PH },
  compact: { W: 360, H: PH * 2 + 14 },
  setup: () => ({}),
  render: (t, _S, { compact }) => {
    const { label, small } = type(compact);
    const pw = compact ? 340 : 300;
    const sp = (pw - 16) / N;
    const cx = (i: number) => 8 + sp * (i + 0.5);

    const kBA = C.p(t, "briefA", E.o3);
    const kBB = C.p(t, "briefB", E.o3);
    const kLab = C.p(t, "labels", E.o3);
    const swing = (i: number, a: "swingA" | "swingB") => {
      const s = C.at(a) + i * 0.07;
      return E.io3(clamp((t - s) / (C.end(a) - C.at(a) - 0.3)));
    };

    const panel = (p: 0 | 1, ox: number, oy: number) => {
      const isA = p === 0;
      const uid = `ll-${compact ? "n" : "w"}-${p}`;
      const kBrief = isA ? kBA : kBB;
      const ks = Array.from({ length: N }, (_, i) => swing(i, isA ? "swingA" : "swingB"));
      // Each lamp's target: the patch for everyone, or its own thing
      const target = (i: number) => (isA ? PATCH : i);
      const lit = Array.from({ length: N }, () => 0);
      ks.forEach((k, i) => (lit[target(i)] = Math.max(lit[target(i)], k)));
      const chipW = compact ? 250 : 220;
      const iconX = ox + 8 + chipW - 20;

      return (
        <g opacity={isA ? 1 : clamp((t - C.at("briefB") + 0.1) / 0.5)}>
          <text x={ox + 8} y={oy + 14} fill={MUTED} style={small}>
            {isA ? "what happened" : "what we do now"}
          </text>
          <text x={ox + 8} y={oy + 32} fill={FG} style={{ ...label, fontWeight: 600 }}>
            {isA ? "prompt names our choice" : compact ? "the rule we kept: ask what is out there" : "the rule we kept: ask what is out there"}
          </text>

          {/* The brief handed to the researchers */}
          <g opacity={kBrief}>
            <rect x={ox + 8} y={oy + 40} width={chipW} height={26} {...line} fill={`color-mix(in oklch, ${FG} 6%, transparent)`} />
            <text x={ox + 16} y={oy + 57.5} fill={FG} style={small}>
              {isA ? "brief: about contour art" : "brief: what is out there?"}
            </text>
            {isA && (
              <g transform={`translate(${q(iconX)} ${oy + 53})`}>
                <ellipse rx={7} ry={5} fill="none" stroke={MUTED} strokeWidth={0.9} />
                <ellipse rx={3.5} ry={2.4} fill="none" stroke={MUTED} strokeWidth={0.9} />
                <ellipse rx={12} ry={10} fill="none" stroke={ORANGE} strokeWidth={1.3} />
              </g>
            )}
          </g>

          {/* The field: what is out there */}
          <rect x={ox + 8} y={oy + FT} width={pw - 16} height={FB - FT} fill={`color-mix(in oklch, ${GROUND} 55%, transparent)`} stroke={FG} strokeOpacity={0.18} />

          {/* Light, then the things it lands on */}
          {ks.map((k, i) => {
            if (k <= 0) return null;
            const j = target(i);
            const lx = ox + cx(i) + 7;
            const tx = lerp(ox + cx(i), ox + cx(j), k);
            const ty = lerp(oy + FT + 6, oy + IY + 6, k);
            const hw = 7 + 13 * k;
            return (
              <polygon
                key={i}
                points={`${q(lx)},${oy + LY} ${q(tx - hw)},${q(ty)} ${q(tx + hw)},${q(ty)}`}
                fill={ORANGE}
                fillOpacity={0.22 * clamp(k * 6)}
              />
            );
          })}

          {NAMES.map((name, i) => {
            const o = 0.22 + 0.78 * lit[i];
            const x = ox + cx(i);
            const y = oy + IY;
            return (
              <g key={name} opacity={o}>
                {i === PATCH ? (
                  <rect x={x - 20} y={y - 14} width={40} height={28} fill="none" stroke={FG} strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.8} />
                ) : i === 0 ? (
                  <g stroke={FG} strokeWidth={1.4} fill="none" strokeLinecap="round">
                    <path d={`M${x} ${y + 15}V${y - 8}`} />
                    <path d={`M${x} ${y + 4}Q${x - 14} ${y + 2} ${x - 14} ${y - 8}Q${x - 2} ${y - 8} ${x} ${y + 4}`} fill={FG} fillOpacity={0.4} />
                    <path d={`M${x} ${y - 4}Q${x + 14} ${y - 6} ${x + 13} ${y - 16}Q${x + 1} ${y - 16} ${x} ${y - 4}`} fill={FG} fillOpacity={0.4} />
                  </g>
                ) : i === 1 ? (
                  <circle cx={x} cy={y} r={16} fill={FG} fillOpacity={0.7} />
                ) : i === 3 ? (
                  <g stroke={FG} strokeLinecap="round">
                    <path d={`M${x - 20} ${y - 3}H${x + 20}`} strokeWidth={5} />
                    <path d={`M${x - 20} ${y + 8}H${x + 8}`} strokeWidth={2} />
                  </g>
                ) : (
                  <g fill={FG} fillOpacity={0.75}>
                    <rect x={x - 17} y={y + 2} width={8} height={12} />
                    <rect x={x - 4} y={y - 8} width={8} height={22} />
                    <rect x={x + 9} y={y - 16} width={8} height={30} />
                  </g>
                )}
              </g>
            );
          })}

          {!isA && (
            <g opacity={kLab}>
              {NAMES.map((name, i) =>
                i === PATCH ? (
                  <text key={name} x={ox + cx(i)} y={oy + IY + 40} textAnchor="middle" fill={MUTED} style={small}>
                    <tspan x={ox + cx(i)}>contour:</tspan>
                    <tspan x={ox + cx(i)} dy={12}>none found</tspan>
                  </text>
                ) : (
                  <text key={name} x={ox + cx(i)} y={oy + IY + 40} textAnchor="middle" fill={MUTED} style={small}>
                    {name}
                  </text>
                ),
              )}
            </g>
          )}

          {/* Five researchers, each with a lamp */}
          {Array.from({ length: N }, (_, i) => {
            const x = ox + cx(i);
            const g = oy + FB - 6;
            return (
              <g key={i} stroke={FG} strokeOpacity={0.7} strokeWidth={1.3} fill="none" strokeLinecap="round">
                <path d={`M${x - 3} ${g}L${x} ${g - 10}L${x + 3} ${g}M${x} ${g - 10}V${g - 20}`} />
                <path d={`M${x} ${g - 18}L${x + 7} ${oy + LY + 2}`} />
                <circle cx={x} cy={g - 24} r={3.6} fill={GROUND} />
                <circle cx={x + 7} cy={oy + LY} r={2.6} fill={ORANGE} stroke="none" />
              </g>
            );
          })}
        </g>
      );
    };

    return (
      <g>
        {panel(0, 0, 0)}
        {compact ? panel(1, 0, PH + 14) : panel(1, 340, 0)}
        {!compact && <line x1={320} x2={320} y1={8} y2={PH - 8} stroke={FG} strokeOpacity={0.15} />}
      </g>
    );
  },
});

export default function LeadingLamp() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
