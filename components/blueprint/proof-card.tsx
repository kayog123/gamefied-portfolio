import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { Panel } from './panel';

export type ProofCardProps = {
  caseNo: string;
  title: string;
  problem: string;
  stack: string[];
  href: string;
  /** Overrides the placeholder architecture-thumbnail label. */
  thumb?: string;
  compact?: boolean;
  className?: string;
};

/** "Built this before ✓" card (Sheet 00) — links a feature to a shipped case study. */
export function ProofCard({ caseNo, title, problem, stack, href, thumb = 'arch thumb', compact = false, className }: ProofCardProps) {
  return (
    <Panel tone="green" className={className} bodyClassName={compact ? 'p-3.5' : 'p-4'}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-label text-live-text">
          <BadgeCheck className="size-3.5" aria-hidden />
          BUILT THIS BEFORE ✓
        </span>
        <span className="font-mono text-[10px] text-muted">{caseNo}</span>
      </div>

      <div className={compact ? 'mt-3' : 'mt-3 grid grid-cols-[1fr_120px] gap-3.5 md:grid-cols-[1fr_132px]'}>
        <div>
          <div className="font-display text-lg font-semibold text-text-strong">{title}</div>
          <p className="mt-1.5 font-sans text-[13px] leading-[1.5] text-muted">{problem}</p>
        </div>
        {!compact && (
          <div
            className="relative hidden h-[78px] items-center justify-center rounded-control border border-glow/35 font-mono text-[9px] text-muted md:flex"
            style={{ background: 'repeating-linear-gradient(135deg, rgb(59 130 246 / 0.08) 0 6px, transparent 6px 12px)' }}
          >
            {thumb}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-[5px]">
        {stack.map((tech) => (
          <span key={tech} className="rounded-tag border border-muted/35 px-2 py-[3px] font-mono text-[11px] text-text-soft">
            {tech}
          </span>
        ))}
      </div>

      <Link href={href} className="focus-blueprint mt-3 inline-flex font-sans text-[13px] font-medium text-glow">
        Read case study →
      </Link>
    </Panel>
  );
}
