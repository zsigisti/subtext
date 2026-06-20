import { GoogleGenAI, type Schema } from "@google/genai";

/**
 * Single Gemini client + a typed structured-output helper.
 *
 * Server-side only. The key is read from the environment and never leaves
 * this process. Supports an offline GEMINI_MOCK mode so the whole UI can be
 * built and demoed without spending API quota.
 */

const MOCK = process.env.GEMINI_MOCK === "1";
const apiKey = process.env.GEMINI_API_KEY ?? "";

/** Lazily constructed so mock/dev without a key never throws at import time. */
let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!client) {
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Set it in apps/server/.env, or use GEMINI_MOCK=1 to run offline.",
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetryable(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message ?? err ?? "");
  const status = (err as { status?: number })?.status;
  return (
    status === 429 ||
    status === 503 ||
    status === 500 ||
    /429|rate|quota|overload|unavailable|deadline|ECONNRESET|ETIMEDOUT/i.test(msg)
  );
}

export interface GenerateOpts<T> {
  /** System instruction — the persona + hard rules. */
  system: string;
  /** The user-facing prompt (already includes personalization context). */
  prompt: string;
  /** A @google/genai responseSchema (built with the Type enum). */
  schema: unknown;
  temperature?: number;
  /** Canned response used when GEMINI_MOCK=1 or no API key is present. */
  mock: () => T;
}

/**
 * Calls Gemini with JSON structured output and returns a parsed object.
 * Retries 429 / transient errors with exponential backoff (1s, 2s, 4s, 8s).
 * The caller is responsible for validating the shape (we do it with Zod).
 */
export async function generateStructured<T>(opts: GenerateOpts<T>): Promise<T> {
  if (MOCK) {
    // Tiny delay so loading states are visible during a demo.
    await sleep(450);
    return opts.mock();
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  for (let attempt = 0; ; attempt++) {
    try {
      const res = await getClient().models.generateContent({
        model,
        contents: opts.prompt,
        config: {
          systemInstruction: opts.system,
          responseMimeType: "application/json",
          responseSchema: opts.schema as Schema,
          temperature: opts.temperature ?? 0.4,
        },
      });

      const text = res.text;
      if (!text) throw new Error("Gemini returned an empty response.");
      return JSON.parse(text) as T;
    } catch (err) {
      if (attempt >= 4 || !isRetryable(err)) throw err;
      await sleep(1000 * 2 ** attempt);
    }
  }
}

export { MOCK as GEMINI_MOCK_ENABLED };
