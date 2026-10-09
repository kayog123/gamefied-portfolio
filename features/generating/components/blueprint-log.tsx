import { Panel } from '@/components/blueprint';
import type { LogLine } from '../hooks/use-blueprint-generation';

export type BlueprintLogProps = {
  logs: LogLine[];
  activeMessage: string;
  /** Shows only the first few lines, no timestamps (mobile card). */
  compact?: boolean;
  className?: string;
};

function Spinner() {
  return (
    <span
      className="inline-block size-3 shrink-0 rounded-full border-[1.5px] border-glow/30"
      style={{ borderTopColor: 'var(--color-glow)' }}
      aria-hidden
    />
  );
}

/** "BLUEPRINT.LOG" console (Sheet 02). */
export function BlueprintLog({ logs, activeMessage, compact = false, className }: BlueprintLogProps) {
  if (compact) {
    return (
      <div className={className}>
        <div className="flex flex-col gap-[7px] font-mono text-xs leading-[1.4]">
          {logs.slice(-2).map((log, i) => (
            <div key={i} className="flex justify-between gap-2.5">
              <span className="text-text">{log.message.trim()}</span>
              {log.ok && <span className="text-live">✓</span>}
            </div>
          ))}
          <div className="text-glow">{activeMessage} ▍</div>
        </div>
      </div>
    );
  }

  return (
    <Panel
      className={className}
      title="BLUEPRINT.LOG"
      action={
        <span className="flex items-center gap-2 font-mono text-[11px] tracking-label text-glow">
          <Spinner />
          RUNNING
        </span>
      }
      bodyClassName="flex flex-col gap-[9px] px-4 py-3.5 font-mono text-[13px] leading-[1.4]"
    >
      {logs.map((log, i) => (
        <div key={i} className="grid grid-cols-[52px_1fr_auto] gap-2.5">
          <span className="text-text-faint">{log.timestamp}</span>
          <span className={log.indent ? 'text-text' : 'text-text'}>{log.message}</span>
          <span className="text-live">{log.ok ? '✓' : ''}</span>
        </div>
      ))}
      <div className="grid grid-cols-[52px_1fr] gap-2.5">
        <span className="text-text-faint" />
        <span className="flex items-center gap-0.5 text-glow">
          {activeMessage}
          <span className="animate-caret-blink inline-block h-[15px] w-2 bg-glow" aria-hidden />
        </span>
      </div>
    </Panel>
  );
}
