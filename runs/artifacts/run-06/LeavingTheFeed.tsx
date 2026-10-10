"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The "utilitarian migration": owners walk away from the feed toward places that do a job -
 * finding workers, vetting tools, getting unfiltered advice, automating tasks. One stays
 * behind scrolling, since the passage says owners are moving, not that all of them have moved.
 * Illustrative: the post gives no split, so every stall gets one owner.
 */

const W = 360;
const H = 340;
const START = { x: 180, y: 134 };
const STALL_W = 74;
const STALL_TOP = 226;
const GROUND = 300;
const DURATION = 3200; // ms for the whole walk
const STAGGER = 0.12; // fraction of the walk each owner waits after the previous one

const STALLS = [
  { a: "find", b: "workers", icon: "hat" },
  { a: "vet", b: "tools", icon: "wrench" },
  { a: "unfiltered", b: "advice", icon: "bubble" },
  { a: "automate", b: "tasks", icon: "gear" },
] as const;

const stallX = (i: number) => 18 + i * 82;
const q = (n: number) => Math.round(n * 10) / 10;

// Each owner's route: a curve from under the phone to the front of their stall
function route(i: number) {
  const end = { x: stallX(i) + 18, y: GROUND - 2 };
  const ctrl = { x: (START.x + end.x) / 2 + (i < 2 ? -10 : 10), y: 150 };
  return (t: number) => ({
    x: (1 - t) ** 2 * START.x + 2 * (1 - t) * t * ctrl.x + t * t * end.x,
    y: (1 - t) ** 2 * START.y + 2 * (1 - t) * t * ctrl.y + t * t * end.y,
  });
}
const ROUTES = STALLS.map((_, i) => route(i));
const STEPS = 16;

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const progress = (p: number, i: number) => {
  const start = i * STAGGER;
  const span = 1 - (STALLS.length - 1) * STAGGER;
  return ease(Math.min(1, Math.max(0, (p - start) / span)));
};

// A stick person standing (or mid-stride) with feet at (x, y)
function Person({ x, y, color, stride = 0, opacity = 1, headDown = false }: {
  x: number;
  y: number;
  color: string;
  stride?: number;
  opacity?: number;
  headDown?: boolean;
}) {
  const s = 6 * stride;
  return (
    <g stroke={color} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={opacity}>
      <circle cx={q(x + (headDown ? 1.5 : 0))} cy={q(y - 32)} r={5} fill={color} stroke="none" />
      <line x1={q(x)} y1={q(y - 25)} x2={q(x)} y2={q(y - 12)} />
      <line x1={q(x)} y1={q(y - 12)} x2={q(x - 4 - s)} y2={q(y)} />
      <line x1={q(x)} y1={q(y - 12)} x2={q(x + 4 + s)} y2={q(y)} />
      <line x1={q(x)} y1={q(y - 22)} x2={q(x - 5 + s)} y2={q(y - 13)} />
      <line x1={q(x)} y1={q(y - 22)} x2={q(x + 5 - s)} y2={q(y - 13)} />
    </g>
  );
}

function Icon({ kind, x, y }: { kind: (typeof STALLS)[number]["icon"]; x: number; y: number }) {
  const c = "var(--foreground)";
  const common = { stroke: c, strokeWidth: 1.6, fill: "none", strokeLinecap: "round" as const };
  switch (kind) {
    case "hat":
      return (
        <g {...common}>
          <path d={`M${x - 8} ${y} A8 8 0 0 1 ${x + 8} ${y}`} />
          <line x1={x - 11} y1={y} x2={x + 11} y2={y} />
          <line x1={x} y1={y - 8} x2={x} y2={y - 4} />
        </g>
      );
    case "wrench":
      return (
        <g {...common} transform={`rotate(-35 ${x} ${y - 4})`}>
          <line x1={x - 9} y1={y - 4} x2={x + 4} y2={y - 4} strokeWidth={3} />
          <path d={`M${x + 8} ${y - 9} A5.5 5.5 0 1 0 ${x + 8} ${y + 1}`} />
        </g>
      );
    case "bubble":
      return (
        <g {...common}>
          <path d={`M${x - 10} ${y - 13} H${x + 10} V${y - 3} H${x - 2} L${x - 7} ${y + 1} V${y - 3} H${x - 10} Z`} strokeLinejoin="round" />
          <line x1={x - 6} y1={y - 8} x2={x + 6} y2={y - 8} strokeWidth={1.2} />
        </g>
      );
    case "gear":
      return (
        <g {...common}>
          <circle cx={x} cy={y - 6} r={6.5} strokeWidth={3.5} strokeDasharray="2.6 2.5" strokeLinecap="butt" />
          <circle cx={x} cy={y - 6} r={4.8} />
          <circle cx={x} cy={y - 6} r={1.6} />
        </g>
      );
  }
}

export default function LeavingTheFeed() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(1); // static render is the end state

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const next = Math.min(1, (now - t0) / DURATION);
      setP(next);
      if (next < 1) raf = requestAnimationFrame(tick);
    };
    const onHidden = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        setP(1);
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        raf = requestAnimationFrame((now) => {
          t0 = now;
          setP(0);
          raf = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, []);

  const fg = "var(--foreground)";
  const muted = "var(--muted-foreground)";
  const accent = "var(--accent)";
  const label = { fontFamily: "var(--font-sans)", fontSize: 13.5 } as const;
  const small = { fontFamily: "var(--font-sans)", fontSize: 12 } as const;

  return (
    <div ref={ref} className="border border-border/60 bg-surface/40 p-3 md:p-5" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[520px]">
        {/* The feed: a phone with an endless stack of posts */}
        <rect x={150} y={12} width={60} height={108} rx={8} fill="var(--background)" stroke={fg} strokeOpacity={0.55} />
        {[0, 1, 2, 3].map((k) => (
          <g key={k} opacity={0.5}>
            <rect x={157} y={24 + k * 24} width={46} height={18} rx={2} fill={`color-mix(in oklch, ${muted} 25%, transparent)`} />
            <line x1={161} x2={190} y1={30 + k * 24} y2={30 + k * 24} stroke={muted} strokeWidth={1.5} />
            <line x1={161} x2={180} y1={36 + k * 24} y2={36 + k * 24} stroke={muted} strokeWidth={1.5} />
          </g>
        ))}
        <rect x={150} y={108} width={60} height={12} rx={0} fill="var(--background)" />
        <path d="M150 108 V112 A8 8 0 0 0 158 120 H202 A8 8 0 0 0 210 112 V108" fill="none" stroke={fg} strokeOpacity={0.55} />
        <text x={138} y={52} textAnchor="end" fill={fg} style={{ ...label, fontWeight: 600 }}>
          the feed
        </text>
        <text x={138} y={68} textAnchor="end" fill={muted} style={small}>
          passive scrolling
        </text>

        {/* One owner still scrolling */}
        <Person x={234} y={118} color={muted} opacity={0.6} headDown />
        <text x={250} y={96} fill={muted} style={small}>
          some still
        </text>
        <text x={250} y={110} fill={muted} style={small}>
          scrolling
        </text>

        {/* Footprints left behind each walking owner */}
        {ROUTES.map((r, i) => {
          const t = progress(p, i);
          return Array.from({ length: STEPS }, (_, k) => {
            const s = (k + 0.5) / STEPS;
            if (s > t - 0.04) return null;
            const pt = r(s);
            return (
              <circle key={`${i}-${k}`} cx={q(pt.x + (k % 2 ? 2 : -2))} cy={q(pt.y)} r={1.7} fill={muted} opacity={0.8} />
            );
          });
        })}

        {/* The stalls: places that do a job */}
        {STALLS.map((s, i) => {
          const x = stallX(i);
          return (
            <g key={s.b}>
              {/* awning */}
              <path
                d={`M${x - 3} ${STALL_TOP + 12} L${x + 4} ${STALL_TOP} H${x + STALL_W - 4} L${x + STALL_W + 3} ${STALL_TOP + 12} Z`}
                fill={`color-mix(in oklch, ${fg} 10%, transparent)`}
                stroke={fg}
                strokeOpacity={0.55}
              />
              {/* posts and counter */}
              <line x1={x + 2} x2={x + 2} y1={STALL_TOP + 12} y2={GROUND} stroke={fg} strokeOpacity={0.4} />
              <line x1={x + STALL_W - 2} x2={x + STALL_W - 2} y1={STALL_TOP + 12} y2={GROUND} stroke={fg} strokeOpacity={0.4} />
              <rect x={x} y={GROUND - 22} width={STALL_W} height={22} fill="var(--background)" stroke={fg} strokeOpacity={0.55} />
              <Icon kind={s.icon} x={x + 52} y={GROUND - 26} />
              <text x={x + STALL_W / 2} y={GROUND + 18} textAnchor="middle" fill={fg} style={label}>
                {s.a}
              </text>
              <text x={x + STALL_W / 2} y={GROUND + 34} textAnchor="middle" fill={fg} style={label}>
                {s.b}
              </text>
            </g>
          );
        })}
        <line x1={8} x2={W - 8} y1={GROUND} y2={GROUND} stroke={fg} strokeOpacity={0.3} />

        {/* Owners walking from the feed to a stall */}
        {ROUTES.map((r, i) => {
          const t = progress(p, i);
          const pt = r(t);
          const walking = t > 0 && t < 1;
          return (
            <Person
              key={i}
              x={q(pt.x)}
              y={q(pt.y)}
              color={accent}
              stride={walking ? Math.sin(t * Math.PI * 12) : 0}
            />
          );
        })}
      </svg>
    </div>
  );
}
