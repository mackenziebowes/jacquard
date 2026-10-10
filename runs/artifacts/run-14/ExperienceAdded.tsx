"use client";

// In December 2022 Google added "Experience" to its rater guidelines. E-A-T became E-E-A-T, and the
// guidelines grew from 167 to 176 pages. Expertise is what you know (a certificate); experience is what
// you have done (a belt that fits again). The E drops in at the front, and the page count ticks up.
import { Figure, defineFigure, cues, E, P, makeBody, stand, settle, q, lerp } from "../_figure";
import { Frame, Street, Person, labels, FG, PAPER, GROUND, ACCENT } from "./world";

// Beats in seconds: the three tiles slide along (shift), the new E drops in at the front (drop), the
// page count ticks from 167 to 176 (count), and the belt pulls in on the second person (belt).
const C = cues({ shift: [0.5, 1.2], drop: 1.5, count: [2.4, 3.2], belt: [3.5, 4.4] });
const PAGES_BEFORE = 167, PAGES_AFTER = 176;

const spec = defineFigure({
  dur: 5,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 290 },
  setup: () => ({
    expert: makeBody(31),
    doer: makeBody(32),
  }),
  render: (t, S, { W, H, compact }) => {
    // Wide: people on the left, the tiles and page tag on the right. Compact: the tiles on top, people below.
    const L = compact
      ? { G: 268, s: 0.22, px: [92, 236], tile: 38, gap: 7, cx: 180, top: 30, shelf: 82, tag: 94, fs: 22 }
      : { G: 262, s: 0.26, px: [140, 280], tile: 46, gap: 8, cx: 480, top: 58, shelf: 116, tag: 128, fs: 26 };
    const lab = labels(compact);
    const tw = 4 * L.tile + 3 * L.gap;
    const slot = (i: number) => L.cx - tw / 2 + i * (L.tile + L.gap);

    // The three tiles slide one slot right to make room; the new E lands in slot 0 and springs to rest.
    const k = C.p(t, "shift", E.io3);
    const dropY = settle(t, { t0: C.at("drop"), from: L.top - 70, to: L.top, zeta: 0.4, omega: 9 });
    const dropped = t >= C.at("drop");

    const tile = (x: number, y: number, ch: string, key: string, accent = false) => (
      <g key={key}>
        <rect x={q(x)} y={q(y)} width={L.tile} height={L.tile} rx={4} fill={PAPER} stroke={accent ? ACCENT : FG} strokeWidth={1.25} />
        <text x={q(x + L.tile / 2)} y={q(y + L.tile / 2 + L.fs * 0.36)} textAnchor="middle" fontFamily="var(--font-serif)" fontSize={L.fs} fill={FG}>
          {ch}
        </text>
      </g>
    );
    const letters = ["E", "A", "T"];

    const pages = Math.round(lerp(PAGES_BEFORE, PAGES_AFTER, C.p(t, "count", E.io3)));

    // The expert holds up a certificate in the near hand.
    const expJ = stand(S.expert, 1.1);
    const [hx, hy] = expJ.haF;

    // The doer's belt: loose and wide at first, then drawn in flush with the waist.
    const doerTight = E.io3(C.p(t, "belt"));
    const beltW = 67 * S.doer.bulk * lerp(1.24, 1, doerTight);

    return (
      <g>
        <defs>
          <clipPath id="eeat-exp-clip">
            <rect width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#eeat-exp-clip)">
          <Street x={0} y={L.G} w={W} />

          <Person x={L.px[0]} y={L.G} s={L.s} body={S.expert} J={expJ}>
            {/* a certificate, its lines cut out of the ink like the rater's board */}
            <rect x={hx - 16} y={hy - 70} width={96} height={68} rx={4} fill={FG} stroke={GROUND} strokeWidth={8} />
            {[0, 1, 2].map((i) => (
              <rect key={i} x={hx - 4} y={hy - 58 + i * 14} width={62 - i * 14} height={6} fill={GROUND} />
            ))}
            <circle cx={hx + 58} cy={hy - 14} r={11} fill={GROUND} />
          </Person>
          <text x={L.px[0]} y={L.G - 530 * L.s - 8} textAnchor="middle" {...lab.label} fill={FG}>
            expertise
          </text>

          <Person x={L.px[1]} y={L.G} s={L.s} body={S.doer} J={stand(S.doer)}>
            {/* the belt, drawn across the waist; it closes in as the trousers fit again */}
            <g transform="translate(0 -10) rotate(4.6)">
              <rect x={q(-beltW / 2)} y={-66} width={q(beltW)} height={18} fill={GROUND} stroke={FG} strokeWidth={6} />
            </g>
          </Person>
          <text x={L.px[1]} y={L.G - 530 * L.s - 8} textAnchor="middle" {...lab.label} fill={FG}>
            experience
          </text>

          {/* the tiles: the three existing ones slide right, the new E drops into slot 0 */}
          {letters.map((ch, j) => tile(slot(j + k), L.top, ch, `old-${j}`))}
          {dropped && tile(slot(0), dropY, "E", "new", true)}

          <Street x={L.cx - tw / 2 - 20} y={L.shelf} w={tw + 40} o={0.55} />

          <g>
            <rect x={q(L.cx - 52)} y={L.tag} width={104} height={28} rx={4} fill={PAPER} stroke={FG} strokeOpacity={0.6} strokeWidth={1.25} />
            <text x={L.cx} y={L.tag + 18.5} textAnchor="middle" {...lab.small} fontSize={compact ? 14 : 13} fill={FG}>
              {pages} pages
            </text>
          </g>
        </g>
      </g>
    );
  },
});

export default function ExperienceAdded() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
