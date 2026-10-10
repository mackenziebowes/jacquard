"use client";

// Google doesn't rank websites. It ranks trust. A rater walks a market street: two stock stalls get a
// quiet "no", the stall whose keeper did the work is lit, and the queue forms there.
import { Figure, defineFigure, cues, E, P, gait, stand, lerpPose, walk, makeBody, q } from "../_figure";
import { Frame, Street, Stall, Lantern, Person, Rater, labels, FG, MUTED, PAPER, ACCENT } from "./world";

// Beats in seconds. The rater walks in from the left and reaches the lit stall at 4.9s, lamp on, tags
// up, a tick on the board, then the queue arrives (see the customers below).
const C = cues({ arrive: 4.9, lit: [5.2, 5.9], tag: 5.7, tick: [6.4, 6.9] });
const TAGS = ["E", "E", "A", "T"];
const WALK_S = 4.5; // seconds for the rater to reach the stop, whatever the layout

// Stalls: left edge in px, and the stall scale. The lit stall is always the third (index 2).
const WIDE = { su: 1, lefts: [24, 164, 304, 444] };
const NARROW = { su: 0.72, lefts: [10, 92, 174, 256] }; // phones: bigger stalls, same four
const REAL = 2;

const spec = defineFigure({
  dur: 9.5,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 210 },
  setup: () => ({
    rater: makeBody(11),
    neighbour: makeBody(5),
    keeper: makeBody(7),
    customers: [makeBody(21), makeBody(22), makeBody(23), makeBody(24)],
  }),
  render: (t, S, { W, H, compact }) => {
    const { su, lefts } = compact ? NARROW : WIDE;
    const G = H - (compact ? 16 : 34); // the ground line
    const R = lefts[REAL];
    const lampX = R + 50 * su, lampY = G - 178 * su;
    const chip = compact ? 22 : 20, gap = chip + 6;
    const lit = C.p(t, "lit", E.io3);
    const L = labels(compact);

    // The rater stops in the gap before the lit stall, and walks there in WALK_S seconds.
    const stopX = (lefts[REAL - 1] + 100 * su + R) / 2;
    const x0 = -30 * su, t0 = 0.4;
    const speed = (stopX - x0) / WALK_S;
    const w = walk(t, { x0, to: stopX, t0, speed, stride: 70 * su });
    const pose = lerpPose(
      gait(S.rater, w.phase),
      stand(S.rater, 1.25),
      E.io2(P(t, C.at("arrive"), C.at("arrive") + 0.5)),
    );
    const passAt = (i: number) => t0 + (lefts[i] + 50 * su - x0) / speed; // when the rater passes a stall's centre

    // The queue: four customers, each in a spot in front of the lit stall, walking in from the right.
    const spots = [26, 48, 70, 92].map((d) => R + d * su);
    const people = S.customers.map((b, i) => {
      const start = [5.9, 6.3, 6.7, 7.1][i];
      if (t < start) return null;
      const c = walk(t, { x0: W + 10, to: spots[i], t0: start, speed: 130 * su, stride: 70 * su });
      return <Person key={i} x={c.x} y={G + 16} s={0.19 * su} body={b} J={c.moving ? gait(b, c.phase) : stand(b)} flip />;
    });

    const no = (i: number) => (
      <text key={i} x={lefts[i] + 50 * su} y={q(G - 162 * su)} textAnchor="middle" {...L.label} fill={MUTED} opacity={P(t, passAt(i), passAt(i) + 0.3)}>
        no
      </text>
    );

    return (
      <g>
        <defs>
          <clipPath id="eeat-hero-clip">
            <rect width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#eeat-hero-clip)">
          <Street x={0} y={G} w={W} />
          <ellipse cx={q(lampX)} cy={q(G + 1)} rx={q(120 * su)} ry={q(7 * su)} fill={ACCENT} opacity={0.16 * lit} />
          {lefts.map((x, i) => (
            <Stall
              key={i}
              x={x}
              y={G}
              s={su}
              variant={i === REAL ? "real" : "template"}
              keeper={i === REAL ? { body: S.keeper } : undefined}
            />
          ))}
          <Lantern x={lampX} y={lampY} s={su} k={lit} id="eeat-hero-glow" />
          {/* the neighbour, across the gap, points at the lit stall */}
          <Person x={(R + 100 * su + lefts[3]) / 2} y={G} s={0.2 * su} body={S.neighbour} J={stand(S.neighbour, Math.PI / 2)} flip />
          <Rater x={w.x} y={G} s={0.2 * su} body={S.rater} J={pose} tick={C.p(t, "tick", E.io2)} />
          {people}
          {no(0)}
          {no(1)}
          {TAGS.map((l, i) => {
            const at = C.at("tag") + i * 0.2;
            const x = lampX + (i - 1.5) * gap - chip / 2;
            const y = lampY - 25 * su - chip;
            return (
              <g key={i} opacity={P(t, at, at + 0.25)}>
                <rect x={q(x)} y={q(y)} width={chip} height={chip} rx={4} fill={PAPER} stroke={ACCENT} strokeWidth={1.25} />
                <text x={q(x + chip / 2)} y={q(y + chip / 2 + 4)} textAnchor="middle" {...L.small} fill={FG}>
                  {l}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    );
  },
});

export default function HeroTrustStreet() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
