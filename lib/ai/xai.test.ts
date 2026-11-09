import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { DEFAULT_XAI_MODEL, generateStructured } from './xai';

const fetchMock = vi.fn();

const schema = z.object({ summary: z.string().min(1), count: z.number() });
const request = {
  schema,
  jsonSchema: { type: 'object', properties: { summary: { type: 'string' }, count: { type: 'number' } }, required: ['summary', 'count'], additionalProperties: false },
  name: 'test_schema',
  system: 'SYSTEM PROMPT',
  user: 'USER PROMPT',
  timeoutMs: 5_000,
};

const completion = (content: unknown, usage: unknown = { total_tokens: 321 }) => ({
  ok: true,
  status: 200,
  json: async () => ({ choices: [{ message: { content: typeof content === 'string' ? content : JSON.stringify(content) } }], usage }),
  text: async () => '',
});

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('XAI_API_KEY', 'xai-secret-key');
  vi.stubEnv('XAI_MODEL', '');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('generateStructured', () => {
  it('returns validated data, the model and the token count', async () => {
    fetchMock.mockResolvedValue(completion({ summary: 'ok', count: 3 }));
    const result = await generateStructured(request);
    expect(result).toEqual({ ok: true, data: { summary: 'ok', count: 3 }, model: DEFAULT_XAI_MODEL, tokensUsed: 321 });
  });

  it('sends the key only as a bearer header, with a strict json_schema response format', async () => {
    fetchMock.mockResolvedValue(completion({ summary: 'ok', count: 1 }));
    await generateStructured(request);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://api.x.ai/v1/chat/completions');
    expect(init.headers.authorization).toBe('Bearer xai-secret-key');
    expect(init.body).not.toContain('xai-secret-key');

    const body = JSON.parse(init.body);
    expect(body.model).toBe(DEFAULT_XAI_MODEL);
    expect(body.messages).toEqual([
      { role: 'system', content: 'SYSTEM PROMPT' },
      { role: 'user', content: 'USER PROMPT' },
    ]);
    expect(body.response_format).toEqual({ type: 'json_schema', json_schema: { name: 'test_schema', strict: true, schema: request.jsonSchema } });
  });

  it('uses XAI_MODEL when set', async () => {
    vi.stubEnv('XAI_MODEL', 'grok-custom');
    fetchMock.mockResolvedValue(completion({ summary: 'ok', count: 1 }));
    const result = await generateStructured(request);
    expect(result).toMatchObject({ ok: true, model: 'grok-custom' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe('grok-custom');
  });

  it('reports unconfigured without calling xAI', async () => {
    vi.stubEnv('XAI_API_KEY', '');
    expect(await generateStructured(request)).toEqual({ ok: false, reason: 'unconfigured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('tolerates a missing token count', async () => {
    // `null`, not `undefined`: undefined would trigger the helper's default usage.
    fetchMock.mockResolvedValue(completion({ summary: 'ok', count: 1 }, null));
    expect(await generateStructured(request)).toMatchObject({ ok: true, tokensUsed: null });
  });

  it.each([
    ['an HTTP error', { ok: false, status: 400, text: async () => 'model not found', json: async () => ({}) }],
    ['a rate limit', { ok: false, status: 429, text: async () => 'slow down', json: async () => ({}) }],
  ])('fails on %s and never leaks the key into the logs', async (_label, response) => {
    fetchMock.mockResolvedValue(response);
    expect(await generateStructured(request)).toEqual({ ok: false, reason: 'failed' });
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain('xai-secret-key');
  });

  it('fails on a network error or a timeout', async () => {
    fetchMock.mockRejectedValue(new DOMException('timed out', 'TimeoutError'));
    expect(await generateStructured(request)).toEqual({ ok: false, reason: 'failed' });
  });

  it.each([
    ['no choices', { ok: true, json: async () => ({}) }],
    ['empty content', completion('')],
    ['content that is not JSON', completion('Sure! Here is your answer')],
    ['JSON of the wrong shape', completion({ summary: 'ok' })],
    ['an empty summary', completion({ summary: '', count: 1 })],
    ['a JSON array', completion('[]')],
  ])('treats %s as invalid, so the caller falls back', async (_label, response) => {
    fetchMock.mockResolvedValue(response);
    expect(await generateStructured(request)).toEqual({ ok: false, reason: 'invalid' });
  });
});
