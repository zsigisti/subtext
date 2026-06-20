import { useState } from "react";
import type { ComposeResult, ComposeTone } from "@subtext/shared";
import { trpc } from "../../lib/trpc";
import { useSession } from "../../lib/useSession";
import { useToast } from "../../components/Toast";
import { Segmented } from "../../components/Segmented";
import { CopyButton } from "../../components/CopyButton";
import { YouDecideNote, ErrorNote, InfoBanner } from "../../components/Notes";
import { Reveal } from "../../components/Reveal";
import { ComposeSkeleton } from "../../components/Skeleton";
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

const MAX = 4000;

export function ComposeView() {
  const { isLoggedIn } = useSession();
  const { toast } = useToast();
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

  const overLimit = intent.length > MAX;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section aria-labelledby="compose-heading" className="space-y-4">
        <Reveal animation="fade-up">
          <p className="chip w-fit">
            <span aria-hidden="true">✍️</span> Compose
          </p>
          <h1 id="compose-heading" className="mt-2 text-3xl font-bold tracking-tight">
            Say it so it <span className="text-gradient">lands right</span>
          </h1>
          <p className="mt-2 text-muted">
            Write what you actually want to say — however it comes out. You'll get
            a few ways to phrase it, each with the reasoning, so you keep the skill.
          </p>
        </Reveal>

        <Reveal animation="fade-up" delay={80} className="card p-5 space-y-4">
          <div>
            <label className="label" htmlFor="compose-input">
              What you actually mean
            </label>
            <textarea
              id="compose-input"
              className="field min-h-[9rem] resize-y"
              placeholder="Just say it plainly — we'll help it land."
              value={intent}
              maxLength={MAX + 200}
              onChange={(e) => setIntent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(intent);
              }}
            />
          </div>

          <div>
            <span className="label">How do you want it to come across?</span>
            <Segmented label="Tone" value={tone} onChange={setTone} options={TONES} />
          </div>

          <RelationshipSelect value={relationshipId} onChange={setRelationshipId} />

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs tabular-nums text-muted">
              {intent.length.toLocaleString()} / {MAX.toLocaleString()}
            </span>
            <button
              type="button"
              className="btn-primary"
              disabled={!intent.trim() || overLimit || compose.isPending}
              onClick={() => run(intent)}
            >
              {compose.isPending ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Working…
                </>
              ) : (
                <>Help me phrase it <kbd className="ml-1 hidden rounded bg-white/20 px-1.5 text-xs sm:inline">⌘↵</kbd></>
              )}
            </button>
          </div>
        </Reveal>

        <Reveal animation="fade-up" delay={140}>
          <p className="mb-2 text-sm font-medium text-muted">Or try an example:</p>
          <div className="flex flex-col gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                className="card-hover rounded-xl border border-border bg-surface px-3 py-2 text-left text-sm text-muted hover:text-ink"
                onClick={() => {
                  setIntent(ex);
                  run(ex);
                }}
              >
                “{ex}”
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      <section aria-live="polite" aria-label="Phrasings" className="reading-focus space-y-4">
        {compose.isPending && <ComposeSkeleton />}

        {compose.isError && !compose.isPending && (
          <ErrorNote>
            We couldn't draft options just now. {compose.error.message}{" "}
            <button className="font-medium underline" onClick={() => run(lastInput || intent)}>
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
              <Reveal animation="scale-in" className="card p-4">
                <div className="text-sm font-medium text-muted">
                  <span aria-hidden="true">👀</span> How your draft might land
                </div>
                <p className="mt-1">{result.originalMightLandAs}</p>
              </Reveal>
            )}

            {result.variants.map((v, i) => (
              <Reveal as="article" index={i} key={i} className="card card-hover p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                      {i + 1}
                    </span>
                    {v.label}
                  </h3>
                  <div className="flex gap-1">
                    <CopyButton text={v.text} />
                    {isLoggedIn && (
                      <SavePhrase
                        label={v.label}
                        text={v.text}
                        onSaved={() => toast("Saved to phrasebook")}
                      />
                    )}
                  </div>
                </div>
                <p className="mt-2 max-w-reading whitespace-pre-wrap">{v.text}</p>
                <div
                  className="mt-3 rounded-xl p-3 text-sm"
                  style={{ background: "rgb(var(--positive) / 0.08)", color: "rgb(var(--ink))" }}
                >
                  <span className="font-medium" style={{ color: "rgb(var(--positive))" }}>
                    Why this works:{" "}
                  </span>
                  {v.whyThisWorks}
                </div>
              </Reveal>
            ))}

            <YouDecideNote onRegenerate={() => run(lastInput)} />
            {isLoggedIn && result.variants[0] && (
              <Reveal animation="fade-in" delay={150}>
                <SaveCompose
                  intentText={lastInput}
                  relationshipId={relationshipId}
                  chosenVariant={result.variants[0].label}
                  result={result}
                  onSaved={() => toast("Draft saved to history")}
                />
              </Reveal>
            )}
          </>
        )}

        {!result && !compose.isPending && !compose.isError && <ComposeEmpty />}
      </section>
    </div>
  );
}

function ComposeEmpty() {
  return (
    <div className="card grid min-h-[16rem] place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-16 w-16 animate-float place-items-center rounded-2xl bg-brand-soft text-3xl">
          🪄
        </div>
        <p className="font-medium">Your options will appear here</p>
        <p className="mt-1 text-sm text-muted">
          Direct is valid. These are choices,<br />never corrections.
        </p>
      </div>
    </div>
  );
}

function SavePhrase({
  label,
  text,
  onSaved,
}: {
  label: string;
  text: string;
  onSaved: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const save = trpc.library.savePhrase.useMutation({
    onSuccess: () => {
      setSaved(true);
      onSaved();
    },
  });
  return (
    <button
      type="button"
      className="btn-quiet"
      disabled={save.isPending || saved}
      onClick={() => save.mutate({ label, text, context: "" })}
      title="Save to your phrasebook"
    >
      <span aria-hidden="true" className="animate-pop inline-block" key={String(saved)}>
        {saved ? "✓" : "＋"}
      </span>
      {saved ? "Saved" : "Phrasebook"}
    </button>
  );
}

function SaveCompose({
  intentText,
  relationshipId,
  chosenVariant,
  result,
  onSaved,
}: {
  intentText: string;
  relationshipId: string | null;
  chosenVariant: string;
  result: ComposeResult;
  onSaved: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const save = trpc.library.saveCompose.useMutation({
    onSuccess: () => {
      setSaved(true);
      onSaved();
    },
  });
  return (
    <button
      type="button"
      className="btn-ghost"
      disabled={save.isPending || saved}
      onClick={() => save.mutate({ intentText, relationshipId, chosenVariant, result })}
    >
      <span aria-hidden="true" className="animate-pop inline-block" key={String(saved)}>
        {saved ? "✓" : "☆"}
      </span>
      {saved ? "Saved to history" : "Save this draft"}
    </button>
  );
}
