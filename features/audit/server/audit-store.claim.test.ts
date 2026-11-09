import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type PatchRecord = { id: string; revision?: string; set?: Record<string, unknown>; unset?: string[] };

const fake = vi.hoisted(() => ({
  doc: null as null | { _rev: string; status: string; reportStartedAt?: string },
  patches: [] as { id: string; revision?: string; set?: Record<string, unknown>; unset?: string[] }[],
  commitError: null as Error | null,
}));

vi.mock('next-sanity', () => ({
  createClient: () => ({
    fetch: async () => fake.doc,
    patch: (id: string) => {
      const record: PatchRecord = { id };
      const chain = {
        ifRevisionId: (revision: string) => {
          record.revision = revision;
          return chain;
        },
        set: (values: Record<string, unknown>) => {
          record.set = values;
          return chain;
        },
        unset: (fields: string[]) => {
          record.unset = fields;
          return chain;
        },
        commit: async () => {
          if (fake.commitError) throw fake.commitError;
          fake.patches.push(record);
          return {};
        },
      };
      return chain;
    },
  }),
}));

const NOW = Date.UTC(2026, 10, 9, 12, 0, 0);
const AGO = (ms: number) => new Date(NOW - ms).toISOString();

async function loadStore() {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'proj1234');
  vi.stubEnv('SANITY_AUDIT_TOKEN', 'token');
  return import('./audit-store');
}

beforeEach(() => {
  fake.doc = { _rev: 'rev-1', status: 'pending' };
  fake.patches = [];
  fake.commitError = null;
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('claimReportRun', () => {
  it('takes the lock on a request that is not running, pinned to the revision it read', async () => {
    const { claimReportRun } = await loadStore();
    expect(await claimReportRun('req-1', NOW)).toBe(true);

    expect(fake.patches).toHaveLength(1);
    expect(fake.patches[0].id).toBe('req-1');
    expect(fake.patches[0].revision).toBe('rev-1');
    expect(fake.patches[0].set).toEqual({ status: 'running', reportStartedAt: new Date(NOW).toISOString() });
    expect(fake.patches[0].unset).toEqual(['reportError']);
  });

  it.each(['completed', 'failed', 'contacted', 'declined'])('may start again from "%s"', async (status) => {
    fake.doc = { _rev: 'rev-2', status };
    const { claimReportRun } = await loadStore();
    expect(await claimReportRun('req-1', NOW)).toBe(true);
  });

  it('refuses while a recent run holds the lock, without writing anything', async () => {
    fake.doc = { _rev: 'rev-1', status: 'running', reportStartedAt: AGO(60_000) };
    const { claimReportRun } = await loadStore();
    expect(await claimReportRun('req-1', NOW)).toBe(false);
    expect(fake.patches).toHaveLength(0);
  });

  it('takes over a run that was cut off more than five minutes ago', async () => {
    fake.doc = { _rev: 'rev-1', status: 'running', reportStartedAt: AGO(6 * 60_000) };
    const { claimReportRun } = await loadStore();
    expect(await claimReportRun('req-1', NOW)).toBe(true);
  });

  it('takes over a running request that has no start time', async () => {
    fake.doc = { _rev: 'rev-1', status: 'running' };
    const { claimReportRun } = await loadStore();
    expect(await claimReportRun('req-1', NOW)).toBe(true);
  });

  it('loses the race, and writes nothing, when someone changed the document first', async () => {
    fake.commitError = new Error('Document revision does not match (409)');
    const { claimReportRun } = await loadStore();
    expect(await claimReportRun('req-1', NOW)).toBe(false);
    expect(fake.patches).toHaveLength(0);
  });

  it('refuses a request that does not exist', async () => {
    fake.doc = null;
    const { claimReportRun } = await loadStore();
    expect(await claimReportRun('nope', NOW)).toBe(false);
  });

  it('refuses everything when the store is not configured', async () => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', '');
    vi.stubEnv('SANITY_AUDIT_TOKEN', '');
    const { claimReportRun } = await import('./audit-store');
    expect(await claimReportRun('req-1', NOW)).toBe(false);
    expect(fake.patches).toHaveLength(0);
  });
});
