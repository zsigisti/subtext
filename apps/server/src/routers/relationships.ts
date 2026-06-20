import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Relationship, RelationshipInput } from "@subtext/shared";
import { router, protectedProcedure } from "../trpc.js";
import { prisma } from "../db.js";

function toShared(row: {
  id: string;
  name: string;
  who: string;
  formality: string;
  notes: string;
}) {
  return Relationship.parse(row);
}

export const relationshipsRouter = router({
  list: protectedProcedure
    .output(z.array(Relationship))
    .query(async ({ ctx }) => {
      const rows = await prisma.relationship.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toShared);
    }),

  create: protectedProcedure
    .input(RelationshipInput)
    .output(Relationship)
    .mutation(async ({ input, ctx }) => {
      const row = await prisma.relationship.create({
        data: { ...input, userId: ctx.user.id },
      });
      return toShared(row);
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).and(RelationshipInput))
    .output(Relationship)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const existing = await prisma.relationship.findFirst({
        where: { id, userId: ctx.user.id },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      const row = await prisma.relationship.update({ where: { id }, data });
      return toShared(row);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const res = await prisma.relationship.deleteMany({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (res.count === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return { ok: true };
    }),
});
