"use client";

/**
 * Motivation: the platform already prints the title, description and domain beside the image,
 * and X stamps its own badge on the image's bottom-left corner. A domain mark baked into that
 * corner is a repeat, and gets covered. So the text came off the card.
 * The unfurl is a generic one; only the "X Article" badge text is attested. The title is this post's.
 */
import { Figure, defineFigure, cues, E, q, clamp } from "../_figure";
import { Frame, FG, MUTED, ORANGE, BG, makeMap, MapCard, type MapArt } from "./world";

const C = cues({
  arrive: [0, 0.9],
  repeat: [1.2, 2.2],
  stamp: [2.4, 3.0],
  lift: [4.0, 4.8],
});

type Layout = { W: number; H: number; x: number; cw: number; ch: number; cy: number; fs: number; ts: number; capY: number };
const WIDE: Layout = { W: 640, H: 330, x: 140, cw: 360, ch: 189, cy: 100, fs: 13, ts: 15, capY: 318 };
const NARROW: Layout = { W: 360, H: 350, x: 12, cw: 336, ch: 176, cy: 108, fs: 14, ts: 15.5, capY: 322 };

type State = { wide: MapArt; narrow: MapArt };

/** Opacity of a caption shown from a to b, fading over 0.25s at each end (b = Infinity stays). */
const show = (t: number, a: number, b: number) => clamp((t - a) / 0.25) * (b === Infinity ? 1 : 1 - clamp((t - b) / 0.25));

const spec = defineFigure<State>({
  dur: 5.6,
  size: { W: WIDE.W, H: WIDE.H },
  compact: { W: NARROW.W, H: NARROW.H },
  setup: () => ({
    wide: makeMap(17, WIDE.cw, WIDE.ch, { pitch: 5.2 }),
    narrow: makeMap(17, NARROW.cw, NARROW.ch, { pitch: 4.6 }),
  }),
  render: (t, S, { compact }) => {
    const L = compact ? NARROW : WIDE;
    const map = compact ? S.narrow : S.wide;
    const id = compact ? "notext-n" : "notext-w";
    const fam = { fontFamily: "var(--font-sans)" } as const;

    const kArrive = C.p(t, "arrive", E.o3);
    const kRepeat = Math.sin(Math.PI * C.p(t, "repeat")); // 0 -> 1 -> 0: the pair glows once
    const kStamp = C.p(t, "stamp", E.back);
    const kStampOp = clamp((t - C.at("stamp")) / 0.12);
    const kLift = C.p(t, "lift", E.io3);

    const bandH = compact ? 32 : 30;
    const bandW = compact ? 190 : 176;
    const markFs = compact ? 13.5 : 12.5;
    const markW = compact ? 138 : 128;
    const bandOp = clamp(kArrive * 2 - 0.6) * (1 - clamp(kLift * 1.6));
    const bandDy = -kLift * 34;
    const cx = L.x;
    const cy = L.cy;
    const by = cy + L.ch - bandH; // band top, in the card's corner

    const badgeW = compact ? 92 : 84;
    const badgeH = compact ? 26 : 24;
    const bx = cx + 8;
    const byy = cy + L.ch - badgeH - 8;
    const bdy = (1 - kStamp) * -46;

    // text beside the card
    const domainTop = cy - 78;
    const gx = cx;
    const hl = { fill: "none", stroke: ORANGE, strokeWidth: 1.3, opacity: kRepeat } as const;

    return (
      <g>
        {/* The unfurl's own text */}
        <text x={gx} y={domainTop + 12} fill={MUTED} style={{ ...fam, fontSize: L.fs }}>mackenziebowes.com</text>
        <rect x={gx - 4} y={domainTop - 3} width={markW + 8} height={L.fs + 9} {...hl} />
        <text x={gx} y={domainTop + 36} fill={FG} style={{ ...fam, fontSize: L.ts, fontWeight: 600 }}>
          Generative OG images, built and measured
        </text>
        <rect x={gx} y={domainTop + 46} width={L.cw * 0.92} height={5} rx={2.5} fill={MUTED} opacity={0.35} />
        <rect x={gx} y={domainTop + 58} width={L.cw * 0.6} height={5} rx={2.5} fill={MUTED} opacity={0.35} />

        {/* The card, with the drafted mark baked in */}
        <MapCard id={id} x={cx} y={cy} map={map} k={kArrive} />
        <g transform={`translate(0 ${q(bandDy)})`} opacity={q(bandOp, 3)}>
          <clipPath id={`${id}-band`}>
            <rect x={cx} y={by - 40} width={L.cw} height={bandH + 40} />
          </clipPath>
          <g clipPath={`url(#${id}-band)`}>
            <rect x={cx} y={by} width={bandW} height={bandH} fill={GROUNDBAND} />
            <text x={cx + 10} y={by + bandH / 2 + markFs * 0.36} fill={FG} style={{ ...fam, fontSize: markFs }}>mackenziebowes.com</text>
          </g>
          <rect x={cx + 5} y={by + bandH / 2 - markFs * 0.5 - 4} width={markW + 10} height={markFs + 8} {...hl} />
        </g>

        {/* X's badge, stamped over the same corner */}
        <g transform={`translate(0 ${q(bdy)})`} opacity={q(kStampOp, 3)}>
          <rect x={bx} y={byy} width={badgeW} height={badgeH} rx={badgeH / 2} fill={BG} stroke={FG} strokeOpacity={0.7} strokeWidth={1} />
          <text x={bx + badgeW / 2} y={byy + badgeH / 2 + 4.5} textAnchor="middle" fill={FG} style={{ ...fam, fontSize: compact ? 13 : 12, fontWeight: 600 }}>
            X Article
          </text>
        </g>

        {/* What it says */}
        <g style={{ ...fam, fontSize: compact ? 15 : 13.5 }} textAnchor="middle">
          <text x={L.W / 2} y={L.capY} fill={MUTED} opacity={q(show(t, 0.9, 1.3) * (1 - clamp((t - 1.3) / 0.2)), 3)}>
            our draft: the domain baked into the corner
          </text>
          <text x={L.W / 2} y={L.capY} fill={ORANGE} opacity={q(show(t, 1.35, 2.5), 3)}>
            the same words, already printed above
          </text>
          <text x={L.W / 2} y={L.capY} fill={ORANGE} opacity={q(show(t, 3.0, 4.0), 3)}>
            X stamps its badge there: the mark is covered
          </text>
          <text x={L.W / 2} y={L.capY} fill={FG} opacity={q(show(t, 4.8, Infinity), 3)}>
            no text on the card: nothing repeated, nothing covered
          </text>
        </g>
      </g>
    );
  },
});

const GROUNDBAND = "color-mix(in oklch, var(--accent-b) 5%, #060403)";

export default function NoTextOnTheCard() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
