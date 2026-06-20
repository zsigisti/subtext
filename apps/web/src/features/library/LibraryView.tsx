import { useState } from "react";
import { trpc } from "../../lib/trpc";
import { useSession } from "../../lib/useSession";
import { Segmented } from "../../components/Segmented";
import { CopyButton } from "../../components/CopyButton";

type Tab = "history" | "phrasebook";

export function LibraryView() {
  const { isLoggedIn } = useSession();
  const [tab, setTab] = useState<Tab>("history");
  const [search, setSearch] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="card mx-auto max-w-reading p-6 text-center text-muted">
        Sign in to keep a private library of saved readings, drafts, and
        phrases.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Your library</h1>
          <p className="text-muted">
            Only what you chose to save. Delete anything, any time.
          </p>
        </div>
        <Segmented
          label="Library section"
          value={tab}
          onChange={setTab}
          options={[
            { value: "history", label: "History" },
            { value: "phrasebook", label: "Phrasebook" },
          ]}
        />
      </div>

      <input
        className="field"
        placeholder="Search…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search your library"
      />

      {tab === "history" ? (
        <HistoryList search={search} />
      ) : (
        <PhraseList search={search} />
      )}
    </div>
  );
}

function HistoryList({ search }: { search: string }) {
  const utils = trpc.useUtils();
  const history = trpc.library.history.useQuery({ search });
  const delDecode = trpc.library.deleteDecode.useMutation({
    onSuccess: () => utils.library.history.invalidate(),
  });
  const delCompose = trpc.library.deleteCompose.useMutation({
    onSuccess: () => utils.library.history.invalidate(),
  });

  if (history.isLoading) return <p className="text-muted">Loading…</p>;
  const decodes = history.data?.decodeEntries ?? [];
  const composes = history.data?.composeEntries ?? [];

  if (!decodes.length && !composes.length) {
    return (
      <div className="card p-6 text-center text-muted">
        Nothing saved yet. When you decode a message or draft a reply, use
        “Save” to keep it here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {decodes.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Decoded messages
          </h2>
          <ul className="space-y-3">
            {decodes.map((e) => (
              <li key={e.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-muted">“{e.inputText}”</p>
                  <button
                    className="btn-quiet shrink-0"
                    onClick={() => delDecode.mutate({ id: e.id })}
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-2 font-medium">{e.result.toneSummary}</p>
                <p className="text-sm text-muted">
                  {e.result.confidence} confidence · {e.result.senderIntent}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {composes.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Drafted replies
          </h2>
          <ul className="space-y-3">
            {composes.map((e) => {
              const chosen =
                e.result.variants.find((v) => v.label === e.chosenVariant) ??
                e.result.variants[0];
              return (
                <li key={e.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-muted">“{e.intentText}”</p>
                    <button
                      className="btn-quiet shrink-0"
                      onClick={() => delCompose.mutate({ id: e.id })}
                    >
                      Delete
                    </button>
                  </div>
                  {chosen && (
                    <div className="mt-2 rounded-xl bg-surface-2 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="chip">{chosen.label}</span>
                        <CopyButton text={chosen.text} />
                      </div>
                      <p>{chosen.text}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function PhraseList({ search }: { search: string }) {
  const utils = trpc.useUtils();
  const phrases = trpc.library.phrases.useQuery({ search });
  const del = trpc.library.deletePhrase.useMutation({
    onSuccess: () => utils.library.phrases.invalidate(),
  });

  if (phrases.isLoading) return <p className="text-muted">Loading…</p>;
  const items = phrases.data ?? [];

  if (!items.length) {
    return (
      <div className="card p-6 text-center text-muted">
        Your phrasebook is empty. When you compose a reply, tap “Phrasebook” on
        a variant to keep it as a reusable go-to.
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((p) => (
        <li key={p.id} className="card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium">{p.label}</div>
            <div className="flex gap-1">
              <CopyButton text={p.text} />
              <button className="btn-quiet" onClick={() => del.mutate({ id: p.id })}>
                Delete
              </button>
            </div>
          </div>
          <p className="mt-2 whitespace-pre-wrap">{p.text}</p>
          {p.context && <p className="mt-2 text-sm text-muted">{p.context}</p>}
        </li>
      ))}
    </ul>
  );
}
