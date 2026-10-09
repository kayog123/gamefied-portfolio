'use client';

import { Play } from 'lucide-react';
import { Button, SegmentedProgress } from '@/components/blueprint';
import { BuildingDetail } from '@/features/building-detail';
import { CityScene } from '@/features/city';
import { GameTopBar } from '@/components/layout/top-bar';
import { useBuildProgress, useGame } from '@/features/game';
import { MiniGameOverlay } from '@/features/mini-game';
import { useIsDesktop } from '@/hooks/use-media-query';
import type { BuildingId } from '@/types/blueprint';
import { useAutoBuild } from '../hooks/use-auto-build';
import { useLinkedHover } from '../hooks/use-linked-hover';
import { FeaturesPanel } from './features-panel';
import { MobileBottomSheet } from './mobile-bottom-sheet';
import { MobileFeatureChips } from './mobile-feature-chips';
import { MobileProjectCard } from './mobile-project-card';
import { ProjectIntro } from './project-intro';
import { SkillShardTray } from './skill-shard-tray';

/** Sheet 03 — Blueprint City: the main HUD. */
export function HudScreen() {
  const [{ blueprint }, dispatch] = useGame();
  const isDesktop = useIsDesktop();
  const progress = useBuildProgress();
  const autoBuild = useAutoBuild();

  const featureIds = blueprint?.features.map((f) => f.id) ?? [];
  const openPanel = (id: BuildingId) => dispatch({ type: 'BUILDING_PANEL_OPENED', id });
  // `id` here is already `activeId` (Enter only fires on the currently-active building).
  const { activeId, setActive } = useLinkedHover(featureIds, openPanel);

  if (!blueprint) return null;

  const canAutoBuild = !progress.isComplete && !autoBuild.isRunning;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <CityScene
        mode="progress"
        scale={isDesktop ? 1.12 : 0.55}
        x={isDesktop ? -60 : 0}
        y={isDesktop ? 0 : -70}
        labels={isDesktop}
        features={blueprint.features}
        activeBuildingId={activeId}
        onBuildingHover={setActive}
        onBuildingSelect={openPanel}
      />

      <GameTopBar
        context={blueprint.projectName}
        center={<SegmentedProgress segments={progress.segments} />}
        mobileLeft={
          <span className="font-mono text-xs text-glow">
            {progress.percent}% · {progress.liveCount}/{progress.totalCount}
          </span>
        }
      />

      <BuildingDetail />
      <MiniGameOverlay />

      {/* Desktop: floating panels, positioned against the full canvas (see docs/design-system/03-layout-and-patterns.md#hud-layout). */}
      <div className="hidden md:contents">
        <ProjectIntro
          projectName={blueprint.projectName}
          summary={blueprint.summary}
          onEditIdea={() => dispatch({ type: 'IDEA_EDITED' })}
          className="absolute left-8 top-24 z-30 w-[380px]"
        />

        <FeaturesPanel
          features={blueprint.features}
          activeId={activeId}
          onHover={setActive}
          onSelect={openPanel}
          className="absolute right-6 top-[88px] z-30 w-[300px]"
        />

        <SkillShardTray
          shards={blueprint.shards}
          collectedCount={progress.collectedShardCount}
          className="absolute bottom-7 left-8 z-30 w-[600px]"
        />

        <div className="absolute bottom-7 right-6 z-30 flex items-center gap-2.5">
          <Button href="/work" variant="ghost" size="sm">
            Skip to my work
          </Button>
          <Button onClick={autoBuild.start} disabled={!canAutoBuild} iconRight={<Play className="size-3.5" aria-hidden />}>
            Auto-build
          </Button>
        </div>
      </div>

      {/* Mobile: stacked below the top bar, ending in the bottom sheet (Sheet 03b). */}
      <div className="flex flex-1 flex-col justify-between overflow-hidden md:hidden">
        <div className="relative z-30 p-4">
          <MobileProjectCard projectName={blueprint.projectName} segments={progress.segments} />
        </div>

        <div className="relative z-30 flex flex-col gap-3 pb-3">
          <MobileFeatureChips features={blueprint.features} activeId={activeId} onSelect={openPanel} />
          <MobileBottomSheet
            shards={blueprint.shards}
            collectedCount={progress.collectedShardCount}
            onAutoBuild={autoBuild.start}
            autoBuildDisabled={!canAutoBuild}
          />
        </div>
      </div>
    </div>
  );
}
