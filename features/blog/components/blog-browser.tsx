'use client';

import { Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Button, Chip } from '@/components/blueprint';
import { BLOG_PAGE_SIZE, BLOG_TOPICS } from '../blog.constants';
import type { PostSummary } from '../blog.types';
import { FeaturedPost } from './featured-post';
import { PostCard } from './post-card';

const ALL = 'All';

/**
 * Topic chips, search and the post grid. Filtering happens in the browser over the
 * posts the server already sent, so `/blog` stays a static page.
 */
export function BlogBrowser({ posts }: { posts: PostSummary[] }) {
  const searchId = useId();
  const [topic, setTopic] = useState<string>(ALL);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(BLOG_PAGE_SIZE);

  // Only offer topics that have at least one post.
  const topics = useMemo(() => [ALL, ...BLOG_TOPICS.filter((t) => posts.some((p) => p.topic === t))], [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (topic === ALL || p.topic === topic) &&
        (!q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)),
    );
  }, [posts, topic, query]);

  const isFiltering = topic !== ALL || query.trim() !== '';
  const featured = !isFiltering ? filtered[0] : undefined;
  const rest = featured ? filtered.slice(1) : filtered;
  const shown = rest.slice(0, visible);

  return (
    <>
      <section
        aria-label="Find a post"
        className="flex flex-wrap items-center justify-between gap-5 border-y border-grid px-5 py-5 md:px-12 md:py-6"
      >
        <div role="group" aria-label="Topics" className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <Chip
              key={t}
              selected={topic === t}
              onClick={() => {
                setTopic(t);
                setVisible(BLOG_PAGE_SIZE);
              }}
              className="h-9 px-3.5 text-[13px]"
            >
              {t}
            </Chip>
          ))}
        </div>
        <div className="flex h-11 w-full items-center gap-2.5 rounded-control border border-grid bg-input px-3.5 focus-within:border-glow md:w-[300px]">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <label htmlFor={searchId} className="sr-only">
            Search posts
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(BLOG_PAGE_SIZE);
            }}
            placeholder="Search posts"
            className="min-w-0 flex-1 bg-transparent font-sans text-sm text-text outline-none placeholder:text-text-faint"
          />
        </div>
      </section>

      <div className="px-5 pb-6 pt-8 md:px-12 md:pt-12">
        {featured && (
          <section aria-label="Featured post">
            <FeaturedPost post={featured} />
          </section>
        )}

        {filtered.length === 0 ? (
          <p className="py-16 text-center font-sans text-muted" role="status">
            {posts.length === 0
              ? 'No posts yet. Check back soon.'
              : 'No posts match that search. Try another topic or clear the search.'}
          </p>
        ) : (
          rest.length > 0 && (
            <section aria-label="Latest posts" className={featured ? 'pt-12 md:pt-16' : undefined}>
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-text-strong md:text-[28px]">
                  {isFiltering ? 'Matching posts' : 'Latest posts'}
                </h2>
                <span className="font-mono text-xs tracking-label text-muted" role="status">
                  {shown.length} OF {rest.length} POSTS
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {shown.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              {shown.length < rest.length && (
                <div className="mt-12 flex justify-center">
                  <Button variant="secondary" onClick={() => setVisible((v) => v + BLOG_PAGE_SIZE)}>
                    Show more posts
                  </Button>
                </div>
              )}
            </section>
          )
        )}
      </div>
    </>
  );
}
