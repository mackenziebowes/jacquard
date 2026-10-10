"use client";

// Says vs shows. One paragraph sheet is read in by the judge lamp. Its score for how important the
// paragraph says its subject is lands as loud discs in the left pan, and its evidence as a few small
// blocks in the right. The left pan sinks far below. A flag rises on the beam: the two scores are
// far apart, so a person should look. Ends with the beam tilted and the flag up.
import { Figure, defineFigure, cues, E, lerp, q, tilt } from "../_figure";
import { Frame, Street, Page, Judge, pageLines, labels, FG, MUTED, ACCENT } from "./world";

const C = cues({
  level: [0, 1.5],
  read: [1.5, 2.3],
  judge: [1.5, 2.1],
  flag: [3.5, 4.5],
});

const SEED = 7;
const SAY_T = [2.0, 2.2, 2.4, 2.6, 2.8]; // when each loud disc is dropped on the says pan
const EV_T = [3.0, 3.2, 3.4]; // when each small block is dropped on the evidence pan
const FALL = 0.5; // seconds a dropped piece takes to land
const DROP = 90; // height it falls from, in figure units
const BALLAST = 1; // each pan's own weight, so the empty beam sits level
const MAX_TILT = 0.5; // radians at the extreme

// rest places for the pieces, relative to the top centre of a pan (y up is negative)
const SAY_REST = [
  { x: -24, y: -11 },
  { x: 0, y: -11 },
  { x: 24, y: -11 },
  { x: -12, y: -32 },
  { x: 12, y: -32 },
];
const EV_REST = [
  { x: -16, y: -4 },
  { x: 0, y: -4 },
  { x: 16, y: -4 },
];
const DISC_R = 11;
const BLOCK = 8;

// how far a piece has dropped: 0 when it leaves, 1 when it rests (gravity: it speeds up)
const fallAt = (t: number, t0: number) => {
  const p = Math.min(1, Math.max(0, (t - t0) / FALL));
  return p * p;
};
// how much a piece counts on the beam: it counts once it has landed, smoothly
const weightAt = (t: number, t0: number) => E.io2(Math.min(1, Math.max(0, (t - t0 - FALL) / 0.3)));

const spec = defineFigure({
  dur: 4.5,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 340 },
  setup: () => ({ sheet: pageLines(SEED, 6) }),
  render: (t, S, { W, H, compact }) => {
    const L = labels(compact);
    // full width: the beam centred, the sheet at the left, the judge over the right pan.
    // compact: the same, tighter, with the ground lower and the labels set on the pans' left edges.
    const G = compact ? H - 40 : H - 36; // ground
    const cx = compact ? 190 : 360; // pivot
    const py = G - (compact ? 118 : 120); // pivot height
    const Lb = compact ? 70 : 100; // half the beam
    const pw = compact ? 60 : 84; // pan width
    const hang = compact ? 62 : 70; // beam end to pan top
    const sw = compact ? 66 : 110; // sheet width
    const sx = lerp(-sw - 30, compact ? 8 : 24, E.io3(C.p(t, "read")));
    const jx = compact ? cx + Lb + 56 : cx + Lb + 70;
    const js = compact ? 0.9 : 1;
    const jAim = 70;
    const lit = C.p(t, "judge", E.io2);

    // the beam: the weights so far, each side with its ballast; the tilt is their balance
    const sayW = BALLAST + SAY_T.reduce((s, t0) => s + 2 * weightAt(t, t0), 0);
    const evW = BALLAST + EV_T.reduce((s, t0) => s + weightAt(t, t0), 0);
    const a = tilt(sayW, evW, MAX_TILT); // positive: the right (evidence) end drops
    const deg = (a * 180) / Math.PI;

    // ends of the beam (before the pans hang from them), rotated about the pivot
    const Lx = cx - Lb * Math.cos(a);
    const Ly = py - Lb * Math.sin(a);
    const Rx = cx + Lb * Math.cos(a);
    const Ry = py + Lb * Math.sin(a);
    const LpT = Ly + hang; // top of the says pan
    const RpT = Ry + hang; // top of the evidence pan

    // the flag rises from the pivot as the two scores come apart
    const fl = C.p(t, "flag", E.io3);
    const poleTop = py - (compact ? 54 : 56) * fl;
    const pen = compact ? 22 : 26;

    return (
      <g>
        <defs>
          <clipPath id="prose-says-vs-shows-clip">
            <rect width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#prose-says-vs-shows-clip)">
          <Street x={0} y={G} w={W} />

          {/* the paragraph sheet, read in from the left and standing on the ground */}
          <Page x={sx} y={G} w={sw} lines={S.sheet} />

          {/* the post, pivot and beam: the beam rotates about the pivot */}
          <rect x={q(cx - 4)} y={q(py)} width={8} height={q(G - py)} fill={FG} />
          <rect x={q(cx - 30)} y={G - 6} width={60} height={6} fill={FG} />
          <g transform={`rotate(${q(deg)} ${q(cx)} ${q(py)})`}>
            <rect x={q(cx - Lb)} y={q(py - 3)} width={q(2 * Lb)} height={6} fill={FG} />
          </g>
          <circle cx={q(cx)} cy={q(py)} r={6} fill={FG} />

          {/* strings from each beam end to its pan, hairlines */}
          <g stroke={FG} strokeOpacity={0.55} strokeWidth={1.25}>
            <line x1={q(Lx)} y1={q(Ly)} x2={q(Lx - pw / 2)} y2={q(LpT)} />
            <line x1={q(Lx)} y1={q(Ly)} x2={q(Lx + pw / 2)} y2={q(LpT)} />
            <line x1={q(Rx)} y1={q(Ry)} x2={q(Rx - pw / 2)} y2={q(RpT)} />
            <line x1={q(Rx)} y1={q(Ry)} x2={q(Rx + pw / 2)} y2={q(RpT)} />
          </g>

          {/* the says pan: loud discs, dropped one by one */}
          <rect x={q(Lx - pw / 2)} y={q(LpT)} width={pw} height={6} fill={FG} />
          {SAY_T.map((t0, i) =>
            t >= t0 ? (
              <circle
                key={`s${i}`}
                cx={q(Lx + SAY_REST[i].x)}
                cy={q(LpT + SAY_REST[i].y - DROP * (1 - fallAt(t, t0)))}
                r={DISC_R}
                fill={FG}
              />
            ) : null,
          )}

          {/* the evidence pan: a few small blocks, muted */}
          <rect x={q(Rx - pw / 2)} y={q(RpT)} width={pw} height={6} fill={FG} />
          {EV_T.map((t0, i) =>
            t >= t0 ? (
              <rect
                key={`e${i}`}
                x={q(Rx + EV_REST[i].x - BLOCK / 2)}
                y={q(RpT + EV_REST[i].y - BLOCK / 2 - DROP * (1 - fallAt(t, t0)))}
                width={BLOCK}
                height={BLOCK}
                fill={MUTED}
              />
            ) : null,
          )}

          {/* the flag: a pole up from the pivot and a pennant in accent */}
          <rect x={q(cx - 1.5)} y={q(poleTop)} width={3} height={q(py - poleTop)} fill={FG} />
          <polygon
            points={`${q(cx + 1.5)},${q(poleTop)} ${q(cx + 1.5 + pen * fl)},${q(poleTop + 8 * fl)} ${q(cx + 1.5)},${q(poleTop + 16 * fl)}`}
            fill={ACCENT}
          />
          <text
            x={q(cx - 14)}
            y={q(py - 40)}
            textAnchor="end"
            {...L.label}
            fill={FG}
            opacity={fl}
          >
            flagged for a person
          </text>
          <text x={q(cx - 14)} y={q(py - 22)} textAnchor="end" {...L.small} fill={MUTED} opacity={fl}>
            says far above evidence
          </text>

          {/* the judge: a lamp over the right pan, its light on the sheet and the beam */}
          <Judge x={jx} y={G} s={js} aim={jAim} k={lit} id="prose-says-vs-shows-glow" />

          {/* labels beside each pan, on the ground line */}
          <text x={q(Lx - pw / 2)} y={G + 22} {...L.small} fill={MUTED}>
            says it matters
          </text>
          <text x={q(compact ? Rx : Rx - pw / 2)} y={G + 22} textAnchor={compact ? "end" : "start"} {...L.small} fill={MUTED}>
            evidence
          </text>
          <text
            x={q(compact ? W - 4 : jx)}
            y={G + 22}
            textAnchor={compact ? "end" : "middle"}
            {...L.small}
            fill={MUTED}
          >
            small model
          </text>
        </g>
      </g>
    );
  },
});

export default function SaysVsShows() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
