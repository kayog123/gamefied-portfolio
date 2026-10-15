import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPost, getPostSlugs, getRelatedPosts, PostPage } from '@/features/blog';

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  // Cache Components requires at least one param. With no posts yet, prerender a placeholder
  // that resolves to notFound(); real slugs published later render on demand.
  return slugs.length > 0 ? slugs.map(({ slug }) => ({ slug })) : [{ slug: '_none' }];
}

// Posts prerender statically, but an unknown slug takes the `notFound()` branch below, which
// Cache Components' dev-only `instant` validation can't prove ahead of time (same as /work/[slug]).
export const instant = false;

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const description = post.seoDescription ?? post.excerpt;
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: post.cover ? [{ url: post.cover.url, width: post.cover.width, height: post.cover.height, alt: post.cover.alt }] : undefined,
    },
  };
}

/** "/blog/[slug]": one post, rendered from Sanity. */
export default async function Page({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return <PostPage post={post} related={await getRelatedPosts(post)} />;
}
