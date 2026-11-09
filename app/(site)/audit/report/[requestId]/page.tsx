import type { Metadata } from 'next';
import { AuditReportPage, type AuditReportPageProps } from '@/features/audit';

// Private page: never indexed or followed. The signed token in the URL is the only way in.
export const metadata: Metadata = {
  title: 'Website audit report',
  robots: { index: false, follow: false },
};

export default function Page({ params, searchParams }: AuditReportPageProps) {
  return <AuditReportPage params={params} searchParams={searchParams} />;
}
