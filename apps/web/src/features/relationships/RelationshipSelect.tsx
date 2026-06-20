import { trpc } from "../../lib/trpc";
import { useSession } from "../../lib/useSession";

/**
 * Lets the user pick which relationship a message is with, so output is
 * calibrated. Only meaningful when signed in (relationships are saved per user).
 */
export function RelationshipSelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const { isLoggedIn } = useSession();
  const list = trpc.relationships.list.useQuery(undefined, {
    enabled: isLoggedIn,
  });

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-muted">
        <span aria-hidden="true">🔒</span> Sign in to calibrate results to a
        specific person (your boss reads differently from your best friend).
      </p>
    );
  }

  const relationships = list.data ?? [];

  return (
    <div>
      <label className="label" htmlFor="relationship-select">
        Who is this with?
      </label>
      <select
        id="relationship-select"
        className="field"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">No specific person (general reading)</option>
        {relationships.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name} · {r.who}
          </option>
        ))}
      </select>
      {relationships.length === 0 && (
        <p className="mt-1.5 text-sm text-muted">
          Add people on the “You” tab to calibrate tone per relationship.
        </p>
      )}
    </div>
  );
}
