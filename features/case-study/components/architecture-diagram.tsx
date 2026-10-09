import type { ArchitectureStep } from '@/content/case-studies';
import { cn } from '@/lib/cn';

export type ArchitectureDiagramProps = {
  steps: ArchitectureStep[];
};

/**
 * The "FIG. 01" architecture figure (Sheet 08) — a horizontal flow on
 * desktop, a vertical one on mobile. One component covers every case study;
 * the original mockup's bespoke two-row branch for CODA is simplified to
 * this reusable flow (docs/design-system/03-layout-and-patterns.md#recurring-patterns).
 */
export function ArchitectureDiagram({ steps }: ArchitectureDiagramProps) {
  return (
    <div
      className="relative rounded-control border border-glow/40 bg-glass p-5 md:p-10"
      style={{
        backgroundImage: 'linear-gradient(rgb(59 130 246 / 0.1) 1px, transparent 1px), linear-gradient(90deg, rgb(59 130 246 / 0.1) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    >
      <div className="flex flex-col items-stretch md:flex-row md:flex-wrap md:items-center">
        {steps.map((step, i) => (
          <div key={step.name} className="flex flex-col items-center md:flex-1 md:flex-row">
            {i > 0 && <span className="h-4 w-px bg-glow md:h-px md:w-6 md:flex-none" aria-hidden />}
            <div
              className={cn(
                'w-full rounded-control border px-3.5 py-3 md:min-w-[150px]',
                step.accent ? 'border-live bg-live/[0.08]' : 'border-glow',
              )}
            >
              <div className="font-display text-sm font-semibold text-text-strong">{step.name}</div>
              <div className="mt-1 font-mono text-[11px] text-muted">{step.tech}</div>
            </div>
          </div>
        ))}
      </div>
      <span className="absolute bottom-2.5 right-3 font-mono text-[10px] tracking-label text-muted">FIG. 01 · SIMPLIFIED</span>
    </div>
  );
}
