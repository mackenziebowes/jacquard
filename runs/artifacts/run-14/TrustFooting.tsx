"use client";

// Trust is the footing. Experience, expertise and authoritativeness are stacked on a plank on top of it;
// the stack stands until the footing cracks and gives way, and then everything comes down. Nothing in the
// stack is broken. It just had nothing holding it.
import { Figure, defineFigure, cues, E, P, fall, drop, drawOn, q } from "../_figure";
import { Frame, Street, LINE, FG, GROUND, PAPER, labels } from "./world";

// Beats in seconds. The stack stands until 1.0s, the crack runs 1.0-1.4s, the footing sinks 1.5-2.0s,
// then the plank and the blocks fall, top block first.
const C = cues({ crack: [1.0, 1.4], sink: 1.5, plank: 1.8, blocks: 1.9 });

const BLOCK_W = 180, BLOCK_H = 40, PLANK_W = 280, PLANK_H = 16;
const FOOT_W = 200, FOOT_H = 96;
const BLOCKS = ["Experience", "Expertise", "Authoritativeness"]; // bottom to top

// Where the pieces come to rest, as offsets from the centre line. Compact pulls the heap in so it fits a
// phone; the blocks themselves stay the same size.
const REST = {
  wide: { plank: -20, experience: 230, expertise: 230, authority: -250 },
  compact: { plank: -20, experience: 80, expertise: 70, authority: -80 },
};

const spec = defineFigure({
  dur: 3.4,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 262 },
  setup: () => ({}),
  render: (t, _S, { W, compact }) => {
    const G = compact ? 246 : 266; // the street
    const cx = W / 2;
    const R = compact ? REST.compact : REST.wide;
    const L = labels(compact);

    // Stack positions, bottom up: the plank sits on the footing, the blocks sit on the plank.
    const plankY = G - FOOT_H - PLANK_H / 2;
    const blockY = (i: number) => plankY - PLANK_H / 2 - BLOCK_H / 2 - i * BLOCK_H;

    // The footing sinks at one side and drops out of sight below the street.
    const sinkK = P(t, C.at("sink"), C.at("sink") + 0.5);
    const dy = fall(t, { from: 0, to: 110, t0: C.at("sink") });
    const tilt = 7 * E.io2(sinkK);

    // The plank falls off the sunk footing and lies across the hole.
    const pl = drop(t, {
      from: { x: cx, y: plankY },
      to: { x: cx + R.plank, y: G - PLANK_H / 2, r: 0 },
      t0: C.at("plank"),
      bounce: 0.15,
    });

    // Blocks fall one after another, top first. They land where they land.
    const landing = [
      { x: cx + R.experience, y: G - BLOCK_H / 2, r: 4 }, // Experience
      { x: cx + R.expertise + 14, y: G - BLOCK_H - BLOCK_H / 2 + 4, r: 9 }, // Expertise, tumbled onto the first
      { x: cx + R.authority, y: G - BLOCK_H / 2, r: -8 }, // Authoritativeness
    ];
    const order = [2, 1, 0]; // top block first
    const bl = BLOCKS.map((_, i) => {
      const k = order.indexOf(i);
      return drop(t, {
        from: { x: cx, y: blockY(i) },
        to: { x: landing[i].x, y: landing[i].y, r: landing[i].r },
        t0: C.at("blocks") + k * 0.07,
        bounce: 0.2,
      });
    });

    return (
      <g>
        <defs>
          <clipPath id="eeat-footing-clip">
            <rect x={0} y={0} width={W} height={G} />
          </clipPath>
        </defs>

        <Street x={0} y={G} w={W} />

        {/* the footing, cracking and then sinking out of sight */}
        <g clipPath="url(#eeat-footing-clip)">
          <g transform={`translate(${q(cx)} ${q(G + dy)}) rotate(${q(tilt)})`}>
            <rect x={-FOOT_W / 2} y={-FOOT_H} width={FOOT_W} height={FOOT_H} fill={FG} fillOpacity={0.6} />
            <path
              d="M-6 -96L8 -68L-4 -46L10 -22L2 0"
              fill="none"
              stroke={GROUND}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              {...drawOn(P(t, C.at("crack"), C.at("crack") + 0.4))}
            />
            <text x={0} y={-40} textAnchor="middle" {...L.label} fontSize={compact ? 17 : 16} fill={GROUND}>
              Trust
            </text>
          </g>
        </g>

        {/* the plank, falling to lie across the gap */}
        <g transform={`translate(${q(pl.x)} ${q(pl.y)}) rotate(${q(pl.r)})`}>
          <rect x={-PLANK_W / 2} y={-PLANK_H / 2} width={PLANK_W} height={PLANK_H} fill={FG} fillOpacity={0.55} {...LINE} strokeWidth={1} />
        </g>

        {/* the blocks: sound, just unsupported */}
        {BLOCKS.map((label, i) => {
          const b = bl[i];
          return (
            <g key={label} transform={`translate(${q(b.x)} ${q(b.y)}) rotate(${q(b.r)})`}>
              <rect x={-BLOCK_W / 2} y={-BLOCK_H / 2} width={BLOCK_W} height={BLOCK_H} rx={2} fill={PAPER} {...LINE} />
              <text x={0} y={5} textAnchor="middle" {...L.label} fill={FG}>
                {label}
              </text>
            </g>
          );
        })}
      </g>
    );
  },
});

export default function TrustFooting() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
