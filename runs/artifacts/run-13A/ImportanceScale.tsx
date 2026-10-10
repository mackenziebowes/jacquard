"use client";

// What to ask a small model: significance needs a reader. Each paragraph slip sits on a small balance: how
// important it says its subject is (left pan) against how much evidence it gives (right pan). Only a much
// heavier importance pan earns the flag. All weights are illustrative sizes, not data.
// In the corner, the copula rule sits parked on a shelf (2 real cases, waiting for hand labels).
import { Figure, defineFigure, E, P, q, settle, tilt } from "../_figure";
import { DIM, FAINT, INK, MARK, MONO, PAPER, PAPER_EDGE, Slip } from "./world";

const C = { start: 0.3, pitch: 1.7, drop: 0.5, flag: 1.2 }; // unit i begins at start + i * pitch
const units = [
  { n: 1, imp: 22, ev: 22 }, // balanced
  { n: 2, imp: 26, ev: 18 }, // tilts mildly, no flag
  { n: 3, imp: 34, ev: 12 }, // tips hard, flagged
];
const BEAM = 62, HANG = 28, TRAY = 18;

function Weight({ x, y, size, solid }: { x: number; y: number; size: number; solid: boolean }) {
  // Sits on the tray: x centre, y = tray top.
  return solid
    ? <rect x={q(x - size / 2)} y={q(y - size)} width={size} height={size} rx={3} fill={INK} opacity={0.82} />
    : <rect x={q(x - size / 2)} y={q(y - size)} width={size} height={size} rx={3} fill={PAPER} stroke={INK} strokeWidth={1.4} strokeDasharray="3 2" />;
}

function Scale({ u, t, i, fs }: { u: (typeof units)[number]; t: number; i: number; fs: number }) {
  const t0 = C.start + i * C.pitch;
  const k = E.o3(P(t, t0, t0 + C.drop));
  const fall = (1 - E.o3(P(t, t0, t0 + C.drop))) * 46;
  const ang = settle(t, { t0: t0 + C.drop, from: 0, to: tilt(u.imp * u.imp, u.ev * u.ev, 0.45), zeta: 0.35, omega: 9 });
  const cs = Math.cos(ang), sn = Math.sin(ang);
  const ends = [{ x: -BEAM * cs, y: -BEAM * sn, w: u.imp, solid: true }, { x: BEAM * cs, y: BEAM * sn, w: u.ev, solid: false }];
  const flagged = u.n === 3;
  const flagK = flagged ? E.back(P(t, t0 + C.drop + C.flag, t0 + C.drop + C.flag + 0.5)) : 0;
  return (
    <g>
      <line x1={0} x2={0} y1={0} y2={86} stroke={DIM} strokeWidth={3} strokeLinecap="round" />
      <line x1={-26} x2={26} y1={86} y2={86} stroke={DIM} strokeWidth={3} strokeLinecap="round" />
      {/* the slip rides the balance */}
      <line x1={0} x2={0} y1={-50} y2={0} stroke={DIM} strokeWidth={2} />
      <g transform="translate(0 -72)">
        <Slip x={0} y={0} w={112} h={40} bars={[]} flag={flagK}>
          <text x={-40} y={6} textAnchor="middle" fontSize={17} fontWeight={600} fill={INK} style={{ fontFamily: MONO }}>{u.n}</text>
          <line x1={-22} x2={40} y1={-7} y2={-7} stroke={DIM} strokeWidth={3.5} strokeLinecap="round" />
          <line x1={-22} x2={24} y1={7} y2={7} stroke={DIM} strokeWidth={3.5} strokeLinecap="round" />
        </Slip>
      </g>
      <line x1={q(ends[0].x)} y1={q(ends[0].y)} x2={q(ends[1].x)} y2={q(ends[1].y)} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle r={4.5} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      {ends.map((e, j) => {
        const ty = e.y + HANG;
        return (
          <g key={j}>
            <path d={`M${q(e.x - TRAY)} ${q(ty)} L${q(e.x)} ${q(e.y)} L${q(e.x + TRAY)} ${q(ty)}`} fill="none" stroke={DIM} strokeWidth={1.2} />
            <line x1={q(e.x - TRAY - 3)} x2={q(e.x + TRAY + 3)} y1={q(ty)} y2={q(ty)} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
            <g opacity={q(k)}><Weight x={e.x} y={ty - 1.2 - fall} size={e.w} solid={e.solid} /></g>
            <text x={q(j ? BEAM : -BEAM)} y={q(j ? 66 : 66)} textAnchor="middle" fontSize={fs} fill={DIM} style={{ fontFamily: MONO }}>{j ? "evidence" : "importance"}</text>
          </g>
        );
      })}
      {flagged && (
        <g opacity={q(Math.min(1, flagK))} fill={MARK} fontSize={fs} textAnchor="middle" style={{ fontFamily: MONO }}>
          <text x={0} y={112}>flag when importance</text>
          <text x={0} y={112 + fs * 1.3}>is much higher</text>
        </g>
      )}
      {u.n === 2 && (
        <text x={0} y={112} textAnchor="middle" fontSize={fs} fill={DIM} opacity={q(E.o3(P(t, t0 + 1, t0 + 1.4)))} style={{ fontFamily: MONO }}>no flag</text>
      )}
    </g>
  );
}

function Shelf({ x, y, fs }: { x: number; y: number; fs: number }) {
  // Origin = centre of the shelf's top edge. Quiet: the copula rule, parked.
  return (
    <g opacity={0.9}>
      <rect x={x - 54} y={y - 40} width={108} height={36} rx={4} fill={PAPER} stroke={PAPER_EDGE} strokeDasharray="4 3" />
      <text x={x} y={y - 18} textAnchor="middle" fontSize={fs} fill={DIM} style={{ fontFamily: MONO }}>copula rule</text>
      <line x1={x - 70} x2={x + 70} y1={y - 3} y2={y - 3} stroke={DIM} strokeWidth={3} strokeLinecap="round" />
      <line x1={x - 56} x2={x - 56} y1={y} y2={y + 12} stroke={FAINT} strokeWidth={3} />
      <line x1={x + 56} x2={x + 56} y1={y} y2={y + 12} stroke={FAINT} strokeWidth={3} />
      <text x={x} y={y + 14 + fs} textAnchor="middle" fontSize={fs} fill={DIM} style={{ fontFamily: MONO }}>2 cases, parked</text>
    </g>
  );
}

const spec = defineFigure({
  dur: 5.9,
  size: { W: 800, H: 270 },
  compact: { W: 360, H: 950 },
  render: (t, _s, { compact }) => {
    if (compact) {
      const sc = 1.15;
      return (
        <g>
          {units.map((u, i) => (
            <g key={u.n} transform={`translate(180 ${q(150 + 265 * i)}) scale(${sc})`}><Scale u={u} t={t} i={i} fs={11} /></g>
          ))}
          <Shelf x={180} y={895} fs={12} />
        </g>
      );
    }
    return (
      <g>
        {units.map((u, i) => (
          <g key={u.n} transform={`translate(${105 + 205 * i} 138)`}><Scale u={u} t={t} i={i} fs={11} /></g>
        ))}
        <Shelf x={705} y={196} fs={11} />
      </g>
    );
  },
});

export default function ImportanceScale() {
  return <Figure spec={spec} />;
}
