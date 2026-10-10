import type { ReactNode } from "react";

/** Shared pieces for the prose-scrub 0.4 figures: a page is a stack of filled bars, nothing outlined. */
export const FG = "var(--foreground)";
export const MUTED = "var(--muted-foreground)";
export const ACCENT = "var(--accent)";
export const CUT = "var(--accent-a)";
export const GROUND = "var(--background)";

export const label = { fontFamily: "var(--font-sans)", fontSize: 13.5 } as const;
export const small = { fontFamily: "var(--font-sans)", fontSize: 12 } as const;
export const num = { fontFamily: "var(--font-mono)", fontSize: 13.5 } as const;

export function Frame({ children }: { children: ReactNode }) {
  return <div className="border border-border/60 bg-surface/40 p-3 md:p-5">{children}</div>;
}

/** One line of text, as a bar. */
export function Bar({ x, y, w, h = 7, fill = MUTED, opacity = 0.7 }: { x: number; y: number; w: number; h?: number; fill?: string; opacity?: number }) {
  return <rect x={x} y={y} width={Math.max(0, w)} height={h} fill={fill} opacity={opacity} />;
}
