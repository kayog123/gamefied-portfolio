import 'server-only';
import { z } from 'zod';
import type { FullAuditReport } from '../audit.types';

const severity = z.enum(['critical', 'warning', 'info']);
const category = z.enum(['seo', 'security', 'maintainability']);
const effort = z.enum(['quick', 'moderate', 'involved']);
const impact = z.enum(['high', 'medium', 'low']);

/**
 * What Grok must return. Deliberately plain (types, enums, required fields): xAI's strict mode doesn't accept
 * every JSON Schema keyword, so lengths and emptiness are enforced afterwards, in `buildReport`.
 */
export const aiAnalysisSchema = z.object({
  summary: z.string(),
  businessImpact: z.string(),
  plan: z.array(z.object({ findingId: z.string(), action: z.string(), effort, impact })),
});

export type AiAnalysis = z.infer<typeof aiAnalysisSchema>;

/** The schema sent to xAI, generated from the one above so the two can't drift apart. */
export function aiAnalysisJsonSchema(): Record<string, unknown> {
  const schema = z.toJSONSchema(aiAnalysisSchema) as Record<string, unknown>;
  delete schema.$schema;
  return schema;
}

const fullFinding = z.object({
  id: z.string(),
  category,
  title: z.string(),
  severity,
  tier: z.enum(['open', 'locked']),
  why: z.string(),
  fix: z.string(),
  status: z.enum(['pass', 'fail']),
  evidence: z.string().optional(),
  isLocked: z.boolean(),
});

const storedReportSchema = z.object({
  generatedAt: z.string(),
  model: z.string().nullable(),
  result: z.object({
    url: z.string(),
    finalUrl: z.string(),
    auditedAt: z.string(),
    scores: z.object({ seo: z.number(), security: z.number(), maintainability: z.number() }),
    counts: z.object({ critical: z.number(), warning: z.number(), info: z.number() }),
    findings: z.array(fullFinding),
  }),
  headline: z.string(),
  lead: z.string(),
  ai: z.object({ summary: z.string(), businessImpact: z.string() }).nullable(),
  plan: z.array(z.object({ findingId: z.string(), action: z.string(), effort: effort.nullable(), impact })),
});

/** Reads a stored report. It can be edited in Studio, so anything that isn't exactly a report becomes `null`. */
export function parseReportJson(json: unknown): FullAuditReport | null {
  if (typeof json !== 'string') return null;
  try {
    const parsed = storedReportSchema.safeParse(JSON.parse(json));
    return parsed.success ? (parsed.data as FullAuditReport) : null;
  } catch {
    return null;
  }
}
