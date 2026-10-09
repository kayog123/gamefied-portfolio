import type { BuildingId, Blueprint, GameState } from '@/types/blueprint';

export type GameAction =
  | { type: 'IDEA_SUBMITTED'; idea: string }
  | { type: 'BLUEPRINT_READY'; blueprint: Blueprint }
  | { type: 'GENERATION_CANCELLED' }
  | { type: 'IDEA_EDITED' }
  | { type: 'BUILDING_ACTIVATED'; id: BuildingId | null }
  | { type: 'BUILDING_PANEL_OPENED'; id: BuildingId }
  | { type: 'BUILDING_PANEL_CLOSED' }
  | { type: 'MINI_GAME_STARTED'; id: BuildingId }
  | { type: 'MINI_GAME_CLOSED' }
  | { type: 'BUILDING_WENT_LIVE'; id: BuildingId }
  | { type: 'RESET' };

export const INITIAL_GAME_STATE: GameState = {
  phase: 'spark',
  idea: '',
  blueprint: null,
  activeBuildingId: null,
  panelBuildingId: null,
  miniGameBuildingId: null,
};
