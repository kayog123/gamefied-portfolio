import { cn } from '@/lib/cn';

export type SkillShardState = 'collected' | 'locked' | 'new';

export type SkillShardProps = {
  name: string;
  state: SkillShardState;
  className?: string;
};

/** Collectible tech badge (Sheet 00). "+1 PER BUILDING". */
export function SkillShard({ name, state, className }: SkillShardProps) {
  const isNew = state === 'new';
  const isLocked = state === 'locked';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-[7px] whitespace-nowrap rounded-control border font-mono font-medium',
        isNew
          ? 'animate-shard-pop border-glow bg-wire/25 px-[13px] py-2 text-[13px] text-white'
          : isLocked
            ? 'border-dashed border-muted/40 px-2.5 py-1.5 text-xs text-muted'
            : 'border-glow/70 bg-wire/16 px-2.5 py-1.5 text-xs text-glow-pale',
        className,
      )}
      style={
        isNew
          ? { boxShadow: '0 0 24px rgb(59 130 246 / 0.6)' }
          : !isLocked
            ? { boxShadow: '0 0 12px rgb(59 130 246 / 0.3)' }
            : undefined
      }
    >
      <span
        className={cn('size-[7px] rotate-45', isLocked ? 'border border-current' : 'bg-current')}
        style={isNew ? { color: 'var(--color-glow-pale)' } : undefined}
        aria-hidden
      />
      {name}
      {isNew && <span className="text-[10px] text-cta">+1</span>}
    </span>
  );
}
