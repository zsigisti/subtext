import type { Confidence } from "@subtext/shared";

const CONFIDENCE_PCT: Record<Confidence, number> = {
  low: 33,
  medium: 66,
  high: 100,
};

const CONFIDENCE_COLOR: Record<Confidence, string> = {
  low: "var(--muted)",
  medium: "var(--brand)",
  high: "var(--positive)",
};

/** A small animated bar that fills to reflect the model's confidence. */
export function ConfidenceMeter({ value }: { value: Confidence }) {
  return (
    <div className="min-w-[7rem]">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted">Confidence</span>
        <span className="font-medium capitalize" style={{ color: `rgb(${CONFIDENCE_COLOR[value]})` }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" role="meter" aria-label={`Confidence: ${value}`} aria-valuetext={value}>
        <div
          className="grow-x h-full rounded-full"
          style={{
            width: `${CONFIDENCE_PCT[value]}%`,
            backgroundColor: `rgb(${CONFIDENCE_COLOR[value]})`,
          }}
        />
      </div>
    </div>
  );
}

const URGENCY_LABEL = ["No rush", "Low", "Soon", "Time-sensitive"];

/** Four segments that light up to show urgency 0–3. */
export function UrgencyGauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(3, value));
  return (
    <div className="inline-flex items-center gap-2" title={`Urgency: ${URGENCY_LABEL[v]}`}>
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-1.5 rounded-full transition-colors"
            style={{
              height: `${6 + i * 4}px`,
              backgroundColor:
                i <= v
                  ? `rgb(var(--${v >= 3 ? "warn" : "brand"}))`
                  : "rgb(var(--border))",
            }}
          />
        ))}
      </span>
      <span className="text-sm text-muted">{URGENCY_LABEL[v]}</span>
    </div>
  );
}
