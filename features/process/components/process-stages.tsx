import { RevealOnView } from '@/components/reveal-on-view';
import { PROCESS_STAGES, type ProcessStage } from '@/content/process';

function StageList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] tracking-label text-glow-soft uppercase">{title}</h4>
      <ul className="mt-2 flex flex-col gap-1.5 font-sans text-sm leading-[1.5] text-text-soft">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rotate-45 border border-glow/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stage({ stage, index }: { stage: ProcessStage; index: number }) {
  return (
    <RevealOnView
      delayMs={index * 80}
      className="grid grid-cols-[24px_1fr] gap-4 pb-10 md:grid-cols-[72px_24px_1fr]"
    >
      <span className="hidden font-mono text-sm text-glow md:block">{stage.step}</span>
      <span className="flex flex-col items-center" aria-hidden>
        <span className="reveal-pop mt-1.5 size-2.5 rotate-45 border-[1.5px] border-glow bg-navy" />
        <span className="reveal-line mt-1.5 w-px flex-1 bg-wire/40" />
      </span>
      <article id={stage.id} className="scroll-mt-24">
        <div className="font-mono text-xs tracking-label text-muted">
          <span className="md:hidden">{stage.step} · </span>
          TYPICAL TIME · {stage.duration}
        </div>
        <h3 className="mt-1.5 font-display text-2xl font-semibold tracking-[-0.02em] text-text-strong md:text-[32px]">
          {stage.title}
        </h3>
        <p className="mt-2.5 max-w-[680px] text-pretty font-sans text-[15px] leading-[1.6] text-muted md:text-base">
          {stage.summary}
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <StageList title="What I need from you" items={stage.fromYou} />
          <StageList title="What you get" items={stage.fromMe} />
        </div>
      </article>
    </RevealOnView>
  );
}

/** The seven-stage timeline: the primary content of `/process`. */
export function ProcessStages() {
  return (
    <section id="stages" aria-labelledby="stages-heading" className="border-b border-grid px-5 py-12 md:px-12 md:py-20">
      <h2 id="stages-heading" className="font-display text-[28px] font-semibold tracking-[-0.02em] text-text-strong md:text-[44px]">
        The seven stages
      </h2>
      <div className="mt-8 md:mt-12">
        {PROCESS_STAGES.map((stage, i) => (
          <Stage key={stage.id} stage={stage} index={i} />
        ))}
      </div>
    </section>
  );
}
