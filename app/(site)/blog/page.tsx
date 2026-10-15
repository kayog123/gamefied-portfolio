import type { Metadata } from 'next';
import { BlogIndexPage } from '@/features/blog';

export const metadata: Metadata = {
  title: 'Blog: notes from the build',
  description:
    'Practical write-ups from real projects by Jovanni Jungco: web and mobile apps, AI agents, payments, maps and automation.',
  alternates: { canonical: '/blog' },
};

export default function Page() {
  return <BlogIndexPage />;
}
