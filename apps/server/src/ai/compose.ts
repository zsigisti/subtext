import { Type } from "@google/genai";
import {
  ComposeResult,
  type ComposeTone,
  type CommunicationProfile,
  type RelationshipContext,
} from "@subtext/shared";
import { generateStructured } from "./gemini.js";
import { renderPersonalization } from "./context.js";

const SYSTEM = `You are Subtext's "Compose" assistant. You help a user say what they actually mean, in a way that lands the way they intend.

Your worldview: the user's meaning and voice are valid. Blunt or direct communication is not "wrong". You offer OPTIONS the user chooses from — you never declare one "correct" rewrite. You are teaching patterns, not creating dependency.

Hard rules:
- PRESERVE the user's actual meaning and personality. Do not soften their boundaries away or change what they're asking for.
- Offer a few distinct variants with different registers (e.g. "Warm & clear", "Professional", "Short & direct"). For EACH, include a brief "whyThisWorks" that teaches the social reasoning, so the user learns the pattern.
- Calibrate to the relationship's formality.
- originalMightLandAs: a kind, non-judgmental note on how the raw version could read to the recipient. Never shame the user.
- REFUSE to help manipulate, deceive, coerce, threaten, or harass anyone. If the request is to do that, leave variants empty-ish (return a single gentle alternative) and set gentleNote to a short, kind explanation of why you can't help with that and what you can do instead. Otherwise set gentleNote to null.
- Plain language. Warm, never condescending.`;

const schema = {
  type: Type.OBJECT,
  properties: {
    originalMightLandAs: { type: Type.STRING },
    variants: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          text: { type: Type.STRING },
          whyThisWorks: { type: Type.STRING },
        },
        required: ["label", "text", "whyThisWorks"],
      },
    },
    gentleNote: { type: Type.STRING, nullable: true },
  },
  required: ["originalMightLandAs", "variants", "gentleNote"],
};

export interface ComposeArgs {
  intent: string;
  tone: ComposeTone;
  profile?: CommunicationProfile | null;
  relationship?: RelationshipContext | null;
}

const toneLabel: Record<ComposeTone, string> = {
  warm: "warm and friendly",
  neutral: "neutral and plain",
  professional: "professional",
  direct: "short and direct",
  "apologetic-but-confident": "kind but confident (not over-apologetic)",
};

function buildPrompt(args: ComposeArgs): string {
  const personalization = renderPersonalization({
    profile: args.profile,
    relationship: args.relationship,
  });
  return `${personalization}

The user wants their message to come across as: ${toneLabel[args.tone]}.

WHAT THE USER ACTUALLY MEANS (rephrase this, keeping their meaning):
"""
${args.intent}
"""

Return the structured options.`;
}

/** Offline / mock rephrasings. */
function mockCompose(args: ComposeArgs): ComposeResult {
  const intent = args.intent.trim();
  const snippet = intent.slice(0, 80);
  return {
    originalMightLandAs:
      "As written, this is clear about what you mean — to some readers it might feel a little abrupt, so here are a few ways to keep the meaning while softening the edges (or not, your call).",
    variants: [
      {
        label: "Warm & clear",
        text: `Hi! Quick one — ${lowerFirst(snippet)}. Let me know what works for you. Thanks so much!`,
        whyThisWorks:
          "Opens with warmth and keeps the ask explicit. The 'let me know' invites a reply without pressure.",
      },
      {
        label: "Professional",
        text: `Hello, I wanted to follow up regarding ${lowerFirst(snippet)}. Could you let me know how you'd like to proceed? Thank you.`,
        whyThisWorks:
          "Neutral, businesslike framing that's easy to forward and reads as composed in a work context.",
      },
      {
        label: "Short & direct",
        text: `${capFirst(snippet)} — can you let me know? Thanks.`,
        whyThisWorks:
          "Respects everyone's time. Being direct is valid; the 'thanks' keeps it friendly without padding.",
      },
    ],
    gentleNote: null,
  };
}

const lowerFirst = (s: string) => (s ? s[0]!.toLowerCase() + s.slice(1) : s);
const capFirst = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s);

export async function runCompose(args: ComposeArgs): Promise<ComposeResult> {
  const raw = await generateStructured<unknown>({
    system: SYSTEM,
    prompt: buildPrompt(args),
    schema,
    temperature: 0.6,
    mock: () => mockCompose(args),
  });
  return ComposeResult.parse(raw);
}
