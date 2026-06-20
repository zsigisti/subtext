import { DecodeInput, DecodeResult } from "@subtext/shared";
import { router, publicProcedure } from "../trpc.js";
import { runDecode } from "../ai/decode.js";
import { loadProfile, loadRelationshipContext } from "../personalization.js";

export const decodeRouter = router({
  /**
   * Decode a received message. Process-and-discard: nothing is persisted here.
   * Personalizes with the signed-in user's profile + relationship when available.
   */
  run: publicProcedure
    .input(DecodeInput)
    .output(DecodeResult)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      const [profile, relationship] = userId
        ? await Promise.all([
            loadProfile(userId),
            loadRelationshipContext(userId, input.relationshipId),
          ])
        : [null, null];

      return runDecode({
        message: input.message,
        profile,
        relationship,
      });
    }),
});
