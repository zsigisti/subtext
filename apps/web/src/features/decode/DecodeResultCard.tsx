import type { DecodeResult } from "@subtext/shared";
import { ConfidenceMeter, UrgencyGauge } from "../../components/Meter";
import { Reveal } from "../../components/Reveal";

const CONFIDENCE_RING: Record<DecodeResult["confidence"], string> = {
  low: "rgb(var(--muted))",
  medium: "rgb(var(--brand))",
  high: "rgb(var(--positive))",
};

function Field({
  term,
  icon,
  index,
  children,
}: {
  term: string;
  icon: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <Reveal index={index} className="rounded-xl bg-surface-2/60 p-3">
      <dt className="flex items-center gap-1.5 text-sm font-medium text-muted">
        <span aria-hidden="true">{icon}</span>
        {term}
      </dt>
      <dd className="mt-1">{children}</dd>
    </Reveal>
  );
}

export function DecodeResultCard({ result }: { result: DecodeResult }) {
  return (
    <article
      className="card animate-scale-in overflow-hidden p-5"
      style={{ borderTop: `3px solid ${CONFIDENCE_RING[result.confidence]}` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h2 className="max-w-reading text-lg font-semibold leading-snug">
          {result.toneSummary}
        </h2>
        <ConfidenceMeter value={result.confidence} />
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field term="What it literally says" icon="📄" index={0}>
          {result.literalMeaning}
        </Field>
        <Field term="What it may imply" icon="💭" index={1}>
          {result.impliedMeaning}
        </Field>
        <Field term="Likely intent" icon="🎯" index={2}>
          {result.senderIntent}
        </Field>
        <Field term="Timing" icon="⏱️" index={3}>
          <div className="flex flex-col gap-2">
            <UrgencyGauge value={result.urgency} />
            <span className="chip w-fit">
              {result.replyExpected ? "Reply expected" : "No reply needed"}
            </span>
          </div>
        </Field>
      </dl>

      {result.alternativeReading && (
        <Reveal
          index={4}
          className="mt-4 rounded-xl border border-dashed p-4"
          style={{
            borderColor: "rgb(var(--accent) / 0.5)",
            background: "rgb(var(--accent) / 0.06)",
          }}
        >
          <div className="text-sm font-medium" style={{ color: "rgb(var(--accent))" }}>
            <span aria-hidden="true">🤔</span> Another way to read it
          </div>
          <p className="mt-1">{result.alternativeReading}</p>
        </Reveal>
      )}
    </article>
  );
}
