import { Button } from '@/components/blueprint';
import { BOOK_A_CALL_URL } from '@/lib/site';

/** `/process` hero: the one `<h1>` plus an answer-first summary. */
export function ProcessHero({ updated }: { updated: string }) {
  return (
    <section className="border-b border-grid px-5 pb-10 pt-12 md:px-12 md:pb-[72px] md:pt-24">
      <div className="font-mono text-[11px] tracking-eyebrow text-glow md:text-xs">PROCESS — FROM FIRST CALL TO DELIVERY</div>
      <h1 className="mt-3.5 max-w-[900px] text-balance font-display text-4xl font-semibold leading-[1.02] tracking-display text-text-strong md:mt-[22px] md:text-[72px] md:tracking-[-0.04em]">
        How I work with clients
      </h1>
      <p className="mt-4 max-w-[720px] text-pretty font-sans text-base leading-[1.55] text-muted md:mt-[26px] md:text-[19px]">
        Jovanni Jungco, a full-stack and AI engineer, takes every project through seven stages: discovery call, brief
        and scope, blueprint, build, review, launch, and handover. Each stage ends with something you can see and
        approve, so you always know what is done and what comes next.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 md:mt-8">
        <Button href={BOOK_A_CALL_URL} size="lg">
          Book a discovery call
        </Button>
        <span className="font-mono text-xs tracking-label text-text-faint">
          LAST UPDATED · <time dateTime={updated}>{updated}</time>
        </span>
      </div>
    </section>
  );
}
