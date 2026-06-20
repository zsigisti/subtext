/** A calm, low-motion loading indicator with a reassuring caption. */
export function Loading({ caption = "Reading it over…" }: { caption?: string }) {
  return (
    <div
      className="flex items-center gap-3 text-muted"
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-brand"
      />
      <span>{caption}</span>
    </div>
  );
}
