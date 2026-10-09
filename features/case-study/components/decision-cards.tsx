import type { Decision } from '@/content/case-studies';

/** "03 — Key decisions & trade-offs" (Sheet 08). */
export function DecisionCards({ decisions }: { decisions: Decision[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {decisions.map((decision) => (
        <div key={decision.title} className="flex flex-col gap-3 rounded-panel border border-wire/30 bg-glass-strong p-5">
          <span className="font-display text-lg font-semibold leading-[1.25] text-text-strong">{decision.title}</span>
          <span className="font-sans text-sm leading-[1.55] text-text-soft">{decision.why}</span>
          <span className="border-t border-dashed border-cta/40 pt-3 font-sans text-[13px] leading-[1.5] text-muted">
            <span className="font-mono text-[10px] tracking-label text-cta">TRADE-OFF </span>
            {decision.cost}
          </span>
        </div>
      ))}
    </div>
  );
}
