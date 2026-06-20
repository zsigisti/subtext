import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  ComposeEntry,
  ComposeResult,
  DecodeEntry,
  DecodeResult,
  SavePhraseInput,
  SavedPhrase,
} from "@subtext/shared";
import { router, protectedProcedure } from "../trpc.js";
import { prisma } from "../db.js";

/**
 * History + phrasebook. Everything here is EXPLICIT, per-item opt-in —
 * the decode/compose procedures never persist on their own.
 */
export const libraryRouter = router({
  /* ---- History: decode ---- */
  saveDecode: protectedProcedure
    .input(
      z.object({
        relationshipId: z.string().nullable().optional(),
        inputText: z.string().min(1),
        result: DecodeResult,
      }),
    )
    .output(DecodeEntry)
    .mutation(async ({ input, ctx }) => {
      const row = await prisma.decodeEntry.create({
        data: {
          userId: ctx.user.id,
          relationshipId: input.relationshipId ?? null,
          inputText: input.inputText,
          result: input.result,
        },
      });
      return DecodeEntry.parse({
        ...row,
        result: input.result,
        createdAt: row.createdAt.toISOString(),
      });
    }),

  /* ---- History: compose ---- */
  saveCompose: protectedProcedure
    .input(
      z.object({
        relationshipId: z.string().nullable().optional(),
        intentText: z.string().min(1),
        chosenVariant: z.string(),
        result: ComposeResult,
      }),
    )
    .output(ComposeEntry)
    .mutation(async ({ input, ctx }) => {
      const row = await prisma.composeEntry.create({
        data: {
          userId: ctx.user.id,
          relationshipId: input.relationshipId ?? null,
          intentText: input.intentText,
          chosenVariant: input.chosenVariant,
          result: input.result,
        },
      });
      return ComposeEntry.parse({
        ...row,
        result: input.result,
        createdAt: row.createdAt.toISOString(),
      });
    }),

  history: protectedProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const search = input?.search?.trim().toLowerCase();
      const [decodes, composes] = await Promise.all([
        prisma.decodeEntry.findMany({
          where: { userId: ctx.user.id },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        prisma.composeEntry.findMany({
          where: { userId: ctx.user.id },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      ]);

      const decodeEntries = decodes.map((r) =>
        DecodeEntry.parse({
          ...r,
          result: r.result,
          createdAt: r.createdAt.toISOString(),
        }),
      );
      const composeEntries = composes.map((r) =>
        ComposeEntry.parse({
          ...r,
          result: r.result,
          createdAt: r.createdAt.toISOString(),
        }),
      );

      if (!search) return { decodeEntries, composeEntries };
      return {
        decodeEntries: decodeEntries.filter((e) =>
          e.inputText.toLowerCase().includes(search),
        ),
        composeEntries: composeEntries.filter((e) =>
          e.intentText.toLowerCase().includes(search),
        ),
      };
    }),

  deleteDecode: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const res = await prisma.decodeEntry.deleteMany({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (res.count === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return { ok: true };
    }),

  deleteCompose: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const res = await prisma.composeEntry.deleteMany({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (res.count === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return { ok: true };
    }),

  /* ---- Phrasebook ---- */
  phrases: protectedProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .output(z.array(SavedPhrase))
    .query(async ({ input, ctx }) => {
      const rows = await prisma.savedPhrase.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: "desc" },
      });
      const phrases = rows.map((r) =>
        SavedPhrase.parse({ ...r, createdAt: r.createdAt.toISOString() }),
      );
      const search = input?.search?.trim().toLowerCase();
      if (!search) return phrases;
      return phrases.filter(
        (p) =>
          p.label.toLowerCase().includes(search) ||
          p.text.toLowerCase().includes(search),
      );
    }),

  savePhrase: protectedProcedure
    .input(SavePhraseInput)
    .output(SavedPhrase)
    .mutation(async ({ input, ctx }) => {
      const row = await prisma.savedPhrase.create({
        data: { ...input, userId: ctx.user.id },
      });
      return SavedPhrase.parse({ ...row, createdAt: row.createdAt.toISOString() });
    }),

  deletePhrase: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const res = await prisma.savedPhrase.deleteMany({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (res.count === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return { ok: true };
    }),
});
