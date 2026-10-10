"use client";

// In August 2018 the health and money stalls were sorted by credentials. Stalls with a plaque on the
// wall stayed on the top rank shelf; the two without slid down the ladder, with a mild shake.
import { Figure, defineFigure, cues, E, P, q } from "../_figure";
import { Frame, labels, FG, MUTED, PAPER, GROUND, LINE } from "./world";

const C = cues({ label: [0.2, 0.8], slideA: [1.2, 2.6], slideB: [1.45, 2.85] });

// Four stalls on the top shelf: a health cross or a coin sign, with or without a credential plaque.
// The two without a plaque (index 1 and 3) are the ones that drop.
const STALLS = [
  { sign: "cross", plaque: true },
  { sign: "cross", plaque: false },
  { sign: "coin", plaque: true },
  { sign: "coin", plaque: false },
] as const;
const DROPS = [false, true, false, true];
const SHELVES = 4; // rank shelves, top to bottom
const STALL_H = 82; // a stall at s = 1, from its ground line up to the top of its sign
const DROP_STEPS = 3; // shelves a stall without a plaque slides down (the bottom rung)

const spec = defineFigure({
  dur: 3.2,
  size: { W: 640, H: 368 },
  compact: { W: 360, H: 314 },
  render: (t, _state, { W, H, compact }) => {
    const su = compact ? 0.7 : 0.85;
    const cx = W / 2;
    const gap = 90 * su; // shelf to shelf
    const top = 44 + STALL_H * su; // the top shelf's ground line
    const shelfY = (k: number) => top + k * gap;
    const bottom = shelfY(SHELVES - 1);
    const spacing = 120 * su;
    const rail = 234 * su; // outside the outer stalls' edges, so the shelves hold them
    const L = labels(compact);

    const label = C.p(t, "label", E.o3);

    // The drop: a stall slides from the top shelf to the bottom one, rocking a little while it goes.
    const slide = (i: number) => {
      const id = i === 1 ? "slideA" : "slideB";
      const k = C.p(t, id, E.io2);
      const rock = Math.sin(Math.PI * k); // 0 at the start and the end, so it lands square
      const wob = Math.sin(2 * Math.PI * 3 * k) * rock;
      return { y: (shelfY(DROP_STEPS) - shelfY(0)) * k, x: wob * 2.5 * su, deg: wob * 3 };
    };

    const xs = [-1.5, -0.5, 0.5, 1.5].map((n) => cx + n * spacing);

    return (
      <g>
        <text x={q(cx)} y={26} textAnchor="middle" {...L.label} fill={FG} opacity={label}>
          Aug 2018
        </text>

        {/* the ladder: two rails and a rank shelf on each rung */}
        <path d={`M${q(cx - rail)} ${q(top - 6)}V${q(bottom + 6)}M${q(cx + rail)} ${q(top - 6)}V${q(bottom + 6)}`} stroke={FG} strokeWidth={2} strokeOpacity={0.55} />
        {Array.from({ length: SHELVES }, (_, k) => (
          <line key={k} x1={q(cx - rail)} x2={q(cx + rail)} y1={q(shelfY(k))} y2={q(shelfY(k))} stroke={FG} strokeWidth={2.5} strokeOpacity={0.55} />
        ))}

        {STALLS.map((s, i) => {
          const dropping = DROPS[i];
          const pos = dropping ? slide(i) : { x: 0, y: 0, deg: 0 };
          const gx = xs[i] + pos.x;
          const gy = top + pos.y;
          return (
            <g key={i} transform={`translate(${q(gx)} ${q(gy)}) rotate(${q(pos.deg)})`}>
              <Stall s={su} sign={s.sign} plaque={s.plaque} />
            </g>
          );
        })}
      </g>
    );
  },
});

/**
 * A market stall at s = 1 with its ground centre at the origin: 84 wide, 82 tall. A health cross
 * or a coin on the sign. A plaque on the back wall is the credential; without it the wall is blank,
 * with a dashed outline where the plaque would be.
 */
function Stall({ s, sign, plaque }: { s: number; sign: "cross" | "coin"; plaque: boolean }) {
  const stripes = [0, 1, 2, 3];
  return (
    <g transform={`scale(${s})`}>
      {/* back wall and posts */}
      <rect x={-36} y={-56} width={72} height={56} fill={PAPER} {...LINE} strokeWidth={1.25} />
      <path d="M-40 0V-58M40 0V-58" stroke={FG} strokeWidth={2} />

      {/* credential plaque, or the empty place for one */}
      {plaque ? (
        <>
          <rect x={-12} y={-46} width={24} height={16} fill={GROUND} stroke={FG} strokeWidth={1} />
          <circle cx={-4} cy={-38} r={3.5} fill={FG} fillOpacity={0.8} />
          <path d="M2 -41H9M2 -35H9" stroke={FG} strokeWidth={1.25} />
        </>
      ) : (
        <rect x={-12} y={-46} width={24} height={16} fill="none" stroke={FG} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="2 2" />
      )}

      {/* awning */}
      {stripes.map((i) => {
        const x0 = -42 + 21 * i;
        return <path key={i} d={`M${x0} -66H${x0 + 21}V-58H${x0}Z`} fill={i % 2 === 0 ? FG : "none"} fillOpacity={0.22} {...LINE} strokeWidth={1.25} />;
      })}

      {/* sign */}
      <rect x={-22} y={-82} width={44} height={16} rx={2} fill={PAPER} stroke={FG} strokeWidth={1.25} />
      {sign === "cross" ? (
        <>
          <rect x={-1.8} y={-79.5} width={3.6} height={9} fill={FG} />
          <rect x={-4.5} y={-76.2} width={9} height={3.6} fill={FG} />
        </>
      ) : (
        <>
          <circle cx={0} cy={-74} r={5} fill="none" stroke={FG} strokeWidth={1.25} />
          <circle cx={0} cy={-74} r={2.5} fill="none" stroke={MUTED} strokeWidth={0.8} />
        </>
      )}

      {/* counter */}
      <rect x={-38} y={-26} width={76} height={26} fill={PAPER} {...LINE} />
      <rect x={-40} y={-29} width={80} height={4} fill={FG} fillOpacity={0.8} />
    </g>
  );
}

export default function MedicSlide() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
