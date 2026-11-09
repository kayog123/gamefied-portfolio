'use client';

import { useState } from 'react';
import { CATEGORY_INFO } from '@/content/audit-page';
import { cn } from '@/lib/cn';
import type { AuditCategory, PreviewFinding, Severity } from '@/types/audit';
import { AUDIT_CATEGORIES } from '../audit.constants';
import { FindingRow } from './finding-row';

type Filter = 'all' | AuditCategory;

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

/** Failing checks only, most severe first; locked ones lead within a severity so the hook is seen early. */
function sortFailures(findings: PreviewFinding[]): PreviewFinding[] {
  return findings
    .filter((finding) => finding.status === 'fail')
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || Number(b.isLocked) - Number(a.isLocked));
}

export type FindingsListProps = { findings: PreviewFinding[]; passedCount: number };

/** Sheet 09 findings: category filter + expandable rows. */
export function FindingsList({ findings, passedCount }: FindingsListProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const failures = sortFailures(findings);
  const visible = filter === 'all' ? failures : failures.filter((finding) => finding.category === filter);
  const counts = {
    critical: failures.filter((f) => f.severity === 'critical').length,
    warning: failures.filter((f) => f.severity === 'warning').length,
    info: failures.filter((f) => f.severity === 'info').length,
  };

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: failures.length },
    ...AUDIT_CATEGORIES.map((category) => ({
      id: category,
      label: CATEGORY_INFO[category].label,
      count: failures.filter((f) => f.category === category).length,
    })),
  ];

  return (
    <section aria-labelledby="findings-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="findings-title" className="font-display text-2xl font-semibold text-text-strong">
          {failures.length === 0 ? 'Nothing to fix' : `${failures.length} ${failures.length === 1 ? 'thing' : 'things'} to improve`}
        </h2>
        <p className="flex gap-3.5 font-mono text-[11px] tracking-label text-muted">
          {counts.critical > 0 && <span className="text-danger-text">{counts.critical} CRITICAL</span>}
          <span>{counts.warning} WARNINGS</span>
          <span>{counts.info} NOTICES</span>
        </p>
      </div>

      <div role="group" aria-label="Filter findings" className="flex flex-wrap gap-1.5 border-b border-wire/20 pb-2.5">
        {filters.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={cn(
              'focus-blueprint h-[34px] rounded-control border px-3 font-sans text-[13px] font-medium',
              filter === id ? 'border-glow/60 bg-wire/20 text-text-strong' : 'border-transparent text-text-soft hover:text-text-strong',
            )}
          >
            {label} <span className={cn('font-mono', filter === id ? 'text-glow-soft' : 'text-muted')}>{count}</span>
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {visible.map((finding) => (
            <FindingRow
              key={finding.id}
              finding={finding}
              isExpanded={expandedId === finding.id}
              onToggle={() => setExpandedId((current) => (current === finding.id ? null : finding.id))}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-panel border border-wire/25 bg-glass p-4 font-sans text-sm text-text-soft">
          No issues in this category. Nice.
        </p>
      )}

      <p className="font-sans text-[13px] leading-[1.5] text-muted">
        {passedCount} {passedCount === 1 ? 'check' : 'checks'} passed. Passive checks only: one page load plus robots.txt, the sitemap and
        response headers.
      </p>
    </section>
  );
}
