import type { Metadata } from 'next';
import { AuditPage } from '@/features/audit';

export const metadata: Metadata = {
  title: 'Free website audit',
  description:
    'Free website audit by Jovanni Jungco: SEO, security and maintainability checks in about 10 seconds, with plain-English results and what to fix first.',
  alternates: { canonical: '/audit' },
};

export default function Page() {
  return <AuditPage />;
}
