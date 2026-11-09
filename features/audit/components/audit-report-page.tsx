import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { Button } from '@/components/blueprint';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { SOCIAL_LINKS } from '@/lib/site';
import { isExpired } from '../audit.utils';
import { getStoredReport } from '../server/audit-store';
import { SigningUnavailableError, verifyToken } from '../server/signing';
import { FullReport } from './full-report';

export type AuditReportPageProps = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

/**
 * `/audit/report/[requestId]?token=…`: the private full report. noindex; the signed token is the only way in,
 * and a link stops working 30 days after it was sent (or sooner if `reportExpiresAt` is edited in Studio).
 * Runtime data is read inside <Suspense>, as Cache Components requires.
 */
export function AuditReportPage(props: AuditReportPageProps) {
  return (
    <PageWrapper>
      <Suspense fallback={<p className="px-5 py-16 font-mono text-xs tracking-label text-muted md:px-12">LOADING REPORT…</p>}>
        <ReportContent {...props} />
      </Suspense>
    </PageWrapper>
  );
}

async function ReportContent({ params, searchParams }: AuditReportPageProps) {
  // Always request-time: access depends on a secret token and an expiry. Without this, Cache Components' dev
  // check treats params and searchParams as predictable and rejects the Date.now() inside token verification.
  await connection();
  const [{ requestId }, { token: rawToken }] = await Promise.all([params, searchParams]);
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  let isValid = false;
  try {
    isValid = verifyToken('report', requestId, token);
  } catch (error) {
    if (!(error instanceof SigningUnavailableError)) throw error;
  }
  if (!isValid) notFound();

  const stored = await getStoredReport(requestId);
  if (!stored) notFound();
  if (stored.expiresAt && isExpired(stored.expiresAt)) return <ExpiredReport />;

  return <FullReport domain={stored.domain} report={stored.report} />;
}

export function ExpiredReport() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-5 py-24 text-center md:px-12 md:py-32">
      <p className="font-mono text-xs font-medium tracking-eyebrow text-glow">AUDIT REPORT · EXPIRED</p>
      <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-display text-text-strong md:text-5xl">
        This report link has expired
      </h1>
      <p className="text-pretty font-sans text-base leading-[1.55] text-muted md:text-lg">
        Report links work for 30 days. Email me and I&apos;ll send you a fresh one.
      </p>
      <Button href={`mailto:${SOCIAL_LINKS.email}?subject=${encodeURIComponent('A fresh link to my audit report')}`} size="lg" className="mt-3">
        Ask for a new link
      </Button>
    </div>
  );
}
