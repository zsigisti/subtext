import type { DecodeResult } from "@subtext/shared";

const URGENCY_LABEL = ["No rush", "Low", "Soon", "Time-sensitive"];

const CONFIDENCE_STYLE: Record<DecodeResult["confidence"], string> = {
  low: "bg-surface-2 text-muted",
  medium: "bg-brand-soft text-brand",
  high: "bg-positive/15 text-positive",
};

function Field({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-muted">{term}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

export function DecodeResultCard({ result }: { result: DecodeResult }) {
  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="max-w-reading text-lg font-semibold">
          {result.toneSummary}
        </h2>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-medium",
            CONFIDENCE_STYLE[result.confidence],
          ].join(" ")}
          title="How confident this reading is"
        >
          {result.confidence} confidence
        </span>
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field term="What it literally says">{result.literalMeaning}</Field>
        <Field term="What it may imply">{result.impliedMeaning}</Field>
        <Field term="Likely intent">{result.senderIntent}</Field>
        <Field term="Timing">
          <span className="chip">{URGENCY_LABEL[result.urgency] ?? "—"}</span>{" "}
          <span className="chip">
            {result.replyExpected ? "Reply expected" : "No reply needed"}
          </span>
        </Field>
      </dl>

      {result.alternativeReading && (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-surface-2 p-4">
          <div className="text-sm font-medium text-muted">
            <span aria-hidden="true">🤔</span> Another way to read it
          </div>
          <p className="mt-1">{result.alternativeReading}</p>
        </div>
      )}
    </article>
  );
}
