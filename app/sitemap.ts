import type { MetadataRoute } from 'next';
import { PROJECTS } from '@/content/projects';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/work`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/process`, changeFrequency: 'monthly', priority: 0.8 },
    ...PROJECTS.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.9,
    })),
  ];
}
