# Subtext

**Read between the lines. Say what you mean.**

A respectful, **two-way** communication translator for the gap between
neurodivergent and neurotypical communication styles.

> Built for **Youth Code x AI — Track 3, "AI That Actually Helps People."**

---

## The problem: the double-empathy problem

Communication breakdowns between neurodivergent (autistic / ADHD) and
neurotypical people are a **two-way mismatch — not a deficit in one person.**
Most "social skills" apps get this wrong: they treat the neurodivergent person
as broken and in need of fixing.

Subtext doesn't. It helps in **both directions** and **teaches the pattern**
instead of creating dependency. Direct communication is treated as valid.
Every suggestion is an **option you choose**, never a command.

## What it does

- **Decode** — Paste a message you *received*. Get a plain-language read: tone,
  the **literal vs. implied** meaning, likely intent, urgency, whether a reply
  is expected, and — crucially — an **honest confidence level** plus an
  **alternative reading** when it's ambiguous. It never invents hidden hostility.
- **Compose** — Write what you *actually mean* (however blunt or anxious it
  comes out). Get a few rephrasings calibrated to the relationship and tone you
  want — each with a short **"why this works"** so you learn the pattern.
- **Personalize** — A saved **communication profile** (your self-identified
  traits and goals) and **relationships** (boss → formal, best friend → casual)
  calibrate every result to *you*. Plus a private **history** and **phrasebook**.

## Why it's respectful by design

- Empowering, first-person framing. No clinical or pathologizing language.
- Neurotypical "translations" are **choices**, never corrections.
- A quiet **"This is a suggestion — you decide"** affordance on every result.
- **The UI is the thesis:** calm, low-sensory, and fully accessible (see below).

---

## Accessibility (this is a judged category — and the point)

Built to WCAG 2.1 AA, with a runtime **Accessibility & comfort** panel:

- **Theme:** light · dark (low-glare) · high-contrast
- **Dyslexia-friendly font** (Atkinson Hyperlegible)
- **Text size:** S / M / L / XL
- **Reduced motion** (also honors OS `prefers-reduced-motion`)
- **Reading focus** mode

Plus: semantic HTML, ARIA roles on every custom control, visible keyboard
focus, a skip link, labelled inputs, screen-reader-announced results and copy
actions, and a calm, muted palette with ≥ 4.5:1 contrast. Settings persist to
the device.

---

## Privacy & safety

- **Server-side AI only.** The Gemini key never touches the browser.
- **Process-and-discard by default.** Raw messages are *not* persisted. Saving
  to history or the phrasebook is an explicit, per-item opt-in.
- An honest in-app note: this uses Gemini's free tier, so don't paste truly
  confidential information.
- **Not therapy, not medical, not a diagnosis** — stated gently in the footer.

---

## Tech stack

End-to-end type safety from DB → server → client with **zero codegen**:

| Layer    | Choice |
|----------|--------|
| Monorepo | `pnpm` workspaces — `packages/shared`, `apps/server`, `apps/web` |
| Shared   | **Zod** schemas + inferred types, defined once, used both sides |
| API      | **tRPC v11** over **Fastify**, HTTP-only cookie sessions |
| Server   | Node + TypeScript, Pino logging |
| DB       | **Prisma** — SQLite by default (zero setup), Postgres-ready |
| AI       | **`@google/genai`** with JSON structured output + backoff |
| Web      | **React + Vite + Tailwind + TanStack Query** |
| Auth     | email + password (`bcrypt`) + one-click demo account |

---

## Run it

Requirements: **Node ≥ 20** and **pnpm**.

```bash
# 1. Install
pnpm install

# 2. Configure (the defaults work offline, no API key needed)
cp .env.example apps/server/.env
cp .env.example apps/web/.env   # only VITE_API_URL is read here

# 3. Create the database + demo data
pnpm db:push
pnpm seed

# 4. Run both server and web
pnpm dev
```

- Web: <http://localhost:5173>  ·  Server: <http://localhost:3000>
- Click **"Try a demo account"** — it's preloaded with relationships, history,
  and a phrasebook so you can explore instantly.
  (Credentials, if you want them: `demo@subtext.app` / `demodemo`.)

### Offline vs. live AI

The default `GEMINI_MOCK=1` returns canned structured responses so you can build
and demo the **entire UI offline without spending any API quota.**

To see **live, personalized** output (where the *same* message visibly reads
differently for "boss" vs. "best friend"):

1. Get a free key at <https://aistudio.google.com/apikey>.
2. In `apps/server/.env`, set `GEMINI_API_KEY="..."` and `GEMINI_MOCK="0"`.
3. Restart. Free tier (mid-2026) covers `gemini-2.5-flash` / `-flash-lite`;
   429s are retried automatically with exponential backoff.

### Switching to PostgreSQL

SQLite is the default so the project runs from a clean clone with zero external
setup. For production:

1. In `apps/server/prisma/schema.prisma`, set `provider = "postgresql"`.
2. Point `DATABASE_URL` at your Postgres instance (e.g. Neon).
3. `pnpm db:push && pnpm seed`.

The schema is written cross-compatibly (Json fields, app-layer enum validation)
so this is a genuinely small change.

---

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Run server + web together |
| `pnpm seed` | (Re)seed the demo account and scenarios |
| `pnpm db:push` | Sync the Prisma schema to the database |
| `pnpm typecheck` | `tsc --noEmit` across every package |
| `pnpm build` | Production build of all packages |

---

## Project structure

```
subtext/
├─ packages/shared/   # Zod schemas + types (the single source of truth)
└─ apps/
   ├─ server/         # Fastify + tRPC + Prisma + Gemini (mock-able)
   │  └─ src/ai/      # decode/compose prompts, schemas, structured output
   └─ web/            # React + Vite + Tailwind
      ├─ a11y/        # Accessibility settings context + panel
      └─ features/    # decode · compose · profile · relationships · library · auth
```

---

## What's next

- Per-platform tone (email vs. iMessage vs. Slack).
- "Explain this back to me" — a learn-mode that quizzes you gently on patterns.
- Optional shared glossary for a household / team to align on phrasings.
- On-device model option for fully private decoding.

---

*Subtext supports communication — it doesn't replace human relationships or
professional support.*
