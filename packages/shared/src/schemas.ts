import { z } from "zod";

/* ──────────────────────────────────────────────────────────────
 * Shared vocabulary
 * ────────────────────────────────────────────────────────────── */

export const Formality = z.enum(["CASUAL", "NEUTRAL", "FORMAL"]);
export type Formality = z.infer<typeof Formality>;

export const Confidence = z.enum(["low", "medium", "high"]);
export type Confidence = z.infer<typeof Confidence>;

/** Tone targets a user can ask Compose to aim for. */
export const ComposeTone = z.enum([
  "warm",
  "neutral",
  "professional",
  "direct",
  "apologetic-but-confident",
]);
export type ComposeTone = z.infer<typeof ComposeTone>;

/* ──────────────────────────────────────────────────────────────
 * Communication profile (personalization)
 * ────────────────────────────────────────────────────────────── */

/** A short, self-identified communication trait, e.g. "I tend to be very direct". */
export const SelfTrait = z.string().min(1).max(120);

export const ReadingPrefs = z.object({
  /** Prefer extra plain-language detail in decode output. */
  extraPlainLanguage: z.boolean().default(false),
  /** Always surface an alternative reading, even at high confidence. */
  alwaysShowAlternative: z.boolean().default(false),
});
export type ReadingPrefs = z.infer<typeof ReadingPrefs>;

export const CommunicationProfile = z.object({
  selfTraits: z.array(SelfTrait).max(12).default([]),
  goals: z.string().max(500).default(""),
  readingPrefs: ReadingPrefs.default({
    extraPlainLanguage: false,
    alwaysShowAlternative: false,
  }),
});
export type CommunicationProfile = z.infer<typeof CommunicationProfile>;

/* ──────────────────────────────────────────────────────────────
 * Relationships / contexts
 * ────────────────────────────────────────────────────────────── */

export const Relationship = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
  who: z.string().min(1).max(80), // "manager", "best friend", "parent"...
  formality: Formality,
  notes: z.string().max(500).default(""),
});
export type Relationship = z.infer<typeof Relationship>;

export const RelationshipInput = Relationship.omit({ id: true });
export type RelationshipInput = z.infer<typeof RelationshipInput>;

/** A lightweight relationship snapshot passed into AI prompts. */
export const RelationshipContext = Relationship.pick({
  name: true,
  who: true,
  formality: true,
  notes: true,
}).partial({ notes: true });
export type RelationshipContext = z.infer<typeof RelationshipContext>;

/* ──────────────────────────────────────────────────────────────
 * DECODE
 * ────────────────────────────────────────────────────────────── */

export const DecodeInput = z.object({
  message: z.string().min(1, "Paste a message to decode.").max(4000),
  relationshipId: z.string().nullable().optional(),
});
export type DecodeInput = z.infer<typeof DecodeInput>;

export const SuggestedResponse = z.object({
  /** e.g. "warm", "neutral", "boundary-setting" */
  register: z.string(),
  text: z.string(),
});
export type SuggestedResponse = z.infer<typeof SuggestedResponse>;

export const DecodeResult = z.object({
  toneSummary: z.string(),
  literalMeaning: z.string(),
  impliedMeaning: z.string(),
  senderIntent: z.string(),
  urgency: z.number().int().min(0).max(3),
  replyExpected: z.boolean(),
  confidence: Confidence,
  alternativeReading: z.string().nullable(),
  suggestedResponses: z.array(SuggestedResponse).max(4).default([]),
});
export type DecodeResult = z.infer<typeof DecodeResult>;

/* ──────────────────────────────────────────────────────────────
 * COMPOSE
 * ────────────────────────────────────────────────────────────── */

export const ComposeInput = z.object({
  intent: z.string().min(1, "Write what you actually mean.").max(4000),
  tone: ComposeTone.default("warm"),
  relationshipId: z.string().nullable().optional(),
});
export type ComposeInput = z.infer<typeof ComposeInput>;

export const ComposeVariant = z.object({
  label: z.string(), // "Warm & clear", "Professional", "Short & direct"
  text: z.string(),
  whyThisWorks: z.string(),
});
export type ComposeVariant = z.infer<typeof ComposeVariant>;

export const ComposeResult = z.object({
  /** Non-judgmental note on how the raw version could read. */
  originalMightLandAs: z.string(),
  variants: z.array(ComposeVariant).min(1).max(4),
  /** Set when the request asked to manipulate/deceive — a gentle refusal note. */
  gentleNote: z.string().nullable().default(null),
});
export type ComposeResult = z.infer<typeof ComposeResult>;

/* ──────────────────────────────────────────────────────────────
 * Library: history + phrasebook
 * ────────────────────────────────────────────────────────────── */

export const DecodeEntry = z.object({
  id: z.string(),
  relationshipId: z.string().nullable(),
  inputText: z.string(),
  result: DecodeResult,
  createdAt: z.string(),
});
export type DecodeEntry = z.infer<typeof DecodeEntry>;

export const ComposeEntry = z.object({
  id: z.string(),
  relationshipId: z.string().nullable(),
  intentText: z.string(),
  chosenVariant: z.string(),
  result: ComposeResult,
  createdAt: z.string(),
});
export type ComposeEntry = z.infer<typeof ComposeEntry>;

export const SavedPhrase = z.object({
  id: z.string(),
  label: z.string().min(1).max(120),
  text: z.string().min(1).max(2000),
  context: z.string().max(200).default(""),
  createdAt: z.string(),
});
export type SavedPhrase = z.infer<typeof SavedPhrase>;

export const SavePhraseInput = SavedPhrase.omit({ id: true, createdAt: true });
export type SavePhraseInput = z.infer<typeof SavePhraseInput>;

/* ──────────────────────────────────────────────────────────────
 * Auth
 * ────────────────────────────────────────────────────────────── */

export const SignupInput = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters."),
  displayName: z.string().min(1).max(80),
});
export type SignupInput = z.infer<typeof SignupInput>;

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInput>;

export const PublicUser = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
});
export type PublicUser = z.infer<typeof PublicUser>;
