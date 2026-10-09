import type { GameState } from '@/types/blueprint';
import type { GameAction } from './game.types';
import { INITIAL_GAME_STATE } from './game.types';

/**
 * Pure reducer for the cross-screen game state (Sheets 01–06).
 * Kept framework-free and side-effect-free so it's trivial to unit test.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'IDEA_SUBMITTED':
      return { ...state, phase: 'generating', idea: action.idea };

    case 'BLUEPRINT_READY':
      return {
        ...state,
        phase: 'hud',
        blueprint: action.blueprint,
        activeBuildingId: null,
        panelBuildingId: null,
        miniGameBuildingId: null,
      };

    case 'GENERATION_CANCELLED':
      // Sheet 02: "Cancel returns to 01" — the idea text is kept so it isn't lost.
      return { ...state, phase: 'spark' };

    case 'IDEA_EDITED':
      // Sheet 03 "✎ EDIT IDEA" — back to Spark, idea prefilled, blueprint kept
      // until a new one is generated.
      return { ...state, phase: 'spark' };

    case 'BUILDING_ACTIVATED':
      return state.activeBuildingId === action.id ? state : { ...state, activeBuildingId: action.id };

    case 'BUILDING_PANEL_OPENED':
      return { ...state, panelBuildingId: action.id, activeBuildingId: action.id };

    case 'BUILDING_PANEL_CLOSED':
      return { ...state, panelBuildingId: null };

    case 'MINI_GAME_STARTED':
      // Sheet 04 "Power it up" replaces the detail panel with the game modal.
      return { ...state, panelBuildingId: null, miniGameBuildingId: action.id };

    case 'MINI_GAME_CLOSED': {
      const allLive = state.blueprint?.features.every((f) => f.status === 'live') ?? false;
      return { ...state, miniGameBuildingId: null, phase: allLive ? 'launch' : state.phase };
    }

    case 'BUILDING_WENT_LIVE': {
      if (!state.blueprint) return state;
      const features = state.blueprint.features.map((feature) =>
        feature.id === action.id ? { ...feature, status: 'live' as const, percent: undefined } : feature,
      );
      const allLive = features.every((f) => f.status === 'live');
      return {
        ...state,
        blueprint: { ...state.blueprint, features },
        // All live hands off to Launch once the mini-game's own success
        // screen is dismissed (it stays open to show "+1 SKILL SHARD").
        phase: allLive && state.miniGameBuildingId !== action.id ? 'launch' : state.phase,
        // The detail panel's "Auto-build this →" skips straight past any
        // success screen, so it's safe to close here. The mini-game modal
        // closes itself (MINI_GAME_CLOSED) once its success screen is dismissed.
        panelBuildingId: state.panelBuildingId === action.id ? null : state.panelBuildingId,
      };
    }

    case 'RESET':
      return INITIAL_GAME_STATE;

    default:
      return state;
  }
}
