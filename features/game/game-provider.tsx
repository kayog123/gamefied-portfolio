'use client';

import { createContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { GameState } from '@/types/blueprint';
import type { GameAction } from './game.types';
import { INITIAL_GAME_STATE } from './game.types';
import { gameReducer } from './game.reducer';

export const GameContext = createContext<GameState | null>(null);
export const GameDispatchContext = createContext<Dispatch<GameAction> | null>(null);

/** Holds the cross-screen game state (Sheets 01–06). Mount once, above the game shell. */
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);

  return (
    <GameContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>{children}</GameDispatchContext.Provider>
    </GameContext.Provider>
  );
}
