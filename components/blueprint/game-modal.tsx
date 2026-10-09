'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useFocusReturn } from '@/hooks/use-focus-return';
import { cn } from '@/lib/cn';

export type GameModalProps = {
  /** Switches the border/glow from blue to green (Sheet 05 success state). */
  tone?: 'default' | 'success';
  onDismiss?: () => void;
  'aria-label': string;
  children: ReactNode;
  className?: string;
};

/** Mini-game modal shell (Sheet 00 / Sheet 05) — scrim, four-corner ticks, blur. */
export function GameModal({ tone = 'default', onDismiss, children, className, ...aria }: GameModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusReturn(true);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!onDismiss) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss?.();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  const color = tone === 'success' ? '#22c55e' : '#60a5fa';
  const tickLayers = [
    ['0 0', '12px 1px'],
    ['0 0', '1px 12px'],
    ['100% 0', '12px 1px'],
    ['100% 0', '1px 12px'],
    ['0 100%', '12px 1px'],
    ['0 100%', '1px 12px'],
    ['100% 100%', '12px 1px'],
    ['100% 100%', '1px 12px'],
  ]
    .map(([pos, size]) => `linear-gradient(${color},${color}) ${pos} / ${size} no-repeat`)
    .join(', ');

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4" style={{ background: 'rgb(5 9 18 / 0.62)' }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal
        aria-label={aria['aria-label']}
        tabIndex={-1}
        className={cn('w-full max-w-[620px] rounded-modal backdrop-blur-[18px] focus:outline-none', className)}
        style={{
          border: `1px solid ${color}${tone === 'success' ? '99' : '8c'}`,
          background: `${tickLayers}, rgb(11 18 32 / 0.92)`,
          boxShadow:
            tone === 'success'
              ? '0 30px 80px rgb(0 0 0 / 0.5), 0 0 70px rgb(34 197 94 / 0.18)'
              : '0 30px 80px rgb(0 0 0 / 0.5), 0 0 60px rgb(59 130 246 / 0.15)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
