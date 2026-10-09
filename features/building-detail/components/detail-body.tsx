import { ProofCard } from '@/components/blueprint';
import type { Feature } from '@/types/blueprint';

export type DetailBodyProps = {
  feature: Feature;
  compact?: boolean;
};

/** The why + suggested tech + proof content (the panel's scrollable body). */
export function DetailBody({ feature, compact = false }: DetailBodyProps) {
  return (
    <div className="flex flex-col gap-5.5">
      <div>
        {!compact && <div className="font-mono text-[11px] tracking-label text-glow">WHY YOUR PROJECT NEEDS THIS</div>}
        <p className={compact ? 'font-sans text-sm leading-[1.55] text-text-soft' : 'mt-2 text-pretty font-sans text-[15px] leading-[1.6] text-text-soft'}>
          {feature.detail.why}
        </p>
      </div>

      <div>
        {!compact && <div className="font-mono text-[11px] tracking-label text-glow">SUGGESTED TECH</div>}
        <div className={compact ? 'flex flex-wrap gap-1.5' : 'mt-2.5 flex flex-wrap gap-1.5'}>
          {feature.detail.suggestedTech.map((tech) => (
            <span
              key={tech}
              className="rounded-control border border-glow/50 bg-wire/10 px-2.5 py-[5px] font-mono text-xs text-glow-pale"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <ProofCard {...feature.detail.proof} compact={compact} />
    </div>
  );
}
