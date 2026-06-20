import { useState } from "react";
import type { ComposeResult, ComposeTone } from "@subtext/shared";
import { trpc } from "../../lib/trpc";
import { useSession } from "../../lib/useSession";
import { Segmented } from "../../components/Segmented";
import { Loading } from "../../components/Spinner";
import { CopyButton } from "../../components/CopyButton";
import { YouDecideNote, ErrorNote, InfoBanner } from "../../components/Notes";
import { RelationshipSelect } from "../relationships/RelationshipSelect";

const TONES: { value: ComposeTone; label: string }[] = [
  { value: "warm", label: "Warm" },
  { value: "neutral", label: "Neutral" },
  { value: "professional", label: "Professional" },
  { value: "direct", label: "Direct" },
  { value: "apologetic-but-confident", label: "Kind & confident" },
];

const EXAMPLES = [
  "I'm so so sorry to bother you but is there any chance you could maybe send the file? totally fine if not!!",
  "no. that deadline doesn't work for me.",
  "i need you to stop messaging me after work hours",
];

export function ComposeView() {
  const { isLoggedIn } = useSession();
  const [intent, setIntent] = useState("");
  const [tone, setTone] = useState<ComposeTone>("warm");
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [result, setResult] = useState<ComposeResult | null>(null);
  const [lastInput, setLastInput] = useState("");

  const compose = trpc.compose.run.useMutation({
    onSuccess: (data) => setResult(data),
  });

  function run(text: string) {
    const msg = text.trim();
    if (!msg) return;
    setLastInput(msg);
    setResult(null);
    compose.mutate({ intent: msg, tone, relationshipId });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section aria-labelledby="compose-heading" className="space-y-4">
        <div>
          <h1 id="compose-heading" className="text-2xl font-semibold">
            Say what you mean
          </h1>
          <p className="mt-1 text-muted">
            Write what you actually want to say — however it comes out. You'll
            get a few ways to phrase it, each with the reasoning, so you keep
            the skill.
          </p>
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <label className="label" htmlFor="compose-input">
              What you actually mean
            </label>
            <textarea
              id="compose-input"
              className="field min-h-[9rem] resize-y"
              placeholder="Just say it plainly — we'll help it land."
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
            />
          </div>

          <div>
            <span className="label">How do you want it to come across?</span>
            <Segmented
              label="Tone"
              value={tone}
              onChange={setTone}
              options={TONES}
            />
          </div>

          <RelationshipSelect value={relationshipId} onChange={setRelationshipId} />

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted">{intent.length}/4000</span>
            <button
              type="button"
              className="btn-primary"
              disabled={!intent.trim() || compose.isPending}
              onClick={() => run(intent)}
            >
              {compose.isPending ? "Working…" : "Help me phrase it"}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Or try an example:</p>
          <div className="flex flex-col gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                className="rounded-xl border border-border bg-surface px-3 py-2 text-left text-sm text-muted hover:border-brand hover:text-ink"
                onClick={() => {
                  setIntent(ex);
                  run(ex);
                }}
              >
                “{ex}”
              </button>
            ))}
          </div>
        </div>
      </section>

      <section aria-live="polite" aria-label="Phrasings" className="reading-focus space-y-4">
        {compose.isPending && (
          <div className="card p-6">
            <Loading caption="Finding the words…" />
          </div>
        )}

        {compose.isError && !compose.isPending && (
          <ErrorNote>
            We couldn't draft options just now. {compose.error.message}{" "}
            <button className="underline" onClick={() => run(lastInput || intent)}>
              Try again
            </button>
            .
          </ErrorNote>
        )}

        {result && !compose.isPending && (
          <>
            {result.gentleNote ? (
              <InfoBanner>{result.gentleNote}</InfoBanner>
            ) : (
              <div className="card p-4">
                <div className="text-sm font-medium text-muted">
                  How your draft might land
                </div>
                <p className="mt-1">{result.originalMightLandAs}</p>
              </div>
            )}

            {result.variants.map((v, i) => (
              <article key={i} className="card p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{v.label}</h3>
                  <div className="flex gap-1">
                    <CopyButton text={v.text} />
                    {isLoggedIn && <SavePhrase label={v.label} text={v.text} />}
                  </div>
                </div>
                <p className="mt-2 max-w-reading whitespace-pre-wrap">{v.text}</p>
                <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm text-muted">
                  <span className="font-medium text-ink">Why this works: </span>
                  {v.whyThisWorks}
                </div>
              </article>
            ))}

            <YouDecideNote onRegenerate={() => run(lastInput)} />
            {isLoggedIn && result.variants[0] && (
              <SaveCompose
                intentText={lastInput}
                relationshipId={relationshipId}
                chosenVariant={result.variants[0].label}
                result={result}
              />
            )}
          </>
        )}

        {!result && !compose.isPending && !compose.isError && (
          <div className="card grid min-h-[12rem] place-items-center p-6 text-center text-muted">
            <p>
              Your options will appear here.
              <br />
              <span className="text-sm">
                Direct is valid. These are choices, never corrections.
              </span>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function SavePhrase({ label, text }: { label: string; text: string }) {
  const [saved, setSaved] = useState(false);
  const save = trpc.library.savePhrase.useMutation({
    onSuccess: () => setSaved(true),
  });
  return (
    <button
      type="button"
      className="btn-quiet"
      disabled={save.isPending || saved}
      onClick={() => save.mutate({ label, text, context: "" })}
      title="Save to your phrasebook"
    >
      <span aria-hidden="true">{saved ? "✓" : "＋"}</span>
      {saved ? "Saved" : "Phrasebook"}
    </button>
  );
}

function SaveCompose({
  intentText,
  relationshipId,
  chosenVariant,
  result,
}: {
  intentText: string;
  relationshipId: string | null;
  chosenVariant: string;
  result: ComposeResult;
}) {
  const [saved, setSaved] = useState(false);
  const save = trpc.library.saveCompose.useMutation({
    onSuccess: () => setSaved(true),
  });
  return (
    <button
      type="button"
      className="btn-ghost"
      disabled={save.isPending || saved}
      onClick={() =>
        save.mutate({ intentText, relationshipId, chosenVariant, result })
      }
    >
      <span aria-hidden="true">{saved ? "✓" : "☆"}</span>
      {saved ? "Saved to history" : "Save this draft"}
    </button>
  );
}
