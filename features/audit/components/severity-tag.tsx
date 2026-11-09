import { cn } from '@/lib/cn';
import type { Severity } from '@/types/audit';

export const SEVERITY_LABEL: Record<Severity, string> = { critical: 'CRITICAL', warning: 'WARNING', info: 'NOTICE' };

/** Only `critical` is coloured (danger). Warnings and notices stay neutral, because blue, amber and green mean build status. */
export function SeverityTag({ severity }: { severity: Severity }) {
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
