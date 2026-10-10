"use client";

/**
 * Drafting is cheap, checking is where the cost is. An agent pours 100 drafted boards
 * onto a sieve of checks (design rules plus simulation). 92 pile up on it; 8 fall through.
 * 8 in 100 is HWE-Bench's best full pass rate (8.15% of 300 board projects) scaled to 100.
 */

const W = 360;
const H = 330;
const TW = 13; // board width
const TH = 8; // board height
const GAP = 2;
const SIEVE_Y = 206;
const ROWS = [18, 16, 14, 12, 10, 8, 6, 4, 4]; // 92 boards, bottom row first

// Deterministic jitter so the heap looks tipped out rather than stacked
function jitter(i: number) {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s) - 0.5;
}
const q = (n: number) => Math.round(n * 10) / 10;

type Tile = { x: number; y: number; r: number };

const heap: Tile[] = [];
ROWS.forEach((n, row) => {
  const width = n * (TW + GAP) - GAP;
  const x0 = W / 2 - width / 2;
  const y = SIEVE_Y - (row + 1) * (TH + GAP);
  for (let k = 0; k < n; k++) {
    const i = heap.length;
    heap.push({
      x: q(x0 + k * (TW + GAP) + jitter(i) * 2),
      y: q(y + jitter(i + 300) * 1.5),
      r: q(jitter(i + 600) * (row === 0 ? 4 : 14)),
    });
  }
});

// Boards still falling from the hopper onto the heap
const pouring: Tile[] = [
  { x: 176, y: 74, r: 20 },
  { x: 171, y: 90, r: -12 },
];

// The 8 that got through: two still falling, six in the tray
const through: Tile[] = [
  { x: 150, y: 236, r: 28 },
  { x: 196, y: 252, r: -18 },
  ...[0, 1, 2, 3, 4, 5].map((k) => ({
    x: W / 2 - (6 * (TW + GAP) - GAP) / 2 + k * (TW + GAP),
    y: 292,
    r: 0,
  })),
];

function Board({ t, pass }: { t: Tile; pass?: boolean }) {
  const c = pass ? "var(--accent)" : "var(--muted-foreground)";
  return (
    <g transform={`rotate(${t.r} ${q(t.x + TW / 2)} ${q(t.y + TH / 2)})`}>
      <rect
        x={t.x}
        y={t.y}
        width={TW}
        height={TH}
        fill={`color-mix(in oklch, ${c} ${pass ? 55 : 22}%, transparent)`}
        stroke={c}
        strokeOpacity={pass ? 1 : 0.6}
        strokeWidth={0.8}
      />
      <circle cx={t.x + 3.5} cy={t.y + TH / 2} r={1.1} fill={c} opacity={pass ? 1 : 0.7} />
      <circle cx={t.x + TW - 3.5} cy={t.y + TH / 2} r={1.1} fill={c} opacity={pass ? 1 : 0.7} />
    </g>
  );
}

export default function DraftSieve() {
  const fg = "var(--foreground)";
  const muted = "var(--muted-foreground)";
  const label = { fontFamily: "var(--font-sans)", fontSize: 13.5 } as const;
  const small = { fontFamily: "var(--font-sans)", fontSize: 12 } as const;

  return (
    <div className="border border-border/60 bg-surface/40 p-3 md:p-5" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[520px]">
        {/* Hopper: the agent drafting */}
        <path
          d="M140 14 H220 L196 60 H164 Z"
          fill={`color-mix(in oklch, ${fg} 6%, transparent)`}
          stroke={fg}
          strokeOpacity={0.55}
          strokeWidth={1}
        />
        <text x={180} y={36} textAnchor="middle" fill={fg} style={{ ...label, fontWeight: 600 }}>
          Agent
        </text>
        <text x={230} y={30} fill={fg} style={label}>
          100 drafts
        </text>
        <text x={230} y={46} fill={muted} style={small}>
          cheap and quick
        </text>
        {pouring.map((t, i) => (
          <Board key={`p${i}`} t={t} />
        ))}

        {/* The heap the checks stopped */}
        {heap.map((t, i) => (
          <Board key={`h${i}`} t={t} />
        ))}
        <text x={20} y={128} fill={fg} style={label}>
          92 caught
        </text>
        <text x={20} y={145} fill={muted} style={small}>
          fail a check
        </text>

        {/* Sieve: design rules plus simulation */}
        <rect x={24} y={SIEVE_Y} width={W - 48} height={18} fill="var(--background)" stroke={fg} strokeOpacity={0.55} strokeWidth={1} />
        {Array.from({ length: 26 }, (_, k) => (
          <line
            key={k}
            x1={30 + k * 12}
            x2={30 + k * 12}
            y1={SIEVE_Y + 2}
            y2={SIEVE_Y + 16}
            stroke={fg}
            strokeOpacity={0.12}
          />
        ))}
        <text x={W / 2} y={SIEVE_Y + 13} textAnchor="middle" fill={fg} style={small}>
          checks: design rules + simulation
        </text>

        {/* What fell through */}
        {through.map((t, i) => (
          <Board key={`t${i}`} t={t} pass />
        ))}
        <path
          d={`M120 284 V306 H240 V284`}
          fill="none"
          stroke={fg}
          strokeOpacity={0.55}
          strokeWidth={1}
        />
        <text x={250} y={292} fill="var(--accent)" style={label}>
          8 pass
        </text>
        <text x={250} y={308} fill={muted} style={small}>
          every check
        </text>
      </svg>
    </div>
  );
}
