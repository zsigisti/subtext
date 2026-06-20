import type {
  CommunicationProfile,
  RelationshipContext,
} from "@subtext/shared";

/**
 * Renders the user's communication profile + the chosen relationship into a
 * compact text block injected into every AI prompt, so output is calibrated
 * to *this* person and *this* relationship.
 */
export function renderPersonalization(input: {
  profile?: CommunicationProfile | null;
  relationship?: RelationshipContext | null;
}): string {
  const lines: string[] = [];

  const p = input.profile;
  if (p && (p.selfTraits.length || p.goals)) {
    lines.push("ABOUT THE USER (how they describe their own communication):");
    if (p.selfTraits.length) {
      for (const t of p.selfTraits) lines.push(`  - ${t}`);
    }
    if (p.goals) lines.push(`  Goal: ${p.goals}`);
  }

  const r = input.relationship;
  if (r) {
    lines.push("");
    lines.push("RELATIONSHIP CONTEXT (who this message is with):");
    lines.push(`  - This person is the user's ${r.who} (saved as "${r.name}").`);
    lines.push(`  - Preferred register: ${formalityLabel(r.formality)}.`);
    if (r.notes) lines.push(`  - Notes from the user: ${r.notes}`);
  }

  if (!lines.length) {
    return "No personalization provided — give a clear, general-purpose reading.";
  }
  return lines.join("\n");
}

function formalityLabel(f: RelationshipContext["formality"]): string {
  switch (f) {
    case "CASUAL":
      return "casual / relaxed";
    case "FORMAL":
      return "formal / professional";
    default:
      return "neutral";
  }
}
