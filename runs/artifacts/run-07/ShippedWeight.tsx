"use client";

/**
 * Every feature a theme offers ships to the browser, used or not. Two carts deliver the
 * same page to a phone: the template cart is piled with unused layouts and plugins and is
 * still far off; the custom cart carries only the two parts the page uses and has nearly
 * arrived. Pass rates are the post's own figures (SEJ on CrUX data): 43% vs 83%+.
 */

const W = 360;
const H = 332;
const BW = 22; // box width
const BH = 16; // box height

const q = (n: number) => Math.round(n * 10) / 10;
function jitter(i: number) {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s) - 0.5;
}

// Template cart load: 4 columns x 4 rows, two of them are what the page uses
const USED = new Set([1, 6]);
const load = Array.from({ length: 16 }, (_, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  return {
    x: q(48 + col * 25 + jitter(i) * 2),
    y: 121 - row * 19,
    r: q(jitter(i + 50) * (row === 0 ? 1 : 5)),
    used: USED.has(i),
  };
});

function Box({ x, y, r = 0, used }: { x: number; y: number; r?: number; used?: boolean }) {
  const c = used ? "var(--accent)" : "var(--muted-foreground)";
  return (
    <g transform={`rotate(${r} ${q(x + BW / 2)} ${q(y + BH / 2)})`}>
      <rect
        x={x}
        y={y}
        width={BW}
        height={BH}
        fill={`color-mix(in oklch, ${c} ${used ? 55 : 18}%, transparent)`}
        stroke={c}
        strokeOpacity={used ? 1 : 0.6}
        strokeWidth={0.8}
      />
      <line x1={x + BW / 2} x2={x + BW / 2} y1={y} y2={y + BH} stroke={c} strokeOpacity={used ? 0.8 : 0.35} strokeWidth={0.8} />
    </g>
  );
}

function Phone({ x, y }: { x: number; y: number }) {
  const fg = "var(--foreground)";
  return (
    <g>
      <rect x={x} y={y} width={30} height={56} rx={4} fill="var(--background)" stroke={fg} strokeOpacity={0.6} strokeWidth={1} />
      <rect x={x + 3} y={y + 6} width={24} height={42} fill={`color-mix(in oklch, ${fg} 6%, transparent)`} />
      <line x1={x + 11} x2={x + 19} y1={y + 52} y2={y + 52} stroke={fg} strokeOpacity={0.5} />
    </g>
  );
}

export default function ShippedWeight() {
  const fg = "var(--foreground)";
  const muted = "var(--muted-foreground)";
  const label = { fontFamily: "var(--font-sans)", fontSize: 14.5 } as const;
  const small = { fontFamily: "var(--font-sans)", fontSize: 13 } as const;
  const line = { stroke: fg, strokeOpacity: 0.6, strokeWidth: 1.2, strokeLinecap: "round", fill: "none" } as const;

  return (
    <div className="border border-border/60 bg-surface/40 p-3 md:p-5" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[520px]">
        {/* Lane 1: template theme, heavy cart, far from the phone */}
        <text x={14} y={20} fill={fg} style={{ ...label, fontWeight: 600 }}>
          Template theme
        </text>
        <text x={14} y={37} fill={muted} style={small}>
          ships every layout and plugin, used or not
        </text>

        {load.map((b, i) => (
          <Box key={i} {...b} />
        ))}
        <rect x={44} y={138} width={106} height={6} fill={`color-mix(in oklch, ${fg} 20%, transparent)`} stroke={fg} strokeOpacity={0.6} strokeWidth={0.8} />
        <circle cx={58} cy={150} r={6} fill="var(--background)" stroke={fg} strokeOpacity={0.6} />
        <circle cx={136} cy={150} r={6} fill="var(--background)" stroke={fg} strokeOpacity={0.6} />
        <line x1={44} x2={44} y1={114} y2={144} {...line} />
        {/* Pusher, leaning hard into the load */}
        <circle cx={33} cy={99} r={5} {...line} />
        <path d="M30 105 L18 128 L6 156 M18 128 L24 156 M27 111 L44 116" {...line} />

        <text x={162} y={88} fill={muted} style={small}>
          unused layouts,
        </text>
        <text x={162} y={104} fill={muted} style={small}>
          plugins, theme code
        </text>
        <rect x={162} y={117} width={10} height={8} fill="color-mix(in oklch, var(--accent) 55%, transparent)" stroke="var(--accent)" strokeWidth={0.8} />
        <text x={177} y={125} fill="var(--accent)" style={small}>
          what the page uses
        </text>

        <line x1={6} x2={W - 6} y1={156} y2={156} stroke={fg} strokeOpacity={0.3} />
        <Phone x={318} y={100} />
        <text x={14} y={178} fill={fg} style={label}>
          43% of WordPress sites pass Core Web Vitals
        </text>

        <line x1={14} x2={W - 14} y1={198} y2={198} stroke={fg} strokeOpacity={0.12} strokeDasharray="3 4" />

        {/* Lane 2: custom build, light cart, nearly there */}
        <text x={14} y={224} fill={fg} style={{ ...label, fontWeight: 600 }}>
          Custom build
        </text>
        <text x={14} y={241} fill={muted} style={small}>
          ships only what the page uses
        </text>

        <Box x={247} y={265} used />
        <Box x={248} y={247} r={-3} used />
        <rect x={240} y={282} width={36} height={6} fill={`color-mix(in oklch, ${fg} 20%, transparent)`} stroke={fg} strokeOpacity={0.6} strokeWidth={0.8} />
        <circle cx={248} cy={294} r={6} fill="var(--background)" stroke={fg} strokeOpacity={0.6} />
        <circle cx={268} cy={294} r={6} fill="var(--background)" stroke={fg} strokeOpacity={0.6} />
        <line x1={240} x2={240} y1={262} y2={288} {...line} />
        {/* Pusher, walking upright */}
        <circle cx={226} cy={251} r={5} {...line} />
        <path d="M225 257 L223 278 L215 300 M223 278 L230 300 M224 263 L240 266" {...line} />
        {/* Motion lines */}
        <path d="M168 262 H200 M178 276 H206 M162 290 H196" stroke={fg} strokeOpacity={0.25} strokeLinecap="round" />

        <line x1={6} x2={W - 6} y1={300} y2={300} stroke={fg} strokeOpacity={0.3} />
        <Phone x={300} y={244} />
        <text x={14} y={322} fill={fg} style={label}>
          83%+ of custom or optimized builds pass
        </text>
      </svg>
    </div>
  );
}
