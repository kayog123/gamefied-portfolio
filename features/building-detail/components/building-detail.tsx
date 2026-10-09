'use client';

import { useGame } from '@/features/game';
import { useIsDesktop } from '@/hooks/use-media-query';
import { DetailPanel } from './detail-panel';
import { DetailSheet } from './detail-sheet';

/**
 * Sheet 04 — the building detail panel/sheet. Renders nothing when no
 * building's panel is open; mount once near the top of the HUD.
 */
export function BuildingDetail() {
  const [{ blueprint, panelBuildingId }, dispatch] = useGame();
  const isDesktop = useIsDesktop();

  const index = blueprint?.features.findIndex((f) => f.id === panelBuildingId) ?? -1;
  const feature = index >= 0 ? blueprint?.features[index] : undefined;
  if (!blueprint || !feature) return null;

  const onClose = () => dispatch({ type: 'BUILDING_PANEL_CLOSED' });
  const onPowerUp = () => dispatch({ type: 'MINI_GAME_STARTED', id: feature.id });
  const onAutoBuild = () => dispatch({ type: 'BUILDING_WENT_LIVE', id: feature.id });

  if (isDesktop) {
    return (
      <>
        <DetailPanel
          feature={feature}
          index={index}
          total={blueprint.features.length}
          onClose={onClose}
          onPowerUp={onPowerUp}
          onAutoBuild={onAutoBuild}
        />
        <div className="absolute bottom-7 left-8 z-50 flex items-center gap-2.5 font-mono text-[11px] tracking-label text-muted">
          <span className="rounded-tag border border-muted/40 px-[7px] py-1">ESC</span>
          CLOSE PANEL
        </div>
      </>
    );
  }

  return <DetailSheet feature={feature} onClose={onClose} onPowerUp={onPowerUp} onAutoBuild={onAutoBuild} />;
}
