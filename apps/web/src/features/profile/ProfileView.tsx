import { useEffect, useState } from "react";
import type { CommunicationProfile } from "@subtext/shared";
import { trpc } from "../../lib/trpc";
import { useSession } from "../../lib/useSession";
import { RelationshipManager } from "../relationships/RelationshipManager";

const TRAIT_SUGGESTIONS = [
  "I tend to be very direct",
  "I over-apologize",
  "I take things literally",
  "I miss hints / subtext",
  "I worry messages are angrier than they are",
  "I info-dump when excited",
  "I need extra time to reply",
];

const EMPTY: CommunicationProfile = {
  selfTraits: [],
  goals: "",
  readingPrefs: { extraPlainLanguage: false, alwaysShowAlternative: false },
};

export function ProfileView() {
  const { isLoggedIn } = useSession();
  if (!isLoggedIn) {
    return (
      <div className="card mx-auto max-w-reading p-6 text-center text-muted">
        Sign in to set up your communication profile — it calibrates every
        reading and rephrasing to you.
      </div>
    );
  }
  return <ProfileEditor />;
}

function ProfileEditor() {
  const utils = trpc.useUtils();
  const query = trpc.profile.get.useQuery();
  const save = trpc.profile.save.useMutation({
    onSuccess: () => utils.profile.get.invalidate(),
  });

  const [draft, setDraft] = useState<CommunicationProfile>(EMPTY);
  const [traitInput, setTraitInput] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (query.data) setDraft(query.data);
  }, [query.data]);

  function addTrait(t: string) {
    const trait = t.trim();
    if (!trait || draft.selfTraits.includes(trait) || draft.selfTraits.length >= 12)
      return;
    setDraft((d) => ({ ...d, selfTraits: [...d.selfTraits, trait] }));
    setTraitInput("");
  }
  function removeTrait(t: string) {
    setDraft((d) => ({ ...d, selfTraits: d.selfTraits.filter((x) => x !== t) }));
  }

  async function persist() {
    await save.mutateAsync(draft);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  const isNew = query.isFetched && !query.data;

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Your communication profile</h1>
          <p className="mt-1 text-muted">
            A few honest notes about how you communicate. This isn't about
            fixing anything — it just helps Subtext calibrate to you. There are
            no wrong answers, and being direct is completely valid.
          </p>
        </div>

        {isNew && (
          <div className="rounded-xl border border-border bg-brand-soft/60 px-4 py-3 text-sm">
            <strong>Welcome!</strong> Add a couple of traits below to personalize
            your results. You can change these any time.
          </div>
        )}

        <div className="card p-5 space-y-5">
          <div>
            <span className="label">How would you describe your style?</span>
            <div className="flex flex-wrap gap-2">
              {draft.selfTraits.map((t) => (
                <span key={t} className="chip text-ink">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTrait(t)}
                    aria-label={`Remove "${t}"`}
                    className="ml-1 text-muted hover:text-ink"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="field"
                placeholder="Add your own…"
                value={traitInput}
                onChange={(e) => setTraitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTrait(traitInput);
                  }
                }}
              />
              <button className="btn-ghost" type="button" onClick={() => addTrait(traitInput)}>
                Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {TRAIT_SUGGESTIONS.filter((s) => !draft.selfTraits.includes(s)).map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    className="chip hover:border-brand hover:text-ink"
                    onClick={() => addTrait(s)}
                  >
                    + {s}
                  </button>
                ),
              )}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="goals">
              What do you want help with? (optional)
            </label>
            <textarea
              id="goals"
              className="field min-h-[5rem]"
              placeholder="e.g. Understanding what people really mean without spiralling."
              value={draft.goals}
              onChange={(e) => setDraft((d) => ({ ...d, goals: e.target.value }))}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="label">Reading preferences</legend>
            <ToggleRow
              label="Extra plain-language detail"
              checked={draft.readingPrefs.extraPlainLanguage}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  readingPrefs: { ...d.readingPrefs, extraPlainLanguage: v },
                }))
              }
            />
            <ToggleRow
              label="Always show an alternative reading"
              checked={draft.readingPrefs.alwaysShowAlternative}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  readingPrefs: { ...d.readingPrefs, alwaysShowAlternative: v },
                }))
              }
            />
          </fieldset>

          <div className="flex items-center gap-3">
            <button className="btn-primary" onClick={persist} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save profile"}
            </button>
            {savedFlash && (
              <span role="status" className="text-sm text-positive">
                ✓ Saved
              </span>
            )}
          </div>
        </div>
      </section>

      <RelationshipManager />
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-surface-2 px-3 py-2">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-brand" : "bg-border",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
    </label>
  );
}
