import Link from 'next/link';
import { formatPostDate } from '../blog.utils';
import type { PostSummary } from '../blog.types';
import { PostCover } from './post-cover';

/** Post card for the `/blog` grid. The whole card is one link (the title). */
export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-panel border border-grid bg-glass transition-[border-color,box-shadow] hover:border-glow hover:shadow-[0_0_30px_rgb(59,130,246,0.2)]">
      <PostCover image={post.cover} className="aspect-video" sizes="(max-width: 768px) 100vw, 33vw" />
      <div className="flex flex-1 flex-col gap-3 p-5 md:p-[22px]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className="rounded-tag border border-grid px-2 py-[3px] font-mono text-[11px] tracking-label text-glow-soft">
            {post.topic.toUpperCase()}
          </span>
          <span className="font-mono text-[11px] text-muted">
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time> · {post.readingMinutes} MIN
          </span>
        </div>
        <h3 className="text-balance font-display text-xl font-semibold leading-[1.2] tracking-[-0.02em] text-text-strong">
          <Link
            href={`/blog/${post.slug}`}
            className="focus-blueprint after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </Link>
        </h3>
        <p className="text-pretty font-sans text-sm leading-[1.6] text-muted">{post.excerpt}</p>
      </div>
    </article>
  );
}
