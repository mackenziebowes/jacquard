"use client";

/**
 * Why it matters, told with DraftSieve's hopper and sieve. The checks are where the cost is,
 * and they are software-shaped: a person at a laptop is wired into the sieve, and what it
 * catches rides a chute back to the agent. What passes drops into a first order, the
 * vendor's advertised 5 boards from $2. The heap and the chute are illustrative, not counts.
 */

const W = 360;
const H = 330;
const TW = 13; // board width
const TH = 8; // board height
const GAP = 2;
const SIEVE_X = 40;
const SIEVE_W = 220;
const SIEVE_Y = 200;
const CX = SIEVE_X + SIEVE_W / 2;
const ROWS = [13, 9, 5]; // illustrative, not a count

function jitter(i: number) {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s) - 0.5;
}
const q = (n: number) => Math.round(n * 10) / 10;

type Tile = { x: number; y: number; r: number };

const heap: Tile[] = [];
ROWS.forEach((n, row) => {
  const width = n * (TW + GAP) - GAP;
  const x0 = CX - width / 2;
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

// Boards still falling from the hopper
const pouring: Tile[] = [
  { x: 184, y: 90, r: 20 },
  { x: 178, y: 108, r: -12 },
];

// Caught boards riding the chute back up to the agent
const CHUTE_X = 16;
const returning: Tile[] = [
  { x: CHUTE_X - TW / 2, y: 182, r: 90 },
  { x: CHUTE_X - TW / 2, y: 132, r: 90 },
  { x: CHUTE_X - TW / 2, y: 82, r: 90 },
  { x: 70, y: 12, r: 0 },
];

// The first order: 5 boards, as advertised
const order: Tile[] = [0, 1, 2, 3, 4].map((k) => ({
  x: CX - (5 * (TW + GAP) - GAP) / 2 + k * (TW + GAP),
  y: 286,
  r: 0,
}));

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

export default function CheckLoop() {
  const fg = "var(--foreground)";
  const muted = "var(--muted-foreground)";
  const label = { fontFamily: "var(--font-sans)", fontSize: 13.5 } as const;
  const small = { fontFamily: "var(--font-sans)", fontSize: 12 } as const;
  const line = { stroke: fg, strokeOpacity: 0.55, strokeWidth: 1, fill: "none" } as const;

  return (
    <div className="border border-border/60 bg-surface/40 p-3 md:p-5" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[520px]">
        {/* Return chute: from the sieve's edge, up and back into the hopper */}
        <path
          d={`M${SIEVE_X} ${SIEVE_Y + 9} H${CHUTE_X} V16 H180 V30`}
          {...line}
          strokeOpacity={0.35}
          strokeDasharray="3 3"
        />
        <path d="M176 26 L180 32 L184 26" {...line} strokeOpacity={0.55} />
        {returning.map((t, i) => (
          <Board key={`r${i}`} t={t} />
        ))}
        <text x={30} y={36} fill={muted} style={small}>
          caught boards go
        </text>
        <text x={30} y={51} fill={muted} style={small}>
          back to the agent
        </text>
        {/* One catch from the documented attempt */}
        <path d={`M${CHUTE_X + 6} 136 H30`} {...line} strokeOpacity={0.35} />
        <text x={34} y={140} fill={fg} style={small}>
          &ldquo;via almost on a pad&rdquo;
        </text>

        {/* Hopper: the agent drafting */}
        <path
          d="M150 34 H230 L206 78 H174 Z"
          {...line}
          fill={`color-mix(in oklch, ${fg} 6%, transparent)`}
        />
        <text x={190} y={57} textAnchor="middle" fill={fg} style={{ ...label, fontWeight: 600 }}>
          Agent
        </text>
        {pouring.map((t, i) => (
          <Board key={`p${i}`} t={t} />
        ))}

        {/* Heap the checks stopped */}
        {heap.map((t, i) => (
          <Board key={`h${i}`} t={t} />
        ))}

        {/* Sieve: design rules plus simulation */}
        <rect x={SIEVE_X} y={SIEVE_Y} width={SIEVE_W} height={18} {...line} fill="var(--background)" />
        {Array.from({ length: 18 }, (_, k) => (
          <line
            key={k}
            x1={SIEVE_X + 6 + k * 12}
            x2={SIEVE_X + 6 + k * 12}
            y1={SIEVE_Y + 2}
            y2={SIEVE_Y + 16}
            stroke={fg}
            strokeOpacity={0.12}
          />
        ))}
        <text x={CX} y={SIEVE_Y + 13} textAnchor="middle" fill={fg} style={small}>
          checks: design rules + simulation
        </text>

        {/* You, at a laptop wired into the sieve */}
        <path d={`M${SIEVE_X + SIEVE_W} ${SIEVE_Y + 12} H274`} {...line} />
        <path d="M268 220 H300 M272 220 V246 M296 220 V246" {...line} />
        <path d="M276 219 L281 203 H298 L293 219 Z" {...line} fill="var(--background)" />
        <circle cx={316} cy={168} r={8} {...line} />
        <path d="M316 176 V210 M316 210 L308 246 M316 210 L324 246 M316 186 L296 214" {...line} />
        <text x={316} y={150} textAnchor="middle" fill={fg} style={{ ...label, fontWeight: 600 }}>
          You
        </text>
        <text x={308} y={264} textAnchor="middle" fill={muted} style={small}>
          checks are
        </text>
        <text x={308} y={278} textAnchor="middle" fill={muted} style={small}>
          software work
        </text>

        {/* What passes: a first order */}
        <path d={`M${CX} ${SIEVE_Y + 22} V276`} {...line} strokeOpacity={0.25} strokeDasharray="2 3" />
        {order.map((t, i) => (
          <Board key={`o${i}`} t={t} pass />
        ))}
        <path d={`M${CX - 44} 280 V300 H${CX + 44} V280`} {...line} />
        <text x={CX - 50} y={292} textAnchor="end" fill="var(--accent)" style={label}>
          first order
        </text>
        <text x={CX - 50} y={308} textAnchor="end" fill={muted} style={small}>
          5 boards from $2
        </text>
      </svg>
    </div>
  );
}
