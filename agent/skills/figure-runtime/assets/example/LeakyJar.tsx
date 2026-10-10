"use client";
// Example figure: someone walks to a jar and pours in 40 coins; 12 leak out of a crack into a puddle.
// Shows the whole runtime: cues, a seeded setup, walk + gait, pour/drop/pile, sieve, compact layout.
import { Figure, defineFigure, cues, E, makeBody, stand, gait, personPaths, walk, pour, drop, pile, sieve, place, q, BODY_HEIGHT } from "../figure";

const C = cues({ walk: [0, 1.6], pour: 1.7, leak: 2.6, verdict: [4.6, 5.2] });
const N = 40, LEAKED = 12;

const spec = defineFigure({
  dur: 5.4, // must cover every motion: the last leaked coin starts at ~4.5s and lands ~0.3s later
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 300 },
  setup: () => {
    const body = makeBody(7);
    const passes = sieve(N, LEAKED, 3); // which coins leak: exactly 12
    const starts = pour(N, { t0: C.at("pour"), rate: 18 });
    return { body, passes, starts };
  },
  render: (t, { body, passes, starts }, { W, compact }) => {
    const jarX = compact ? 230 : 380, floor = 260, s = 120 / BODY_HEIGHT;
    const kept = pile(N - LEAKED, { cx: jarX, base: floor - 6, w: 10, h: 6, step: 1, seed: 5 });
    const puddle = pile(LEAKED, { cx: jarX + 90, base: floor, w: 10, h: 4, step: 3, seed: 9 });
    const who = walk(t, { x0: compact ? 30 : 120, to: jarX - 70, t0: C.at("walk"), speed: 140 });
    const J = who.moving ? gait(body, who.phase) : stand(body, 2.2);
    const P = personPaths(J, body);
    let k = 0, l = 0;
    const label = compact ? 18 : 15;
    return (
      <g>
        <line x1={0} x2={W} y1={floor} y2={floor} stroke="currentColor" strokeOpacity={0.3} />
        <path d={`M${jarX - 40} ${floor - 90}v84q0 6 6 6h68q6 0 6-6v-84`} fill="none" stroke="currentColor" strokeOpacity={0.6} />
        <path d={`M${jarX + 40} ${floor - 30}l-6 6 6 6`} fill="none" stroke="var(--accent)" />
        <g transform={place(who.x, floor - (body.thigh + body.shin + 6) * s, 0, s)} fill="currentColor">
          <path d={P.far} opacity={0.6} /><path d={P.body} /><path d={P.near} />
        </g>
        {passes.map((leaks, i) => {
          const rest = leaks ? puddle[l++] : kept[k++];
          const from = leaks ? { x: jarX + 42, y: floor - 24 } : { x: jarX - 20, y: floor - 140 };
          const c = drop(t, { from, to: rest, t0: leaks ? Math.max(starts[i] + 0.6, C.at("leak")) : starts[i], bounce: 0.25 });
          return c.started && <rect key={i} width={10} height={4} x={-5} y={-2} transform={place(c.x, c.y, c.r)} fill={leaks ? "var(--accent)" : "currentColor"} />;
        })}
        <text x={jarX} y={floor + 30} textAnchor="middle" fontSize={label} fill="currentColor" opacity={q(C.p(t, "verdict", E.o3))}>
          {N - LEAKED} kept · {LEAKED} leaked
        </text>
      </g>
    );
  },
});

export default function LeakyJar() {
  return <Figure spec={spec} />;
}
