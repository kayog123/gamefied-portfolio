import 'server-only';
import type { AuditResult, FullFinding, Severity } from '@/types/audit';
import { buildSummary } from '../audit.summary';
import type { FixImpact, FixPlanItem, FullAuditReport } from '../audit.types';
import type { AiAnalysis } from './report-schema';

const MAX_PROSE = 1200;
const MAX_ACTION = 400;

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
const IMPACT_BY_SEVERITY: Record<Severity, FixImpact> = { critical: 'high', warning: 'medium', info: 'low' };

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

/** Failing findings, most severe first, otherwise in the catalog's own order. */
export function failingFindings(result: AuditResult): FullFinding[] {
  return result.findings
    .map((finding, index) => ({ finding, index }))
    .filter(({ finding }) => finding.status === 'fail')
    .sort((a, b) => SEVERITY_RANK[a.finding.severity] - SEVERITY_RANK[b.finding.severity] || a.index - b.index)
    .map(({ finding }) => finding);
}

/** No AI: the catalog's own fix text, most severe first, with the impact implied by the severity. */
function deterministicPlan(failing: FullFinding[]): FixPlanItem[] {
  return failing.map((finding) => ({ findingId: finding.id, action: finding.fix, effort: null, impact: IMPACT_BY_SEVERITY[finding.severity] }));
}

/**
 * Keeps the AI's order but only what is real: unknown ids and repeats are dropped, text is capped, and
 * a critical finding the model left out is added at the end, because a report must never lose a critical issue.
 */
function aiPlan(plan: AiAnalysis['plan'], failing: FullFinding[]): FixPlanItem[] {
  const known = new Map(failing.map((finding) => [finding.id, finding]));
  const seen = new Set<string>();
  const items: FixPlanItem[] = [];

  for (const item of plan) {
    if (!known.has(item.findingId) || seen.has(item.findingId)) continue;
    const action = truncate(item.action, MAX_ACTION);
    if (!action) continue;
    seen.add(item.findingId);
    items.push({ findingId: item.findingId, action, effort: item.effort, impact: item.impact });
  }

  for (const finding of failing) {
    if (finding.severity === 'critical' && !seen.has(finding.id)) {
      items.push({ findingId: finding.id, action: finding.fix, effort: null, impact: 'high' });
    }
  }
  return items.length > 0 ? items : deterministicPlan(failing);
}

/**
 * Assembles the delivered report from the full results and, if it worked, Grok's analysis. Without usable AI
 * (`ai` is null, or its prose is empty) the report is the deterministic one: same findings, the standard
 * summary from `buildSummary`, and the catalog's fixes. The AI can only add prose and reorder the plan; it
 * cannot add, remove or change a finding.
 */
export function buildReport({ result, ai, model, now }: { result: AuditResult; ai: AiAnalysis | null; model: string | null; now: Date }): FullAuditReport {
  const { headline, lead } = buildSummary(result);
  const failing = failingFindings(result);

  const summary = ai ? truncate(ai.summary, MAX_PROSE) : '';
  const businessImpact = ai ? truncate(ai.businessImpact, MAX_PROSE) : '';
  const usable = ai !== null && summary !== '' && businessImpact !== '';

  return {
    generatedAt: now.toISOString(),
    model: usable ? model : null,
    result,
    headline,
    lead,
    ai: usable ? { summary, businessImpact } : null,
    plan: usable && ai ? aiPlan(ai.plan, failing) : deterministicPlan(failing),
  };
}
