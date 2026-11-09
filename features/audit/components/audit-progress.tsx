import { cn } from '@/lib/cn';

const STEPS = [
  { from: 0, label: 'Checking the address is a public website' },
  { from: 15, label: 'Loading the page over HTTPS' },
  { from: 40, label: 'Reading robots.txt, the sitemap and response headers' },
  { from: 65, label: 'Running 30 checks' },
];

export type AuditProgressProps = { domain: string; progress: number };

/** Sheet 09 "scanning" state: estimated progress + a step log. Announced politely to screen readers. */
export function AuditProgress({ domain, progress }: AuditProgressProps) {
  const current = STEPS.filter((step) => progress >= step.from).length - 1;

  return (
    <div role="status" aria-live="polite" className="panel-ticks flex max-w-[680px] flex-col gap-3.5 p-5 md:p-[22px]">
      <div className="flex items-end justify-between gap-4">
        <p className="font-mono text-5xl font-semibold leading-none tracking-[-0.04em] text-text-strong md:text-[56px]">
          {progress}
          <span className="text-[22px] text-glow">%</span>
        </p>
        <p className="font-mono text-[11px] tracking-label text-muted">AUDITING {domain.toUpperCase()}</p>
      </div>
      <div className="h-1 rounded-full bg-grid" aria-hidden>
        <div className="h-1 rounded-full bg-glow shadow-[0_0_12px_var(--color-glow)] motion-safe:transition-[width] motion-safe:duration-200" style={{ width: `${progress}%` }} />
      </div>
      <ol className="flex flex-col gap-1.5 font-mono text-[13px] leading-[1.4]">
        {STEPS.map((step, index) => (
          <li key={step.label} className={cn(index < current ? 'text-text-soft' : index === current ? 'text-text-strong' : 'text-muted')}>
            <span className={index <= current ? 'text-glow' : undefined} aria-hidden>
              {index < current ? '✓' : '›'}
            </span>{' '}
            {step.label}
            {index === current ? '…' : ''}
          </li>
        ))}
      </ol>
      <p className="font-sans text-xs text-muted">Usually takes about 10 seconds. Progress is an estimate.</p>
    </div>
  );
}
