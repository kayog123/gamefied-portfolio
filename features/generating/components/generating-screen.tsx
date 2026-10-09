'use client';

import { CityScene, BUILDING_LAYOUT } from '@/features/city';
import { DimensionLine } from '@/components/blueprint';
import { GameTopBar } from '@/components/layout/top-bar';
import { useGame } from '@/features/game';
import { useIsDesktop } from '@/hooks/use-media-query';
import { useBlueprintGeneration } from '../hooks/use-blueprint-generation';
import { BlueprintLog } from './blueprint-log';
import { GenerationProgress } from './generation-progress';

const AUTH_TOWER = BUILDING_LAYOUT.find((b) => b.id === 'auth')!;

/** Sheet 02 — Generating: parses the idea into a blueprint, 3–6s. */
export function GeneratingScreen() {
  const [{ idea }, dispatch] = useGame();
  const isDesktop = useIsDesktop();
  const { logs, percent, activeMessage } = useBlueprintGeneration({
    idea,
    onComplete: (blueprint) => dispatch({ type: 'BLUEPRINT_READY', blueprint }),
  });

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <CityScene mode="drawing" scale={isDesktop ? 1.15 : 0.52} y={isDesktop ? 0 : -150} interactive={false} />

      <GameTopBar context="BLUEPRINT" />

      <div className="pointer-events-none absolute left-1/2 top-[70px] hidden -translate-x-1/2 items-center gap-3 rounded-control border border-glow/35 bg-navy/75 px-4 py-2.5 backdrop-blur-[12px] md:flex">
        <span className="font-mono text-[10px] tracking-label text-glow">YOUR IDEA</span>
        <span className="h-3.5 w-px bg-glow/40" aria-hidden />
        <span className="max-w-[560px] truncate font-sans text-[15px] text-text">“{idea}”</span>
      </div>

      <div className="relative flex flex-1 flex-col justify-end gap-4 p-5 md:hidden">
        <div className="rounded-xl border border-glow/35 bg-navy/[0.88] p-4 backdrop-blur-[14px]">
          <div className="font-sans text-sm text-text-soft">“{idea}”</div>
          <div className="mt-3.5 flex items-baseline justify-between">
            <span className="font-mono text-[36px] font-semibold leading-none text-text-strong">
              {percent}
              <span className="text-lg text-glow">%</span>
            </span>
            <span className="font-mono text-[10px] tracking-label text-muted">DRAFTING BLUEPRINT</span>
          </div>
          <div className="mt-2.5 h-1 rounded-tag bg-grid">
            <div className="h-full rounded-tag bg-glow" style={{ width: `${percent}%`, boxShadow: '0 0 10px var(--color-glow)' }} />
          </div>
          <div className="mt-3.5 border-t border-glow/20 pt-3">
            <BlueprintLog logs={logs} activeMessage={activeMessage} compact />
          </div>
        </div>
      </div>

      <div className="relative hidden flex-1 md:block">
        <BlueprintLog logs={logs} activeMessage={activeMessage} className="absolute bottom-8 left-8 w-[500px]" />
        <GenerationProgress
          percent={percent}
          onCancel={() => dispatch({ type: 'GENERATION_CANCELLED' })}
          className="absolute bottom-8 right-8 w-[300px]"
        />
        <DimensionLine
          orientation="vertical"
          label={`H ${AUTH_TOWER.h} · AUTH TOWER`}
          className="absolute right-8 top-[240px] h-[194px]"
        />
      </div>
    </div>
  );
}
