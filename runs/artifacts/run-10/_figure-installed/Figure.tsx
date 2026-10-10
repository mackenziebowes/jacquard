"use client";
// The figure runner. A figure is a pure function of time t in [0, dur]:
//   - the server renders t = dur, so the page ships the finished picture (no frame-0 flash, works without JS)
//   - when the figure first scrolls into view it plays from 0 to dur, once
//   - prefers-reduced-motion: it stays on the end state
//   - tab hidden mid-play: it jumps to the end state
//   - clicking a finished figure plays it again
// Narrow containers (< 480px) get `compact: true` and the compact size, so a figure can restack or
// enlarge its labels instead of shrinking them.
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

export type FigureCtx = { W: number; H: number; compact: boolean };
type Common<S> = {
  dur: number;
  /** viewBox size for normal widths. */
  size: { W: number; H: number };
  /** viewBox size below 480px wide. Defaults to `size`. */
  compact?: { W: number; H: number };
  /** Built once. Seeded layouts, piles, bodies: anything that doesn't change with t. */
  setup?: () => S;
};
export type SvgFigure<S> = Common<S> & { render: (t: number, state: S, ctx: FigureCtx) => ReactNode };
export type CanvasFigure<S> = Common<S> & { draw: (g: CanvasRenderingContext2D, t: number, state: S, ctx: FigureCtx) => void };
export type FigureSpec<S> = SvgFigure<S> | CanvasFigure<S>;

export function defineFigure<S = undefined>(spec: FigureSpec<S>) { return spec; }

function usePlayhead(dur: number, ref: RefObject<Element | null>) {
  const [t, setT] = useState(dur);
  const [compact, setCompact] = useState(false);
  const play = useRef<() => void>(() => {});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCompact(e.contentRect.width < 480));
    ro.observe(el);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, playing = false;
    const stop = () => { cancelAnimationFrame(raf); playing = false; setT(dur); };
    play.current = () => {
      if (still || playing) return;
      playing = true;
      let start = -1;
      const tick = (now: number) => {
        if (start < 0) start = now; // reset to frame 0 only inside the first frame callback
        const s = (now - start) / 1000;
        if (s >= dur) return stop();
        setT(s);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); play.current(); } }, { threshold: 0.4 });
    io.observe(el);
    const onHide = () => { if (document.hidden && playing) stop(); };
    document.addEventListener("visibilitychange", onHide);
    return () => { ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", onHide); };
  }, [dur, ref]);

  return { t, compact, replay: () => play.current() };
}

export function Figure<S>({ spec, className }: { spec: FigureSpec<S>; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useMemo(() => spec.setup?.() as S, [spec]);
  const { t, compact, replay } = usePlayhead(spec.dur, ref);
  const { W, H } = compact && spec.compact ? spec.compact : spec.size;
  const ctx = { W, H, compact };
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!("draw" in spec) || !canvas.current) return;
    const c = canvas.current, dpr = window.devicePixelRatio || 1;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    const g = c.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    spec.draw(g, t, state, ctx);
  });

  return (
    <div ref={ref} className={className} onClick={() => t >= spec.dur && replay()}>
      {"render" in spec ? (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }} aria-hidden="true">
          {spec.render(t, state, ctx)}
        </svg>
      ) : (
        <canvas ref={canvas} style={{ display: "block", width: "100%", aspectRatio: `${W} / ${H}` }} aria-hidden="true" />
      )}
    </div>
  );
}
