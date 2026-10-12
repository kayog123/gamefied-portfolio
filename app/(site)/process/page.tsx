import type { Metadata } from 'next';
import { ProcessPage } from '@/features/process';

export const metadata: Metadata = {
  title: 'How I work with clients',
  description:
    "Jovanni Jungco's process from discovery call to delivery: brief, blueprint, build, review, launch and support, plus answers to common client questions.",
  alternates: { canonical: '/process' },
};

export default function Page() {
  return <ProcessPage />;
}
