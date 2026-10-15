import type { MetadataRoute } from 'next';
import { PROJECTS } from '@/content/projects';
import { getPostSlugs } from '@/features/blog';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPostSlugs();

  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/work`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/process`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    ...PROJECTS.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.9,
    })),
    ...posts.map(({ slug, date }) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: new Date(date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
