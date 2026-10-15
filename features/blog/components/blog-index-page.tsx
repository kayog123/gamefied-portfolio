import { PageWrapper } from '@/components/layout/page-wrapper';
import { JsonLd } from '@/components/seo/json-ld';
import { blogSchema } from '@/lib/seo/schema';
import { getPosts } from '../server/get-posts';
import { BlogBrowser } from './blog-browser';
import { BlogCta } from './blog-cta';

/** `/blog`: hero, topic filter, featured post and the post grid. */
export async function BlogIndexPage() {
  const posts = await getPosts();

  return (
    <PageWrapper after={<JsonLd data={blogSchema(posts)} />}>
      <section className="px-5 pb-8 pt-12 md:px-12 md:pb-10 md:pt-20">
        <div className="font-mono text-[11px] tracking-eyebrow text-glow md:text-xs">BLOG — FIELD NOTES</div>
        <h1 className="mt-3.5 max-w-[900px] text-balance font-display text-4xl font-semibold leading-[1.02] tracking-display text-text-strong md:mt-[22px] md:text-[64px]">
          Notes from the build
        </h1>
        <p className="mt-4 max-w-[720px] text-pretty font-sans text-base leading-[1.6] text-text-soft md:mt-6 md:text-lg">
          How I turn ideas into live products: web and mobile apps, AI agents, payments, maps and automation. Short,
          practical write-ups from real projects.
        </p>
      </section>
      <BlogBrowser posts={posts} />
      <BlogCta />
    </PageWrapper>
  );
}
