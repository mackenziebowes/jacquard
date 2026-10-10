"use client";

/**
 * The set for this post's figures: a small-town market street. A row of stalls with striped awnings
 * stands on a ground line, and a lantern hangs over the stall worth stopping at. Ink on paper, in the
 * site's own colours; the accent is for light and the odd tag, nothing else.
 *
 * Every piece takes a position and a scale `s`. (x, y) is the ground point under the thing: a stall's
 * left foot, a person's feet, a lamp's centre. `s` is 1 for a stall (100 wide, 152 tall) and for a
 * person 560 units tall (BODY_HEIGHT), so a 150px person is s = 150 / 560.
 *
 *   <Street x y w />                                       ground line, w long
 *   <Stall x y s variant="real" | "template" sign keeper />  real: lettering, photos, keeper. template: stock grey, blank panels
 *   <Lantern x y s k id />                                 lamp hung at (x, y); k 0..1 how lit; id unique per figure
 *   <Person x y s body J flip />                           a puppet; J from gait() or stand(); flip faces -x
 *   <Rater x y s body J tick />                            a puppet with a clipboard; tick 0..1 draws a tick on it
 *
 * Bodies come from makeBody(seed) in setup, so the same seed is always the same person.
 */
import type { ReactNode } from "react";
import { place, personPaths, groundOf, drawOn, stand, q, type Body, type Joints } from "../_figure";

export const FG = "var(--foreground)";
export const MUTED = "var(--muted-foreground)";
export const PAPER = "var(--surface)";
export const GROUND = "var(--background)";
export const ACCENT = "var(--accent)";

/** A stall at s = 1 */
export const STALL_W = 100;
export const STALL_H = 152;

/** Hairline for panels and frames, in px at s = 1 */
export const LINE = { stroke: FG, strokeWidth: 1.5, strokeLinejoin: "round" as const };

export const labels = (compact: boolean) => ({
  label: { fontFamily: "var(--font-sans)", fontSize: compact ? 15 : 13 } as const,
  small: { fontFamily: "var(--font-sans)", fontSize: compact ? 13 : 11.5 } as const,
});

/** The frame every figure in this post sits in (matches the other explainers). */
export function Frame({ children }: { children: ReactNode }) {
  return <div className="border border-border/60 bg-surface/40 p-3 md:p-5">{children}</div>;
}

/** A ground line, w long, from (x, y). */
export function Street({ x, y, w, o = 0.55 }: { x: number; y: number; w: number; o?: number }) {
  return <line x1={q(x)} x2={q(x + w)} y1={q(y)} y2={q(y)} stroke={FG} strokeOpacity={o} strokeWidth={1.25} />;
}

/** A framed photo of the keeper's work: 0 hills and sun, 1 a wheel, 2 stitched cloth. */
function Photo({ x, y, kind }: { x: number; y: number; kind: 0 | 1 | 2 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={24} height={28} fill={GROUND} stroke={FG} strokeWidth={1.25} />
      {kind === 0 && (
        <>
          <circle cx={16} cy={8} r={3} fill={FG} fillOpacity={0.8} />
          <path d="M2 24L10 13L16 19L19 16L22 24Z" fill={FG} fillOpacity={0.55} />
        </>
      )}
      {kind === 1 && (
        <>
          <circle cx={12} cy={14} r={8} fill="none" stroke={FG} strokeWidth={1.25} />
          <circle cx={12} cy={14} r={1.5} fill={FG} />
        </>
      )}
      {kind === 2 && <path d="M4 7H20M4 12H20M4 17H15" stroke={FG} strokeWidth={1.25} />}
    </g>
  );
}

/**
 * A market stall, its left foot on the ground at (x, y). Local units: 100 wide, awning at -128,
 * sign at -150. `real` has a hand-lettered sign, photos, credentials, goods, an open card and (if
 * given) a keeper behind the counter. `template` has a grey stock sign and blank panels.
 */
export function Stall({ x, y, s = 1, variant, sign = "Pell's Mending", keeper, o = 1 }: {
  x: number;
  y: number;
  s?: number;
  variant: "real" | "template";
  sign?: string;
  keeper?: { body: Body; reach?: number };
  o?: number;
}) {
  const real = variant === "real";
  const stripe = [0, 1, 2, 3, 4, 5];
  return (
    <g transform={place(x, y, 0, s)} opacity={o}>
      {/* back wall */}
      <rect x={6} y={-112} width={88} height={68} fill={PAPER} {...LINE} strokeWidth={1.25} />
      {real ? (
        <>
          <Photo x={12} y={-104} kind={0} />
          <Photo x={38} y={-104} kind={1} />
          <Photo x={64} y={-104} kind={2} />
          <rect x={20} y={-68} width={60} height={9} fill={GROUND} stroke={FG} strokeWidth={1} />
          <path d="M26 -63.5H56M62 -63.5H74" stroke={FG} strokeWidth={1.25} />
        </>
      ) : (
        [0, 1, 2].map((i) => (
          <rect key={i} x={12 + i * 26} y={-104} width={24} height={28} fill="none" stroke={FG} strokeOpacity={0.3} strokeWidth={1} />
        ))
      )}
      {keeper && <Person x={9} y={0} s={0.17} body={keeper.body} J={stand(keeper.body, keeper.reach)} />}
      {/* counter */}
      <rect x={2} y={-46} width={96} height={46} fill={PAPER} {...LINE} />
      <rect x={0} y={-49} width={100} height={4} fill={FG} fillOpacity={0.8} />
      {real && (
        <>
          <rect x={12} y={-57} width={8} height={11} fill={GROUND} stroke={FG} strokeWidth={1} />
          <rect x={25} y={-61} width={7} height={15} fill={GROUND} stroke={FG} strokeWidth={1} />
          <rect x={41} y={-53} width={14} height={7} fill={GROUND} stroke={FG} strokeWidth={1} />
          <rect x={66} y={-36} width={26} height={14} fill={PAPER} {...LINE} strokeWidth={1} />
          <text x={79} y={-26} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={8} fill={FG}>OPEN</text>
        </>
      )}
      {/* posts */}
      <path d="M4 0V-128M96 0V-128" stroke={FG} strokeWidth={2} />
      {/* awning: alternate stripes for real, plain for template */}
      {stripe.map((i) => {
        const x0 = -4 + 18 * i;
        return (
          <path
            key={i}
            d={`M${x0} -128H${x0 + 18}V-116A9 9 0 0 1 ${x0} -116Z`}
            fill={real && i % 2 === 0 ? FG : "none"}
            fillOpacity={0.22}
            {...LINE}
          />
        );
      })}
      {/* sign on top of the awning */}
      {real ? (
        <g transform="rotate(-1.5 50 -139)">
          <rect x={8} y={-150} width={84} height={22} rx={2} fill={PAPER} {...LINE} strokeWidth={1.25} />
          <text x={50} y={-135} textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize={13} fill={FG}>{sign}</text>
        </g>
      ) : (
        <g>
          <rect x={8} y={-150} width={84} height={22} rx={2} fill={MUTED} fillOpacity={0.35} stroke={MUTED} strokeWidth={1} />
          <rect x={16} y={-142} width={68} height={3} fill={MUTED} />
          <rect x={16} y={-136} width={44} height={3} fill={MUTED} />
        </g>
      )}
    </g>
  );
}

/**
 * A lamp hung at (x, y), its centre. `k` 0..1 is how lit it is: the glow spreads about 150 units at s = 1.
 * `id` must be unique in the figure (it names the gradient).
 */
export function Lantern({ x, y, s = 1, k = 1, id }: { x: number; y: number; s?: number; k?: number; id: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={ACCENT} stopOpacity={0.26 * k} />
          <stop offset="1" stopColor={ACCENT} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={q(x)} cy={q(y)} r={q(150 * s)} fill={`url(#${id})`} />
      <g transform={place(x, y, 0, s)}>
        <path d="M0 -30V-15" stroke={FG} strokeWidth={1.25} />
        <path d="M-9 -9L0 -15L9 -9Z" fill={PAPER} {...LINE} strokeWidth={1.25} />
        <rect x={-7} y={-9} width={14} height={18} fill={PAPER} {...LINE} strokeWidth={1.25} />
        <rect x={-7} y={-9} width={14} height={18} fill={ACCENT} fillOpacity={k} />
        <path d="M-9 9H9" stroke={FG} strokeWidth={1.25} />
      </g>
    </g>
  );
}

/**
 * A person as ink. Feet on the ground at (x, y), pelvis above. `flip` faces them -x.
 * `children` are drawn in body units on top, so anything placed there scales with the person.
 */
export function Person({ x, y, s = 1, body, J, flip = false, farOpacity = 0.55, children }: {
  x: number;
  y: number;
  s?: number;
  body: Body;
  J: Joints;
  flip?: boolean;
  farOpacity?: number;
  children?: ReactNode;
}) {
  const paths = personPaths(J, body);
  const py = y - groundOf(body) * s;
  return (
    <g transform={`translate(${q(x)} ${q(py)}) scale(${flip ? -s : s} ${s})`}>
      <path d={paths.far} fill={FG} fillOpacity={farOpacity} />
      <path d={paths.body} fill={FG} />
      <path d={paths.near} fill={FG} />
      {children}
    </g>
  );
}

/** A person holding a clipboard in the near hand (J.haF). `tick` 0..1 draws a tick on the board. */
export function Rater({ x, y, s = 1, body, J, flip = false, tick = 0 }: {
  x: number;
  y: number;
  s?: number;
  body: Body;
  J: Joints;
  flip?: boolean;
  tick?: number;
}) {
  const [hx, hy] = J.haF;
  return (
    <Person x={x} y={y} s={s} body={body} J={J} flip={flip}>
      {/* a light board with its lines cut out, so it reads against the ink and the street */}
      <rect x={hx - 8} y={hy - 52} width={52} height={66} rx={3} fill={FG} stroke={GROUND} strokeWidth={7} />
      <rect x={hx + 14} y={hy - 58} width={14} height={9} fill={GROUND} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={hx - 1} y={hy - 38 + i * 12} width={34} height={4} fill={GROUND} />
      ))}
      <path
        d={`M${q(hx + 1)} ${q(hy - 8)}L${q(hx + 9)} ${q(hy)}L${q(hx + 22)} ${q(hy - 20)}`}
        fill="none"
        stroke={GROUND}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawOn(tick)}
      />
    </Person>
  );
}
