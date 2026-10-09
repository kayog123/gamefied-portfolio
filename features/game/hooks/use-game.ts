import { use } from 'react';
import type { GameState } from '@/types/blueprint';
import type { GameAction } from '../game.types';
import { GameContext, GameDispatchContext } from '../game-provider';

/** Reads game state and dispatch from the nearest <GameProvider>. */
export function useGame(): [GameState, (action: GameAction) => void] {
  const state = use(GameContext);
  const dispatch = use(GameDispatchContext);

  if (!state || !dispatch) {
    throw new Error('useGame must be used within a <GameProvider>.');
  }

  return [state, dispatch];
}
