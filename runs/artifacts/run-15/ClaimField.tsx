"use client";

/**
 * A field named claim. Haiku read "claim" as "describe the claim" and wrote sentences where
 * the number should go: four of five significance runs returned no scores. Renamed
 * importance_score / evidence_score / empty_score with a strict schema, all five came back whole.
 */
import { Frame, FG, MUTED, ACCENT, GROUND, label, small, num } from "./world";

function Slip({ x, y, words, fill = ACCENT }: { x: number; y: number; words: boolean; fill?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={56} height={48} fill={words ? MUTED : fill} opacity={words ? 0.55 : 1} />
      {words ? (
        <>
          <rect x={x + 7} y={y + 9} width={42} height={4} fill={GROUND} />
          <rect x={x + 7} y={y + 19} width={34} height={4} fill={GROUND} />
          <rect x={x + 7} y={y + 29} width={40} height={4} fill={GROUND} />
          <rect x={x + 7} y={y + 39} width={22} height={4} fill={GROUND} />
        </>
      ) : (
        <rect x={x + 14} y={y + 21} width={28} height={6} fill={GROUND} />
      )}
    </g>
  );
}

export default function ClaimField() {
  const xs = [24, 98, 172, 246, 320];
  return (
    <Frame>
      <svg viewBox="0 0 460 270" className="block h-auto w-full" aria-hidden>
        <text x={24} y={28} fill={FG} style={num}>claim</text>
        {xs.map((x, i) => (
          <Slip key={i} x={x} y={42} words={i !== 2} fill={FG} />
        ))}
        <text x={24} y={118} fill={MUTED} style={small}>four of five runs answered in sentences</text>

        <text x={24} y={160} fill={ACCENT} style={num}>importance_score</text>
        {xs.map((x, i) => (
          <Slip key={i} x={x} y={174} words={false} />
        ))}
        <text x={24} y={250} fill={ACCENT} style={small}>all five came back with a number</text>
      </svg>
    </Frame>
  );
}
