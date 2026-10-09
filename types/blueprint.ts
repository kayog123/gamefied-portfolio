/**
 * Shared domain types for the Blueprint experience (Sheets 01–06).
 * See docs/design-system/03-layout-and-patterns.md and 04-screens.md.
 */

/** The five building archetypes every generated project is drawn from. */
export type BuildingId = 'auth' | 'pay' | 'ai' | 'shop' | 'notif';

/** Build status, shared by status tags, progress segments and the City scene. */
export type BuildStatus = 'blueprint' | 'building' | 'live';

/** The City scene's visual mode (docs/design-system/03-layout-and-patterns.md#the-city-scene). */
export type CityMode = 'wire' | 'drawing' | 'progress' | 'lit';

/** A shipped case study offered as proof for a building (Sheet 04). */
export type ProofCase = {
  /** e.g. "CASE 02". */
  caseNo: string;
  title: string;
  problem: string;
  stack: string[];
  /** Case-study link. Points at the placeholder `/work/[slug]` until Blueprint 3 ships. */
  href: string;
};

/** The detail-panel content for one feature (Sheet 04). */
export type FeatureDetail = {
  why: string;
  suggestedTech: string[];
  proof: ProofCase;
};

/** One feature/building in a generated blueprint. */
export type Feature = {
  id: BuildingId;
  /** Full display name, e.g. "Auth Tower". */
  name: string;
  /** Short label for mobile chips, e.g. "Auth". */
  short: string;
  subtitle: string;
  /** Lucide icon name. */
  icon: string;
  status: BuildStatus;
  /** Build percent while status is "building" (0–100). */
  percent?: number;
  detail: FeatureDetail;
};

/** One phase of a blueprint's roadmap (Sheet 06 brief). */
export type RoadmapPhase = {
  phase: string;
  items: string;
};

/** One key/value row of a blueprint's suggested stack (Sheet 06 brief). */
export type StackRow = {
  k: string;
  v: string;
};

/** A generated (or preset-fallback) project blueprint. */
export type Blueprint = {
  projectName: string;
  summary: string;
  features: Feature[];
  /** Default skill-shard set, in collection order. */
  shards: string[];
  roadmap: RoadmapPhase[];
  stackTable: StackRow[];
};

export type GamePhase = 'spark' | 'generating' | 'hud' | 'launch';

export type GameState = {
  phase: GamePhase;
  /** The visitor's typed idea (kept across Cancel / Edit idea). */
  idea: string;
  blueprint: Blueprint | null;
  /** Building currently hovered, keyboard-focused or selected — linked both ways with the City scene. */
  activeBuildingId: BuildingId | null;
  /** The building whose detail panel/sheet is open (Sheet 04). `null` = closed. */
  panelBuildingId: BuildingId | null;
  /** The building whose mini-game modal is open (Sheet 05). `null` = closed. */
  miniGameBuildingId: BuildingId | null;
};
