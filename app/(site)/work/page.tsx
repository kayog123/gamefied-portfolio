import type { Metadata } from 'next';
import { WorkPage } from '@/features/work';

export const metadata: Metadata = {
  title: 'See my work',
  description:
    "Full-stack and AI engineering: shipped AI agents, payments, maps and automation. See my work, skills, experience and get in touch.",
  alternates: { canonical: '/work' },
};

export default function Page() {
  return <WorkPage />;
}
