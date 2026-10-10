"use client";

// Five runs, averaged. Five judge lamps stand in a row to the right of a page, each head aimed at
// its own point on one flagged line. Their light lands on the line, then each run lands a mark on a
// stair of two steps: four on the upper step (0.3), the odd one, muted, on the lower (0.25). The
// accent marker, the average, slides in between the steps. The label arrives last. Ends still.
import { Figure, defineFigure, cues, E, lerp, q } from "../_figure";
import { Frame, Street, Page, Judge, judgeBulb, pageLines, pageRowY, labels, FG, MUTED, ACCENT, type PageLine } from "./world";

const C = cues({
  lower: [0, 1.5],
  drop: [1.5, 3],
  avg: [3, 4.2],
  label: [4.2, 4.8],
});

const SEED = 9;
const N = 9;
const FLAG = N - 2; // the flagged line: the second row from the bottom of the sheet
const ODD = 2; // the lamp whose run went the other way (muted)
const UP = 0.3;
const LOW = 0.25;
const AVG = (4 * UP + LOW) / 5; // the average of four 0.3s and one 0.25
const HITS = [0.2, 0.35, 0.5, 0.65, 0.8]; // where each lamp's light lands, as a share of the flagged line

const spec = defineFigure({
  dur: 4.8,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 320 },
  setup: () => ({ lines: pageLines(SEED, N) }),
  render: (t, S, { W, H, compact }) => {
    const L = labels(compact);
    const G = compact ? H - 70 : H - 40; // the ground line
    const s = compact ? 0.62 : 0.8; // lamp scale
    const pivot = 92 * s; // the lamp's pivot height above its foot
    const sheetX = compact ? 14 : 20;
    const sw = compact ? 124 : 200;
    const inset = 14;
    const textL = sheetX + inset;
    const textW = sw - inset * 2;
    const step = 13;
    const pad = 14;
    const bar = 5;
    const lines: PageLine[] = S.lines.map((l, i) => ({
      ...l,
      state: i === FLAG ? "ink" : "dim",
    }));
    const rowY = pageRowY(lines, FLAG, G, pad, step, bar) + bar / 2; // the flagged line's centre
    const flagW = Math.max(2, textW * lines[FLAG].len); // the flagged bar's length

    // the lamps: a row to the right of the page, evenly spaced, each one a fixed gap from the last
    const lampX0 = compact ? 156 : 264;
    const gap = compact ? 26 : 34;
    const lampX = HITS.map((_, i) => lampX0 + i * gap);
    // where each beam lands on the flagged line, then the aim that puts it there (a ray from the pivot)
    const hitX = HITS.map((h) => textL + flagW * h);
    const drop = rowY - (G - pivot); // from the pivot down to the line
    const aim = lampX.map((x, i) => (Math.atan((x - hitX[i]) / drop) * 180) / Math.PI);

    const low = E.io3(C.p(t, "lower"));
    const lampY = G - 40 * (1 - low); // the lamps come down from above
    const lampAim = aim.map((a) => lerp(0, a, low));

    // the stair: the lower step on the left, the upper step to the right, both standing on the ground
    const stepY = compact ? G - 22 : G - 30; // lower step's top (0.25)
    const upY = compact ? G - 52 : G - 70; // upper step's top (0.3)
    const lowX0 = compact ? 272 : 452;
    const riser = compact ? 306 : 530;
    const upX1 = W - (compact ? 14 : 36);
    const valueY = (v: number) => stepY - ((v - LOW) / (UP - LOW)) * (stepY - upY); // the scale is just these two steps
    const avgY = valueY(AVG);
    const mk = compact ? 8 : 10; // mark size

    // marks: four land on the upper step, evenly spaced, the odd one on the lower
    const upSpots = [0, 1, 3, 4].map((i, j) => ({ i, x: riser + ((upX1 - riser) * (j + 1)) / 5, top: upY, t0: 1.5, dur: 1.2 }));
    const lowSpot = { i: ODD, x: lowX0 + (riser - lowX0) / 2, top: stepY, t0: 1.7, dur: 1.3 };
    const marks = [...upSpots, lowSpot];

    const avgX = lerp(lowX0 + 14, riser - 26, E.io3(C.p(t, "avg"))); // slides across the lower rung, clear of the lamps
    const avgFade = C.p(t, "avg", E.io2);
    const labelFade = C.p(t, "label", E.io2);
    const labelY = compact ? 36 : 56;

    return (
      <g>
        <defs>
          <clipPath id="prose-five-runs-clip">
            <rect width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#prose-five-runs-clip)">
          <Street x={0} y={G} w={W} />

          {/* the page: one flagged line, the rest dim */}
          <Page x={sheetX} y={G} w={sw} lines={lines} pad={pad} step={step} bar={bar} />
          <text x={q(sheetX)} y={q(G - (compact ? 150 : 158))} {...L.small} fill={MUTED} opacity={low}>
            one line, five runs
          </text>

          {/* the stair: two solid steps, the lower one at 0.25, the upper at 0.3 */}
          <rect x={q(lowX0)} y={q(stepY)} width={q(riser - lowX0)} height={q(G - stepY)} fill={FG} />
          <rect x={q(riser)} y={q(upY)} width={q(upX1 - riser)} height={q(G - upY)} fill={FG} />
          {/* the step values, named under the ground */}
          <text x={q((riser + upX1) / 2)} y={q(G + 18)} textAnchor="middle" {...L.small} fill={MUTED} opacity={C.p(t, "drop", E.io2)}>
            0.3
          </text>
          <text x={q((lowX0 + riser) / 2)} y={q(G + 18)} textAnchor="middle" {...L.small} fill={MUTED} opacity={C.p(t, "drop", E.io2)}>
            0.25
          </text>

          {/* the five judge lamps, lowering into their row and turning to the line */}
          {lampX.map((x, i) => (
            <g key={i} opacity={low}>
              <Judge x={x} y={lampY} s={s} aim={lampAim[i]} k={0} id={`prose-five-runs-glow-${i}`} dim={i === ODD} />
            </g>
          ))}

          {/* the beams: each lamp's light, from its bulb down onto the flagged line */}
          {lampX.map((x, i) => {
            const b = judgeBulb({ x, y: G, s, aim: aim[i] });
            return (
              <line
                key={`beam-${i}`}
                x1={q(b.x)}
                y1={q(b.y)}
                x2={q(hitX[i])}
                y2={q(rowY)}
                stroke={i === ODD ? MUTED : FG}
                strokeOpacity={(i === ODD ? 0.6 : 0.5) * C.p(t, "lower", E.io2)}
                strokeWidth={1}
              />
            );
          })}

          {/* the marks: each lamp's run lands on a step */}
          {marks.map((m, n) => {
            const local = Math.min(1, Math.max(0, (t - m.t0) / m.dur));
            if (t < m.t0) return null;
            const e = E.io2(local);
            const b = judgeBulb({ x: lampX[m.i], y: G, s, aim: aim[m.i] });
            const ty = m.top - 10;
            const mx = lerp(b.x, m.x, e);
            // a short arc: up off the bulb, then down onto the step
            const my = lerp(b.y, ty, local) - 40 * Math.sin(Math.PI * local);
            return (
              <rect
                key={n}
                x={q(mx - mk / 2)}
                y={q(my - mk / 2)}
                width={mk}
                height={mk}
                fill={m.i === ODD ? MUTED : FG}
              />
            );
          })}

          {/* the average: an accent bar that settles between the two steps */}
          <rect x={q(avgX - 14)} y={q(avgY - 2)} width={28} height={4} fill={ACCENT} opacity={avgFade} />

          {/* the label, last */}
          <text x={q(compact ? 14 : W - 24)} y={q(labelY)} textAnchor={compact ? "start" : "end"} {...L.label} fill={FG} opacity={labelFade}>
            158 of 330: all five agree,
          </text>
          <text x={q(compact ? 14 : W - 24)} y={q(labelY + 18)} textAnchor={compact ? "start" : "end"} {...L.label} fill={FG} opacity={labelFade}>
            the rest mostly one step apart
          </text>
        </g>
      </g>
    );
  },
});

export default function FiveRuns() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
