import { ChevronDown, Info, Lock, TriangleAlert } from 'lucide-react';
import { CATEGORY_INFO } from '@/content/audit-page';
import { cn } from '@/lib/cn';
import type { PreviewFinding, Severity } from '@/types/audit';

const SEVERITY_LABEL: Record<Severity, string> = { critical: 'CRITICAL', warning: 'WARNING', info: 'NOTICE' };

function SeverityTag({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        'rounded-tag px-1.5 py-0.5 font-mono text-[10px] tracking-label',
        severity === 'critical' ? 'border border-danger/40 bg-danger/12 text-danger-text' : 'border border-muted/40 text-text-soft',
      )}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export type FindingRowProps = {
  finding: PreviewFinding;
  isExpanded: boolean;
  onToggle: () => void;
};

/**
 * One failing check. Open findings expand to "why it matters / how to fix"; locked ones show only
 * the title and severity (the details never reach the browser, see `toPreview`).
 */
export function FindingRow({ finding, isExpanded, onToggle }: FindingRowProps) {
  const category = CATEGORY_INFO[finding.category].label.toUpperCase();

  if (finding.isLocked) {
    return (
      <li className="flex items-start gap-3.5 rounded-panel border border-wire/25 bg-glass px-4 py-3.5">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-control border border-glow/35 text-glow-soft" aria-hidden>
          <Lock className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h3 className="font-display text-base font-semibold text-text-strong">{finding.title}</h3>
            <SeverityTag severity={finding.severity} />
            <span className="font-mono text-[10px] tracking-label text-glow-soft">LOCKED · {category}</span>
          </div>
          <div className="flex flex-col gap-1.5" aria-hidden>
            <div className="h-2 w-[72%] rounded-[2px] bg-muted/15" />
            <div className="h-2 w-[48%] rounded-[2px] bg-muted/10" />
          </div>
          <p className="font-sans text-[13px] text-muted">The cause and the fix are part of the full audit.</p>
        </div>
      </li>
    );
  }

  const detailsId = `finding-${finding.id}`;
  return (
    <li className="rounded-panel border border-wire/25 bg-glass">
      <h3>
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          onClick={onToggle}
          className="focus-blueprint flex w-full items-center gap-3.5 rounded-panel px-4 py-3.5 text-left"
        >
          <span className="grid size-[34px] shrink-0 place-items-center rounded-control border border-muted/35 text-text-soft" aria-hidden>
            {finding.severity === 'info' ? <Info className="size-4 text-muted" /> : <TriangleAlert className="size-4" />}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="font-display text-base font-semibold text-text-strong">{finding.title}</span>
              <span className="font-mono text-[10px] tracking-label text-muted">
                {SEVERITY_LABEL[finding.severity]} · {category}
              </span>
            </span>
            {finding.evidence && <span className="font-mono text-xs text-text-soft">{finding.evidence}</span>}
          </span>
          <ChevronDown className={cn('size-[18px] shrink-0 text-muted motion-safe:transition-transform', isExpanded && 'rotate-180 text-glow-soft')} aria-hidden />
        </button>
      </h3>
      {isExpanded && (
        <div id={detailsId} className="grid gap-5 px-4 pb-[18px] md:grid-cols-2 md:gap-6 md:pl-[64px]">
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-[10px] tracking-eyebrow text-glow">WHY IT MATTERS</p>
            <p className="text-pretty font-sans text-sm leading-[1.55] text-text-soft">{finding.why}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-[10px] tracking-eyebrow text-glow">HOW TO FIX</p>
            <p className="text-pretty font-sans text-sm leading-[1.55] text-text-soft">{finding.fix}</p>
          </div>
        </div>
      )}
    </li>
  );
}
