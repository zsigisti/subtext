import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@subtext/server/src/routers/index.js";

/** Typed tRPC hooks. AppRouter is imported as a TYPE only — no server code
 *  is bundled into the client. */
export const trpc = createTRPCReact<AppRouter>();

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
