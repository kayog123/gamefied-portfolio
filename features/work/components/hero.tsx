import { Button, DimensionLine } from '@/components/blueprint';

/** Sheet 07 hero: eyebrow, headline, lead, CTAs, portrait frame (desktop only). */
export function Hero() {
  return (
    <section className="grid grid-cols-1 items-end gap-10 border-b border-grid px-5 pb-10 pt-12 md:grid-cols-[1fr_400px] md:gap-16 md:px-12 md:pb-[88px] md:pt-24">
      <div>
        <div className="font-mono text-[11px] tracking-eyebrow text-glow md:text-xs">
          JOVANNI JUNGCO — FULL-STACK &amp; AI ENGINEER
        </div>
        <h1 className="mt-3.5 text-balance font-display text-5xl font-semibold leading-[1] tracking-display text-text-strong md:mt-[22px] md:text-[96px] md:leading-[0.98] md:tracking-[-0.04em]">
          Your idea →
          <br />
          Live product.
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
        <DimensionLine label="400" className="mb-2" />
        <div
          className="grid h-[460px] place-items-center rounded-panel border border-glow/45 font-mono text-xs text-muted"
          style={{ background: 'repeating-linear-gradient(135deg, rgb(59 130 246 / 0.08) 0 10px, transparent 10px 20px), rgba(15,25,45,.8)' }}
        >
          portrait photo
        </div>
      </div>
    </section>
  );
}
