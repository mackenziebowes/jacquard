"use client";

/**
 * What a reader is for. Two habits a word list can't see: a paragraph that says its subject
 * matters far more than it shows (scored per paragraph, importance against evidence), and a
 * sentence that only interprets what came before (scored per sentence).
 */
import { Frame, Bar, FG, MUTED, ACCENT, label, small } from "./world";

export default function TwoQuestions() {
  return (
    <Frame>
      <svg viewBox="0 0 460 300" className="block h-auto w-full" aria-hidden>
        {/* per paragraph */}
        <text x={24} y={26} fill={FG} style={label}>per paragraph</text>
        {[0.9, 0.82, 0.88, 0.5].map((f, i) => (
          <Bar key={i} x={24} y={44 + i * 14} w={f * 160} h={6} />
        ))}
        <text x={230} y={58} fill={MUTED} style={small}>says it matters</text>
        <Bar x={230} y={64} w={190} h={10} fill={FG} opacity={1} />
        <text x={230} y={98} fill={MUTED} style={small}>gives evidence</text>
        <Bar x={230} y={104} w={52} h={10} fill={FG} opacity={0.5} />
        <rect x={282} y={104} width={138} height={10} fill={ACCENT} />
        <text x={230} y={134} fill={ACCENT} style={small}>flagged when the first is</text>
        <text x={230} y={150} fill={ACCENT} style={small}>far above the second</text>

        {/* per sentence */}
        <text x={24} y={186} fill={FG} style={label}>per sentence</text>
        <Bar x={24} y={206} w={190} h={8} fill={FG} opacity={1} />
        <text x={230} y={214} fill={FG} style={small}>adds new information</text>
        <Bar x={24} y={238} w={150} h={8} fill={ACCENT} opacity={1} />
        <text x={230} y={246} fill={ACCENT} style={small}>only interprets the one before</text>
        <text x={24} y={282} fill={MUTED} style={small}>each unit is numbered so every run scores the same pieces</text>
      </svg>
    </Frame>
  );
}
