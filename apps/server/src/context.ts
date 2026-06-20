import "@fastify/cookie"; // loads the cookie type augmentation (req.cookies, res.setCookie)
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { SESSION_COOKIE, userFromSession } from "./auth.js";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  const user = await userFromSession(sessionId);

  // Whether to mark the session cookie `Secure` (HTTPS-only). Defaults to
  // production, but is overridable so the app works behind a plain-HTTP
  // homelab proxy (COOKIE_SECURE=false) or with TLS (COOKIE_SECURE=true).
  const secure =
    (process.env.COOKIE_SECURE ??
      (process.env.NODE_ENV === "production" ? "true" : "false")) === "true";

  return {
    user,
    /** Sets the HTTP-only session cookie. */
    setSessionCookie(id: string) {
      res.setCookie(SESSION_COOKIE, id, {
        httpOnly: true,
        sameSite: "lax",
        secure,
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
