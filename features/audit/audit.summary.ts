import { LEVEL_LABEL, SUMMARY_CARDS, VERDICT_PHRASE, type ScoreLevel } from '@/content/audit-page';
import type { AuditCategory, AuditPreview } from '@/types/audit';
import { AUDIT_CATEGORIES } from './audit.constants';

export type SummaryCard = {
  category: AuditCategory;
  level: ScoreLevel;
  levelLabel: string;
  title: string;
  body: string;
};

export type AuditSummary = {
  headline: string;
  lead: string;
  cards: SummaryCard[];
};

export function scoreLevel(score: number): ScoreLevel {
  if (score >= 80) return 'good';
  if (score >= 50) return 'fair';
  return 'attention';
}

/**
 * The "What this means for you" copy (docs/AUDIT.md). Picked by code from the scores and counts,
 * with no AI, so the free scan stays free. It only uses scores and counts, so it can never leak a
 * locked finding.
 */
export function buildSummary(preview: Pick<AuditPreview, 'scores' | 'counts'>): AuditSummary {
  const cards = AUDIT_CATEGORIES.map((category): SummaryCard => {
    const level = scoreLevel(preview.scores[category]);
    return { category, level, levelLabel: LEVEL_LABEL[level], ...SUMMARY_CARDS[category][level] };
  });

  const strong = cards.filter((card) => card.level === 'good').map((card) => VERDICT_PHRASE[card.category].strong);
  const weak = cards.filter((card) => card.level !== 'good').map((card) => VERDICT_PHRASE[card.category].weak);

  let headline: string;
  if (weak.length === 0) headline = 'Your site is in good shape, with only small improvements left.';
  else if (strong.length === 0) headline = `Your site ${joinPhrases(weak)}.`;
  else headline = `Your site ${joinPhrases(strong)}, but it ${joinPhrases(weak)}.`;

  const { critical, warning } = preview.counts;
  const urgency =
    critical > 0
      ? ` ${critical === 1 ? 'One issue is' : `${critical} issues are`} marked critical and should come first.`
      : warning > 0
        ? ''
        : ' Only minor notices remain.';
  const lead = `None of these issues will break your site today. They quietly cost you visitors, trust and enquiries, which is why they are worth fixing.${urgency}`;

  return { headline, lead, cards };
}

/** "a", "a and b", "a, b and c". */
function joinPhrases(phrases: string[]): string {
  if (phrases.length <= 1) return phrases[0] ?? '';
  return `${phrases.slice(0, -1).join(', ')} and ${phrases[phrases.length - 1]}`;
}
