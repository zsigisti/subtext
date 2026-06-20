interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface Props<T extends string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  /** Visually hide the group label but keep it for screen readers. */
  hideLabel?: boolean;
}

/** Accessible segmented control implemented as an ARIA radiogroup. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  hideLabel,
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1"
    >
      {!hideLabel && <span className="sr-only">{label}</span>}
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={opt.hint}
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
