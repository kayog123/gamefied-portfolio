'use client';

import type { ReactNode } from 'react';
import { useTypeOnView } from '@/hooks/use-type-on-view';

export type TypeOnViewProps = {
  /** Text to type. Use `\n` for a line break. */
  text: string;
  charMs?: number;
  className?: string;
};

function withBreaks(value: string): ReactNode[] {
  return value.split('\n').flatMap((line, i) => (i === 0 ? [line] : [<br key={i} />, line]));
}

/**
 * Types its text out once when scrolled into view. Goes inside a heading: the
 * heading keeps the full text for screen readers and crawlers, and the not-yet-typed
 * part is invisible (not removed), so the layout never reflows while typing.
 */
export function TypeOnView({ text, charMs, className }: TypeOnViewProps) {
  const { ref, count, pending, isDone } = useTypeOnView<HTMLSpanElement>({ length: text.length, charMs });

  return (
    <span ref={ref} data-type-pending={pending || undefined} className={className}>
      <span className="sr-only">{text.replace(/\n/g, ' ')}</span>
      <span aria-hidden>
        {withBreaks(text.slice(0, count))}
        {!pending && !isDone && (
          <span className="relative inline-block h-[0.82em] w-0 align-baseline">
            <span className="absolute inset-y-0 left-[0.05em] w-[0.06em] bg-glow" />
          </span>
        )}
        <span className="invisible">{withBreaks(text.slice(count))}</span>
      </span>
    </span>
  );
}
