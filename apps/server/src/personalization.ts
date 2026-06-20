import {
  CommunicationProfile,
  Formality,
  type RelationshipContext,
} from "@subtext/shared";
import { prisma } from "./db.js";

/**
 * Loads a user's communication profile (or null) in the shared shape.
 * Tolerates partial/legacy JSON by re-parsing through the Zod contract.
 */
export async function loadProfile(
  userId: string,
): Promise<CommunicationProfile | null> {
  const row = await prisma.communicationProfile.findUnique({
    where: { userId },
  });
  if (!row) return null;
  const parsed = CommunicationProfile.safeParse({
    selfTraits: row.selfTraits,
    goals: row.goals,
    readingPrefs: row.readingPrefs,
  });
  return parsed.success ? parsed.data : null;
}

/**
 * Loads a relationship (scoped to the user) as the lightweight context the
 * AI prompts consume. Returns null when no id is given or it isn't found.
 */
export async function loadRelationshipContext(
  userId: string,
  relationshipId: string | null | undefined,
): Promise<RelationshipContext | null> {
  if (!relationshipId) return null;
  const row = await prisma.relationship.findFirst({
    where: { id: relationshipId, userId },
  });
  if (!row) return null;
  return {
    name: row.name,
    who: row.who,
    formality: Formality.catch("NEUTRAL").parse(row.formality),
    notes: row.notes,
  };
}
