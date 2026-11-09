import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { after } from 'next/server';
import { Suspense } from 'react';
import { Button } from '@/components/blueprint';
import { PageWrapper } from '@/components/layout/page-wrapper';
import type { AuditSnapshotRecord } from '../audit.types';
import { isExpired, isValidShareId } from '../audit.utils';
import { isLikelyBot } from '../server/bot-detect';
import { getSnapshot } from '../server/audit-store';
import { trackSnapshotView } from '../server/snapshot-tracking';
import { AuditResults } from './audit-results';

export type SharedAuditPageProps = { params: Promise<{ shareId: string }> };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/**
 * `/audit/s/[shareId]`: a read-only snapshot of someone's audit, opened from a shared link.
 * Private by design: noindex, an unguessable ID, and it expires. The dynamic part sits inside <Suspense>,
 * as Cache Components requires for runtime data.
 */
export function SharedAuditPage({ params }: SharedAuditPageProps) {
  return (
    <PageWrapper>
      <Suspense fallback={<p className="px-5 py-16 font-mono text-xs tracking-label text-muted md:px-12">LOADING AUDIT…</p>}>
        <SharedContent params={params} />
      </Suspense>
    </PageWrapper>
  );
}

async function SharedContent({ params }: SharedAuditPageProps) {
  const { shareId } = await params;
  if (!isValidShareId(shareId)) notFound();

  const requestHeaders = await headers();
  const snapshot = await getSnapshot(shareId);
  if (!snapshot) notFound();

  if (isExpired(snapshot.expiresAt)) return <ExpiredAudit domain={snapshot.domain} />;

  // Link-preview bots and prefetchers load this page too; they are not a person reading it.
  if (!isLikelyBot(requestHeaders)) after(() => trackSnapshotView(shareId));

  return <SharedAudit snapshot={snapshot} />;
}

export function SharedAudit({ snapshot }: { snapshot: AuditSnapshotRecord }) {
  const preparedFor = snapshot.preparedFor?.slice(0, 80);

  return (
    <div className="flex flex-col gap-10 px-5 py-12 md:gap-12 md:px-12 md:py-16">
      <header className="flex max-w-[860px] flex-col gap-3.5">
        {preparedFor && (
          <p className="self-start rounded-tag border border-glow/50 px-2.5 py-1.5 font-mono text-[11px] tracking-label text-glow-soft">
            PREPARED FOR {preparedFor.toUpperCase()}
          </p>
        )}
        <h1 className="text-balance font-display text-4xl font-semibold leading-[1.02] tracking-display text-text-strong md:text-[56px]">
          Website audit of {snapshot.domain}
        </h1>
        <p className="max-w-[720px] text-pretty font-sans text-base leading-[1.55] text-muted md:text-lg">
          An automated, read-only check run by Jovanni Jungco, a full-stack engineer, on{' '}
          <time dateTime={snapshot.preview.auditedAt}>{formatDate(snapshot.preview.auditedAt)}</time>. These results are a preview: the full
          audit covers the locked findings and a fix plan.
        </p>
        <p className="font-mono text-[11px] tracking-label text-muted">
          SNAPSHOT · LINK VALID UNTIL <time dateTime={snapshot.expiresAt}>{formatDate(snapshot.expiresAt).toUpperCase()}</time>
        </p>
      </header>

      <AuditResults variant="shared" preview={snapshot.preview} shareId={snapshot.shareId} />
    </div>
  );
}

export function ExpiredAudit({ domain }: { domain: string }) {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-5 py-24 text-center md:px-12 md:py-32">
      <p className="font-mono text-xs font-medium tracking-eyebrow text-glow">SHARED AUDIT · EXPIRED</p>
      <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-display text-text-strong md:text-5xl">
        This audit is out of date
      </h1>
      <p className="text-pretty font-sans text-base leading-[1.55] text-muted md:text-lg">
        Shared audits last 30 days because websites change. Run a fresh one for {domain}; it takes about 10 seconds.
      </p>
      <Button href="/audit" size="lg" className="mt-3">
        Run a fresh audit
      </Button>
    </div>
  );
}
