"use client";

/**
 * An owner's time online, as coins. Each coin is a minute. The first two go onto a feed, which
 * carries them off and gives nothing back - the passive scrolling the post says is over. The next
 * four go into slot machines that each pay out one thing the post names: workers, vetted tools,
 * advice, tasks automated. Times are the post's own (2 h 9 min vs a 141-minute average); coin
 * counts are illustrative.
 */
import { Figure, defineFigure, cues, E, P, lerp, q, makeBody, stand, personPaths, place, drop, BODY_HEIGHT } from "../_figure";

const DUR = 4.8;
const C = cues({ scroll: 0.3, solve: 1.7, verdict: [4.2, DUR] });
const FLY = 0.55; // seconds a coin is in the air
const SCROLL_COINS = 2;
const PAYOUTS = [
  { label: ["workers"], icon: "worker" },
  { label: ["tools", "vetted"], icon: "tool" },
  { label: ["advice"], icon: "advice" },
  { label: ["tasks", "automated"], icon: "gear" },
] as const;

const fg = "var(--foreground)";
const muted = "var(--muted-foreground)";
const accent = "var(--accent)";
const sans = "var(--font-sans)";

function layout(W: number, compact: boolean) {
  if (compact) {
    return {
      fs: 15, fsSmall: 14,
      head: [{ x: 12, y: 22, text: "An owner's 2 h 9 min a day online" }, { x: 12, y: 42, text: "a little under the 141-minute average" }],
      owner: { x: 46, ground: 262, h: 140 },
      belt: { x0: 112, x1: W - 8, y: 150, land: 170 },
      beltLabel: { x: 112, y: 84 },
      slots: PAYOUTS.map((_, i) => ({ cx: 48 + i * 88, top: 330 })),
      box: { w: 66, h: 72 },
      solveLabel: { x: 12, y: 304 },
      labelY: 432,
    };
  }
  return {
    fs: 14.5, fsSmall: 13,
    head: [{ x: 14, y: 22, text: "An owner's 2 h 9 min a day online, a little under the 141-minute average" }],
    owner: { x: 72, ground: 300, h: 160 },
    belt: { x0: 180, x1: W - 10, y: 108, land: 300 },
    beltLabel: { x: 180, y: 56 },
    slots: PAYOUTS.map((_, i) => ({ cx: 236 + i * 112, top: 196 })),
    box: { w: 78, h: 72 },
    solveLabel: { x: 180, y: 174 },
    labelY: 292,
  };
}

function Icon({ kind, x, y, s }: { kind: string; x: number; y: number; s: number }) {
  const line = { stroke: accent, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
  return (
    <g transform={place(x, y, 0, s)}>
      {kind === "worker" && (
        <>
          <circle cx={0} cy={-7} r={3.4} fill={accent} />
          <path d="M0 -3 V5 M-5 0 L0 -2 L5 0 M0 5 L-4 11 M0 5 L4 11" {...line} />
        </>
      )}
      {kind === "tool" && <path d="M-7 9 L3 -1 M1 -3 a5 5 0 1 1 4 4 M5 -6 l-2 2 l2 2 l2 -2" {...line} />}
      {kind === "advice" && <path d="M-9 -7 h18 v11 h-10 l-5 5 v-5 h-3 z" {...line} />}
      {kind === "gear" && (
        <>
          <circle cx={0} cy={0} r={6.5} stroke={accent} strokeWidth={4} strokeDasharray="2.6 2.5" fill="none" />
          <circle cx={0} cy={0} r={5} {...line} />
          <circle cx={0} cy={0} r={1.6} fill={accent} />
        </>
      )}
    </g>
  );
}

const arc = (t: number, t0: number, a: { x: number; y: number }, b: { x: number; y: number }, lift: number) => {
  const k = P(t, t0, t0 + FLY);
  return { k, x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) - lift * 4 * k * (1 - k) };
};

const spec = defineFigure({
  dur: DUR,
  size: { W: 640, H: 330 },
  compact: { W: 360, H: 480 },
  setup: () => ({ body: makeBody(11) }),
  render: (t, { body }, { W, compact }) => {
    const L = layout(W, compact);
    const s = L.owner.h / BODY_HEIGHT;
    const pelvisY = L.owner.ground - (body.thigh + body.shin + 6) * s;
    // The tossing arm lifts a little for each throw
    const throws = [
      ...Array.from({ length: SCROLL_COINS }, (_, i) => C.at("scroll") + i * 0.5),
      ...PAYOUTS.map((_, i) => C.at("solve") + i * 0.5),
    ];
    const flick = Math.max(0, ...throws.map((t0) => Math.sin(Math.PI * P(t, t0 - 0.2, t0))));
    const J = stand(body, 1.4 + 0.5 * flick);
    const Pp = personPaths(J, body);
    const hand = { x: L.owner.x + J.haF[0] * s, y: pelvisY + J.haF[1] * s };

    const scrollDim = lerp(1, 0.5, C.p(t, "solve", 0.6, E.io3));
    const label = { fontFamily: sans, fontSize: L.fs } as const;
    const small = { fontFamily: sans, fontSize: L.fsSmall } as const;
    const B = L.belt;

    // Feed cards slide right forever; wrapping keeps them on the belt
    // Speed chosen so the first coin is near the far end, still on the belt, when the figure stops
    const span = B.x1 - B.x0;
    const BELT = (B.x1 - 34 - B.land) / (DUR - throws[0] - FLY);
    const n = Math.ceil(span / 46) + 1, pitch = (span + 46) / n, period = n * pitch;
    const cards = Array.from({ length: n }, (_, i) => B.x0 - pitch + ((i * pitch + BELT * t) % period));

    return (
      <g>
        {L.head.map((h, i) => (
          <text key={i} x={h.x} y={h.y} fill={fg} style={{ ...label, fontWeight: 600 }}>{h.text}</text>
        ))}

        {/* The owner */}
        <line x1={L.owner.x - 34} x2={L.owner.x + 34} y1={L.owner.ground} y2={L.owner.ground} stroke={fg} strokeOpacity={0.3} />
        <g transform={place(L.owner.x, pelvisY, 0, s)} fill={fg} opacity={0.85}>
          <path d={Pp.far} opacity={0.55} />
          <path d={Pp.body} />
          <path d={Pp.near} />
        </g>

        {/* Before: the feed */}
        <g opacity={q(scrollDim)}>
          <text x={L.beltLabel.x} y={L.beltLabel.y} fill={fg} style={{ ...label, fontWeight: 600 }}>Scrolling</text>
          {(compact ? ["the feed carries them off,", "nothing comes back"] : ["the feed carries them off, nothing comes back"]).map((ln, j) => (
            <text key={j} x={L.beltLabel.x} y={L.beltLabel.y + 18 + j * 17} fill={muted} style={small}>{ln}</text>
          ))}
          <defs>
            <clipPath id="msl-belt">
              <rect x={B.x0} y={B.y - 30} width={span} height={44} />
            </clipPath>
          </defs>
          <g clipPath="url(#msl-belt)">
            {cards.map((x, i) => (
              <rect key={i} x={q(x)} y={B.y - 20} width={38} height={18} rx={2} fill={`color-mix(in oklch, ${fg} 7%, transparent)`} stroke={fg} strokeOpacity={0.35} strokeWidth={0.8} />
            ))}
          </g>
          <line x1={B.x0} x2={B.x1} y1={B.y} y2={B.y} stroke={fg} strokeOpacity={0.5} strokeWidth={1.2} />
          <line x1={B.x0} x2={B.x1} y1={B.y + 6} y2={B.y + 6} stroke={fg} strokeOpacity={0.25} />
          <path d={`M${B.x1 - 18} ${B.y + 18} h14 l-4 -3 m4 3 l-4 3`} stroke={muted} fill="none" strokeWidth={1} />
        </g>
        {Array.from({ length: SCROLL_COINS }, (_, i) => {
          const t0 = throws[i];
          if (t < t0) return null;
          const to = { x: B.land, y: B.y - 26 };
          const a = arc(t, t0, hand, to, compact ? 30 : 60);
          let { x, y } = a;
          if (a.k >= 1) {
            x = to.x + BELT * (t - t0 - FLY);
            y = to.y;
          }
          const fade = 1 - P(x, B.x1 - 20, B.x1 - 4);
          if (fade <= 0) return null;
          return <circle key={i} cx={q(x)} cy={q(y)} r={6} fill={accent} opacity={q(fade * scrollDim)} />;
        })}

        {/* Now: slots that pay out */}
        <text x={L.solveLabel.x} y={L.solveLabel.y} fill={fg} style={{ ...label, fontWeight: 600 }}>Solving</text>
        <text x={L.solveLabel.x + (compact ? 64 : 66)} y={L.solveLabel.y} fill={muted} style={small}>each minute buys something</text>
        {PAYOUTS.map((p, i) => {
          const { cx, top } = L.slots[i];
          const { w, h } = L.box;
          const t0 = throws[SCROLL_COINS + i];
          const coin = arc(t, t0, hand, { x: cx, y: top + 2 }, compact ? 70 : 50);
          const trayY = top + h - 8;
          const out = drop(t, { from: { x: cx, y: top + h - 34 }, to: { x: cx, y: trayY - 10, r: 0 }, t0: t0 + FLY + 0.2, bounce: 0.3 });
          return (
            <g key={i}>
              <rect x={cx - w / 2} y={top} width={w} height={h} fill={`color-mix(in oklch, ${fg} 5%, transparent)`} stroke={fg} strokeOpacity={0.6} strokeWidth={1} />
              <line x1={cx - 9} x2={cx + 9} y1={top + 6} y2={top + 6} stroke={fg} strokeOpacity={0.8} strokeWidth={2.4} strokeLinecap="round" />
              <rect x={cx - w / 2 + 8} y={top + h - 34} width={w - 16} height={30} fill="var(--background)" stroke={fg} strokeOpacity={0.35} strokeWidth={0.8} />
              {out.started && <Icon kind={p.icon} x={q(out.x)} y={q(out.y)} s={compact ? 1.1 : 1} />}
              {t >= t0 && coin.k < 1 && <circle cx={q(coin.x)} cy={q(coin.y)} r={6} fill={accent} />}
              {p.label.map((ln, j) => (
                <text key={j} x={cx} y={L.labelY + j * (L.fsSmall + 3)} textAnchor="middle" fill={fg} style={small}>{ln}</text>
              ))}
            </g>
          );
        })}

        <g opacity={q(C.p(t, "verdict", E.o3))}>
          <circle cx={compact ? 18 : 186} cy={compact ? 467 : 320} r={5} fill={accent} />
          <text x={compact ? 28 : 196} y={compact ? 472 : 325} fill={muted} style={small}>= one minute</text>
        </g>
      </g>
    );
  },
});

export default function MinuteSlots() {
  return (
    <div className="border border-border/60 bg-surface/40 p-3 md:p-5">
      <div className="mx-auto max-w-[640px]">
        <Figure spec={spec} />
      </div>
    </div>
  );
}
