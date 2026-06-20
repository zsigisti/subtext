import { useState } from "react";
import type { Formality, RelationshipInput } from "@subtext/shared";
import { trpc } from "../../lib/trpc";
import { Segmented } from "../../components/Segmented";

const EMPTY: RelationshipInput = {
  name: "",
  who: "",
  formality: "NEUTRAL",
  notes: "",
};

const FORMALITY_LABEL: Record<Formality, string> = {
  CASUAL: "Casual",
  NEUTRAL: "Neutral",
  FORMAL: "Formal",
};

export function RelationshipManager() {
  const utils = trpc.useUtils();
  const list = trpc.relationships.list.useQuery();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RelationshipInput>(EMPTY);

  const invalidate = () => utils.relationships.list.invalidate();
  const create = trpc.relationships.create.useMutation({ onSuccess: invalidate });
  const update = trpc.relationships.update.useMutation({ onSuccess: invalidate });
  const remove = trpc.relationships.delete.useMutation({ onSuccess: invalidate });

  function startNew() {
    setEditingId("new");
    setDraft(EMPTY);
  }
  function startEdit(id: string) {
    const r = list.data?.find((x) => x.id === id);
    if (!r) return;
    setEditingId(id);
    setDraft({ name: r.name, who: r.who, formality: r.formality, notes: r.notes });
  }
  async function submit() {
    if (!draft.name.trim() || !draft.who.trim()) return;
    if (editingId === "new") await create.mutateAsync(draft);
    else if (editingId) await update.mutateAsync({ id: editingId, ...draft });
    setEditingId(null);
  }

  const relationships = list.data ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">People & contexts</h2>
          <p className="text-muted">
            Save who you talk to, so results match the relationship — your
            manager reads differently from your best friend.
          </p>
        </div>
        {editingId === null && (
          <button className="btn-ghost" onClick={startNew}>
            + Add
          </button>
        )}
      </div>

      {relationships.length === 0 && editingId === null && (
        <div className="card p-6 text-center text-muted">
          No people yet. Add your manager, a friend, a parent… then pick them
          when you decode or compose.
        </div>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {relationships.map((r) => (
          <li key={r.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-sm text-muted">
                  {r.who} · {FORMALITY_LABEL[r.formality]}
                </div>
              </div>
              <div className="flex gap-1">
                <button className="btn-quiet" onClick={() => startEdit(r.id)}>
                  Edit
                </button>
                <button
                  className="btn-quiet"
                  onClick={() => remove.mutate({ id: r.id })}
                  aria-label={`Delete ${r.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
            {r.notes && <p className="mt-2 text-sm text-muted">{r.notes}</p>}
          </li>
        ))}
      </ul>

      {editingId !== null && (
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold">
            {editingId === "new" ? "Add a person" : "Edit"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="rel-name">Name / label</label>
              <input
                id="rel-name"
                className="field"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Priya (manager)"
              />
            </div>
            <div>
              <label className="label" htmlFor="rel-who">Who are they?</label>
              <input
                id="rel-who"
                className="field"
                value={draft.who}
                onChange={(e) => setDraft((d) => ({ ...d, who: e.target.value }))}
                placeholder="manager, friend, parent…"
              />
            </div>
          </div>
          <div>
            <span className="label">Tone with them</span>
            <Segmented
              label="Formality"
              value={draft.formality}
              onChange={(v) => setDraft((d) => ({ ...d, formality: v }))}
              options={[
                { value: "CASUAL", label: "Casual" },
                { value: "NEUTRAL", label: "Neutral" },
                { value: "FORMAL", label: "Formal" },
              ]}
            />
          </div>
          <div>
            <label className="label" htmlFor="rel-notes">Notes (optional)</label>
            <textarea
              id="rel-notes"
              className="field min-h-[4rem]"
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              placeholder="e.g. Writes short emails, not actually annoyed."
            />
          </div>
          <div className="flex gap-2">
            <button
              className="btn-primary"
              onClick={submit}
              disabled={create.isPending || update.isPending}
            >
              Save
            </button>
            <button className="btn-ghost" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
