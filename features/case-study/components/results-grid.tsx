import type { ResultMetric } from '@/content/case-studies';

/** "05 — Results" (Sheet 08). Metrics stay "[metric]" until real numbers exist. */
export function ResultsGrid({ results }: { results: ResultMetric[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {results.map((result, i) => (
        <div key={i} className="border-t-2 border-live bg-live/[0.05] p-5">
          <div className="font-display text-[34px] font-semibold text-muted">{result.metric}</div>
          <div className="mt-2 font-sans text-sm leading-[1.5] text-text-soft">{result.description}</div>
        </div>
      ))}
    </div>
  );
}
