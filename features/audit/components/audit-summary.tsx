import { Calendar, Mail } from 'lucide-react';
import { Button } from '@/components/blueprint';
import { CATEGORY_INFO } from '@/content/audit-page';
import { cn } from '@/lib/cn';
import { BOOK_A_CALL_URL, SOCIAL_LINKS } from '@/lib/site';
import type { AuditSummary, SummaryCard } from '../audit.summary';

const LEVEL_STYLE: Record<SummaryCard['level'], { border: string; label: string }> = {
  attention: { border: 'border-danger/35', label: 'text-danger-text' },
  fair: { border: 'border-muted/35', label: 'text-text-soft' },
  good: { border: 'border-wire/30', label: 'text-glow-soft' },
};

export type AuditSummaryProps = { summary: AuditSummary; domain: string };

/**
 * "What this means for you": plain-English verdict above the findings, for non-technical visitors.
 * Both contact buttons are amber on purpose: an audit-page exception to "one amber button per view"
 * (docs/design-system/04-screens.md, Sheet 09).
 */
export function AuditSummarySection({ summary, domain }: AuditSummaryProps) {
  const emailHref = `mailto:${SOCIAL_LINKS.email}?subject=${encodeURIComponent(`My audit results for ${domain}`)}`;

  return (
    <section aria-labelledby="summary-title" className="panel-ticks flex flex-col gap-5 p-5 md:gap-[22px] md:p-7">
      <div className="flex max-w-[820px] flex-col gap-2.5">
        <p className="font-mono text-[11px] font-medium tracking-eyebrow text-glow">WHAT THIS MEANS FOR YOU</p>
        <h2 id="summary-title" className="text-balance font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-text-strong md:text-3xl md:leading-[1.12]">
          {summary.headline}
        </h2>
        <p className="text-pretty font-sans text-sm leading-[1.6] text-text-soft md:text-base">{summary.lead}</p>
      </div>

      <ul className="grid gap-3 md:grid-cols-3 md:gap-4">
        {summary.cards.map((card) => (
          <li key={card.category} className={cn('flex flex-col gap-2 rounded-panel border bg-glass p-4 md:p-[18px]', LEVEL_STYLE[card.level].border)}>
            <p className={cn('font-mono text-[10px] tracking-label', LEVEL_STYLE[card.level].label)}>
              {CATEGORY_INFO[card.category].label.toUpperCase()} · {card.levelLabel}
            </p>
            <h3 className="font-display text-lg font-semibold text-text-strong">{card.title}</h3>
            <p className="font-sans text-sm leading-[1.55] text-text-soft">{card.body}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-wire/20 pt-[18px]">
        <p className="max-w-[560px] font-sans text-[15px] leading-[1.5] text-text-soft">
          Not sure what to fix first, or what it would take? I&apos;ll walk you through these results in plain language. No jargon, no
          obligation.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Button href={emailHref} variant="secondary" iconLeft={<Mail className="size-4" aria-hidden />}>
            Email me about these results
          </Button>
          <Button href={BOOK_A_CALL_URL} iconLeft={<Calendar className="size-4" aria-hidden />}>
            Book a call to walk through it
          </Button>
        </div>
      </div>
    </section>
  );
}
