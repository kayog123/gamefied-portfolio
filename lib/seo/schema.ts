import type { FaqItem, ProcessStage } from '@/content/process';
import { SITE_URL } from '@/lib/site';

/** `FAQPage`: only pass questions that are visibly answered on the page. */
export function faqPageSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

type BlogPostLike = { slug: string; title: string; excerpt: string; publishedAt: string };

/** `Blog` for `/blog`: lists the posts that are visibly on the page. */
export function blogSchema(posts: BlogPostLike[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Notes from the build — Jovanni Jungco',
    url: `${SITE_URL}/blog`,
    author: { '@type': 'Person', name: 'Jovanni Jungco' },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      url: `${SITE_URL}/blog/${post.slug}`,
    })),
  };
}

/** `BlogPosting` + breadcrumb for `/blog/[slug]`. */
export function blogPostSchema(post: BlogPostLike & { updatedAt?: string; image?: string; tags: string[] }) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#post`,
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        mainEntityOfPage: url,
        url,
        image: post.image,
        keywords: post.tags.length ? post.tags.join(', ') : undefined,
        author: { '@type': 'Person', name: 'Jovanni Jungco' },
        publisher: { '@type': 'Person', name: 'Jovanni Jungco' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Blog', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 2, name: post.title, item: url },
        ],
      },
    ],
  };
}

/** `HowTo`: the client-work process, one `HowToStep` per visible stage. */
export function processHowToSchema(stages: ProcessStage[], opts: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    step: stages.map((stage, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: stage.title,
      text: stage.summary,
      url: `${SITE_URL}${opts.path}#${stage.id}`,
    })),
  };
}
