import 'server-only';
import { z } from 'zod';
import type { AuditPreview } from '@/types/audit';

const severity = z.enum(['critical', 'warning', 'info']);
const category = z.enum(['seo', 'security', 'maintainability']);
const status = z.enum(['pass', 'fail']);

/**
 * A locked finding keeps only its title and severity. zod drops unknown keys, so even if a stored
 * document somehow carried `why`, `fix` or `evidence` for a locked finding, parsing removes them.
 */
const lockedFinding = z.object({ id: z.string(), category, title: z.string(), severity, status, isLocked: z.literal(true) });

const openFinding = z.object({
  id: z.string(),
  category,
  title: z.string(),
  severity,
  tier: z.enum(['open', 'locked']),
  why: z.string(),
  fix: z.string(),
  status,
  evidence: z.string().optional(),
  isLocked: z.literal(false),
});

const auditPreviewSchema = z.object({
  url: z.string(),
  finalUrl: z.string(),
  auditedAt: z.string(),
  scores: z.object({ seo: z.number(), security: z.number(), maintainability: z.number() }),
  counts: z.object({ critical: z.number(), warning: z.number(), info: z.number() }),
  findings: z.array(z.union([lockedFinding, openFinding])),
});

/**
 * Reads a stored preview. Snapshots can be edited in Studio, so nothing from the store is trusted:
 * anything that isn't exactly a preview becomes `null` (and the page shows not-found).
 */
export function parsePreviewJson(json: unknown): AuditPreview | null {
  if (typeof json !== 'string') return null;
  try {
    const parsed = auditPreviewSchema.safeParse(JSON.parse(json));
    return parsed.success ? (parsed.data as AuditPreview) : null;
  } catch {
    return null;
  }
}
