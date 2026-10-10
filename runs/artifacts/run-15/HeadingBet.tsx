"use client";

/**
 * The lost bet. Predicted: every heading ranks 1.0 for "how important does the author want me
 * to think this section is". Three Haiku runs averaged 0.47, 0.52 and 0.50. All three quoted
 * the same seven lines as the reason a section sounded important.
 */
import { Frame, Bar, FG, MUTED, ACCENT, label, small, num } from "./world";

const RUNS = [0.47, 0.52, 0.5];
const X = 70, L = 330, Y0 = 58, STEP = 40;

export default function HeadingBet() {
  return (
    <Frame>
      <svg viewBox="0 0 460 290" className="block h-auto w-full" aria-hidden>
        <text x={X} y={26} fill={MUTED} style={small}>mean importance of a heading, 0 to 1</text>
        {RUNS.map((v, i) => {
          const y = Y0 + i * STEP;
          return (
            <g key={i}>
              <text x={X - 12} y={y + 15} textAnchor="end" fill={MUTED} style={small}>run {i + 1}</text>
              <Bar x={X} y={y} w={L} h={22} fill={FG} opacity={0.14} />
              <Bar x={X} y={y} w={v * L} h={22} fill={FG} opacity={1} />
              <text x={X + v * L + 8} y={y + 16} fill={FG} style={num}>{v.toFixed(2)}</text>
            </g>
          );
        })}
        {/* the bet */}
        <line x1={X + L} x2={X + L} y1={Y0 - 10} y2={Y0 + 2 * STEP + 32} stroke={FG} strokeOpacity={0.55} strokeWidth={1.2} />
        <text x={X + L} y={Y0 + 2 * STEP + 50} textAnchor="middle" fill={FG} style={label}>the bet: all 1.0</text>

        {/* the seven lines */}
        <text x={X} y={218} fill={FG} style={label}>the same seven lines, quoted in all three runs</text>
        {Array.from({ length: 7 }, (_, i) => (
          <Bar key={i} x={X + i * 26} y={232} w={20} h={7} fill={ACCENT} opacity={1} />
        ))}
        <text x={X} y={262} fill={MUTED} style={small}>"The one that changed the plan was" - cut in the rewrite</text>
      </svg>
    </Frame>
  );
}
