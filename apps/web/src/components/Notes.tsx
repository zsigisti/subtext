import type { ReactNode } from "react";

/** The quiet, ever-present "this is a suggestion — you decide" affordance. */
export function YouDecideNote({
  onRegenerate,
}: {
  onRegenerate?: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted">
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true">🌱</span>
        This is a suggestion — you decide what fits.
      </span>
      {onRegenerate && (
        <button type="button" className="btn-quiet" onClick={onRegenerate}>
          <span aria-hidden="true">↻</span> Try again
        </button>
      )}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-ink"
    >
      <strong className="font-semibold">Something went sideways.</strong>{" "}
      {children}
    </div>
  );
}

export function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-brand-soft/60 px-4 py-3 text-sm text-ink">
      {children}
    </div>
  );
}
