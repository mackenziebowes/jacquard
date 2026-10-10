"use client";

/**
 * How far AI design output gets as the checks get stricter, from the two benchmarks
 * in /research/vibe-manufacturing: MUSE (best model, CAD assemblies, three stages)
 * and HWE-Bench (best full pass rate on boards). Each bar is a share of tasks, 0-100%.
 * The faded part of a bar is what the previous check let through and this one did not.
 */

type Row = { label: string; value: number; note?: string };

const cad: Row[] = [
  { label: "Code runs", value: 77.4 },
  { label: "Geometry is valid", value: 68.9 },
  { label: "Design intent met", value: 52.4, note: "scored by a model judge" },
];

const boardOthers = [4.4, 6.6];

function Bar({ value, prev, strong }: { value: number; prev?: number; strong?: boolean }) {
  return (
    <div className="relative h-3 w-full bg-foreground/[0.06]">
      {prev !== undefined && (
        <div
          className="absolute inset-y-0 left-0 border border-dashed border-foreground/25"
          style={{ width: `${prev}%` }}
        />
      )}
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${value}%`,
          backgroundColor: strong ? "var(--accent)" : "var(--foreground)",
          opacity: strong ? 0.85 : 0.55,
        }}
      />
    </div>
  );
}

function Label({ label, value, note }: Row) {
  return (
    <div className="mb-1 flex items-baseline justify-between gap-3 font-sans text-[0.75rem] text-foreground/75">
      <span>
        {label}
        {note && <span className="text-foreground/45"> · {note}</span>}
      </span>
      <span className="tabular-nums text-foreground">{value}%</span>
    </div>
  );
}

function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-3">
      <div className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-foreground/45">
        {title}
      </div>
      <div className="font-sans text-[0.72rem] text-foreground/55">{sub}</div>
    </div>
  );
}

export default function RunsVsRight() {
  return (
    <div className="border border-border/60 bg-surface/40 p-4 md:p-6" aria-hidden>
      <Heading title="CAD assemblies" sub="MUSE, best model, share of tasks passing each check in turn" />
      <div className="space-y-3">
        {cad.map((r, i) => (
          <div key={r.label}>
            <Label {...r} />
            <Bar value={r.value} prev={i > 0 ? cad[i - 1].value : undefined} strong={i === cad.length - 1} />
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border/40 pt-5">
        <Heading title="Circuit boards" sub="HWE-Bench, best model, full pass" />
        <Label label="Passes static rules and simulation" value={8.15} />
        <div className="relative">
          <Bar value={8.15} strong />
          {boardOthers.map((v) => (
            <div
              key={v}
              className="absolute -bottom-2 h-2 w-px bg-foreground/60"
              style={{ left: `${v}%` }}
            />
          ))}
        </div>
        <div className="mt-3.5 font-sans text-[0.68rem] leading-[1.5] text-foreground/50">
          Ticks: the other models listed, 4.4-6.6%. Static-rule scores alone average much higher; the
          benchmark headline is the full pass.
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/40 pt-4 font-sans text-[0.68rem] text-foreground/60">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-3 border border-dashed border-foreground/40" />
          Passed the previous check, failed this one
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-3" style={{ backgroundColor: "var(--accent)", opacity: 0.85 }} />
          Strictest check reported
        </span>
      </div>
    </div>
  );
}
