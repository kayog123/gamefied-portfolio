import { Fragment } from 'react';
import type { StackRow } from '@/types/blueprint';

export function BriefStackTable({ stack }: { stack: StackRow[] }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-label text-glow">SUGGESTED STACK</div>
      <div className="mt-2 grid grid-cols-[64px_1fr] gap-x-2.5 gap-y-1.5 font-mono text-xs">
        {stack.map((row) => (
          <Fragment key={row.k}>
            <span className="text-muted">{row.k}</span>
            <span className="text-text">{row.v}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
