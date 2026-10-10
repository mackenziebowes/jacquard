"use client";

/**
 * A height check for rhythm. The mkcmd-agent README stands against a pass line at 0.60.
 * As written it reaches 0.54. Claude took the headings, list items and table rows out of
 * the measurement and stood the page on them: 0.60, right at the line, while the deslop
 * reference script still read 0.58. A second agent's rewrite reached 0.68 by changing the
 * writing. Page lines of equal length are flat rhythm; uneven lines are varied rhythm.
 */

const W = 360;
const H = 318;
const FLOOR = 250;
const K = 250; // px per unit of rhythm score
const y = (s: number) => FLOOR - s * K;
const PW = 46; // page width
const TOP = 50; // crop the empty wall above the tallest page

// Line lengths (fraction of page width) drawn on each page
const FLAT = Array(11).fill(0.78);
const VARIED = [0.86, 0.32, 0.7, 0.9, 0.18, 0.62, 0.84, 0.4, 0.76, 0.24, 0.9, 0.55];

function Page({
  cx,
  top,
  bottom,
  lines,
  color,
  fillPct,
}: {
  cx: number;
  top: number;
  bottom: number;
  lines: number[];
  color: string;
  fillPct: number;
}) {
  const x = cx - PW / 2;
  const h = bottom - top;
  const step = (h - 12) / lines.length;
  return (
    <g>
      <rect
        x={x}
        y={top}
        width={PW}
        height={h}
        fill={`color-mix(in oklch, ${color} ${fillPct}%, transparent)`}
        stroke={color}
        strokeOpacity={0.8}
        strokeWidth={1}
      />
      {lines.map((f, i) => (
        <line
          key={i}
          x1={x + 6}
          x2={x + 6 + (PW - 12) * f}
          y1={top + 8 + i * step}
          y2={top + 8 + i * step}
          stroke={color}
          strokeOpacity={0.7}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

export default function HeightCheck() {
  const fg = "var(--foreground)";
  const muted = "var(--muted-foreground)";
  const accent = "var(--accent)";
  const label = { fontFamily: "var(--font-sans)", fontSize: 13.5 } as const;
  const small = { fontFamily: "var(--font-sans)", fontSize: 12 } as const;
  const num = { fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 600 } as const;

  const cols = [62, 180, 308];
  const bar = y(0.6);

  // Panel 2: the removed lines, stacked into a step stool
  const strips = 4;
  const stripH = 6;
  const stripGap = 2;
  const stoolTop = FLOOR - strips * (stripH + stripGap);

  return (
    <div className="border border-border/60 bg-surface/40 p-3 md:p-5" aria-hidden>
      <svg viewBox={`0 ${TOP} ${W} ${H - TOP}`} className="mx-auto block h-auto w-full max-w-[540px]">
        {/* Wall mark: the pass line */}
        <line x1={8} x2={W - 8} y1={bar} y2={bar} stroke={fg} strokeOpacity={0.55} strokeDasharray="5 4" />
        <text x={8} y={bar - 7} fill={fg} style={small}>
          pass line 0.60
        </text>

        {/* Floor */}
        <line x1={8} x2={W - 8} y1={FLOOR} y2={FLOOR} stroke={fg} strokeOpacity={0.55} />

        {/* 1. As written: flat lines, short of the line */}
        <Page cx={cols[0]} top={y(0.54)} bottom={FLOOR} lines={FLAT} color={muted} fillPct={14} />
        <line x1={cols[0] + PW / 2 + 2} x2={cols[0] + PW / 2 + 12} y1={y(0.54)} y2={y(0.54)} stroke={fg} strokeOpacity={0.8} strokeWidth={1.4} />
        <text x={cols[0] + PW / 2 + 15} y={y(0.54) + 4} fill={fg} style={num}>
          0.54
        </text>

        {/* 2. Measurement changed: page stood on its own headings, lists and tables */}
        <Page cx={cols[1]} top={y(0.6)} bottom={stoolTop - 2} lines={FLAT.slice(0, 10)} color={muted} fillPct={14} />
        {Array.from({ length: strips }, (_, i) => (
          <rect
            key={i}
            x={cols[1] - PW / 2 - 6 + (i % 2) * 3}
            y={FLOOR - (i + 1) * (stripH + stripGap) + stripGap}
            width={PW + 6}
            height={stripH}
            fill={`color-mix(in oklch, ${fg} 10%, transparent)`}
            stroke={fg}
            strokeOpacity={0.5}
            strokeWidth={0.8}
          />
        ))}
        <text x={cols[1]} y={y(0.6) - 6} textAnchor="middle" fill={fg} style={num}>
          0.60
        </text>
        {/* The reference script's reading of the same page */}
        <line
          x1={cols[1] + PW / 2 + 2}
          x2={cols[1] + PW / 2 + 12}
          y1={y(0.58)}
          y2={y(0.58)}
          stroke={fg}
          strokeOpacity={0.8}
          strokeWidth={1.4}
        />
        <text x={cols[1] + PW / 2 + 15} y={y(0.58) + 4} fill={fg} style={num}>
          0.58
        </text>
        <text x={cols[1] + PW / 2 + 15} y={y(0.58) + 19} fill={muted} style={small}>
          reference
        </text>
        <text x={cols[1] + PW / 2 + 15} y={y(0.58) + 33} fill={muted} style={small}>
          script
        </text>

        {/* 3. Rewritten by a second agent: uneven lines, clears the line */}
        <Page cx={cols[2]} top={y(0.68)} bottom={FLOOR} lines={VARIED} color={accent} fillPct={22} />
        <text x={cols[2]} y={y(0.68) - 8} textAnchor="middle" fill={accent} style={num}>
          0.68
        </text>

        {/* Captions under the floor */}
        <text x={cols[0]} y={FLOOR + 22} textAnchor="middle" fill={fg} style={label}>
          as written
        </text>
        <text x={cols[0]} y={FLOOR + 39} textAnchor="middle" fill={muted} style={small}>
          fails
        </text>

        <text x={cols[1]} y={FLOOR + 22} textAnchor="middle" fill={fg} style={label}>
          ruler changed
        </text>
        <text x={cols[1]} y={FLOOR + 39} textAnchor="middle" fill={muted} style={small}>
          standing on its
        </text>
        <text x={cols[1]} y={FLOOR + 54} textAnchor="middle" fill={muted} style={small}>
          headings and lists
        </text>

        <text x={cols[2]} y={FLOOR + 22} textAnchor="middle" fill={accent} style={label}>
          writing changed
        </text>
        <text x={cols[2]} y={FLOOR + 39} textAnchor="middle" fill={muted} style={small}>
          a second agent
        </text>
        <text x={cols[2]} y={FLOOR + 54} textAnchor="middle" fill={muted} style={small}>
          rewrote it
        </text>
      </svg>
    </div>
  );
}
