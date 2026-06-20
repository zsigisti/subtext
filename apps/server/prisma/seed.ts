import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { DecodeResult, ComposeResult } from "@subtext/shared";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@subtext.app";
const DEMO_PASSWORD = "demodemo"; // documented in README

async function main() {
  console.log("🫐  Seeding Subtext demo data…");

  // Fresh start for the demo user (idempotent).
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } });
  }

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      displayName: "Demo",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
    },
  });

  await prisma.communicationProfile.create({
    data: {
      userId: user.id,
      selfTraits: [
        "I tend to be very direct and people sometimes read it as blunt",
        "I over-apologize when I'm anxious",
        "I take messages literally and miss hints",
      ],
      goals:
        "Understand what people actually mean without spiralling, and sound warm without burying my point.",
      readingPrefs: { extraPlainLanguage: true, alwaysShowAlternative: false },
    },
  });

  const manager = await prisma.relationship.create({
    data: {
      userId: user.id,
      name: "Priya (manager)",
      who: "manager",
      formality: "FORMAL",
      notes: "Busy, writes short emails, not actually angry even when terse.",
    },
  });

  const friend = await prisma.relationship.create({
    data: {
      userId: user.id,
      name: "Sam (best friend)",
      who: "best friend",
      formality: "CASUAL",
      notes: "Texts in one-word replies a lot. We're close.",
    },
  });

  await prisma.relationship.create({
    data: {
      userId: user.id,
      name: "Mom",
      who: "parent",
      formality: "NEUTRAL",
      notes: "Worries easily; likes a warm tone.",
    },
  });

  // A pre-loaded decode in history so the Library isn't empty in the demo.
  const clippedEmailResult: DecodeResult = {
    toneSummary:
      "Brief and businesslike — most likely a busy manager, not an annoyed one.",
    literalMeaning:
      "She's asking where the report is and wants it before the meeting.",
    impliedMeaning:
      "It matters to her and she's relying on it, but there's no sign of anger.",
    senderIntent: "To make sure the report is ready in time — a logistics nudge.",
    urgency: 2,
    replyExpected: true,
    confidence: "medium",
    alternativeReading:
      "If she's usually warmer, the terseness could mean she's stressed — but that's about her day, not about you.",
    suggestedResponses: [
      {
        register: "warm",
        text: "Hi Priya — on it! I'll have the report in your inbox within the hour.",
      },
      {
        register: "neutral",
        text: "Sending it over shortly, before the meeting.",
      },
    ],
  };
  await prisma.decodeEntry.create({
    data: {
      userId: user.id,
      relationshipId: manager.id,
      inputText: "Where are we on the report? Need it before the 2pm.",
      result: clippedEmailResult,
    },
  });

  // A pre-loaded compose in history.
  const apologyResult: ComposeResult = {
    originalMightLandAs:
      "Lots of warmth here — the repeated apologies might make a small ask read as a big imposition.",
    variants: [
      {
        label: "Kind but confident",
        text: "Hi Sam! Could we push our call to tomorrow? Something came up. Thanks for being flexible 💛",
        whyThisWorks:
          "Keeps the warmth, drops the extra apologies, and states the ask once and clearly.",
      },
      {
        label: "Short & direct",
        text: "Hey, can we move the call to tomorrow? Works much better for me.",
        whyThisWorks:
          "With a close friend, being direct reads as comfortable, not cold.",
      },
    ],
    gentleNote: null,
  };
  await prisma.composeEntry.create({
    data: {
      userId: user.id,
      relationshipId: friend.id,
      intentText:
        "I'm so so sorry to ask but is there any way we could maybe move our call, I feel terrible, totally fine if not!!",
      chosenVariant: "Kind but confident",
      result: apologyResult,
    },
  });

  // Phrasebook starters.
  await prisma.savedPhrase.createMany({
    data: [
      {
        userId: user.id,
        label: "Buying time politely",
        text: "Thanks for flagging this — I want to give it proper attention, so I'll get back to you by [time].",
        context: "When you need to set a boundary without sounding dismissive.",
      },
      {
        userId: user.id,
        label: "Asking for clarification",
        text: "Quick check so I get this right — do you mean [A] or [B]?",
        context: "When a message is ambiguous and you'd otherwise guess.",
      },
    ],
  });

  console.log(`✅  Seeded demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log("    3 relationships, 1 decode + 1 compose in history, 2 phrases.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
