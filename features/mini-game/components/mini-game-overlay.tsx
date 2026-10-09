'use client';

import { useState } from 'react';
import { GameModal } from '@/components/blueprint';
import { useGame } from '@/features/game';
import { useIsDesktop } from '@/hooks/use-media-query';
import { STOCK_SHARDS } from '@/content/presets';
import type { Blueprint, BuildingId } from '@/types/blueprint';
import type { GameAction } from '@/features/game';
import { useWireGame } from '../hooks/use-wire-game';
import { MiniGamePlaying } from './mini-game-playing';
import { MiniGameSuccess } from './mini-game-success';

type Result = { wiredSeconds: number | null; shardIndex: number };

/**
 * Sheet 05 — the "Wire the API" mini-game modal. Renders nothing when no
 * building's mini-game is open; mount once near the top of the HUD.
 */
export function MiniGameOverlay() {
  const [{ blueprint, miniGameBuildingId }, dispatch] = useGame();
  const isDesktop = useIsDesktop();

  if (!blueprint || !miniGameBuildingId) return null;
  const feature = blueprint.features.find((f) => f.id === miniGameBuildingId);
  if (!feature) return null;

  // Keyed by building id so every new mini-game starts with fresh local state
  // (https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes),
  // rather than resetting it in an Effect.
  return (
    <MiniGameSession
      key={miniGameBuildingId}
      buildingId={miniGameBuildingId}
      buildingName={feature.name}
      blueprint={blueprint}
      isDesktop={isDesktop}
      dispatch={dispatch}
    />
  );
}

function MiniGameSession({
  buildingId,
  buildingName,
  blueprint,
  isDesktop,
  dispatch,
}: {
  buildingId: BuildingId;
  buildingName: string;
  blueprint: Blueprint;
  isDesktop: boolean;
  dispatch: (action: GameAction) => void;
}) {
  const [result, setResult] = useState<Result | null>(null);

  function complete(wiredSeconds: number | null) {
    const shardIndex = blueprint.features.filter((f) => f.status === 'live').length;
    setResult({ wiredSeconds, shardIndex });
    dispatch({ type: 'BUILDING_WENT_LIVE', id: buildingId });
  }

  const game = useWireGame({
    onWin: (wiredSeconds) => complete(wiredSeconds),
    onTimeout: () => complete(null),
  });

  function handleSkip() {
    complete(null);
    dispatch({ type: 'MINI_GAME_CLOSED' });
  }

  const nextFeature = result ? blueprint.features.find((f) => f.id !== buildingId && f.status !== 'live') : undefined;

  function handleNext() {
    if (nextFeature) dispatch({ type: 'BUILDING_PANEL_OPENED', id: nextFeature.id });
    dispatch({ type: 'MINI_GAME_CLOSED' });
  }

  return (
    <GameModal tone={result ? 'success' : 'default'} aria-label={`Wire the API — ${buildingName}`}>
      {result ? (
        <MiniGameSuccess
          buildingName={buildingName}
          wiredSeconds={result.wiredSeconds}
          shardName={blueprint.shards[result.shardIndex] ?? STOCK_SHARDS[STOCK_SHARDS.length - 1]}
          nextBuildingName={nextFeature?.name}
          onBackToCity={() => dispatch({ type: 'MINI_GAME_CLOSED' })}
          onNext={handleNext}
        />
      ) : (
        <MiniGamePlaying buildingName={buildingName} isDesktop={isDesktop} game={game} onSkip={handleSkip} />
      )}
    </GameModal>
  );
}
