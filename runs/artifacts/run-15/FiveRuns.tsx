"use client";

/**
 * Five runs, averaged. Left: on one item four runs said 0.3 and one said 0.25, a single step
 * on Haiku's grid. Right: across the bridge file and the last post, the runs agreed exactly on
 * 158 of 330 scores (22 x 15 = 330 cells).
 */
import { Frame, FG, MUTED, ACCENT, label, small, num } from "./world";

const COLS = 22, ROWS = 15, AGREE = 158, CELL = 8, GAP = 2;

export default function FiveRuns() {
  const gx = 256, gy = 40;
  const tick = (i: number) => 40 + i * 70; // 0.2 .. 0.35
  return (
    <Frame>
      <svg viewBox="0 0 460 250" className="block h-auto w-full" aria-hidden>
        <text x={24} y={26} fill={FG} style={label}>one item, five runs</text>
        <line x1={24} x2={216} y1={180} y2={180} stroke={FG} strokeOpacity={0.55} strokeWidth={1.2} />
        {[0.25, 0.3].map((v, i) => (
          <g key={v}>
            <line x1={tick(i + 1)} x2={tick(i + 1)} y1={180} y2={186} stroke={FG} strokeOpacity={0.55} strokeWidth={1.2} />
            <text x={tick(i + 1)} y={203} textAnchor="middle" fill={MUTED} style={num}>{v}</text>
          </g>
        ))}
        {/* one run at 0.25, four at 0.3, stacked */}
        <circle cx={tick(1)} cy={168} r={9} fill={ACCENT} />
        {[0, 1, 2, 3].map((k) => (
          <circle key={k} cx={tick(2)} cy={168 - k * 22} r={9} fill={FG} />
        ))}
        <text x={24} y={232} fill={MUTED} style={small}>one step apart on the grid</text>

        <text x={gx} y={26} fill={FG} style={label}>330 scores</text>
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const c = i % COLS, r = Math.floor(i / COLS);
          return (
            <rect key={i} x={gx + c * (CELL + GAP)} y={gy + r * (CELL + GAP)} width={CELL} height={CELL} fill={i < AGREE ? FG : MUTED} opacity={i < AGREE ? 1 : 0.35} />
          );
        })}
        <text x={gx} y={gy + ROWS * (CELL + GAP) + 24} fill={FG} style={small}>158 agreed exactly</text>
      </svg>
    </Frame>
  );
}
