import 'server-only';
import { generateStructured } from '@/lib/ai/xai';
import { MIN_AI_BUDGET_MS, REPORT_LINK_TTL_SECONDS, REPORT_RUN_BUDGET_MS } from '../audit.constants';
import { getAuditRequest, saveReport, saveReportFailure } from './audit-store';
import { buildReport } from './build-report';
import { buildFullAuditUserPrompt, FULL_AUDIT_SYSTEM_PROMPT } from './full-audit-prompt';
import { aiAnalysisJsonSchema, aiAnalysisSchema, type AiAnalysis } from './report-schema';
import { runAuditUncached } from './run-audit';

/**
 * Runs the full audit for one request and stores the result (docs/AUDIT.md#full-audit-phase-4), after
 * `claimReportRun` has taken the lock. Fresh checks first (never the cached free scan), then Grok with whatever
 * time is left. If Grok is missing, slow, rejected or off-schema, the report is the deterministic one: same
 * findings, so the visitor never waits on, or loses a report to, the AI. It never throws; failures are recorded
 * on the request so the review page can show them and offer a re-run.
 */
export async function generateFullReport(requestId: string, now: () => number = Date.now): Promise<void> {
  const startedAt = now();
  try {
    const request = await getAuditRequest(requestId);
    if (!request) return;

    const outcome = await runAuditUncached(request.url);
    if (!outcome.ok) {
      await saveReportFailure(requestId, `The site couldn’t be audited right now: ${outcome.message}`);
      return;
    }

    let ai: AiAnalysis | null = null;
    let model: string | null = null;
    let tokensUsed: number | null = null;

    const remainingMs = REPORT_RUN_BUDGET_MS - (now() - startedAt);
    if (remainingMs >= MIN_AI_BUDGET_MS) {
      const answer = await generateStructured({
        schema: aiAnalysisSchema,
        jsonSchema: aiAnalysisJsonSchema(),
        name: 'audit_analysis',
        system: FULL_AUDIT_SYSTEM_PROMPT,
        user: buildFullAuditUserPrompt(outcome.result),
        timeoutMs: remainingMs,
      });
      if (answer.ok) {
        ai = answer.data;
        model = answer.model;
        tokensUsed = answer.tokensUsed;
      } else {
        console.error(`[audit] AI analysis unavailable for ${requestId}: ${answer.reason}. Using the deterministic report.`);
      }
    } else {
      console.error(`[audit] only ${Math.round(remainingMs / 1000)}s left for ${requestId}, skipping the AI. Using the deterministic report.`);
    }

    const report = buildReport({ result: outcome.result, ai, model, now: new Date(now()) });
    await saveReport(requestId, {
      report,
      usedAi: report.ai !== null,
      // Spent even if the prose turned out unusable.
      tokensUsed,
      expiresAt: new Date(now() + REPORT_LINK_TTL_SECONDS * 1000).toISOString(),
    });
  } catch (error) {
    console.error(`[audit] full audit failed for ${requestId}`, error);
    try {
      await saveReportFailure(requestId, 'Something went wrong while generating the report. Try again.');
    } catch (saveError) {
      console.error(`[audit] could not record the failure for ${requestId}`, saveError);
    }
  }
}
