import { cn } from '@/lib/cn';

export type TitleBlockProps = {
  cells: { k: string; v: string }[];
  className?: string;
};

/** Drafting title block, e.g. PROJECT · DRAWN BY · SCALE · SHEET. Decorative. */
export function TitleBlock({ cells, className }: TitleBlockProps) {
  return (
    <div
      aria-hidden
      className={cn('grid border border-wire/40 font-mono text-[10px] tracking-label', className)}
      style={{ gridTemplateColumns: `repeat(${cells.length}, auto)`, background: 'rgb(11 18 32 / 0.7)' }}
    >
      {cells.map((cell, i) => (
        <div key={cell.k} className={cn('px-3.5 py-2', i < cells.length - 1 && 'border-r border-wire/30')}>
          <div className="text-muted">{cell.k}</div>
          <div className="mt-1 text-[11px] text-text">{cell.v}</div>
        </div>
      ))}
    </div>
  );
}
