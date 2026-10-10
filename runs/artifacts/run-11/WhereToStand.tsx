"use client";

/**
 * The whole post in one scene. The agent pours drafts fast; the sieve of checks stops most of
 * them, and You stand at the checks. What passes drops into a small first order, cheap to try.
 * Beside it, a crate that needs capital rolls toward making and delivery and jams at the first
 * gate. Counts are illustrative: the post's one pass rate is drawn in DraftSieve.
 */
import { Figure, defineFigure, cues, drop, pile, pour, sieve, settle, E, P, lerp, q } from "../_figure";
import { Board, Crate, Frame, Gate, Hopper, Person, Sieve, FG, MUTED, ACCENT, line, type } from "./world";

const N = 22; // drafts poured, illustrative
const PASS = 2;
const MOUTH = { x: 120, y: 60 };
const SIEVE_Y = 160;
const BOX = { x: 96, y: 300, w: 48, h: 20 };

const C = cues({ pour: 0.2, close: [2.4, 2.7], order: [2.5, 3.0], roll: [1.6, 2.8], stuck: [3.1, 3.5] });

const spec = defineFigure({
  dur: 3.8,
  size: { W: 640, H: 320 },
  compact: { W: 360, H: 500 },
  setup: () => {
    const passes = sieve(N, PASS, 7);
    const starts = pour(N, { t0: C.at("pour"), rate: 14, seed: 3 });
    const slots = pile(N - PASS, { cx: 120, base: SIEVE_Y, w: 13, h: 8, step: 2, seed: 5 });
    let caught = 0, passed = 0;
    const drafts = passes.map((pass, i) => {
      const to = pass
        ? { x: BOX.x + 14 + passed++ * 20, y: BOX.y - 6, r: 0 }
        : slots[caught++];
      return { pass, t0: starts[i], to, from: { x: MOUTH.x + ((i * 7) % 9) - 4, y: MOUTH.y }, r0: ((i * 37) % 40) - 20 };
    });
    return { drafts };
  },
  render: (t, { drafts }, { compact }) => {
    const { label, small } = type(compact);
    const lid = C.p(t, "close", E.io3);
    const order = C.p(t, "order", E.o3);
    // The crate accelerates toward the making gate, hits it and springs back a little
    const hit = C.end("roll");
    const cx = t < hit ? lerp(0, 58, E.i2(C.p(t, "roll"))) : settle(t, { t0: hit, from: 62, to: 56 });
    const stuck = C.p(t, "stuck", E.o3);
    const road = compact ? "translate(40 180)" : "translate(350 0)";

    return (
      <g>
        {/* Ground */}
        <path d={compact ? "M16 300 H344" : "M16 300 H624"} {...line} strokeOpacity={0.25} />

        {/* Drafting: cheap */}
        <Hopper cx={MOUTH.x} y={16} label={label} />
        <text x={176} y={34} fill={FG} style={label}>drafting</text>
        <text x={176} y={51} fill={MUTED} style={small}>cheap and quick</text>

        {/* Drafts in flight and at rest. Passes fall behind the sieve, so they read as going through it */}
        {drafts.map((d, i) => {
          if (t < d.t0) return null;
          const p = drop(t, { from: d.from, to: d.to, t0: d.t0, r0: d.r0 });
          return <Board key={i} x={p.x} y={p.y} r={p.r} pass={d.pass && p.y > SIEVE_Y} />;
        })}

        <Sieve x={30} y={SIEVE_Y} w={180} text="checks" small={small} />
        <text x={14} y={98} fill={FG} style={label}>checking</text>
        <text x={14} y={115} fill={MUTED} style={small}>still costs</text>

        {/* You, wired into the checks */}
        <path d={`M210 172 H234`} {...line} />
        <path d="M226 206 H262 M230 206 V238 M258 206 V238" {...line} />
        <path d="M234 205 L239 189 H256 L251 205 Z" {...line} fill="var(--background)" />
        <Person x={286} y={238} reach={[-22, 26]} />
        <text x={286} y={146} textAnchor="middle" fill={FG} style={{ ...label, fontWeight: 600 }}>You</text>
        <text x={286} y={258} textAnchor="middle" fill={MUTED} style={small}>checks are</text>
        <text x={286} y={273} textAnchor="middle" fill={MUTED} style={small}>software work</text>

        {/* The small first order: what passes, boxed */}
        <path d={`M${BOX.x} ${BOX.y - BOX.h} V${BOX.y} H${BOX.x + BOX.w} V${BOX.y - BOX.h}`} stroke={ACCENT} strokeWidth={1} fill="none" />
        {[1, -1].map((side) => {
          const x0 = side > 0 ? BOX.x : BOX.x + BOX.w;
          const a = lerp(110, 0, lid) * (Math.PI / 180);
          return (
            <path
              key={side}
              d={`M${x0} ${BOX.y - BOX.h} L${q(x0 + side * 24 * Math.cos(a), 1)} ${q(BOX.y - BOX.h - 24 * Math.sin(a), 1)}`}
              stroke={ACCENT}
              strokeWidth={1}
            />
          );
        })}
        <g opacity={order}>
          <text x={BOX.x - 8} y={BOX.y - 22} textAnchor="end" fill={ACCENT} style={label}>first order</text>
          <text x={BOX.x - 8} y={BOX.y - 6} textAnchor="end" fill={MUTED} style={small}>cheap to try</text>
        </g>

        {/* What to stay away from for now: a run that needs capital, jammed at making */}
        <g transform={road}>
          <text x={0} y={152} fill={FG} style={label}>anything that needs capital</text>
          <text x={0} y={169} fill={MUTED} style={small}>stay away for now</text>
          <Gate x={130} y={300} h={84} text="making" small={small} />
          <Gate x={222} y={300} h={84} text="delivery" small={small} />
          <g opacity={P(t, C.at("roll") - 0.2, C.at("roll"))}>
            <Crate x={q(cx, 1)} y={300} w={72} h={58} />
            <text x={q(cx + 36, 1)} y={276} textAnchor="middle" fill={FG} style={small} opacity={0.8}>$</text>
          </g>
          <g opacity={stuck}>
            <path d="M126 234 l-5 -7 M131 230 l0 -9 M136 234 l5 -7" {...line} />
            <text x={128} y={192} fill={MUTED} style={small}>trouble clusters here</text>
          </g>
        </g>
      </g>
    );
  },
});

export default function WhereToStand() {
  return (
    <Frame>
      <Figure spec={spec} />
    </Frame>
  );
}
