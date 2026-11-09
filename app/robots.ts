import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/audit/review/', '/audit/report/', '/audit/s/', '/studio'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
