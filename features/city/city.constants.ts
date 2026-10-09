import type { BuildingId } from '@/types/blueprint';

export type BuildingLayout = {
  id: BuildingId;
  /** The City scene's own (shorter) label — see docs/design-system/03-layout-and-patterns.md#the-city-scene. */
  name: string;
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  /** oklch hue used once the building is live. */
  hue: number;
};

/** Default building layout, in plane coordinates (City.dc.html `feats`). */
export const BUILDING_LAYOUT: BuildingLayout[] = [
  { id: 'auth', name: 'Auth Tower', x: 40, y: 50, w: 70, d: 70, h: 210, hue: 255 },
  { id: 'pay', name: 'Payments Bank', x: 180, y: 30, w: 120, d: 80, h: 100, hue: 160 },
  { id: 'ai', name: 'AI Brain', x: 170, y: 180, w: 100, d: 100, h: 150, hue: 300 },
  { id: 'shop', name: 'Marketplace', x: 30, y: 220, w: 90, d: 120, h: 56, hue: 75 },
  { id: 'notif', name: 'Notifications', x: 330, y: 200, w: 40, d: 40, h: 250, hue: 25 },
];

export type SceneryBlock = { x: number; y: number; w: number; d: number; h: number };

/** Filler blocks that round out the city. */
export const SCENERY: SceneryBlock[] = [
  { x: 330, y: 40, w: 70, d: 60, h: 40 },
  { x: 320, y: 300, w: 80, d: 70, h: 30 },
  { x: 170, y: 330, w: 100, d: 70, h: 22 },
  { x: 30, y: 370, w: 70, d: 40, h: 34 },
  { x: 345, y: 120, w: 40, d: 40, h: 70 },
];

/** The 440×440 ground plane's rotation (docs/03-layout-and-patterns.md#projection). */
export const PLANE_TRANSFORM = 'rotateX(60deg) rotateZ(-45deg)';
export const PLANE_SIZE = 440;
