"use client";

/**
 * What to stay away from: anything that needs capital. Twenty funded crates roll down the road.
 * They clear the design gate and queue at making, shipping and certification, the problems
 * founders named; five reach the backers on time, standing for the 24.9% in the Kickstarter
 * sample. How the late ones split across the three gates is illustrative; the post gives no split.
 */
import { Figure, defineFigure, cues, E, P, lerp, q } from "../_figure";
import { Crate, Frame, Gate, Person, FG, MUTED, ACCENT, line, type } from "./world";

const CW = 20; // crate width
const CH = 16;
const SPEED = 380; // px per second
const STOPS = ["delivered", "certification", "shipping", "making"] as const;
const COUNTS = { delivered: 5, certification: 3, shipping: 5, making: 7 }; // 20 crates, 5 on time

const C = cues({ roll: 0.2, verdict: [2.9, 3.4] });

type Layout = { ground: number; start: number; gates: Record<"design" | "making" | "shipping" | "certification", number>; backers: number[]; lift: Record<string, number> };
const WIDE: Layout = {
  ground: 172, start: 18,
  gates: { design: 110, making: 270, shipping: 370, certification: 470 },
  backers: [574, 594, 614],
  lift: {},
};
const NARROW: Layout = {
  ground: 196, start: 4,
  gates: { design: 40, making: 128, shipping: 196, certification: 264 },
  backers: [332, 350],
  lift: {},
};

function slots(L: Layout) {
  const stopX = (s: (typeof STOPS)[number]) => (s === "delivered" ? L.backers[0] - 14 : L.gates[s] - 4);
  const out: { x: number; y: number; stop: (typeof STOPS)[number] }[] = [];
  for (const s of STOPS) {
    for (let k = 0; k < COUNTS[s]; k++) {
      const col = Math.floor(k / 3), lvl = k % 3;
      out.push({ x: stopX(s) - (col + 1) * (CW + 2), y: L.ground - lvl * (CH + 1), stop: s });
    }
  }
  return out;
}

const spec = defineFigure({
  dur: 3.6,
  size: { W: 640, H: 222 },
  compact: { W: 360, H: 248 },
  setup: () => ({ wide: slots(WIDE), narrow: slots(NARROW) }),
  render: (t, state, { compact }) => {
    const { label, small } = type(compact);
    const L = compact ? NARROW : WIDE;
    const crates = compact ? state.narrow : state.wide;
    const top = L.ground - 112;
    const g = L.gates;
    const verdict = C.p(t, "verdict", E.o3);

    return (
      <g>
        <text x={L.start} y={top - 40} fill={FG} style={label}>anything that needs capital</text>
        <text x={L.start} y={top - 23} fill={MUTED} style={small}>20 funded projects, one crate each</text>

        <path d={`M${L.start - 4} ${L.ground} H${compact ? 356 : 628}`} {...line} strokeOpacity={0.25} />

        {/* Design: the crates go straight through */}
        <Gate x={g.design} y={L.ground} h={70} text="design" small={small} dim />

        {/* Where trouble clustered */}
        <path d={`M${g.making - 30} ${top + 18} V${top + 12} H${g.certification + 12} V${top + 18}`} {...line} strokeOpacity={0.35} />
        <text x={(g.making - 30 + g.certification + 12) / 2} y={top + 4} textAnchor="middle" fill={MUTED} style={small}>
          trouble clustered here
        </text>
        {(["making", "shipping", "certification"] as const).map((s) => (
          <g key={s}>
            <Gate x={g[s]} y={L.ground} h={70} text="" small={small} />
            <text x={g[s] + 4} y={L.ground - 78 - (L.lift[s] ?? 0)} textAnchor="middle" fill={FG} style={small}>{s}</text>
          </g>
        ))}

        {/* Backers waiting */}
        {L.backers.map((x, i) => <Person key={i} x={x} y={L.ground} opacity={0.8} />)}

        {/* The crates: each rolls along the ground, then hops onto its place in a queue */}
        {crates.map((c, i) => {
          const t0 = C.at("roll") + i * 0.1;
          if (t < t0) return null;
          const dist = c.x - L.start;
          const k = P(t, t0, t0 + dist / SPEED);
          const x = lerp(L.start, c.x, E.o2(k));
          const rise = P(x, c.x - 30, c.x);
          const y = lerp(L.ground, c.y, rise) - Math.sin(Math.PI * rise) * (c.y < L.ground ? 10 : 0);
          const on = c.stop === "delivered";
          return <Crate key={i} x={q(x, 1)} y={q(y, 1)} w={CW} h={CH} color={on ? ACCENT : FG} opacity={on ? 1 : 0.5} />;
        })}

        <g opacity={verdict}>
          <text x={L.backers[L.backers.length - 1] + 8} y={L.ground + 22} textAnchor="end" fill={ACCENT} style={label}>
            5 on time
          </text>
          <text x={L.backers[L.backers.length - 1] + 8} y={L.ground + 38} textAnchor="end" fill={MUTED} style={small}>
            about 1 in 4
          </text>
        </g>
      </g>
    );
  },
});

export default function CapitalRoad() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
