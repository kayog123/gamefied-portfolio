import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/blueprint';
import { cn } from '@/lib/cn';
import { CATEGORY_INFO } from '@/content/audit-page';
import type { AuditRequestRecord, AuditRequestStatus } from '../audit.types';
import { AUDIT_CATEGORIES } from '../audit.constants';
import { getAuditRequest } from '../server/audit-store';
import { updateReviewStatusAction } from '../server/review.actions';
import { SigningUnavailableError, verifyToken } from '../server/signing';

const STATUS_LABEL: Record<AuditRequestStatus, string> = {
  pending: 'PENDING',
  running: 'RUNNING',
  completed: 'COMPLETED',
  failed: 'FAILED',
  contacted: 'CONTACTED',
  declined: 'DECLINED',
};

export type AuditReviewPageProps = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

/**
 * `/audit/review/[requestId]?token=…`: Jovanni's private page for one "Get the full audit" request.
 * Opening it only displays; the buttons are Server Actions. Anything that isn't a valid signed link is a plain 404.
 * Runtime data is read inside <Suspense>, as Cache Components requires.
 */
export function AuditReviewPage(props: AuditReviewPageProps) {
  return (
    <PageWrapper>
      <Suspense fallback={<p className="px-5 py-16 font-mono text-xs tracking-label text-muted md:px-12">LOADING REQUEST…</p>}>
        <ReviewContent {...props} />
      </Suspense>
    </PageWrapper>
  );
}

async function ReviewContent({ params, searchParams }: AuditReviewPageProps) {
  const [{ requestId }, { token: rawToken }] = await Promise.all([params, searchParams]);
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  let isValid = false;
  try {
    isValid = verifyToken('review', requestId, token);
  } catch (error) {
    if (!(error instanceof SigningUnavailableError)) throw error;
  }
  if (!isValid || !token) notFound();

  const request = await getAuditRequest(requestId);
  if (!request) notFound();

  return <ReviewPanel request={request} token={token} />;
}

export function ReviewPanel({ request, token }: { request: AuditRequestRecord; token: string }) {
  const { previewSummary: summary } = request;
  const isOpen = request.status === 'pending' || request.status === 'contacted';

  return (
    <div className="flex max-w-[860px] flex-col gap-8 px-5 py-12 md:px-12 md:py-16">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-[11px] tracking-eyebrow text-glow">AUDIT REQUEST · PRIVATE</p>
        <h1 className="text-balance font-display text-3xl font-semibold leading-[1.05] tracking-display text-text-strong md:text-5xl">{request.domain}</h1>
        <p className="font-mono text-[11px] tracking-label text-muted">
          <span className={cn('rounded-tag border px-1.5 py-0.5', request.status === 'pending' ? 'border-glow/50 text-glow-soft' : 'border-muted/40 text-text-soft')}>
            {STATUS_LABEL[request.status]}
          </span>{' '}
          · RECEIVED {new Date(request.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).toUpperCase()} UTC
        </p>
      </header>

      <section aria-labelledby="who" className="panel-ticks flex flex-col gap-4 p-5 md:p-6">
        <h2 id="who" className="font-mono text-[11px] tracking-label text-muted">
          WHO
        </h2>
        <dl className="grid gap-x-8 gap-y-3 font-sans text-sm sm:grid-cols-[120px_1fr]">
          <dt className="text-muted">Name</dt>
          <dd className="text-text-strong">{request.name}</dd>
          <dt className="text-muted">Email</dt>
          <dd>
            <a href={`mailto:${request.email}`} className="focus-blueprint text-glow-soft hover:text-glow-pale">
              {request.email}
            </a>
          </dd>
          <dt className="text-muted">Site</dt>
          <dd>
            <a href={request.url} target="_blank" rel="noopener noreferrer" className="focus-blueprint break-all text-glow-soft hover:text-glow-pale">
              {request.url}
            </a>
          </dd>
          {request.sharedFrom && (
            <>
              <dt className="text-muted">Came from</dt>
              <dd>
                <a href={`/audit/s/${request.sharedFrom}`} target="_blank" rel="noopener noreferrer" className="focus-blueprint text-glow-soft hover:text-glow-pale">
                  shared audit {request.sharedFrom}
                </a>
              </dd>
            </>
          )}
          <dt className="text-muted">Message</dt>
          <dd className="whitespace-pre-wrap text-text-soft">{request.message || 'They left no message.'}</dd>
        </dl>
      </section>

      <section aria-labelledby="scan" className="flex flex-col gap-3">
        <h2 id="scan" className="font-mono text-[11px] tracking-label text-muted">
          THEIR FREE SCAN
        </h2>
        {summary ? (
          <>
            <ul className="grid gap-3 sm:grid-cols-3">
              {AUDIT_CATEGORIES.map((category) => (
                <li key={category} className="rounded-panel border border-wire/25 bg-glass p-4">
                  <p className="font-mono text-[10px] tracking-label text-muted">{CATEGORY_INFO[category].label.toUpperCase()}</p>
                  <p className="mt-1 font-mono text-3xl font-semibold text-text-strong">
                    {summary.scores[category]}
                    <span className="text-sm text-glow">/100</span>
                  </p>
                </li>
              ))}
            </ul>
            <p className="font-sans text-sm text-text-soft">
              {summary.counts.critical} critical · {summary.counts.warning} warnings · {summary.counts.info} notices ·{' '}
              <strong className="font-semibold text-text-strong">{summary.lockedCount} locked</strong>
            </p>
          </>
        ) : (
          <p className="font-sans text-sm text-muted">The free scan wasn&apos;t available when they asked.</p>
        )}
      </section>

      <section aria-labelledby="actions" className="flex flex-col gap-4 border-t border-grid pt-6">
        <h2 id="actions" className="font-mono text-[11px] tracking-label text-muted">
          WHAT NEXT
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button href={`mailto:${request.email}?subject=${encodeURIComponent(`Your website audit: ${request.domain}`)}`} variant="secondary">
            Reply by email
          </Button>
          {isOpen && (
            <>
              <form action={updateReviewStatusAction}>
                <input type="hidden" name="requestId" value={request.id} />
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="intent" value="contacted" />
                <Button type="submit" disabled={request.status === 'contacted'}>
                  {request.status === 'contacted' ? 'Marked contacted' : 'Mark contacted'}
                </Button>
              </form>
              <form action={updateReviewStatusAction}>
                <input type="hidden" name="requestId" value={request.id} />
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="intent" value="declined" />
                <Button type="submit" variant="ghost">
                  Decline
                </Button>
              </form>
            </>
          )}
        </div>
        <p className="font-sans text-xs leading-[1.5] text-muted">
          Running the full audit with Grok isn&apos;t built yet (Phase 4). For now, reply to them directly. This link works for 7 days after the
          request and only shows or updates this one request.
        </p>
      </section>
    </div>
  );
}
