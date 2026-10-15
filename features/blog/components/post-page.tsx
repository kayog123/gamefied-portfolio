import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/blueprint';
import { JsonLd } from '@/components/seo/json-ld';
import { blogPostSchema } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/site';
import { BLOG_AUTHOR } from '../blog.constants';
import type { Post, PostSummary } from '../blog.types';
import { formatPostDate, getHeadings } from '../blog.utils';
import { CopyLinkButton } from './copy-link-button';
import { PostBody } from './post-body';
import { PostCard } from './post-card';
import { PostCover } from './post-cover';

/** `/blog/[slug]`: header, cover, article body with "On this page", author card and related posts. */
export function PostPage({ post, related }: { post: Post; related: PostSummary[] }) {
  const headings = getHeadings(post.body);
  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <PageWrapper
      topBar="case-study"
      back={{ href: '/blog', label: 'All posts' }}
      after={
        <JsonLd
          data={blogPostSchema({
            slug: post.slug,
            title: post.title,
            excerpt: post.seoDescription ?? post.excerpt,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            image: post.cover?.url,
            tags: post.tags,
          })}
        />
      }
    >
      <header className="flex max-w-[860px] flex-col gap-5 px-5 pb-8 pt-10 md:px-12 md:pb-10 md:pt-14">
        <nav aria-label="Breadcrumb" className="font-mono text-xs tracking-label text-muted">
          <Link href="/blog" className="focus-blueprint text-glow">
            BLOG
          </Link>{' '}
          / <span>{post.topic.toUpperCase()}</span>
        </nav>
        <h1 className="text-balance font-display text-[34px] font-semibold leading-[1.06] tracking-display text-text-strong md:text-[52px]">
          {post.title}
        </h1>
        <p className="text-pretty font-sans text-lg leading-[1.55] text-text-soft md:text-xl">{post.excerpt}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 font-mono text-xs tracking-[0.06em] text-muted">
          <span className="text-text">{BLOG_AUTHOR.name.toUpperCase()}</span>
          <span>
            · <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          </span>
          <span>· {post.readingMinutes} MIN READ</span>
          {post.updatedAt && (
            <span>
              · UPDATED <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
            </span>
          )}
        </div>
      </header>

      {post.cover && (
        <div className="px-5 md:px-12">
          <PostCover
            image={post.cover}
            priority
            className="aspect-[16/9] max-h-[460px] w-full rounded-panel border border-grid"
            sizes="(max-width: 1440px) 100vw, 1440px"
          />
        </div>
      )}

      <div className="flex flex-col items-start gap-12 px-5 pt-10 md:flex-row md:gap-16 md:px-12 md:pt-14">
        <article className="flex min-w-0 max-w-[720px] flex-1 flex-col gap-6">
          <PostBody body={post.body} headings={headings} />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-grid pt-6">
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {[post.topic, ...post.tags].map((tag) => (
                <li
                  key={tag}
                  className="rounded-tag border border-grid px-2 py-1 font-mono text-[11px] tracking-label text-glow-soft"
                >
                  {tag.toUpperCase()}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] tracking-[0.1em] text-muted">SHARE</span>
              <CopyLinkButton />
              <Button
                variant="secondary"
                size="sm"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              >
                LinkedIn
              </Button>
            </div>
          </div>

          <aside
            aria-label="About the author"
            className="flex items-center gap-[18px] rounded-panel border border-grid bg-glass p-6"
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-display text-lg font-semibold text-text-strong">{BLOG_AUTHOR.name}</span>
              <span className="font-sans text-sm leading-[1.55] text-muted">{BLOG_AUTHOR.bio}</span>
            </div>
          </aside>
        </article>

        <aside aria-label="On this page" className="flex w-full flex-col gap-6 md:sticky md:top-6 md:w-[280px] md:shrink-0">
          {headings.length > 0 && (
            <nav aria-label="Table of contents" className="flex flex-col gap-3 rounded-panel border border-grid bg-glass p-5">
              <span className="font-mono text-[11px] tracking-eyebrow text-glow">ON THIS PAGE</span>
              {headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className="focus-blueprint border-l-2 border-grid pl-3 font-sans text-sm text-muted hover:border-glow hover:text-text"
                >
                  {h.text}
                </a>
              ))}
            </nav>
          )}
          <div className="flex flex-col gap-3.5 rounded-panel border border-grid bg-glass-strong p-5">
            <span className="font-display text-lg font-semibold leading-[1.25] text-text-strong">Got an idea like this?</span>
            <span className="font-sans text-sm leading-[1.55] text-muted">See it as a blueprint in under a minute.</span>
            <Button href="/">Start your blueprint</Button>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-label="Related posts" className="px-5 pb-16 pt-16 md:px-12 md:pb-24 md:pt-20">
          <h2 className="mb-6 font-display text-[22px] font-semibold tracking-[-0.03em] text-text-strong md:text-[28px]">
            Keep reading
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </PageWrapper>
  );
}
