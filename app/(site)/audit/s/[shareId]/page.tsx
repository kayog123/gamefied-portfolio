import type { Metadata } from 'next';
import { SharedAuditPage, type SharedAuditPageProps } from '@/features/audit';

// Private page: never indexed or followed. The unguessable ID in the URL is the only access control.
export const metadata: Metadata = {
  title: 'Shared website audit',
  robots: { index: false, follow: false },
};

export default function Page({ params }: SharedAuditPageProps) {
  return <SharedAuditPage params={params} />;
}
