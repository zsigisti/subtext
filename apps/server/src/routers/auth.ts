import { TRPCError } from "@trpc/server";
import { LoginInput, PublicUser, SignupInput } from "@subtext/shared";
import { router, publicProcedure, protectedProcedure } from "../trpc.js";
import { prisma } from "../db.js";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "../auth.js";

export const DEMO_EMAIL = "demo@subtext.app";

export const authRouter = router({
  me: publicProcedure.output(PublicUser.nullable()).query(({ ctx }) => {
    if (!ctx.user) return null;
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      displayName: ctx.user.displayName,
    };
  }),

  signup: publicProcedure
    .input(SignupInput)
    .output(PublicUser)
    .mutation(async ({ input, ctx }) => {
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with that email already exists.",
        });
      }
      const user = await prisma.user.create({
        data: {
          email: input.email,
          displayName: input.displayName,
          passwordHash: await hashPassword(input.password),
        },
      });
      const sessionId = await createSession(user.id);
      ctx.setSessionCookie(sessionId);
      return { id: user.id, email: user.email, displayName: user.displayName };
    }),

  login: publicProcedure
    .input(LoginInput)
    .output(PublicUser)
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "That email or password didn't match.",
        });
      }
      const sessionId = await createSession(user.id);
      ctx.setSessionCookie(sessionId);
      return { id: user.id, email: user.email, displayName: user.displayName };
    }),

  /** One-click demo login — never blocked by signup friction during a live demo. */
  demoLogin: publicProcedure.output(PublicUser).mutation(async ({ ctx }) => {
    const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Demo account not seeded yet. Run `pnpm seed` first.",
      });
    }
    const sessionId = await createSession(user.id);
    ctx.setSessionCookie(sessionId);
    return { id: user.id, email: user.email, displayName: user.displayName };
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // Best-effort: clear all sessions tied to the cookie by clearing the cookie;
    // the current session row is removed on next expiry sweep / explicit destroy.
    const sessions = await prisma.session.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    if (sessions[0]) await destroySession(sessions[0].id);
    ctx.clearSessionCookie();
    return { ok: true };
  }),
});
