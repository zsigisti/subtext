import { Type } from "@google/genai";
import {
  DecodeResult,
  type CommunicationProfile,
  type RelationshipContext,
} from "@subtext/shared";
import { generateStructured } from "./gemini.js";
import { renderPersonalization } from "./context.js";

const SYSTEM = `You are Subtext's "Decode" assistant. You help a user understand a message they RECEIVED.

Your worldview: communication mismatches between people (especially across neurotypes) are a TWO-WAY difference, not a deficit in anyone. You are a respectful translator, not a therapist or a judge.

Hard rules:
- Read tone and intent HONESTLY. Separate the LITERAL meaning from any IMPLIED meaning.
- NEVER fabricate hostility, passive-aggression, or hidden anger. If a message is short or blunt, treat that as possibly just efficient or busy — not automatically cold.
- Give an explicit confidence level. When the message is genuinely ambiguous, provide a plausible, charitable ALTERNATIVE reading. When it is unambiguous, set alternativeReading to null.
- urgency is 0 (no rush) to 3 (needs a fast reply). replyExpected is whether the sender is likely waiting on a response.
- suggestedResponses are OPTIONS the user may choose from, never commands. Offer a small range of registers (e.g. "warm", "neutral", "boundary-setting"). Keep them short and in the user's own plausible voice.
- Plain language. No clinical or pathologizing terms. Be warm and concise.`;

const schema = {
  type: Type.OBJECT,
  properties: {
    toneSummary: { type: Type.STRING },
    literalMeaning: { type: Type.STRING },
    impliedMeaning: { type: Type.STRING },
    senderIntent: { type: Type.STRING },
    urgency: { type: Type.INTEGER },
    replyExpected: { type: Type.BOOLEAN },
    confidence: { type: Type.STRING, enum: ["low", "medium", "high"] },
    alternativeReading: { type: Type.STRING, nullable: true },
    suggestedResponses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          register: { type: Type.STRING },
          text: { type: Type.STRING },
        },
        required: ["register", "text"],
      },
    },
  },
  required: [
    "toneSummary",
    "literalMeaning",
    "impliedMeaning",
    "senderIntent",
    "urgency",
    "replyExpected",
    "confidence",
    "alternativeReading",
    "suggestedResponses",
  ],
};

export interface DecodeArgs {
  message: string;
  profile?: CommunicationProfile | null;
  relationship?: RelationshipContext | null;
}

function buildPrompt(args: DecodeArgs): string {
  const personalization = renderPersonalization({
    profile: args.profile,
    relationship: args.relationship,
  });
  return `${personalization}

MESSAGE THE USER RECEIVED (decode this):
"""
${args.message}
"""

Return the structured reading.`;
}

/** Offline / mock reading — heuristic so the demo feels alive without API calls. */
function mockDecode(args: DecodeArgs): DecodeResult {
  const m = args.message.trim();
  const short = m.length <= 12;
  const hasQuestion = m.includes("?");
  const urgentWord = /\b(asap|now|urgent|today|eod|immediately)\b/i.test(m);

  return {
    toneSummary: short
      ? "Reads as brief and matter-of-fact — most likely just efficient, not cold."
      : "Reads as measured and direct, with a businesslike but not unfriendly tone.",
    literalMeaning: `Taken at face value: "${m.slice(0, 140)}${m.length > 140 ? "…" : ""}"`,
    impliedMeaning: short
      ? "There may be no hidden layer here — short replies often just mean the person is busy."
      : "The sender seems to want this handled, and is signalling it matters to them.",
    senderIntent: hasQuestion
      ? "They're asking for information or a decision from you."
      : "They're sharing a status or expectation, more than asking a question.",
    urgency: urgentWord ? 3 : hasQuestion ? 2 : 1,
    replyExpected: hasQuestion || urgentWord,
    confidence: short ? "low" : "medium",
    alternativeReading: short
      ? "Alternatively, the brevity could signal mild frustration — but there isn't enough here to be sure, so don't assume the worst."
      : null,
    suggestedResponses: [
      {
        register: "warm",
        text: "Thanks for flagging this — I'm on it and will get back to you shortly.",
      },
      {
        register: "neutral",
        text: "Got it. I'll take a look and follow up.",
      },
      {
        register: "boundary-setting",
        text: "Happy to help with this. I'm wrapping up something first, so I'll get to it by [time].",
      },
    ],
  };
}

export async function runDecode(args: DecodeArgs): Promise<DecodeResult> {
  const raw = await generateStructured<unknown>({
    system: SYSTEM,
    prompt: buildPrompt(args),
    schema,
    temperature: 0.4,
    mock: () => mockDecode(args),
  });
  // Validate the model output against the shared contract before returning.
  return DecodeResult.parse(raw);
}
