"use client";

// Four updates, one direction. A walker climbs a staircase, one step per update, and behind each step a
// ratchet pawl drops into its teeth and holds. The walker reaches the top under a lantern and nobody
// comes back down.
import { Figure, defineFigure, E, P, lerp, makeBody, gait, stand, walk, q } from "../_figure";
import { Frame, Street, Person, Lantern, labels, FG, PAPER, LINE } from "./world";

const T0 = 0.4; // the walker sets off at T0 seconds
const CLIMB = 4.4; // and takes this long to reach the top
const LIT = [5.0, 5.6]; // the lantern comes on once the walker is up
const PAWL_DELAY = 0.35; // a pawl drops in this long after the walker passes its riser
const PAWL_DROP = 0.25; // and takes this long to seat
const RISE = 14; // px of walking over which a step is climbed, so the feet don't pop
const STEPS = 4;

const spec = defineFigure({
  dur: 6.2,
  size: { W: 640, H: 380 },
  compact: { W: 360, H: 284 },
  setup: () => ({ walker: makeBody(41) }),
  render: (t, S, { W, compact }) => {
    const L = compact
      ? { G: 246, x0: 18, from: 6, tw: 77, rh: 21, s: 0.2, lamp: 0.55, names: ["Medic", "Reviews", "Helpful", "Experience"], years: ["2018", "2021-23", "2022-23", "Dec 2022"] }
      : { G: 320, x0: 50, from: 10, tw: 124, rh: 34, s: 0.24, lamp: 0.8, names: ["Medic", "Product reviews", "Helpful content", "Experience added"], years: ["2018", "2021-2023", "2022-2023", "Dec 2022"] };
    const { G, x0, from, tw, rh, s } = L;
    const lab = labels(compact);

    const xr = (k: number) => x0 + k * tw; // riser k: the left edge of step k
    const top = (k: number) => G - rh * (k + 1); // the tread of step k
    const stopX = x0 + 3.5 * tw; // the walker stops in the middle of the top step
    const speed = (stopX - from) / CLIMB;

    // Height above the ground, in steps, at x: each riser lifts the feet over RISE px.
    const level = (x: number) => {
      let h = 0;
      for (let k = 0; k < STEPS; k++) h += E.io2(P(x, xr(k), xr(k) + RISE));
      return h;
    };

    const w = walk(t, { x0: from, to: stopX, t0: T0, speed, stride: 300 * s });
    const pose = w.moving ? gait(S.walker, w.phase) : stand(S.walker);
    const feet = G - rh * level(w.x);

    // The pawl for riser k drops once the walker is past it.
    const drop = (k: number) => T0 + (xr(k) - from) / speed + PAWL_DELAY;
    const lit = E.io3(P(t, LIT[0], LIT[1]));
    const topTread = top(STEPS - 1);
    const lampY = topTread - L.s * 560 - 24; // hangs above the walker's head
    const sp = rh * 0.17; // tooth pitch on the riser
    const len = rh * 0.42; // pawl arm

    return (
      <g>
        <Street x={0} y={G} w={W} />

        {/* the steps: each block sits on the ground and rises to its tread */}
        {Array.from({ length: STEPS }, (_, k) => (
          <rect key={k} x={q(xr(k))} y={q(top(k))} width={tw} height={q(G - top(k))} fill={PAPER} {...LINE} strokeWidth={1.25} />
        ))}

        {/* a ratchet on each riser: four teeth, and a pawl that drops onto them */}
        {Array.from({ length: STEPS }, (_, k) => {
          const x = xr(k), y = top(k);
          const teeth = [0, 1, 2, 3].map((i) => {
            const y0 = y + rh * 0.2 + i * sp;
            return `M${q(x + 4)} ${q(y0)}L${q(x + 10)} ${q(y0 + sp / 2)}L${q(x + 4)} ${q(y0 + sp)}Z`;
          });
          const e = E.io2(P(t, drop(k), drop(k) + PAWL_DROP));
          const px = x + rh * 0.45, py = y + rh * 0.1; // the pivot, just under the tread
          const a = lerp(-1.9, 2.5, e); // lifted (up) to seated (down-left, onto the teeth)
          const tx = px + len * Math.cos(a), ty = py + len * Math.sin(a);
          return (
            <g key={k}>
              <path d={teeth.join("")} fill={FG} fillOpacity={0.8} />
              <path d={`M${q(px)} ${q(py)}L${q(tx)} ${q(ty)}`} stroke={FG} strokeWidth={2} strokeLinecap="round" />
              <circle cx={q(px)} cy={q(py)} r={2.5} fill={FG} />
            </g>
          );
        })}

        {/* the walker, one step at a time */}
        <Person x={q(w.x)} y={q(feet)} s={s} body={S.walker} J={pose} />

        {/* the lantern over the top step */}
        <Lantern x={stopX} y={lampY} s={L.lamp} k={lit} id="one-way-stairs-glow" />

        {/* one label per update, under its step */}
        {L.names.map((name, k) => (
          <g key={k} textAnchor="middle">
            <text x={q(xr(k) + tw / 2)} y={G + (compact ? 16 : 18)} {...lab.label} fill={FG}>
              {name}
            </text>
            <text x={q(xr(k) + tw / 2)} y={G + (compact ? 30 : 33)} {...lab.small} fill={FG} opacity={0.7}>
              {L.years[k]}
            </text>
          </g>
        ))}
      </g>
    );
  },
});

export default function OneWayStairs() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
