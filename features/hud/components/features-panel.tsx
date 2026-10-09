'use client';

import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useState } from 'react';
import { Panel } from '@/components/blueprint';
import { ICONS } from '@/lib/icons';
import type { BuildingId, Feature } from '@/types/blueprint';
import { cn } from '@/lib/cn';
import { FeatureRow } from './feature-row';

export type FeaturesPanelProps = {
  features: Feature[];
  activeId: BuildingId | null;
  onHover: (id: BuildingId | null) => void;
  onSelect: (id: BuildingId) => void;
  className?: string;
};

/** The HUD's Features list (Sheet 03) — collapses to a 48px icon rail. */
export function FeaturesPanel({ features, activeId, onHover, onSelect, className }: FeaturesPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const liveCount = features.filter((f) => f.status === 'live').length;

  if (collapsed) {
    return (
      <div className={cn('flex w-12 flex-col items-center gap-2 rounded-panel border border-glow/30 bg-glass py-3 backdrop-blur-[14px]', className)}>
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expand features panel"
          className="focus-blueprint flex size-7 items-center justify-center rounded-control border border-glow/30 text-muted"
        >
          <PanelRightOpen className="size-3.5" aria-hidden />
        </button>
        {features.map((feature) => {
          const Icon = ICONS[feature.icon];
          return (
            <button
              key={feature.id}
              type="button"
              onMouseEnter={() => onHover(feature.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(feature.id)}
              aria-label={feature.name}
              className={cn(
                'focus-blueprint flex size-9 items-center justify-center rounded-control border text-glow',
                activeId === feature.id ? 'border-glow bg-wire/14' : 'border-glow/35',
              )}
            >
              {Icon && <Icon className="size-4" aria-hidden />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Panel
      className={className}
      title={`FEATURES · ${liveCount}/${features.length} LIVE`}
      footer={<div className="px-4 pb-3.5">↑↓ NAVIGATE · ↵ INSPECT</div>}
      bodyClassName="flex flex-col gap-1 p-2"
      action={
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse features panel"
          className="focus-blueprint flex size-7 items-center justify-center rounded-control border border-glow/30 text-muted"
        >
          <PanelRightClose className="size-3.5" aria-hidden />
        </button>
      }
    >
      {features.map((feature) => (
        <FeatureRow
          key={feature.id}
          feature={feature}
          active={activeId === feature.id}
          onHover={() => onHover(feature.id)}
          onLeave={() => onHover(null)}
          onSelect={() => onSelect(feature.id)}
        />
      ))}
    </Panel>
  );
}
