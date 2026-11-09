import 'server-only';
import type { z } from 'zod';

const ENDPOINT = 'https://api.x.ai/v1/chat/completions';

/** The model is configurable because xAI retires and renames them; this is the flagship at the time of writing. */
export const DEFAULT_XAI_MODEL = 'grok-4.7';

/**
 * - `unconfigured`: no `XAI_API_KEY`.
 * - `failed`: network error, timeout, or an HTTP error from xAI.
 * - `invalid`: xAI answered, but not with JSON that matches the schema. Callers fall back instead of trusting it.
 */
export type XaiFailure = 'unconfigured' | 'failed' | 'invalid';

export type XaiResult<T> = { ok: true; data: T; model: string; tokensUsed: number | null } | { ok: false; reason: XaiFailure };

export type StructuredRequest<T> = {
  /** Used to validate the answer. Lengths and other limits belong here, not in `jsonSchema`. */
  schema: z.ZodType<T>;
  /** Sent to xAI as the response format. Keep it simple (types, enums, required fields): not every keyword is supported in strict mode. */
  jsonSchema: Record<string, unknown>;
  /** Shown to the model as the schema's name. Letters, digits and underscores. */
  name: string;
  system: string;
  user: string;
  timeoutMs: number;
};

type ChatCompletion = {
  choices?: { message?: { content?: string | null } }[];
  usage?: { total_tokens?: number };
};

/**
 * Asks Grok for JSON that matches a schema (xAI's OpenAI-compatible Chat Completions with structured
 * outputs), over plain `fetch`: no SDK. Returns a result instead of throwing, because every caller has a
 * deterministic fallback and an AI hiccup must never fail the visitor's report.
 * The API key is only ever sent in the Authorization header and is never logged.
 */
export async function generateStructured<T>({ schema, jsonSchema, name, system, user, timeoutMs }: StructuredRequest<T>): Promise<XaiResult<T>> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, reason: 'unconfigured' };
  const model = process.env.XAI_MODEL || DEFAULT_XAI_MODEL;

  let completion: ChatCompletion;
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_schema', json_schema: { name, strict: true, schema: jsonSchema } },
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });

    if (!response.ok) {
      // The body explains most failures (bad model name, unsupported schema keyword). It never contains our key.
      const detail = await response.text().catch(() => '');
      console.error(`[xai] HTTP ${response.status} for ${model}: ${detail.slice(0, 300)}`);
      return { ok: false, reason: 'failed' };
    }
    completion = (await response.json()) as ChatCompletion;
  } catch (error) {
    console.error('[xai] request failed', error instanceof Error ? error.name : 'unknown error');
    return { ok: false, reason: 'failed' };
  }

  const content = completion.choices?.[0]?.message?.content;
  if (!content) return { ok: false, reason: 'invalid' };

  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch {
    return { ok: false, reason: 'invalid' };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    console.error('[xai] answer did not match the schema:', parsed.error.issues[0]?.path.join('.'), parsed.error.issues[0]?.message);
    return { ok: false, reason: 'invalid' };
  }

  const total = completion.usage?.total_tokens;
  return { ok: true, data: parsed.data, model, tokensUsed: typeof total === 'number' ? total : null };
}
