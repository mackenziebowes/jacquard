"use client";

// Your website probably fails on most E-E-A-T signals, not because the work is missing but because the
// site doesn't show it. The keeper of a real stall works away behind a thin pane of glass. The rater
// stands in front and sees only the template look: a grey sign, blank panels, a "Contact us" slot. The
// rater writes nothing on the board and walks on.
import {
  Figure,
  defineFigure,
  cues,
  E,
  P,
  gait,
  stand,
  lerpPose,
  walk,
  makeBody,
  place,
  q,
} from "../_figure";
import { Frame, Street, Stall, Rater, labels, FG, MUTED, PAPER } from "./world";

// Beats in seconds. The rater walks in, stops in front of the pane, and holds the board with no tick on
// it. Then the rater walks off to the left.
const C = cues({ arrive: 1.6, leave: 3.4 });
const WALK_IN_S = 1.6; // seconds for the rater to reach the stop, whatever the layout
const WALK_OUT_SPEED = 260; // px per second on the way out

// Wide: a stall at 1.2 scale, its left foot at x = 380. Phones: a smaller stall, same idea.
const WIDE = { su: 1.2, stallX: 380, startX: -30, ground: 34 };
const NARROW = { su: 1, stallX: 150, startX: -20, ground: 16 };

const spec = defineFigure({
  dur: 6.2,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 210 },
  setup: () => ({
    rater: makeBody(11),
    keeper: makeBody(7),
  }),
  render: (t, S, { W, H, compact }) => {
    const { su, stallX, startX, ground } = compact ? NARROW : WIDE;
    const G = H - ground; // the ground line
    const L = labels(compact);
    const stopX = stallX - 46 * su; // the rater's centre, a step in front of the pane

    // Walk in, then after the leave beat walk out to the left and keep going.
    const inW = walk(t, {
      x0: startX,
      to: stopX,
      t0: 0.3,
      speed: (stopX - startX) / WALK_IN_S,
      stride: 70 * su,
    });
    const leaving = t >= C.at("leave");
    const outW = walk(t, {
      x0: stopX,
      to: -80,
      t0: C.at("leave"),
      speed: WALK_OUT_SPEED,
      stride: 70 * su,
    });
    const hold = leaving
      ? 0
      : E.io2(P(t, C.at("arrive"), C.at("arrive") + 0.5));
    const pose = lerpPose(gait(S.rater, inW.phase), stand(S.rater, 1.25), hold);
    const rx = leaving ? outW.x : inW.x;
    const rJ = leaving ? gait(S.rater, outW.phase) : pose;

    return (
      <g>
        <defs>
          <clipPath id="eeat-unseen-clip">
            <rect width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#eeat-unseen-clip)">
          <Street x={0} y={G} w={W} />

          {/* the stall: the real one, keeper at work behind the glass */}
          <Stall
            x={stallX}
            y={G}
            s={su}
            variant="real"
            keeper={{ body: S.keeper, reach: 1.15 }}
          />

          {/* the pane: the template look laid over the front, so the work shows through faintly */}
          <Stall x={stallX} y={G} s={su} variant="template" o={0.4} />
          <g transform={place(stallX, G, 0, su)}>
            <rect
              x={-6}
              y={-160}
              width={112}
              height={166}
              rx={2}
              fill="none"
              stroke={FG}
              strokeWidth={1.25}
            />
            <path
              d="M70 -146L84 -120M80 -146L94 -120"
              stroke={FG}
              strokeOpacity={0.3}
              strokeWidth={1}
            />
            {/* the only thing the template gives a visitor to do: a Contact us slot */}
            <rect x={14} y={-30} width={72} height={14} rx={2} fill={PAPER} stroke={FG} strokeWidth={1} />
            <text x={50} y={-20} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={8} fill={FG}>
              Contact us
            </text>
          </g>

          <text
            x={q(stallX + 50 * su)}
            y={q(G - 176 * su)}
            textAnchor="middle"
            {...L.label}
            fill={MUTED}
          >
            what the rater sees
          </text>
          <text
            x={q(stallX + 112 * su)}
            y={q(G - 82 * su)}
            textAnchor="start"
            {...L.label}
            fill={FG}
          >
            the work
          </text>

          {/* the rater, with a blank board: the score is never written in */}
          <Rater x={rx} y={G} s={0.2 * su} body={S.rater} J={rJ} tick={0} />
        </g>
      </g>
    );
  },
});

export default function UnseenStall() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
