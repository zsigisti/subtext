import { router } from "../trpc.js";
import { authRouter } from "./auth.js";
import { profileRouter } from "./profile.js";
import { relationshipsRouter } from "./relationships.js";
import { decodeRouter } from "./decode.js";
import { composeRouter } from "./compose.js";
import { libraryRouter } from "./library.js";

export const appRouter = router({
  auth: authRouter,
  profile: profileRouter,
  relationships: relationshipsRouter,
  decode: decodeRouter,
  compose: composeRouter,
  library: libraryRouter,
});

export type AppRouter = typeof appRouter;
