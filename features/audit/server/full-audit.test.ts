import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUDIT_CHECKS } from '@/content/audit-checks';
import type { AuditResult, Finding } from '@/types/audit';
import { countFailures, mergeFindings, scoreFindings } from '../audit.utils';
import type { AiAnalysis } from './report-schema';
import type { SavedReport } from './audit-store';
import type { AuditOutcome } from './run-audit';

// Plain recording functions, not vi.fn(): vitest's call bookkeeping reports rejected promises as "unhandled"
// even when the code under test handles them, which would hide what these tests want to prove.
const state = vi.hoisted(() => ({
  request: null as { url: string } | null,
  outcome: null as unknown,
  answer: null as unknown,
  audited: [] as string[],
  aiCalls: [] as { system: string; user: string; timeoutMs: number; name: string }[],
  saved: [] as { id: string; payload: unknown }[],
  failures: [] as { id: string; message: string }[],
  throwOnAudit: false,
  throwOnSave: false,
  throwOnFailureSave: false,
}));

vi.mock('./audit-store', () => ({
  getAuditRequest: async () => state.request,
  saveReport: async (id: string, payload: unknown) => {
    if (state.throwOnSave) throw new Error('sanity down');
    state.saved.push({ id, payload });
  },
  saveReportFailure: async (id: string, message: string) => {
    if (state.throwOnFailureSave) throw new Error('sanity still down');
    state.failures.push({ id, message });
  },
}));
vi.mock('./run-audit', () => ({
  runAuditUncached: async (url: string) => {
    state.audited.push(url);
    if (state.throwOnAudit) throw new Error('boom');
    return state.outcome;
  },
}));
vi.mock('@/lib/ai/xai', () => ({
  generateStructured: async (args: { system: string; user: string; timeoutMs: number; name: string }) => {
    state.aiCalls.push(args);
    return state.answer;
  },
}));

const { generateFullReport } = await import('./full-audit');

function buildResult(): AuditResult {
  const findings: Finding[] = AUDIT_CHECKS.map((check, index) => ({ checkId: check.id, status: index % 4 === 0 ? 'pass' : 'fail', evidence: `E-${check.id}` }));
  const merged = mergeFindings(AUDIT_CHECKS, findings);
  return {
    url: 'https://example.com/',
    finalUrl: 'https://example.com/',
    auditedAt: '2026-11-09T02:00:00.000Z',
    scores: scoreFindings(merged),
    counts: countFailures(merged),
    findings: merged,
  };
}

const ai: AiAnalysis = {
  summary: 'A short, clear summary.',
  businessImpact: 'What it costs you.',
  plan: [{ findingId: 'seo.meta-description', action: 'Write a description.', effort: 'quick', impact: 'medium' }],
};

/** Time that advances only when the test says so. */
function clock(...steps: number[]) {
  let call = 0;
  return () => steps[Math.min(call++, steps.length - 1)];
}

const T0 = Date.UTC(2026, 10, 9, 5, 0, 0);
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

beforeEach(() => {
  state.request = { url: 'https://example.com/' };
  state.outcome = { ok: true, result: buildResult() } satisfies AuditOutcome;
  state.answer = { ok: true, data: ai, model: 'grok-test', tokensUsed: 1234 };
  state.audited = [];
  state.aiCalls = [];
  state.saved = [];
  state.failures = [];
  state.throwOnAudit = false;
  state.throwOnSave = false;
  state.throwOnFailureSave = false;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const saved = () => state.saved[0]?.payload as SavedReport;

describe('generateFullReport', () => {
  it('runs fresh checks, asks Grok, and stores an AI report that expires in 30 days', async () => {
    await generateFullReport('req-1', clock(T0));

    expect(state.audited).toEqual(['https://example.com/']);
    expect(state.aiCalls).toHaveLength(1);
    expect(state.aiCalls[0].name).toBe('audit_analysis');
    expect(state.aiCalls[0].system).toContain('untrusted');
    expect(state.aiCalls[0].user).toContain('seo.meta-description');

    expect(state.saved).toHaveLength(1);
    expect(state.saved[0].id).toBe('req-1');
    expect(saved().usedAi).toBe(true);
    expect(saved().tokensUsed).toBe(1234);
    expect(saved().report.model).toBe('grok-test');
    expect(saved().report.ai?.summary).toBe(ai.summary);
    expect(saved().expiresAt).toBe(new Date(T0 + THIRTY_DAYS).toISOString());
    expect(state.failures).toEqual([]);
  });

  it('gives Grok only the time that is left after the checks', async () => {
    await generateFullReport('req-1', clock(T0, T0 + 20_000));
    expect(state.aiCalls[0].timeoutMs).toBe(35_000);
  });

  it.each([
    ['xAI failed', { ok: false, reason: 'failed' }],
    ['xAI is not configured', { ok: false, reason: 'unconfigured' }],
    ['the answer was off-schema', { ok: false, reason: 'invalid' }],
  ])('still stores the standard report when %s', async (_label, answer) => {
    state.answer = answer;
    await generateFullReport('req-1', clock(T0));

    expect(state.saved).toHaveLength(1);
    expect(saved().usedAi).toBe(false);
    expect(saved().tokensUsed).toBeNull();
    expect(saved().report.ai).toBeNull();
    expect(saved().report.model).toBeNull();
    expect(saved().report.plan.length).toBeGreaterThan(0);
    expect(state.failures).toEqual([]);
  });

  it('records the tokens even when the prose turned out unusable', async () => {
    state.answer = { ok: true, data: { ...ai, summary: '   ' }, model: 'grok-test', tokensUsed: 900 };
    await generateFullReport('req-1', clock(T0));
    expect(saved().usedAi).toBe(false);
    expect(saved().tokensUsed).toBe(900);
  });

  it('skips the AI, and still delivers, when too little time is left', async () => {
    await generateFullReport('req-1', clock(T0, T0 + 50_000));
    expect(state.aiCalls).toHaveLength(0);
    expect(state.saved).toHaveLength(1);
    expect(saved().usedAi).toBe(false);
  });

  it('records a failure, and never calls Grok, when the site cannot be audited', async () => {
    state.outcome = { ok: false, reason: 'unreachable', message: 'The site refused the connection.' } satisfies AuditOutcome;
    await generateFullReport('req-1', clock(T0));

    expect(state.aiCalls).toHaveLength(0);
    expect(state.saved).toHaveLength(0);
    expect(state.failures).toHaveLength(1);
    expect(state.failures[0].message).toContain('The site refused the connection.');
  });

  it('does nothing for a request that no longer exists', async () => {
    state.request = null;
    await generateFullReport('gone', clock(T0));
    expect(state.audited).toEqual([]);
    expect(state.saved).toEqual([]);
    expect(state.failures).toEqual([]);
  });

  it('turns an unexpected error into a recorded failure instead of throwing', async () => {
    state.throwOnAudit = true;
    await expect(generateFullReport('req-1', clock(T0))).resolves.toBeUndefined();
    expect(state.failures).toHaveLength(1);
    expect(state.failures[0].message).toContain('Something went wrong');
  });

  it('survives the store failing while saving, and while recording that failure', async () => {
    state.throwOnSave = true;
    await expect(generateFullReport('req-1', clock(T0))).resolves.toBeUndefined();
    expect(state.failures).toHaveLength(1);

    state.failures = [];
    state.throwOnFailureSave = true;
    await expect(generateFullReport('req-1', clock(T0))).resolves.toBeUndefined();
  });
});
