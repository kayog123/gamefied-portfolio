import type { Metadata } from 'next';
import { AuditReviewPage, type AuditReviewPageProps } from '@/features/audit';

// Private page: never indexed, never followed. The signed token in the URL is the only access control.
export const metadata: Metadata = {
  title: 'Audit request',
  robots: { index: false, follow: false },
};

export default function Page({ params, searchParams }: AuditReviewPageProps) {
  return <AuditReviewPage params={params} searchParams={searchParams} />;
}
