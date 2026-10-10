"use client";

import { useMemo, useState } from "react";

/**
 * How the terrain synth sizes its halftone dots (synth/terrain.ts, "mixed" style).
 * A crop of an illustrative hill at true pixel scale: thin contour lines, two index
 * contours, and the 45-degree, 11 px dot screen. Each screen point takes its radius from
 * its distance to the nearest index contour, measured in pixels as elevation difference
 * divided by the local gradient. The toggle drops the division to show why it is there.
 * The hill is made up; the pitch, ribbon width, radius curve and cutoff are the synth's.
 */

const W = 560;
const H = 300;
const PITCH = 11;
const RIBBON = 22; // index contour ribbon width, px
const R_MAX = 5; // index contour max dot radius, px
const R_MIN = 0.7; // dots smaller than this are skipped
const LEVELS = 10;
const INDEX = [4, 8];

// Illustrative terrain: a hill that is steep to the west and gentle to the east
const CX = 235;
const CY = 175;
function elevation(x: number, y: number) {
  const sx = x < CX ? 80 : 300;
  const dx = (x - CX) / sx;
  const dy = (y - CY) / 125;
  return Math.exp(-(dx * dx + dy * dy));
}
const level = (k: number) => k / (LEVELS + 1);
// Round SVG numbers so server and client render identical attributes
const q2 = (n: number) => Math.round(n * 100) / 100;

function radius(dist: number) {
  if (dist >= RIBBON) return 0;
  const r = R_MAX * Math.pow(1 - dist / RIBBON, 1.25);
  return r >= R_MIN ? r : 0;
}

function gradient(x: number, y: number) {
  const gx = (elevation(x + 2, y) - elevation(x - 2, y)) / 4;
  const gy = (elevation(x, y + 2) - elevation(x, y - 2)) / 4;
  return { gx, gy, g: Math.hypot(gx, gy) + 1e-6 };
}

/* Marching squares on a 4 px grid, for the contour lines */
const STEP = 4;
function contourPath(lv: number) {
  const nx = Math.ceil(W / STEP);
  const ny = Math.ceil(H / STEP);
  let d = "";
  const f = (n: number) => n.toFixed(1);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x0 = i * STEP;
      const y0 = j * STEP;
      const v00 = elevation(x0, y0);
      const v10 = elevation(x0 + STEP, y0);
      const v11 = elevation(x0 + STEP, y0 + STEP);
      const v01 = elevation(x0, y0 + STEP);
      const idx =
        (v00 > lv ? 1 : 0) | (v10 > lv ? 2 : 0) | (v11 > lv ? 4 : 0) | (v01 > lv ? 8 : 0);
      if (idx === 0 || idx === 15) continue;
      const t = (a: number, b: number) => (lv - a) / (b - a);
      const pt = (e: number): [number, number] =>
        e === 0
          ? [x0 + t(v00, v10) * STEP, y0]
          : e === 1
            ? [x0 + STEP, y0 + t(v10, v11) * STEP]
            : e === 2
              ? [x0 + t(v01, v11) * STEP, y0 + STEP]
              : [x0, y0 + t(v00, v01) * STEP];
      const seg = (a: number, b: number) => {
        const [x1, y1] = pt(a);
        const [x2, y2] = pt(b);
        d += `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`;
      };
      const pairs: Record<number, [number, number][]> = {
        1: [[3, 0]], 14: [[3, 0]], 2: [[0, 1]], 13: [[0, 1]], 3: [[3, 1]], 12: [[3, 1]],
        4: [[1, 2]], 11: [[1, 2]], 6: [[0, 2]], 9: [[0, 2]], 7: [[3, 2]], 8: [[3, 2]],
        5: [[3, 0], [1, 2]], 10: [[0, 1], [2, 3]],
      };
      for (const [a, b] of pairs[idx]) seg(a, b);
    }
  }
  return d;
}

interface Point {
  x: number;
  y: number;
  val: number;
  gx: number;
  gy: number;
  g: number;
}

// The 45-degree screen, laid out the way the synth does it
const h = PITCH / Math.SQRT2;
const POINTS: Point[] = [];
for (let u = -40; u <= 40; u++) {
  for (let v = -40; v <= 40; v++) {
    const x = W / 2 + (u - v) * h;
    const y = H / 2 + (u + v) * h;
    if (x < 4 || x > W - 4 || y < 4 || y > H - 4) continue;
    POINTS.push({ x, y, val: elevation(x, y), ...gradient(x, y) });
  }
}

// For the counterfactual: one fixed divisor, the mean slope over the crop
const MEAN_G = POINTS.reduce((s, p) => s + p.g, 0) / POINTS.length;

type Mode = "pixels" | "elevation";

function nearest(p: Point, mode: Mode) {
  let best = { k: INDEX[0], dist: Infinity, r: 0 };
  for (const k of INDEX) {
    const dist = Math.abs(p.val - level(k)) / (mode === "pixels" ? p.g : MEAN_G);
    const r = radius(dist);
    if (dist < best.dist) best = { k, dist, r: Math.max(best.r, r) };
    else best.r = Math.max(best.r, r);
  }
  return best;
}

// Default probe: a screen point on the steep side, partway out from the outer index contour
const DEFAULT_PROBE = (() => {
  let pick = 0;
  let score = Infinity;
  POINTS.forEach((p, i) => {
    if (p.x > CX - 60) return;
    const d = Math.abs(p.val - level(4)) / p.g;
    const s = Math.abs(d - 12) + Math.abs(p.y - CY) / 20;
    if (s < score) {
      score = s;
      pick = i;
    }
  });
  return pick;
})();

export default function HalftoneRibbon() {
  const [mode, setMode] = useState<Mode>("pixels");
  const [probe, setProbe] = useState(DEFAULT_PROBE);

  const lines = useMemo(
    () =>
      Array.from({ length: LEVELS }, (_, i) => i + 1).map((k) => ({
        k,
        index: INDEX.includes(k),
        d: contourPath(level(k)),
      })),
    [],
  );

  const dots = useMemo(() => POINTS.map((p) => nearest(p, mode)), [mode]);

  const p = POINTS[probe];
  const info = dots[probe];
  // Foot of the perpendicular to the nearest index contour (one Newton step along the gradient)
  const dv = p.val - level(info.k);
  const foot = { x: p.x - (dv * p.gx) / (p.g * p.g), y: p.y - (dv * p.gy) / (p.g * p.g) };
  const trueDist = Math.abs(dv) / p.g;

  function onPointer(e: React.PointerEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    let best = probe;
    let bd = Infinity;
    POINTS.forEach((q, i) => {
      const d = (q.x - x) ** 2 + (q.y - y) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    if (best !== probe) setProbe(best);
  }

  const dot = "var(--accent-b)";
  const btn = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      className={`border px-2.5 py-1 transition-colors ${
        mode === m
          ? "border-foreground/50 text-foreground"
          : "border-border/60 text-foreground/50 hover:text-foreground/80"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="border border-border/60 bg-surface/40 p-4 md:p-6" aria-hidden>
      <div className="mb-3 flex flex-wrap items-center gap-2 font-sans text-[0.7rem]">
        <span className="mr-1 text-foreground/45">Distance measured as</span>
        {btn("pixels", "elevation ÷ slope (as built)")}
        {btn("elevation", "elevation only")}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full touch-none select-none"
        onPointerMove={onPointer}
        onPointerDown={onPointer}
      >
        {lines.map((l) => (
          <path
            key={l.k}
            d={l.d}
            fill="none"
            stroke={l.index ? dot : "var(--foreground)"}
            strokeOpacity={l.index ? 0.9 : 0.28}
            strokeWidth={l.index ? 1.9 : 1.1}
            strokeLinecap="round"
          />
        ))}

        {POINTS.map((q, i) =>
          dots[i].r > 0 ? (
            <circle key={i} cx={q2(q.x)} cy={q2(q.y)} r={q2(dots[i].r)} fill={dot} />
          ) : (
            <circle key={i} cx={q2(q.x)} cy={q2(q.y)} r={0.9} fill="var(--foreground)" fillOpacity={0.18} />
          ),
        )}

        <line
          x1={q2(p.x)}
          y1={q2(p.y)}
          x2={q2(foot.x)}
          y2={q2(foot.y)}
          stroke="var(--foreground)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <circle cx={q2(foot.x)} cy={q2(foot.y)} r={2.5} fill="var(--foreground)" />
        <circle
          cx={q2(p.x)}
          cy={q2(p.y)}
          r={q2(Math.max(info.r, 1) + 4)}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth={1.5}
        />

      </svg>
      <div className="mt-1 flex justify-between font-sans text-[0.68rem] text-foreground/45">
        <span>Steep: lines close</span>
        <span>Gentle: lines far apart</span>
      </div>

      <p className="mt-3 min-h-[3.2em] font-sans text-[0.75rem] leading-[1.6] text-foreground/70">
        {mode === "pixels" ? (
          <>
            Ringed dot: <span className="text-foreground">{trueDist.toFixed(1)} px</span> from the
            index contour, so radius{" "}
            <span className="text-foreground">
              {info.r > 0 ? `${info.r.toFixed(1)} px` : "below 0.7 px, skipped"}
            </span>
            .
          </>
        ) : (
          <>
            Ringed dot: really {trueDist.toFixed(1)} px from the contour, but read as{" "}
            <span className="text-foreground">{info.dist.toFixed(1)} px</span>, so radius{" "}
            <span className="text-foreground">
              {info.r > 0 ? `${info.r.toFixed(1)} px` : "below 0.7 px, skipped"}
            </span>
            . Ribbons swell on gentle ground and thin out on steep ground.
          </>
        )}{" "}
        <span className="text-foreground/45">Point at any dot to measure it.</span>
      </p>

      <Falloff />
    </div>
  );
}

/** The radius curve for index contours: 5 px at the line, gone by about 17 px. */
function Falloff() {
  const FW = 560;
  const FH = 46;
  const x0 = 24;
  const x1 = FW - 24;
  const sx = (d: number) => x0 + (d / RIBBON) * (x1 - x0);
  const cutoff = RIBBON * (1 - Math.pow(R_MIN / R_MAX, 1 / 1.25));
  const ds = Array.from({ length: RIBBON + 1 }, (_, i) => i);
  return (
    <div className="mt-4 border-t border-border/40 pt-3">
      <div className="mb-1 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-foreground/45">
        Dot radius by distance to an index contour
      </div>
      <div className="mb-1 font-sans text-[0.7rem] text-foreground/55">
        5 px on the line, shrinking to under 0.7 px (not drawn) past about 17 px. The ribbon ends at 22 px.
      </div>
      <svg viewBox={`0 0 ${FW} ${FH}`} className="block h-auto w-full">
        <line x1={x0} y1={23} x2={x1} y2={23} stroke="var(--foreground)" strokeOpacity={0.15} />
        {ds.map((d) => {
          const r = radius(d);
          return r > 0 ? (
            <circle key={d} cx={q2(sx(d))} cy={23} r={q2(r * 1.6)} fill="var(--accent-b)" />
          ) : (
            <circle key={d} cx={q2(sx(d))} cy={23} r={1.2} fill="var(--foreground)" fillOpacity={0.25} />
          );
        })}
        <line
          x1={q2(sx(cutoff))}
          y1={6}
          x2={q2(sx(cutoff))}
          y2={40}
          stroke="var(--foreground)"
          strokeOpacity={0.4}
          strokeDasharray="2 3"
        />
      </svg>
      <div className="relative h-4 font-sans text-[0.68rem] text-foreground/45">
        {[0, 11, cutoff, 22].map((d) => (
          <span
            key={d}
            className="absolute top-0 whitespace-nowrap"
            style={{
              left: `${(sx(d) / FW) * 100}%`,
              transform: d === 0 ? undefined : d === 22 ? "translateX(-100%)" : "translateX(-50%)",
            }}
          >
            {d === cutoff ? `${d.toFixed(0)} px` : `${d} px`}
          </span>
        ))}
      </div>
    </div>
  );
}
