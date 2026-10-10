"use client";

// Two shop doors. A visitor walks up to the one with a shut padlock, an address plate, an open card and
// posted terms, and goes in. At the other the padlock hangs broken, there is no plate, and the terms are
// covered. The visitor stops, and backs away.
import { Figure, defineFigure, cues, P, gait, stand, walk, makeBody, q, type Joints } from "../_figure";
import { Frame, Street, Person, LINE, FG, GROUND, PAPER, MUTED, labels } from "./world";

// Beats in seconds. The visitor reaches the good door at 3.4s and goes in; the second visitor reaches the
// other door at 6.4s, stops, and backs away from 7.6s.
const C = cues({ lock: 1.2, plate: 1.9, card: 2.3, terms: 2.7, in: 3.4, next: 4.4, stop: 6.4, away: 7.6 });
const WALK_IN = 3; // seconds for the first visitor to walk from the middle to the good door
const WALK_BY = 2; // seconds for the second visitor to walk in from the right, and again to leave

/** A padlock, its centre at (0, 0) in door units. k 0..1: 0 shackle lifted clear, 1 shut. */
function Padlock({ k, flash }: { k: number; flash: number }) {
  const lift = -7 * (1 - k);
  return (
    <g>
      {/* the click: two short ticks that flash and fade as the shackle snaps home */}
      <g opacity={flash}>
        <path d="M-13 -8L-17 -12M13 -8L17 -12" stroke={FG} strokeWidth={1.25} strokeLinecap="round" />
      </g>
      <path
        d="M-5 -2V-7A5 5 0 0 1 5 -7V-2"
        fill="none"
        stroke={FG}
        strokeWidth={2}
        strokeLinecap="round"
        transform={`translate(0 ${q(lift)})`}
      />
      <rect x={-8} y={-2} width={16} height={14} rx={2} fill={PAPER} {...LINE} strokeWidth={1.25} />
      <circle cx={0} cy={4} r={1.6} fill={FG} />
    </g>
  );
}

/**
 * A shop front in local units: the ground at (0, 0), the wall 170 wide and 200 tall. `good` has the
 * padlock shut, a plate, an open card and posted terms, each fading in at its own time. The other has
 * the padlock broken, no plate, and the terms covered.
 */
function Shopfront({ cx, G, su, good, fs, t }: { cx: number; G: number; su: number; good: boolean; fs: number; t: number }) {
  const lock = good ? P(t, C.at("lock"), C.at("lock") + 0.25) : 0;
  const flash = good ? P(t, C.at("lock"), C.at("lock") + 0.1) * (1 - P(t, C.at("lock") + 0.1, C.at("lock") + 0.5)) : 0;
  const plate = P(t, C.at("plate"), C.at("plate") + 0.25);
  const card = P(t, C.at("card"), C.at("card") + 0.25);
  const terms = P(t, C.at("terms"), C.at("terms") + 0.25);
  const label = (x: number, y: number, text: string, k: number) => (
    <text x={x} y={y} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={fs} fill={FG} opacity={k}>
      {text}
    </text>
  );

  return (
    <g transform={`translate(${q(cx)} ${q(G)}) scale(${su})`}>
      {/* the wall */}
      <rect x={-85} y={-200} width={170} height={200} fill={PAPER} {...LINE} strokeWidth={1.25} />
      {/* the window, with the open card hung in it when the shop is open */}
      <rect x={-72} y={-150} width={36} height={50} fill={GROUND} {...LINE} strokeWidth={1.25} />
      {good && (
        <g opacity={card} transform="rotate(-3 -54 -134)">
          <rect x={-68} y={-140} width={28} height={18} fill={PAPER} {...LINE} strokeWidth={1} />
          <path d="M-63 -132H-45M-63 -126H-50" stroke={FG} strokeWidth={1.25} />
        </g>
      )}
      {/* the plate with the address, only on the good door */}
      {good && (
        <g opacity={plate}>
          <rect x={40} y={-150} width={40} height={12} fill={PAPER} {...LINE} strokeWidth={1} />
          <path d="M46 -146H74M46 -142H66" stroke={FG} strokeWidth={1.25} />
        </g>
      )}
      {/* the door */}
      <rect x={-30} y={-120} width={60} height={120} fill={GROUND} {...LINE} strokeWidth={1.25} />
      <circle cx={22} cy={-56} r={1.8} fill={FG} />
      {/* the terms: posted on the good door, covered over on the other */}
      {good ? (
        <g opacity={terms}>
          <rect x={-20} y={-112} width={40} height={24} fill={PAPER} {...LINE} strokeWidth={1} />
          <path d="M-14 -105H14M-14 -99H14M-14 -93H6" stroke={FG} strokeWidth={1.25} />
        </g>
      ) : (
        <g>
          <rect x={-20} y={-112} width={40} height={24} fill={MUTED} fillOpacity={0.5} stroke={MUTED} strokeWidth={1} />
          <rect x={-26} y={-104} width={52} height={7} fill={MUTED} fillOpacity={0.85} transform="rotate(-14 0 -100)" />
        </g>
      )}
      {/* the padlock on the door */}
      <g transform="translate(0 -54) scale(1.6)">
        {good ? <Padlock k={lock} flash={flash} /> : <Padlock k={0} flash={0} />}
      </g>
      {/* the broken padlock: its shackle lies on the ground, cut open */}
      {!good && (
        <path d="M34 -3A7 7 0 0 1 48 -3" fill="none" stroke={FG} strokeWidth={2} strokeLinecap="round" transform="rotate(-60 40 -3)" />
      )}
      {/* labels: few, and only where a reader needs them */}
      {good && label(0, -128, "terms", terms)}
      {good && label(60, -156, "address", plate)}
      {good && label(-54, -158, "open", card)}
      {good && label(0, -16, "https", lock)}
    </g>
  );
}

const spec = defineFigure({
  dur: 10,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 262 },
  setup: () => ({
    visitor: makeBody(31),
    second: makeBody(32),
  }),
  render: (t, S, { W, H, compact }) => {
    const su = compact ? 0.72 : 1;
    const G = H - (compact ? 36 : 38); // the ground line
    const good = compact ? 95 : 170;
    const bad = compact ? 265 : 470;
    const mid = W / 2;
    const fs = compact ? 18 : 11.5; // local units: 13px on a phone, 11.5px on the desktop
    const stride = 70 * su;
    const s = 0.27 * su; // a person is 150px tall at desktop size

    // The first visitor walks from the middle to the good door, and goes in once there.
    const w1 = walk(t, { x0: mid, to: good, t0: 0.4, speed: (mid - good) / WALK_IN, stride });
    const v1Alpha = 1 - P(t, C.at("in"), C.at("in") + 0.4);
    const j1: Joints = w1.moving ? gait(S.visitor, w1.phase) : stand(S.visitor);

    // The second visitor walks in from the right, stops at the other door, and backs away the way it came.
    const startX = W + 30 * su;
    const speed2 = (startX - bad) / WALK_BY;
    const inWalk = walk(t, { x0: startX, to: bad, t0: C.at("next"), speed: speed2, stride });
    const outWalk = walk(t, { x0: bad, to: startX, t0: C.at("away"), speed: speed2, stride });
    const leaving = t >= C.at("away");
    const v2 = leaving ? outWalk : inWalk;
    const j2: Joints = v2.moving ? gait(S.second, v2.phase) : stand(S.second);

    return (
      <g>
        <defs>
          <clipPath id="eeat-door-clip">
            <rect width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#eeat-door-clip)">
          <Street x={0} y={G} w={W} />
          <Shopfront cx={good} G={G} su={su} good fs={fs} t={t} />
          <Shopfront cx={bad} G={G} su={su} good={false} fs={fs} t={t} />

          <g opacity={v1Alpha}>
            <Person x={w1.x} y={G} s={s} body={S.visitor} J={j1} flip />
          </g>
          {t >= C.at("next") && v2.x < W + 20 * su && (
            <Person x={v2.x} y={G} s={s} body={S.second} J={j2} flip />
          )}
        </g>
      </g>
    );
  },
});

export default function HonestDoor() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
