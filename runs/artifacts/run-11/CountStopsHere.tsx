"use client";

/**
 * What would change this reading, first item: nobody has taken AI-generated designs through
 * fabrication and counted what worked. DraftSieve's 8 passing boards ride a belt into a fab shed
 * and come out made, each tagged "?". The counting stops at the shed door.
 */
import { Figure, defineFigure, cues, E, P, lerp, q } from "../_figure";
import { Board, Frame, FG, MUTED, ACCENT, line, type } from "./world";

const N = 8; // DraftSieve's 8 in 100
const SPEED = 220;

type Layout = {
  belt: number; tray: [number, number]; shed: { x: number; w: number; top: number };
  out: { y: number; x0: number; step: number; dir: number }; drop?: number;
};
const WIDE: Layout = {
  belt: 170, tray: [24, 146], shed: { x: 300, w: 110, top: 86 },
  out: { y: 170, x0: 612, step: 26, dir: -1 },
};
const NARROW: Layout = {
  belt: 150, tray: [16, 138], shed: { x: 222, w: 108, top: 66 },
  out: { y: 290, x0: 30, step: 40, dir: 1 }, drop: 276,
};

const C = cues({ ride: 0.3, tags: [2.9, 3.3] });

function path(L: Layout, i: number, t: number) {
  const x0 = L.tray[0] + 10 + i * 15;
  const entry = L.shed.x + 8, exit = L.shed.x + L.shed.w;
  const a = C.at("ride") + (N - 1 - i) * 0.16; // the front board goes first
  const tIn = a + (entry - x0) / SPEED;
  const b = tIn + 0.35; // time spent inside
  const j = N - 1 - i; // order out of the shed
  const slot = L.out.x0 + L.out.dir * j * L.out.step;
  if (t < tIn) return { x: lerp(x0, entry, P(t, a, tIn)), y: L.belt - 5, made: false, shown: true };
  if (t < b) return { x: entry, y: L.belt - 5, made: false, shown: false };
  if (L.drop == null) {
    const k = P(t, b, b + Math.abs(slot - exit) / SPEED);
    return { x: lerp(exit, slot, E.o2(k)), y: L.out.y - 6, made: true, shown: true };
  }
  // Narrow: fall out of the shed's floor chute, then slide along the lower belt
  const fallEnd = b + 0.25, sx = L.drop;
  if (t < fallEnd) return { x: sx, y: lerp(L.belt, L.out.y - 6, E.i2(P(t, b, fallEnd))), made: true, shown: true };
  const k = P(t, fallEnd, fallEnd + Math.abs(slot - sx) / SPEED);
  return { x: lerp(sx, slot, E.o2(k)), y: L.out.y - 6, made: true, shown: true };
}

const spec = defineFigure({
  dur: 3.5,
  size: { W: 640, H: 196 },
  compact: { W: 360, H: 350 },
  render: (t, _s, { compact }) => {
    const { label, small } = type(compact);
    const L = compact ? NARROW : WIDE;
    const S = L.shed;
    const tags = C.p(t, "tags", E.o3);

    return (
      <g transform={compact ? undefined : "translate(0 -44)"}>
        {/* Counted: the boards that passed the checks */}
        <text x={L.tray[0]} y={L.belt - 58} fill={ACCENT} style={label}>8 in 100 pass</text>
        <text x={L.tray[0]} y={L.belt - 41} fill={MUTED} style={small}>the checks: counted</text>
        <path d={`M${L.tray[0]} ${L.belt - 16} V${L.belt} H${L.tray[1]} V${L.belt - 16}`} {...line} />

        {/* Belt into the shed */}
        <path d={`M${L.tray[1]} ${L.belt} H${S.x}`} {...line} strokeOpacity={0.35} strokeDasharray="4 3" />

        {/* Boards: under the shed so they disappear into it */}
        {Array.from({ length: N }, (_, i) => {
          const p = path(L, i, t);
          if (!p.shown) return null;
          return (
            <g key={i} transform={p.made ? `translate(${q(p.x, 1)} ${q(p.y, 1)}) scale(1.4) translate(${q(-p.x, 1)} ${q(-p.y, 1)})` : undefined}>
              <Board x={p.x} y={p.y} pass />
            </g>
          );
        })}

        {/* The fab shed, with a sawtooth roof */}
        <path
          d={`M${S.x} ${S.top + 84} V${S.top + 24} L${S.x + S.w / 3} ${S.top} V${S.top + 24} L${S.x + (2 * S.w) / 3} ${S.top} V${S.top + 24} L${S.x + S.w} ${S.top} V${S.top + 84}`}
          {...line}
          fill="var(--background)"
        />
        <text x={S.x + S.w / 2} y={S.top + 60} textAnchor="middle" fill={FG} style={small}>fabrication</text>
        {/* The counting stops at the door */}
        <path d={`M${S.x - 6} ${S.top - 18} V${S.top + 96}`} stroke={FG} strokeOpacity={0.45} strokeDasharray="2 3" />
        <text x={S.x - 12} y={S.top - 22} textAnchor="end" fill={MUTED} style={small}>
          the counting stops here
        </text>

        {/* Out the other side */}
        {compact ? (
          <path d={`M${L.drop} ${S.top + 84} V${L.out.y - 14} M16 ${L.out.y} H344`} {...line} strokeOpacity={0.35} strokeDasharray="4 3" />
        ) : (
          <path d={`M${S.x + S.w} ${L.out.y} H630`} {...line} strokeOpacity={0.35} strokeDasharray="4 3" />
        )}
        {Array.from({ length: N }, (_, j) => {
          const x = L.out.x0 + L.out.dir * j * L.out.step;
          return (
            <text key={j} x={x} y={L.out.y - 22} textAnchor="middle" fill={FG} style={label} opacity={tags}>?</text>
          );
        })}
        <g opacity={tags}>
          <text
            x={compact ? 16 : 630}
            y={L.out.y + 24}
            textAnchor={compact ? "start" : "end"}
            fill={FG}
            style={label}
          >
            how many work?
          </text>
          <text x={compact ? 16 : 630} y={L.out.y + 41} textAnchor={compact ? "start" : "end"} fill={MUTED} style={small}>
            no study has counted yet
          </text>
        </g>
      </g>
    );
  },
});

export default function CountStopsHere() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
