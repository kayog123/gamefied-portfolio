import type { Metadata } from 'next';
import { AuditReviewPage, type AuditReviewPageProps } from '@/features/audit';

// "Run full audit" starts its work in `after()` from a Server Action on this page, so this limit bounds the whole run
// (fresh checks + the Grok call). The run budget in `audit.constants.ts` is sized to fit inside it.
export const maxDuration = 60;

// Private page: never indexed or followed. The signed token in the URL is the only access control.
export const metadata: Metadata = {
  title: 'Audit request',
  robots: { index: false, follow: false },
};

export default function Page({ params, searchParams }: AuditReviewPageProps) {
  return <AuditReviewPage params={params} searchParams={searchParams} />;
}
