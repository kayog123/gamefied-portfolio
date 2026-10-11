import Image from 'next/image';
import { Button, DimensionLine } from '@/components/blueprint';
import { KayogLogo } from '@/components/layout/kayog-logo';
import { TypeOnView } from '@/components/type-on-view';

/** Sheet 07 hero: eyebrow, headline, lead, CTAs, portrait frame (desktop only). */
export function Hero() {
  return (
    <section className="grid grid-cols-1 items-end gap-10 border-b border-grid px-5 pb-10 pt-12 md:grid-cols-[1fr_400px] md:gap-16 md:px-12 md:pb-[88px] md:pt-24">
      <div>
        <div className="font-mono text-[11px] tracking-eyebrow text-glow md:text-xs">
          JOVANNI JUNGCO — FULL-STACK &amp; AI ENGINEER
        </div>
        <h1 className="mt-3.5 text-balance font-display text-5xl font-semibold leading-[1] tracking-display text-text-strong md:mt-[22px] md:text-[96px] md:leading-[0.98] md:tracking-[-0.04em]">
          <TypeOnView text={'Your idea →\nLive product.'} />
        </h1>
        <p className="mt-4 max-w-[620px] text-pretty font-sans text-base leading-[1.55] text-muted md:mt-[26px] md:text-[19px]">
          I build clients&apos; dream products end to end: web and mobile apps, AI agents, payments, maps and the
          automation that keeps them running.
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5 md:mt-8">
          <Button href="/work#contact" size="lg">
            Talk to me
          </Button>
          <Button href="/work#work" variant="secondary" size="lg">
            See case studies ↓
          </Button>
        </div>
      </div>

      <div className="relative hidden md:block">
        <div aria-hidden className="absolute bottom-0 right-full mr-8 hidden h-[460px] w-[127px] xl:block">
          <KayogLogo className="absolute left-1/2 top-1/2 h-auto w-[420px] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-90" />
        </div>
        <DimensionLine label="400" className="mb-2" />
        <div className="relative h-[460px] overflow-hidden rounded-panel border border-glow/45 bg-image">
          <Image
            src="/portrait.jpg"
            alt="Portrait of Jovanni Jungco"
            fill
            priority
            sizes="400px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
