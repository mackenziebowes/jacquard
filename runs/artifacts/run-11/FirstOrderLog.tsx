"use client";

/**
 * How: put checks before the order, read the limits, write down what went wrong. You keep a log
 * at the bench; its entries are the post's own (the timer chip that won't run on a 3 V coin cell,
 * the via almost on a pad, the vendor's limits) plus a blank line for what goes wrong. A copy of
 * the log files into the one empty slot on a shelf of sources: nothing on it measures how often
 * first orders fail. The books are illustrative.
 */
import { Figure, defineFigure, cues, rng, E, P, lerp, q } from "../_figure";
import { Board, Frame, Person, FG, MUTED, ACCENT, line, type } from "./world";

const ENTRIES = [
  { tag: "check", text: "timer chip, not for 3 V" },
  { tag: "check", text: "via almost on a pad" },
  { tag: "limits", text: "minimums, lead time, tariff" },
  { tag: "order", text: "what went wrong: ______" },
];
const PAD_W = 270;
const PAD_H = 146;
const SHELF = { x: 440, w: 180, top: 100, rows: [176, 252], base: 300 };
const GAP = { x: 548, w: 18, h: 52 }; // empty slot on the top shelf
const BOOK_W = GAP.w - 2;

const C = cues({ write: [0.3, 2.6], file: [2.9, 3.9], verdict: [3.8, 4.3] });
const ROW = 0.55; // seconds to write one entry

const spec = defineFigure({
  dur: 4.4,
  size: { W: 640, H: 330 },
  compact: { W: 360, H: 552 },
  setup: () => {
    // Books on both shelves, leaving the gap on the top one
    const r = rng(11);
    const books: { x: number; y: number; w: number; h: number }[] = [];
    SHELF.rows.forEach((y, row) => {
      let x = SHELF.x + 6;
      while (x < SHELF.x + SHELF.w - 14) {
        if (row === 0 && x + 16 > GAP.x && x < GAP.x + GAP.w) { x = GAP.x + GAP.w + 1; continue; }
        const w = r.int(9, 15), h = r.int(38, 56);
        if (x + w > SHELF.x + SHELF.w - 4) break;
        if (row === 0 && x < GAP.x && x + w > GAP.x - 1) { x = GAP.x + GAP.w + 1; continue; }
        books.push({ x, y, w, h });
        x += w + 1;
      }
    });
    return { books };
  },
  render: (t, { books }, { compact }) => {
    const { label, small } = type(compact);
    const pad = compact ? { x: 62, y: 34 } : { x: 78, y: 100 };
    const benchY = pad.y + PAD_H + 6;
    const shelfAt = compact ? { dx: -350, dy: 222 } : { dx: 0, dy: 0 };
    const gapTop = SHELF.rows[0] - GAP.h;

    // The copy of the log: lifts off the pad, shrinks to a book and files into the gap
    const f = C.p(t, "file", E.io3);
    const from = { x: pad.x + PAD_W / 2, y: pad.y + PAD_H / 2, w: PAD_W * 0.5, h: PAD_H * 0.6 };
    const to = { x: GAP.x + 1 + BOOK_W / 2 + shelfAt.dx, y: gapTop + GAP.h / 2 + shelfAt.dy, w: BOOK_W, h: GAP.h };
    const lift = Math.sin(Math.PI * f) * 40;
    const book = {
      x: lerp(from.x, to.x, f),
      y: lerp(from.y, to.y, f) - lift,
      w: lerp(from.w, to.w, E.o3(f)),
      h: lerp(from.h, to.h, E.o3(f)),
    };
    const verdict = C.p(t, "verdict", E.o3);

    return (
      <g>
        <defs>
          {ENTRIES.map((_, i) => {
            const k = P(t, C.at("write") + i * ROW, C.at("write") + (i + 1) * ROW);
            return (
              <clipPath key={i} id={`fol-row-${i}`}>
                <rect x={pad.x} y={pad.y + 44 + i * 26 - 14} width={q(PAD_W * E.o2(k), 1)} height={20} />
              </clipPath>
            );
          })}
        </defs>

        {/* Ground and bench */}
        <path d={compact ? "M16 240 H344" : "M16 300 H624"} {...line} strokeOpacity={0.25} />
        <path
          d={compact ? `M50 ${benchY} H344 M62 ${benchY} V240 M332 ${benchY} V240` : `M60 ${benchY} H404 M72 ${benchY} V300 M392 ${benchY} V300`}
          {...line}
        />

        {/* You */}
        <Person x={compact ? 26 : 38} y={compact ? 240 : 300} reach={[24, 18]} />
        <text x={compact ? 26 : 38} y={compact ? 144 : 204} textAnchor="middle" fill={FG} style={{ ...label, fontWeight: 600 }}>
          You
        </text>

        {/* The log: a notepad propped on the bench */}
        <rect x={pad.x} y={pad.y} width={PAD_W} height={PAD_H} {...line} fill="var(--background)" />
        {Array.from({ length: 9 }, (_, k) => (
          <circle key={k} cx={pad.x + 22 + k * 28} cy={pad.y} r={3} {...line} fill="var(--background)" />
        ))}
        <text x={pad.x + 14} y={pad.y + 24} fill={FG} style={{ ...label, fontWeight: 600 }}>
          your log
        </text>
        {ENTRIES.map((e, i) => {
          const y = pad.y + 44 + i * 26;
          return (
            <g key={i}>
              <path d={`M${pad.x + 12} ${y + 5} H${pad.x + PAD_W - 12}`} stroke={FG} strokeOpacity={0.1} />
              <g clipPath={`url(#fol-row-${i})`}>
                <text x={pad.x + 14} y={y} fill={MUTED} style={small}>{e.tag}</text>
                <text x={pad.x + 66} y={y} fill={FG} style={small}>{e.text}</text>
              </g>
            </g>
          );
        })}

        {/* The first order, on the bench beside the log */}
        {!compact && (
          <g>
            <path d={`M354 ${benchY - 22} V${benchY} H398 V${benchY - 22}`} stroke={ACCENT} strokeWidth={1} fill="none" />
            {[0, 1, 2].map((k) => <Board key={k} x={361 + k * 15} y={benchY - 5} pass />)}
            {[0, 1].map((k) => <Board key={k} x={368 + k * 15} y={benchY - 15} pass />)}
          </g>
        )}

        {/* The shelf of sources, with one empty slot */}
        <g transform={`translate(${shelfAt.dx} ${shelfAt.dy})`}>
          <path
            d={`M${SHELF.x} ${SHELF.top} V${SHELF.base} M${SHELF.x + SHELF.w} ${SHELF.top} V${SHELF.base} M${SHELF.x} ${SHELF.top} H${SHELF.x + SHELF.w} ${SHELF.rows.map((y) => `M${SHELF.x} ${y} H${SHELF.x + SHELF.w}`).join(" ")}`}
            {...line}
          />
          {books.map((b, i) => (
            <rect key={i} x={b.x} y={b.y - b.h} width={b.w} height={b.h} stroke={MUTED} strokeOpacity={0.6} strokeWidth={0.8} fill={`color-mix(in oklch, ${MUTED} 14%, transparent)`} />
          ))}
          <rect x={GAP.x} y={gapTop} width={GAP.w} height={GAP.h} stroke={FG} strokeOpacity={0.35} strokeDasharray="3 3" fill="none" />
          <path d={`M${GAP.x + GAP.w / 2} ${gapTop - 4} V${SHELF.top - 22}`} {...line} strokeOpacity={0.35} />
          <text x={SHELF.x + SHELF.w} y={SHELF.top - 44} textAnchor="end" fill={MUTED} style={small}>no source measures how</text>
          <text x={SHELF.x + SHELF.w} y={SHELF.top - 28} textAnchor="end" fill={MUTED} style={small}>often first orders fail</text>
          <text x={SHELF.x} y={SHELF.base + 18} fill={MUTED} style={small}>what the sources measure</text>
          <text x={SHELF.x + SHELF.w} y={SHELF.top - 62} textAnchor="end" fill={ACCENT} style={label} opacity={verdict}>
            your log fills a gap
          </text>
        </g>

        {/* The copy of the log, in flight or filed */}
        {t >= C.at("file") && (
          <rect
            x={q(book.x - book.w / 2, 1)}
            y={q(book.y - book.h / 2, 1)}
            width={q(book.w, 1)}
            height={q(book.h, 1)}
            stroke={ACCENT}
            strokeWidth={1}
            fill={`color-mix(in oklch, ${ACCENT} 30%, var(--background))`}
          />
        )}
      </g>
    );
  },
});

export default function FirstOrderLog() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
