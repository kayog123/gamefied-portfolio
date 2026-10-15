import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatPostDate } from '../blog.utils';
import type { PostSummary } from '../blog.types';
import { PostCover } from './post-cover';

/** The large card for the newest post at the top of `/blog`. */
export function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-panel border border-grid bg-glass transition-[border-color,box-shadow] hover:border-glow hover:shadow-[0_0_30px_rgb(59,130,246,0.2)] md:flex-row">
      <PostCover
        image={post.cover}
        priority
        className="aspect-video md:aspect-auto md:min-h-[340px] md:flex-1"
        sizes="(max-width: 768px) 100vw, 600px"
      />
      <div className="flex flex-col justify-center gap-4 p-6 md:flex-1 md:gap-[18px] md:p-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="rounded-tag border border-wire bg-wire/12 px-2 py-1 font-mono text-[11px] tracking-label text-glow-soft">
            FEATURED
          </span>
          <span className="font-mono text-xs text-muted">
            {post.topic.toUpperCase()} · <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time> ·{' '}
            {post.readingMinutes} MIN READ
          </span>
        </div>
        <h2 className="text-balance font-display text-[28px] font-semibold leading-[1.12] tracking-display text-text-strong md:text-4xl">
          <Link href={`/blog/${post.slug}`} className="focus-blueprint after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h2>
        <p className="text-pretty font-sans text-base leading-[1.65] text-text-soft">{post.excerpt}</p>
        <span className="inline-flex items-center gap-2 font-sans text-sm font-medium text-glow">
          Read the post <ArrowRight className="size-4" aria-hidden />
        </span>
      </div>
    </article>
  );
}
