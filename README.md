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

## Run it (local dev — the easy path)

Requirements: **Node ≥ 20** and **pnpm**. Defaults work **fully offline** (SQLite
+ mock AI), no API key needed.

```bash
make setup   # install deps, create .env files, set up + seed the SQLite DB
make dev     # run server + web together
```

<details>
<summary>…or without <code>make</code></summary>

```bash
pnpm install
cp .env.example apps/server/.env
printf 'VITE_API_URL="http://localhost:3000"\n' > apps/web/.env
pnpm db:push && pnpm seed
pnpm dev
```
</details>

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

---

## Testing

```bash
make typecheck   # tsc --noEmit across shared, server, web
make build       # production build of every package
```

There's also a quick manual smoke test once `make dev` is running:

```bash
curl localhost:3000/health
curl -X POST localhost:3000/trpc/decode.run \
  -H 'content-type: application/json' -d '{"message":"k."}'
```

### Prod-like local stack (Docker Compose)

Runs the **real production images** — Postgres + API + nginx-served web — exactly
as they run on k3s. Great for verifying a deploy before shipping it.

```bash
make compose-up          # builds images, starts the stack
# → open http://localhost:8080  (nginx serves the SPA and proxies the API)
make compose-logs
make compose-down
```

Config lives in `.env` (copied from `.env.docker.example`). It seeds the demo
account on first start.

---

## Deploy to Kubernetes (k3s)

Manifests live in [`deploy/k8s/`](deploy/k8s). The architecture is deliberately
simple: **one ingress → the web service**, whose nginx reverse-proxies `/trpc`
and `/health` to the API server (so there's no CORS and one public surface).
Postgres runs in-cluster on a PVC (k3s `local-path`).

```
        ┌────────────┐      / , /trpc , /health      ┌──────────────┐
ingress │ subtext-web│ ───────────────────────────▶  │subtext-server│
(traefik)│  (nginx)  │  nginx proxies API to server   │  (Fastify)   │
        └────────────┘                                └──────┬───────┘
                                                             │
                                                      ┌──────▼───────┐
                                                      │  subtext-db  │
                                                      │ (Postgres+PVC)│
                                                      └──────────────┘
```

### 1. Build & push images

CI does this automatically — the included GitHub Actions workflow
(`.github/workflows/build-images.yml`) builds and pushes
`ghcr.io/<owner>/subtext-server` and `-web` on every push to the default branch.

Or build and push manually:

```bash
make images push REGISTRY=ghcr.io OWNER=<your-gh-user> TAG=v1
```

### 2. Configure secrets

```bash
cd deploy/k8s
cp secret.example.yaml secret.yaml     # gitignored
# edit secret.yaml: set SESSION_SECRET (openssl rand -hex 32),
# a Postgres password (match it in DATABASE_URL), and optionally GEMINI_API_KEY.
```

Review `config.yaml`: set `WEB_ORIGIN` to your host, flip `GEMINI_MOCK` to `"0"`
once you've added a real key, and set `COOKIE_SECURE: "true"` if your ingress
terminates TLS.

### 3. Apply

Point the manifests at your images (replace `OWNER`) and apply:

```bash
# with kustomize (recommended — sets images in one place):
kustomize edit set image \
  ghcr.io/OWNER/subtext-server=ghcr.io/<you>/subtext-server:v1 \
  ghcr.io/OWNER/subtext-web=ghcr.io/<you>/subtext-web:v1
kubectl apply -k deploy/k8s

# …or plain kubectl (after editing the image refs in server.yaml / web.yaml):
kubectl apply -f deploy/k8s
```

Add a hosts entry (or DNS) for the ingress host, e.g. `subtext.local`, pointing
at a k3s node, then open it in a browser. The server runs `prisma db push` and
seeds the demo account on first start.

> **Private GHCR images?** Create a pull secret and reference it:
> `kubectl -n subtext create secret docker-registry ghcr --docker-server=ghcr.io --docker-username=<you> --docker-password=<token>`,
> then add `imagePullSecrets: [{name: ghcr}]` to the deployment pod specs.

### About the database

SQLite is the default for **local dev** (zero setup). The container images and
k8s manifests use **PostgreSQL** — the Dockerfile flips the Prisma provider via
`--build-arg DATABASE_PROVIDER=postgresql`. The schema is written
cross-compatibly (Json fields, app-layer enum validation) so the switch is
genuinely small.

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
