import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { appRouter, type AppRouter } from "./routers/index.js";
import { createContext } from "./context.js";

const PORT = Number(process.env.PORT ?? 3000);
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";

async function main() {
  const server = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV === "production"
          ? undefined
          : { target: "pino-pretty", options: { translateTime: "HH:MM:ss" } },
    },
    routerOptions: { maxParamLength: 5000 },
    // Keep the dev console calm: skip per-request "incoming/completed" logs
    // (startup, errors, and explicit logs still show).
    disableRequestLogging: true,
  });

  await server.register(cors, {
    origin: WEB_ORIGIN,
    credentials: true,
  });

  await server.register(cookie, {
    secret: process.env.SESSION_SECRET ?? "dev-insecure-secret",
  });

  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        server.log.error(`tRPC error on ${path ?? "<no-path>"}: ${error.message}`);
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  });

  // Friendly root so hitting the API port directly isn't a bare 404.
  server.get("/", async () => ({
    name: "Subtext API",
    message:
      "This is the Subtext API. The app's web UI runs separately (http://localhost:5173 in dev). API lives under /trpc; health at /health.",
  }));

  server.get("/health", async () => ({
    ok: true,
    mock: process.env.GEMINI_MOCK === "1",
  }));

  try {
    await server.listen({ port: PORT, host: "0.0.0.0" });
    server.log.info(
      `Subtext server ready on :${PORT} (GEMINI_MOCK=${process.env.GEMINI_MOCK === "1" ? "on" : "off"})`,
    );
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

void main();
