import { useState } from "react";
import type { DecodeResult } from "@subtext/shared";
import { trpc } from "../../lib/trpc";
import { useSession } from "../../lib/useSession";
import { Loading } from "../../components/Spinner";
import { CopyButton } from "../../components/CopyButton";
import { YouDecideNote, ErrorNote } from "../../components/Notes";
import { RelationshipSelect } from "../relationships/RelationshipSelect";
import { DecodeResultCard } from "./DecodeResultCard";

const EXAMPLES = [
  { label: "A clipped work email", text: "Where are we on the report? Need it before the 2pm." },
  { label: "A one-word text", text: "k." },
  { label: "A vague plan", text: "we should hang out sometime i guess" },
];

export function DecodeView() {
  const { isLoggedIn } = useSession();
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section aria-labelledby="decode-heading" className="space-y-4">
        <div>
          <h1 id="decode-heading" className="text-2xl font-semibold">
            Decode a message
          </h1>
          <p className="mt-1 text-muted">
            Paste something you received. You'll get a plain-language read —
            tone, what's literally said vs. implied, and how sure we are.
          </p>
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <label className="label" htmlFor="decode-input">
              The message you received
            </label>
            <textarea
              id="decode-input"
              className="field min-h-[9rem] resize-y"
              placeholder="Paste a text, DM, or email…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <RelationshipSelect value={relationshipId} onChange={setRelationshipId} />

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted">
              {message.length}/4000
            </span>
            <button
              type="button"
              className="btn-primary"
              disabled={!message.trim() || decode.isPending}
              onClick={() => run(message)}
            >
              {decode.isPending ? "Reading…" : "Decode this"}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Or try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                className="chip hover:text-ink hover:border-brand"
                onClick={() => {
                  setMessage(ex.text);
                  run(ex.text);
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section aria-live="polite" aria-label="Reading" className="reading-focus space-y-4">
        {decode.isPending && (
          <div className="card p-6">
            <Loading caption="Reading it over…" />
          </div>
        )}

        {decode.isError && !decode.isPending && (
          <ErrorNote>
            We couldn't get a reading just now. {decode.error.message}{" "}
            <button className="underline" onClick={() => run(lastInput || message)}>
              Try again
            </button>
            .
          </ErrorNote>
        )}

        {result && !decode.isPending && (
          <>
            <DecodeResultCard result={result} />
            <YouDecideNote onRegenerate={() => run(lastInput)} />
            {isLoggedIn && (
              <SaveDecode
                inputText={lastInput}
                relationshipId={relationshipId}
                result={result}
              />
            )}
            <ResponsePicker result={result} />
          </>
        )}

        {!result && !decode.isPending && !decode.isError && (
          <div className="card grid min-h-[12rem] place-items-center p-6 text-center text-muted">
            <p>
              Your reading will appear here.
              <br />
              <span className="text-sm">
                Nothing is saved unless you ask it to be.
              </span>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ResponsePicker({ result }: { result: DecodeResult }) {
  if (!result.suggestedResponses.length) return null;
  return (
    <div className="card p-5">
      <h3 className="font-semibold">If you want to reply</h3>
      <p className="text-sm text-muted">
        Options in different registers — pick what feels like you.
      </p>
      <ul className="mt-3 space-y-3">
        {result.suggestedResponses.map((r, i) => (
          <li key={i} className="rounded-xl border border-border bg-surface-2 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="chip capitalize">{r.register}</span>
              <CopyButton text={r.text} />
            </div>
            <p>{r.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SaveDecode({
  inputText,
  relationshipId,
  result,
}: {
  inputText: string;
  relationshipId: string | null;
  result: DecodeResult;
}) {
  const [saved, setSaved] = useState(false);
  const save = trpc.library.saveDecode.useMutation({
    onSuccess: () => setSaved(true),
  });
  return (
    <button
      type="button"
      className="btn-ghost"
      disabled={save.isPending || saved}
      onClick={() => save.mutate({ inputText, relationshipId, result })}
    >
      <span aria-hidden="true">{saved ? "✓" : "☆"}</span>
      {saved ? "Saved to history" : "Save this reading"}
    </button>
  );
}
