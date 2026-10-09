'use client';

import { useEffect, useRef, useState } from 'react';
import { Panel, SkillShard } from '@/components/blueprint';

export type SkillShardTrayProps = {
  shards: string[];
  collectedCount: number;
  className?: string;
};

/** "SKILL SHARDS · N/8 COLLECTED" tray (Sheet 03). The latest one pops in as "new". */
export function SkillShardTray({ shards, collectedCount, className }: SkillShardTrayProps) {
  const [justCollectedIndex, setJustCollectedIndex] = useState<number | null>(null);
  const previousCount = useRef(collectedCount);

  useEffect(() => {
    if (collectedCount > previousCount.current) {
      const index = collectedCount - 1;
      setJustCollectedIndex(index);
      const timeout = window.setTimeout(() => setJustCollectedIndex(null), 1200);
      previousCount.current = collectedCount;
      return () => window.clearTimeout(timeout);
    }
    previousCount.current = collectedCount;
  }, [collectedCount]);

  return (
    <Panel
      className={className}
      bodyClassName="p-3.5"
      title={`SKILL SHARDS · ${collectedCount}/${shards.length} COLLECTED`}
      action={<span className="font-mono text-[11px] tracking-label text-glow">+1 PER BUILDING</span>}
    >
      <div className="flex flex-wrap gap-2 px-4 pb-3.5 pt-3">
        {shards.map((name, index) => (
          <SkillShard
            key={name}
            name={name}
            state={index === justCollectedIndex ? 'new' : index < collectedCount ? 'collected' : 'locked'}
          />
        ))}
      </div>
    </Panel>
  );
}
