# Subtext — 3-minute demo script

Goal: land **Best Social Value**, **Best Original Idea**, **Best UI/UX**, and
**Best Presentation** in one run. Practice until each beat is muscle memory.

**Before you start:** run `pnpm seed && pnpm dev`. For the live personalization
beat, set a real `GEMINI_API_KEY` and `GEMINI_MOCK=0`. Open to the Decode tab,
signed out. Have the Accessibility panel one click away.

---

### 0:00 — Hook (25s)

> "When two people miss each other in a text, we usually blame the autistic or
> ADHD person for 'reading it wrong.' But researchers call this the **double
> empathy problem** — it's a **two-way** mismatch, not a deficit. Every app I
> found treats one side as broken. So we built one that doesn't."

Tagline on screen: **Read between the lines. Say what you mean.**

### 0:25 — Decode (40s)

1. Click the example chip **"A one-word text" → `k.`**
2. Read the result aloud — point at:
   - the **confidence** badge ("low"),
   - the **alternative reading** ("could be frustration — but don't assume the
     worst").
   > "It refuses to invent hostility. It's honest about what it *doesn't* know.
   > That respect is the whole product."
3. Paste the clipped manager email example. Show the calm, structured read +
   the reply options in different registers.

### 1:05 — Compose (40s)

1. Switch to **Compose**. Click the over-apology example.
2. Pick tone **"Kind & confident."** Run.
3. Show the variants — read one **"why this works."**
   > "It gives *options*, never one 'correct' rewrite, and it teaches the
   > pattern so you need it less over time. Being direct stays valid."

### 1:45 — Personalization (35s)

1. Click **"Try a demo account"** (instant, no signup).
2. On **You**, show the saved profile + relationships (boss / friend / parent).
3. Back on Decode, run the **same** message once with **"Priya (manager)"** and
   once with **"Sam (best friend)"** selected.
   > "Same words — calibrated to the relationship. This is why we built a real
   > backend, not a prompt box."

### 2:20 — Accessibility (25s)

Open the **Accessibility & comfort** panel. Live-toggle:
- High-contrast → dyslexia font → text size XL → reduced motion.
> "The interface *is* the thesis: calm, low-sensory, WCAG AA, fully keyboard
> and screen-reader navigable. Designed with neurodiverse users, not at them."

Tab through a result card with the keyboard to show focus rings.

### 2:45 — Close (15s)

> "Private by default — messages are processed and discarded, nothing saved
> unless you choose to. It's not therapy; it's a respectful translator that
> helps **both** sides meet in the middle. That's Subtext."

---

### Backup talking points (if asked)

- **Type safety:** Zod schemas in `packages/shared` flow through tRPC to the
  client with zero codegen — one source of truth, fewer bugs under demo
  pressure.
- **Reliability:** `GEMINI_MOCK=1` means the live demo can't be broken by an API
  outage or quota; 429s are retried with backoff.
- **Honest AI:** structured JSON output validated against Zod before it ever
  reaches the screen — no regexing prose, no malformed cards.
