"use client";

// Expertise is depth. Two wells stand side by side on the street, and a plumb line is lowered into each. The
// shallow well's weight hits bottom after a short drop. The deep well's line keeps paying out and finds water,
// and a small name-and-bio tag hangs on it: the depth is what the tag is standing on.
import { Figure, defineFigure, cues, P, q } from "../_figure";
import { Frame, Street, LINE, FG, GROUND, PAPER, ACCENT, labels } from "./world";

// Beats in seconds. The line starts paying out at 0.4s and runs at a steady speed, so the longer well takes
// longer. The deep line finds water at about 1.9s; the ripple follows, then the tag hangs on the line.
const C = cues({ lower: 0.4, ripple: [1.9, 2.8], tag: [2.2, 2.6] });
const SPEED = 150; // px/s the line pays out, the same for both wells

const spec = defineFigure({
  dur: 3.0,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 300 },
  setup: () => ({}),
  render: (t, _S, { W, compact }) => {
    const G = 70; // the street
    const TOP = 30; // where the weight hangs at rest, just under the pulley
    const SHALLOW = G + 56; // the shallow well's floor
    const WATER = G + 180; // the deep well's water surface
    const DEEP = G + 200; // the deep well's floor, under the water
    const CX = compact ? [90, 270] : [170, 470];
    const HW = compact ? 40 : 55; // half the width of a shaft
    const BAR = compact ? 50 : 66; // half the width of a frame bar
    const L = labels(compact);

    // The line pays out at SPEED from t0 and stops on the floor, or on the water.
    const pay = (stop: number) => Math.min(stop, TOP + SPEED * Math.max(0, t - C.at("lower")));
    const shallowY = pay(SHALLOW - 6);
    const deepY = pay(WATER - 4);

    // Ripples where the deep weight meets the water
    const rip = [0, 1].map((i) => {
      const k = P(t, C.at("ripple") + i * 0.35, C.at("ripple") + i * 0.35 + 0.9);
      return { r: 4 + 36 * k, o: k > 0 ? 0.5 * (1 - k) : 0 };
    });

    const tagK = P(t, C.at("tag"), C.at("tag") + 0.3);
    const tagY = WATER - 62; // the tag hangs on the line, well above the weight
    const dCx = CX[1];

    const shaft = (cx: number, bottom: number, key: string) => (
      <g key={key}>
        <rect x={q(cx - HW)} y={G} width={HW * 2} height={bottom - G} fill={GROUND} {...LINE} strokeWidth={1.25} />
        <rect x={q(cx - HW)} y={bottom - 6} width={HW * 2} height={6} fill={FG} fillOpacity={0.55} />
      </g>
    );

    return (
      <g>
        <defs>
          <clipPath id="eeat-plumb-clip">
            <rect width={W} height={300} />
          </clipPath>
        </defs>
        <g clipPath="url(#eeat-plumb-clip)">
          <Street x={0} y={G} w={W} />

          {/* the two wells */}
          {shaft(CX[0], SHALLOW, "shallow")}
          {shaft(CX[1], DEEP, "deep")}

          {/* water in the deep well, with a line on top */}
          <rect x={q(dCx - HW + 1)} y={WATER} width={HW * 2 - 2} height={DEEP - WATER - 6} fill={FG} fillOpacity={0.14} />
          <path
            d={`M${q(dCx - HW + 1)} ${WATER}H${q(dCx + HW - 1)}`}
            stroke={FG}
            strokeOpacity={0.6}
            strokeWidth={1.25}
            fill="none"
          />
          {rip.map((r, i) => (
            <ellipse key={i} cx={q(dCx)} cy={WATER} rx={q(r.r)} ry={q(r.r * 0.22)} fill="none" stroke={FG} strokeOpacity={r.o} strokeWidth={1} />
          ))}

          {/* a frame and pulley over each well */}
          {CX.map((cx, i) => (
            <g key={i}>
              <path d={`M${q(cx - BAR)} ${G}V18H${q(cx + BAR)}V${G}`} fill="none" stroke={FG} strokeWidth={2} strokeLinejoin="round" />
              <circle cx={q(cx)} cy={18} r={4} fill={PAPER} {...LINE} strokeWidth={1.25} />
            </g>
          ))}

          {/* the lines and weights */}
          <path d={`M${q(CX[0])} 18V${q(shallowY)}`} stroke={FG} strokeWidth={1.25} />
          <circle cx={q(CX[0])} cy={q(shallowY)} r={6} fill={FG} />
          <path d={`M${q(dCx)} 18V${q(deepY)}`} stroke={FG} strokeWidth={1.25} />
          <circle cx={q(dCx)} cy={q(deepY)} r={6} fill={FG} />

          {/* a name-and-bio tag on the deep line */}
          <g opacity={tagK}>
            <rect x={q(dCx - 22)} y={q(tagY - 13)} width={44} height={26} rx={2} fill={PAPER} stroke={ACCENT} strokeWidth={1.25} />
            <rect x={q(dCx - 14)} y={q(tagY - 7)} width={22} height={3} fill={FG} />
            <rect x={q(dCx - 14)} y={q(tagY)} width={28} height={2} fill={FG} fillOpacity={0.6} />
            <rect x={q(dCx - 14)} y={q(tagY + 5)} width={18} height={2} fill={FG} fillOpacity={0.6} />
            <circle cx={q(dCx)} cy={q(tagY - 13)} r={2} fill={PAPER} stroke={ACCENT} strokeWidth={1} />
          </g>

          {/* labels, under each well */}
          <text x={q(CX[0])} y={SHALLOW + 22} textAnchor="middle" {...L.label} fill={FG}>
            hits bottom
          </text>
          <text x={q(dCx)} y={DEEP + 22} textAnchor="middle" {...L.label} fill={FG}>
            finds water
          </text>
        </g>
      </g>
    );
  },
});

export default function PlumbLine() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
