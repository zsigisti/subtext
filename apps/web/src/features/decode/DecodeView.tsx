import { useState } from "react";
import type { DecodeResult } from "@subtext/shared";
import { trpc } from "../../lib/trpc";
import { useSession } from "../../lib/useSession";
import { useToast } from "../../components/Toast";
import { CopyButton } from "../../components/CopyButton";
import { YouDecideNote, ErrorNote } from "../../components/Notes";
import { Reveal } from "../../components/Reveal";
import { DecodeSkeleton } from "../../components/Skeleton";
import { RelationshipSelect } from "../relationships/RelationshipSelect";
import { DecodeResultCard } from "./DecodeResultCard";

const EXAMPLES = [
  { label: "Clipped work email", icon: "📧", text: "Where are we on the report? Need it before the 2pm." },
  { label: "One-word text", icon: "💬", text: "k." },
  { label: "Vague plan", icon: "🌫️", text: "we should hang out sometime i guess" },
];

const MAX = 4000;

export function DecodeView() {
  const { isLoggedIn } = useSession();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [lastInput, setLastInput] = useState("");

  const decode = trpc.decode.run.useMutation({
    onSuccess: (data) => setResult(data),
  });

  function run(text: string) {
    const msg = text.trim();
    if (!msg) return;
    setLastInput(msg);
    setResult(null);
    decode.mutate({ message: msg, relationshipId });
  }

  const overLimit = message.length > MAX;
  const counterColor =
    message.length > MAX ? "rgb(var(--warn))" : message.length > MAX * 0.9 ? "rgb(var(--accent))" : "rgb(var(--muted))";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section aria-labelledby="decode-heading" className="space-y-4">
        <Reveal animation="fade-up">
          <p className="chip w-fit">
            <span aria-hidden="true">🔍</span> Decode
          </p>
          <h1 id="decode-heading" className="mt-2 text-3xl font-bold tracking-tight">
            What did they <span className="text-gradient">actually</span> mean?
          </h1>
          <p className="mt-2 text-muted">
            Paste something you received. You'll get a plain-language read — tone,
            what's literally said vs. implied, and how sure we are.
          </p>
        </Reveal>

        <Reveal animation="fade-up" delay={80} className="card p-5 space-y-4">
          <div>
            <label className="label" htmlFor="decode-input">
              The message you received
            </label>
            <textarea
              id="decode-input"
              className="field min-h-[9rem] resize-y"
              placeholder="Paste a text, DM, or email…"
              value={message}
              maxLength={MAX + 200}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(message);
              }}
            />
          </div>

          <RelationshipSelect value={relationshipId} onChange={setRelationshipId} />

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs tabular-nums" style={{ color: counterColor }}>
              {message.length.toLocaleString()} / {MAX.toLocaleString()}
            </span>
            <button
              type="button"
              className="btn-primary"
              disabled={!message.trim() || overLimit || decode.isPending}
              onClick={() => run(message)}
            >
              {decode.isPending ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Reading…
                </>
              ) : (
                <>Decode this <kbd className="ml-1 hidden rounded bg-white/20 px-1.5 text-xs sm:inline">⌘↵</kbd></>
              )}
            </button>
          </div>
        </Reveal>

        <Reveal animation="fade-up" delay={140}>
          <p className="mb-2 text-sm font-medium text-muted">Or try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                className="chip chip-interactive"
                onClick={() => {
                  setMessage(ex.text);
                  run(ex.text);
                }}
              >
                <span aria-hidden="true">{ex.icon}</span> {ex.label}
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      <section aria-live="polite" aria-label="Reading" className="reading-focus space-y-4">
        {decode.isPending && <DecodeSkeleton />}

        {decode.isError && !decode.isPending && (
          <ErrorNote>
            We couldn't get a reading just now. {decode.error.message}{" "}
            <button className="font-medium underline" onClick={() => run(lastInput || message)}>
              Try again
            </button>
            .
          </ErrorNote>
        )}

        {result && !decode.isPending && (
          <>
            <DecodeResultCard result={result} />
            <div className="flex flex-wrap items-center gap-2">
              <YouDecideNote onRegenerate={() => run(lastInput)} />
            </div>
            {isLoggedIn && (
              <Reveal animation="fade-in" delay={200}>
                <SaveDecode
                  inputText={lastInput}
                  relationshipId={relationshipId}
                  result={result}
                  onSaved={() => toast("Reading saved to history")}
                />
              </Reveal>
            )}
            <ResponsePicker result={result} />
          </>
        )}

        {!result && !decode.isPending && !decode.isError && <DecodeEmpty />}
      </section>
    </div>
  );
}

function DecodeEmpty() {
  return (
    <div className="card grid min-h-[16rem] place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-16 w-16 animate-float place-items-center rounded-2xl bg-brand-soft text-3xl">
          🪞
        </div>
        <p className="font-medium">Your reading will appear here</p>
        <p className="mt-1 text-sm text-muted">
          Honest, never assuming the worst.<br />
          Nothing is saved unless you ask it to be.
        </p>
      </div>
    </div>
  );
}

function ResponsePicker({ result }: { result: DecodeResult }) {
  if (!result.suggestedResponses.length) return null;
  return (
    <Reveal animation="fade-up" delay={120} className="card p-5">
      <h3 className="font-semibold">If you want to reply</h3>
      <p className="text-sm text-muted">
        Options in different registers — pick what feels like you.
      </p>
      <ul className="mt-3 space-y-3">
        {result.suggestedResponses.map((r, i) => (
          <Reveal
            as="li"
            index={i}
            key={i}
            className="card-hover rounded-xl border border-border bg-surface-2/60 p-3"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="chip capitalize">{r.register}</span>
              <CopyButton text={r.text} />
            </div>
            <p>{r.text}</p>
          </Reveal>
        ))}
      </ul>
    </Reveal>
  );
}

function SaveDecode({
  inputText,
  relationshipId,
  result,
  onSaved,
}: {
  inputText: string;
  relationshipId: string | null;
  result: DecodeResult;
  onSaved: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const save = trpc.library.saveDecode.useMutation({
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
      onClick={() => save.mutate({ inputText, relationshipId, result })}
    >
      <span aria-hidden="true" className="animate-pop inline-block" key={String(saved)}>
        {saved ? "✓" : "☆"}
      </span>
      {saved ? "Saved to history" : "Save this reading"}
    </button>
  );
}
