"use client";

/**
 * The cast shared by this post's figures, drawn to match DraftSieve and CheckLoop:
 * drafted boards, the agent's hopper, the sieve of checks, "You", crates and gates.
 */
import type { ReactNode } from "react";
import { q } from "../_figure";

export const TW = 13; // board width
export const TH = 8; // board height
export const FG = "var(--foreground)";
export const MUTED = "var(--muted-foreground)";
export const ACCENT = "var(--accent)";
export const line = { stroke: FG, strokeOpacity: 0.55, strokeWidth: 1, fill: "none" } as const;

export const type = (compact: boolean) => ({
  label: { fontFamily: "var(--font-sans)", fontSize: compact ? 15 : 14 } as const,
  small: { fontFamily: "var(--font-sans)", fontSize: compact ? 13 : 12.5 } as const,
});

/** The frame every figure in this post sits in. */
export function Frame({ children }: { children: ReactNode }) {
  return <div className="border border-border/60 bg-surface/40 p-3 md:p-5">{children}</div>;
}

/** A drafted board, centred on x, y. */
export function Board({ x, y, r = 0, pass, opacity = 1 }: { x: number; y: number; r?: number; pass?: boolean; opacity?: number }) {
  const c = pass ? ACCENT : MUTED;
  return (
    <g transform={`translate(${q(x, 1)} ${q(y, 1)}) rotate(${q(r, 1)})`} opacity={opacity}>
      <rect
        x={-TW / 2}
        y={-TH / 2}
        width={TW}
        height={TH}
        fill={`color-mix(in oklch, ${c} ${pass ? 55 : 22}%, transparent)`}
        stroke={c}
        strokeOpacity={pass ? 1 : 0.6}
        strokeWidth={0.8}
      />
      <circle cx={-3} cy={0} r={1.1} fill={c} opacity={pass ? 1 : 0.7} />
      <circle cx={3} cy={0} r={1.1} fill={c} opacity={pass ? 1 : 0.7} />
    </g>
  );
}

/** The agent: a hopper whose mouth is at (cx, y + 44). */
export function Hopper({ cx, y, label }: { cx: number; y: number; label: { fontFamily: string; fontSize: number } }) {
  return (
    <g>
      <path
        d={`M${cx - 40} ${y} H${cx + 40} L${cx + 16} ${y + 44} H${cx - 16} Z`}
        {...line}
        fill={`color-mix(in oklch, ${FG} 6%, transparent)`}
      />
      <text x={cx} y={y + 23} textAnchor="middle" fill={FG} style={{ ...label, fontWeight: 600 }}>
        Agent
      </text>
    </g>
  );
}

/** The sieve of checks, top edge at y. */
export function Sieve({ x, y, w, text, small }: { x: number; y: number; w: number; text: string; small: { fontFamily: string; fontSize: number } }) {
  const n = Math.floor((w - 8) / 12);
  return (
    <g>
      <rect x={x} y={y} width={w} height={18} {...line} fill="var(--background)" />
      {Array.from({ length: n }, (_, k) => (
        <line key={k} x1={x + 6 + k * 12} x2={x + 6 + k * 12} y1={y + 2} y2={y + 16} stroke={FG} strokeOpacity={0.12} />
      ))}
      <text x={x + w / 2} y={y + 13} textAnchor="middle" fill={FG} style={small}>
        {text}
      </text>
    </g>
  );
}

/** A stick person, feet at (x, y), drawn like the one in CheckLoop. `reach` points the arm (dx, dy). */
export function Person({ x, y, reach, opacity = 1, color = FG }: { x: number; y: number; reach?: [number, number]; opacity?: number; color?: string }) {
  const [rx, ry] = reach ?? [-6, 26];
  return (
    <g opacity={opacity} stroke={color} strokeOpacity={0.55} strokeWidth={1} fill="none">
      <circle cx={x} cy={y - 78} r={8} />
      <path d={`M${x} ${y - 70} V${y - 36} M${x} ${y - 36} L${x - 8} ${y} M${x} ${y - 36} L${x + 8} ${y}`} />
      <path d={`M${x} ${y - 60} L${q(x + rx, 1)} ${q(y - 60 + ry, 1)}`} />
    </g>
  );
}

/** A shipping crate, bottom-left at (x, y). */
export function Crate({ x, y, w, h, color = FG, opacity = 0.55 }: { x: number; y: number; w: number; h: number; color?: string; opacity?: number }) {
  return (
    <g stroke={color} strokeOpacity={opacity} strokeWidth={1} fill="none">
      <rect x={q(x, 1)} y={q(y - h, 1)} width={w} height={h} fill={`color-mix(in oklch, ${color} 7%, var(--background))`} />
      <path d={`M${q(x, 1)} ${q(y - h, 1)} L${q(x + w, 1)} ${q(y, 1)} M${q(x + w, 1)} ${q(y - h, 1)} L${q(x, 1)} ${q(y, 1)}`} strokeOpacity={opacity * 0.45} />
    </g>
  );
}

/** A gate across a road: two posts and a lintel, label above. Ground at y. */
export function Gate({ x, y, h, text, small, dim }: { x: number; y: number; h: number; text: string; small: { fontFamily: string; fontSize: number }; dim?: boolean }) {
  return (
    <g>
      <path d={`M${x} ${y} V${y - h} H${x + 8} V${y}`} {...line} strokeOpacity={dim ? 0.3 : 0.55} />
      <text x={x + 4} y={y - h - 8} textAnchor="middle" fill={dim ? MUTED : FG} style={small}>
        {text}
      </text>
    </g>
  );
}
