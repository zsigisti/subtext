import "@fastify/cookie"; // loads the cookie type augmentation (req.cookies, res.setCookie)
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { SESSION_COOKIE, userFromSession } from "./auth.js";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  const user = await userFromSession(sessionId);

  const isProd = process.env.NODE_ENV === "production";

  return {
    user,
    /** Sets the HTTP-only session cookie. */
    setSessionCookie(id: string) {
      res.setCookie(SESSION_COOKIE, id, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: THIRTY_DAYS,
      });
    },
    /** Clears the session cookie. */
    clearSessionCookie() {
      res.clearCookie(SESSION_COOKIE, { path: "/" });
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
