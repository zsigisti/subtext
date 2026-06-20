import { CommunicationProfile } from "@subtext/shared";
import { router, protectedProcedure } from "../trpc.js";
import { prisma } from "../db.js";
import { loadProfile } from "../personalization.js";

export const profileRouter = router({
  get: protectedProcedure
    .output(CommunicationProfile.nullable())
    .query(({ ctx }) => loadProfile(ctx.user.id)),

  /** Upsert the user's communication profile. */
  save: protectedProcedure
    .input(CommunicationProfile)
    .output(CommunicationProfile)
    .mutation(async ({ input, ctx }) => {
      await prisma.communicationProfile.upsert({
        where: { userId: ctx.user.id },
        create: {
          userId: ctx.user.id,
          selfTraits: input.selfTraits,
          goals: input.goals,
          readingPrefs: input.readingPrefs,
        },
        update: {
          selfTraits: input.selfTraits,
          goals: input.goals,
          readingPrefs: input.readingPrefs,
        },
      });
      return input;
    }),
});
