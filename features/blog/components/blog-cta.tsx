import { Button } from '@/components/blueprint';

/** The one amber CTA on the blog pages: back into the idea → blueprint game. */
export function BlogCta() {
  return (
    <section className="mx-5 mb-16 mt-8 flex flex-wrap items-center justify-between gap-8 rounded-modal border border-grid bg-glass-strong p-6 md:mx-12 md:mb-24 md:mt-16 md:p-12">
      <div className="flex max-w-[640px] flex-col gap-3">
        <p className="font-mono text-xs tracking-eyebrow text-glow">HAVE AN IDEA?</p>
        <h2 className="text-balance font-display text-[28px] font-semibold leading-[1.1] tracking-display text-text-strong md:text-4xl">
          Turn it into a blueprint, then a live product.
        </h2>
        <p className="font-sans text-base leading-[1.6] text-text-soft">
          Type your idea and watch it become a plan in under a minute.
        </p>
      </div>
      <Button href="/" size="lg">
        Start your blueprint
      </Button>
    </section>
  );
}
