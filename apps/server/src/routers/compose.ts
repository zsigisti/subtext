import { ComposeInput, ComposeResult } from "@subtext/shared";
import { router, publicProcedure } from "../trpc.js";
import { runCompose } from "../ai/compose.js";
import { loadProfile, loadRelationshipContext } from "../personalization.js";

export const composeRouter = router({
  /**
   * Rephrase the user's intended message into a few calibrated options.
   * Process-and-discard: nothing is persisted unless the user saves it.
   */
  run: publicProcedure
    .input(ComposeInput)
    .output(ComposeResult)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      const [profile, relationship] = userId
        ? await Promise.all([
            loadProfile(userId),
            loadRelationshipContext(userId, input.relationshipId),
          ])
        : [null, null];

      return runCompose({
        intent: input.intent,
        tone: input.tone,
        profile,
        relationship,
      });
    }),
});
