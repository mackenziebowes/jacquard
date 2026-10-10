"use client";

// E-E-A-T is not a ranking factor. Raters work through a thick handbook and mark results; their notes go
// into the algorithm, which is built to reward the same qualities. The score dial on the machine is
// crossed out, and a plugin box tries to plug into it and finds no socket.
import { Figure, defineFigure, cues, E, P, stand, q, drawOn, makeBody, lerp } from "../_figure";
import { Frame, Street, Rater, labels, FG, PAPER, GROUND, LINE } from "./world";

// Beats in seconds. Raters mark, notes go in (2.2-3.6), results come out (3.8-5.0), the dial is crossed
// out (5.6-6.0), then the plugin box rolls up to the machine and stops at the wall (6.2-7.2).
const C = cues({ mark: [0.4, 2.0], notes: [2.2, 3.6], out: [3.8, 5.0], cross: [5.6, 6.0], plug: [6.2, 7.2], socket: 7.3 });

type St = { x: number; g: number; s: number }; // a station: ground point and scale (1 = local units)

// Wide: one row. Compact (phones): two rows, the results under the machine.
const WIDE = {
  R: { x: 0, g: 232, s: 1 },
  M: { x: 230, g: 232, s: 1 },
  Pl: { x: 540, g: 232, s: 1 },
  S: { x: 390, g: 232, s: 1 },
};
const COMPACT = {
  R: { x: 0, g: 150, s: 0.8 },
  M: { x: 150, g: 150, s: 0.8 },
  Pl: { x: 300, g: 150, s: 0.75 },
  S: { x: 150, g: 300, s: 1 },
};
const RATER_AT = [36, 62, 166]; // local x of the three raters; the last one faces left, at the table
const TICK_GAP = 0.5;

/** A local point (lx, ly) of a station, in figure units. */
const at = (st: St, lx: number, ly: number): [number, number] => [st.x + lx * st.s, st.g + ly * st.s];

const spec = defineFigure({
  dur: 8,
  size: { W: 640, H: 262 },
  compact: { W: 360, H: 320 },
  setup: () => ({
    raters: [makeBody(3), makeBody(8), makeBody(13)],
  }),
  render: (t, S, { W, compact }) => {
    const L = compact ? COMPACT : WIDE;
    const T = labels(compact);
    const { R, M, Pl, S: Sh } = L;
    const wall = M.x + 124 * M.s; // the machine's right-hand wall, where the plug is trying to go

    // The plugin box rolls left until its plug tip touches the wall, and stops there.
    const pk = E.o3(C.p(t, "plug"));
    const boxDx = lerp(0, wall + 4 + 18 * Pl.s - Pl.x, pk);
    const boxX = Pl.x + boxDx;

    // Notes leave the raters' hands and drop into the hopper, one after another.
    const notes = RATER_AT.map((lx, i) => {
      const ns = C.at("notes") + i * 0.3;
      if (t < ns || t >= ns + 0.8) return null;
      const k = E.io2(P(t, ns, ns + 0.8));
      const [sx, sy] = at(R, lx + 8, -96);
      const [ex, ey] = at(M, 70 + (i - 1) * 10, -166);
      const x = lerp(sx, ex, k), y = lerp(sy, ey, k) - 30 * M.s * Math.sin(Math.PI * k);
      return <rect key={i} x={q(x - 5 * M.s)} y={q(y - 5 * M.s)} width={q(10 * M.s)} height={q(10 * M.s)} fill={PAPER} {...LINE} strokeWidth={1} />;
    });

    // Results slide out of the machine's side and settle on the shelf, best one first.
    const cards = [0, 1, 2, 3].map((j) => {
      const cs = C.at("out") + j * 0.3;
      if (t < cs) return null;
      const k = E.io2(P(t, cs, cs + 0.8));
      const [sx, sy] = at(M, 130, -60);
      const [ex, ey] = at(Sh, 6 + j * 28, -92);
      const x = lerp(sx, ex, k), y = lerp(sy, ey, k) - 40 * Sh.s * Math.sin(Math.PI * k);
      return (
        <g key={j} transform={`translate(${q(x)} ${q(y)}) scale(${q(Sh.s, 4)})`}>
          <rect width={22} height={28} fill={PAPER} {...LINE} strokeWidth={1.25} />
          <rect x={4} y={7} width={14} height={2} fill={FG} fillOpacity={0.5} />
          <rect x={4} y={13} width={10} height={2} fill={FG} fillOpacity={0.5} />
        </g>
      );
    });

    const [hx, hy] = at(M, 70, -22); // the dial's label sits in the machine's lower panel
    const [lx, ly] = at(R, 110, -128); // the handbook's label, above the table and the raters
    const [cx, cy] = at(R, 100, 0); // ground label for the raters
    const [sx, sy] = at(Sh, 58, -108);
    const [wx, wy] = at(M, 70, 22); // "no socket", under the wall

    return (
      <g>
        <Street x={0} y={R.g} w={W} />
        {compact && <Street x={0} y={Sh.g} w={W} />}

        {/* the raters and their handbook */}
        <g transform={`translate(${q(R.x)} ${q(R.g)}) scale(${q(R.s, 4)})`}>
          <rect x={84} y={-40} width={56} height={40} fill={PAPER} {...LINE} strokeWidth={1.25} />
          <rect x={88} y={-60} width={48} height={20} fill={GROUND} {...LINE} strokeWidth={1.25} />
          <path d="M92 -54H132M92 -49H132" stroke={FG} strokeOpacity={0.5} strokeWidth={1} />
        </g>
        {RATER_AT.map((lx0, i) => {
          const [x, y] = at(R, lx0, 0);
          const k = P(t, C.at("mark") + i * TICK_GAP, C.at("mark") + i * TICK_GAP + 0.4);
          return <Rater key={i} x={x} y={y} s={0.2 * R.s} body={S.raters[i]} J={stand(S.raters[i], 1.25)} flip={i === 2} tick={k} />;
        })}
        <text x={q(lx)} y={q(ly)} textAnchor="middle" {...T.small} fill={FG}>176-page handbook</text>
        <text x={q(cx)} y={q(cy + 22)} textAnchor="middle" {...T.small} fill={FG}>~16,000 raters</text>
        {notes}

        {/* the algorithm: a machine with a hopper, and a dial that has been crossed out */}
        <g transform={`translate(${q(M.x)} ${q(M.g)}) scale(${q(M.s, 4)})`}>
          <path d="M20 -112L120 -112L134 -160L6 -160Z" fill={PAPER} {...LINE} strokeWidth={1.25} />
          <rect x={16} y={-112} width={108} height={112} fill={PAPER} {...LINE} strokeWidth={1.25} />
          <rect x={124} y={-66} width={6} height={12} fill={GROUND} stroke={FG} strokeWidth={1} />
          <circle cx={70} cy={-60} r={16} fill={GROUND} {...LINE} strokeWidth={1.25} />
          <path d="M70 -60L62 -50" stroke={FG} strokeWidth={1.25} />
          <path d="M60 -72L80 -48M80 -72L60 -48" stroke={FG} strokeWidth={1.75} strokeLinecap="round" {...drawOn(P(t, C.at("cross"), C.at("cross") + 0.4))} />
          <path d="M22 -28H118" stroke={FG} strokeWidth={1.25} {...drawOn(P(t, C.at("cross") + 0.2, C.at("cross") + 0.6))} />
        </g>
        <text x={q(M.x + 70 * M.s)} y={q(M.g - 96 * M.s)} textAnchor="middle" {...T.label} fill={FG}>algorithm</text>
        <text x={q(hx)} y={q(hy)} textAnchor="middle" {...T.small} fill={FG}>E-E-A-T score</text>
        <text x={q(wx)} y={q(wy)} textAnchor="middle" {...T.small} fill={FG} opacity={C.p(t, "socket", 0.3)}>no socket</text>

        {/* results on the shelf */}
        <g transform={`translate(${q(Sh.x)} ${q(Sh.g)}) scale(${q(Sh.s, 4)})`}>
          <path d="M0 -64H116" stroke={FG} strokeWidth={2} strokeLinecap="round" />
        </g>
        {cards}
        <text x={q(sx)} y={q(sy)} textAnchor="middle" {...T.label} fill={FG} opacity={P(t, C.at("out") + 0.9, C.at("out") + 1.2)}>better results</text>

        {/* the plugin box rolls up to the machine, its plug out in front */}
        <g transform={`translate(${q(boxX)} ${q(Pl.g)}) scale(${q(Pl.s, 4)})`}>
          <rect x={0} y={-44} width={70} height={44} fill={PAPER} {...LINE} strokeWidth={1.25} />
          <rect x={-12} y={-36} width={10} height={14} fill={GROUND} {...LINE} strokeWidth={1.25} />
          <path d="M-12 -32H-18M-12 -26H-18" stroke={FG} strokeWidth={2} strokeLinecap="round" />
        </g>
        <text x={q(boxX + 35 * Pl.s)} y={q(Pl.g - 20 * Pl.s)} textAnchor="middle" {...T.small} fill={FG}>plugin</text>
      </g>
    );
  },
});

export default function RaterLoop() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
