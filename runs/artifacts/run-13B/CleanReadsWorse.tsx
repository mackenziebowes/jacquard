"use client";
// Why it matters: the cut signposts were carrying the reader. The opening is a boardwalk: "I found."
// and "Okay." are planks, "But" is a handrail up to "Where is that, exactly?". A small reader walks it
// the first time, smoothly. The tools cut the planks and the rail, and the reader walks back and has to
// hop up onto the last plank, a bit abruptly.
import { Figure, defineFigure, cues, E, P, lerp, clamp, q, makeBody, gait, stand, lerpPose, personPaths, BODY_HEIGHT } from "../_figure";
import { TextLine, Ground, Label } from "./world";

const C = cues({ walk1: [0.3, 3.3], cutA: 3.7, cutB: 4.4, cutC: 5.1, back: [5.4, 6.1], walk2: [6.4, 8.8] });
const body = makeBody(11); // the reader: a small walker, not Mackenzie
const PLANK_H = 13;

type Plank = { x: number; w: number };
type Lay = {
  G: number; h: number; x0: number; x1: number; hop: number; ground: [number, number];
  throat: Plank; okay: Plank; where: Plank;
  rail: { x1: number; x2: number; y: number };
  tag: { throat: [number, number]; judge: [number, number]; rewriter: [number, number] };
  title: [number, number]; railLabel: [number, number];
};
const DESK: Lay = {
  G: 200, h: 96, x0: 24, x1: 420, hop: 22, ground: [16, 630],
  throat: { x: 60, w: 96 }, okay: { x: 176, w: 78 }, where: { x: 274, w: 196 },
  rail: { x1: 200, x2: 300, y: 140 },
  tag: { throat: [60, 222], judge: [176, 240], rewriter: [250, 222] },
  title: [24, 40], railLabel: [250, 130],
};
const COMPACT: Lay = {
  G: 240, h: 110, x0: 10, x1: 290, hop: 18, ground: [6, 354],
  throat: { x: 14, w: 70 }, okay: { x: 96, w: 60 }, where: { x: 168, w: 186 },
  rail: { x1: 118, x2: 200, y: 174 },
  tag: { throat: [14, 268], judge: [96, 286], rewriter: [168, 268] },
  title: [14, 40], railLabel: [159, 164],
};

function Scene({ t, lay }: { t: number; lay: Lay }) {
  const { G, h, x0, x1, throat, okay, where, rail } = lay;
  const top = G - PLANK_H, whereEnd = where.x + where.w, s = h / BODY_HEIGHT;

  // The reader: walks right over the planks, turns and walks back to the start, then walks right again
  // over the bare floor and hops up onto the last plank.
  const [w2a, w2b] = C.span("walk2");
  const hopT = w2a + ((where.x - 30 - x0) / (x1 - x0)) * (w2b - w2a);
  const back = C.p(t, "back");
  const x = t < C.at("back") ? lerp(x0, x1, C.p(t, "walk1")) : t < C.at("walk2") ? lerp(x1, x0, back) : lerp(x0, x1, C.p(t, "walk2"));
  const dir = t >= C.at("back") && t < C.at("walk2") ? -1 : 1;
  const walk = Math.max(
    P(t, C.at("walk1"), C.at("walk1") + 0.3) * (1 - P(t, C.end("walk1") - 0.3, C.end("walk1"))),
    P(t, C.at("back"), C.at("back") + 0.2) * (1 - P(t, C.end("back") - 0.1, C.end("back"))),
    P(t, C.at("walk2"), C.at("walk2") + 0.3) * (1 - P(t, C.end("walk2") - 0.3, C.end("walk2"))),
  );

  // Planks under the reader: the whole boardwalk until the first cut, then only the last plank.
  const [a, b] = t < C.at("cutA") ? [throat.x, whereEnd] : [where.x, whereEnd];
  const ramp = Math.min(clamp((x - a + 6) / 12), clamp((b + 6 - x) / 12));
  const lift = PLANK_H * ramp;
  const arc = t >= hopT ? lay.hop * Math.sin(Math.PI * P(t, hopT, hopT + 0.5)) : 0;
  const tilt = dir * 9 * Math.sin(Math.PI * P(t, hopT + 0.45, hopT + 0.95));

  const J = lerpPose(stand(body), gait(body, x * 0.07), walk);
  const P_ = personPaths(J, body);
  const feet = G - lift - arc;
  const lowY = Math.max(J.anF[1], J.toF[1], J.anB[1], J.toB[1]);
  const y = feet - lowY * s;
  const headX = x + dir * J.head[0] * s, headY = y + J.head[1] * s;

  // The cuts: each plank drops and goes faint; a dashed ghost stays where it was, with its tag.
  const ghost = (cutT: number) => P(t, cutT + 0.2, cutT + 0.7);
  const drop = (cutT: number) => P(t, cutT, cutT + 0.5);
  const tagOn = (cutT: number) => P(t, cutT + 0.3, cutT + 0.7);
  const railOn = 1 - drop(C.at("cutC"));
  const title = P(t, C.at("cutC") + 0.2, C.at("cutC") + 0.6);
  const railMid = (rail.x1 + rail.x2) / 2;

  return (
    <g>
      <Ground x1={lay.ground[0]} x2={lay.ground[1]} y={G} />

      {/* ghosts of the cut planks and rail, dashed where they were */}
      <g style={{ stroke: "var(--muted-foreground)" }} fill="none" strokeWidth={1} strokeDasharray="3 3">
        <rect x={q(throat.x)} y={q(top)} width={throat.w} height={PLANK_H} rx={PLANK_H / 2} opacity={q(ghost(C.at("cutA")))} />
        <rect x={q(okay.x)} y={q(top)} width={okay.w} height={PLANK_H} rx={PLANK_H / 2} opacity={q(ghost(C.at("cutB")))} />
        <g opacity={q(ghost(C.at("cutC")))}>
          <line x1={rail.x1} y1={rail.y} x2={rail.x2} y2={rail.y} />
          <line x1={rail.x1} y1={rail.y} x2={rail.x1} y2={top} />
          <line x1={rail.x2} y1={rail.y} x2={rail.x2} y2={top} />
        </g>
      </g>

      {/* the rail up to the next sentence */}
      <g opacity={q(railOn)} style={{ stroke: "var(--muted-foreground)" }} strokeWidth={2} strokeLinecap="round">
        <line x1={rail.x1} y1={rail.y} x2={rail.x2} y2={rail.y} />
        <line x1={rail.x1} y1={rail.y} x2={rail.x1} y2={top} strokeWidth={1.4} />
        <line x1={rail.x2} y1={rail.y} x2={rail.x2} y2={top} strokeWidth={1.4} />
      </g>
      <g opacity={q(railOn)}><Label x={lay.railLabel[0]} y={lay.railLabel[1]} anchor="middle">But</Label></g>

      <TextLine x={throat.x} y={q(top + lerp(0, 14, E.io2(drop(C.at("cutA")))))} w={throat.w} state={t < C.at("cutA") ? "flag" : "plain"} words="I found." dim={q(1 - drop(C.at("cutA")), 3)} />
      <TextLine x={okay.x} y={q(top + lerp(0, 14, E.io2(drop(C.at("cutB")))))} w={okay.w} state={t < C.at("cutB") ? "judge" : "plain"} words="Okay." dim={q(1 - drop(C.at("cutB")), 3)} />
      <TextLine x={where.x} y={top} w={where.w} words="Where is that, exactly?" />

      {/* the tags: who cut what */}
      <g opacity={q(tagOn(C.at("cutA")))}><Label x={lay.tag.throat[0]} y={lay.tag.throat[1]} size={11.5}>throat-clearing rule</Label></g>
      <g opacity={q(tagOn(C.at("cutB")))}><Label x={lay.tag.judge[0]} y={lay.tag.judge[1]} size={11.5}>judge</Label></g>
      <g opacity={q(tagOn(C.at("cutC")))}><Label x={lay.tag.rewriter[0]} y={lay.tag.rewriter[1]} size={11.5}>rewriter</Label></g>

      <g opacity={q(1 - title)}><Label x={lay.title[0]} y={lay.title[1]} anchor="start">draft</Label></g>
      <g opacity={q(title)}><Label x={lay.title[0]} y={lay.title[1]} anchor="start">after the tools</Label></g>

      <g transform={`translate(${q(x)} ${q(y)}) rotate(${q(tilt)}) scale(${q(dir * s, 4)} ${q(s, 4)})`}>
        <path d={P_.far} style={{ fill: "var(--foreground)", fillOpacity: 0.25 }} />
        <path d={P_.body} style={{ fill: "var(--foreground)", fillOpacity: 0.6 }} />
        <path d={P_.near} style={{ fill: "var(--foreground)", fillOpacity: 0.6 }} />
      </g>
      <Label x={q(headX)} y={q(headY - 22)} anchor="middle">reader</Label>
    </g>
  );
}

const spec = defineFigure({
  dur: 9.0,
  size: { W: 640, H: 300 },
  compact: { W: 360, H: 320 },
  render: (t, _state, ctx) => <Scene t={t} lay={ctx.compact ? COMPACT : DESK} />,
});

export default function CleanReadsWorse() {
  return <Figure spec={spec} />;
}
