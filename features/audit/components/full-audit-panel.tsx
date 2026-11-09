import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/blueprint';
import { SOCIAL_LINKS } from '@/lib/site';

export type FullAuditPanelProps = { domain: string; lockedCount: number; hasCritical: boolean };

const BENEFITS = [
  'The cause and exact fix for every locked finding',
  'A prioritized fix plan with effort estimates',
  'What each issue costs you in plain English: traffic, trust, leads',
  'Reviewed by me before it reaches you',
];

/**
 * The upsell: what the full audit adds and the one request button.
 * TODO(docs/AUDIT.md#phases): Phase 3 replaces this mailto with the request form + review flow.
 */
export function FullAuditPanel({ domain, lockedCount, hasCritical }: FullAuditPanelProps) {
  const requestHref = `mailto:${SOCIAL_LINKS.email}?subject=${encodeURIComponent(`Full audit request: ${domain}`)}`;
  const heading =
    lockedCount === 0
      ? 'Want a deeper look?'
      : `${lockedCount} ${lockedCount === 1 ? 'finding is' : 'findings are'} locked${hasCritical ? ', including a critical issue' : ''}`;

  return (
    <aside aria-label="Full audit" className="panel-ticks flex flex-col gap-3.5 p-5 md:p-6">
      <p className="font-mono text-[11px] font-medium tracking-eyebrow text-glow">FULL AUDIT</p>
      <h2 className="text-balance font-display text-2xl font-semibold leading-[1.1] tracking-[-0.02em] text-text-strong md:text-[26px]">
        {heading}
      </h2>
      <ul className="flex flex-col gap-2.5 font-sans text-sm leading-[1.45] text-text-soft">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex gap-2.5">
            <span className="mt-1.5 size-[7px] shrink-0 rotate-45 border-[1.5px] border-glow" aria-hidden />
            {benefit}
          </li>
        ))}
      </ul>
      <Button href={requestHref} size="lg" className="mt-1" iconRight={<ArrowRight className="size-[18px]" aria-hidden />}>
        Get the full audit
      </Button>
      <p className="font-sans text-xs leading-[1.5] text-muted">
        Free. I reply within [X business days]. Your email is used only for this audit. No newsletters.
      </p>
    </aside>
  );
}
