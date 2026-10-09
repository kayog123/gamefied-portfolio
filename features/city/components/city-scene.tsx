'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { BuildingId, BuildStatus, CityMode, Feature } from '@/types/blueprint';
import { BUILDING_LAYOUT, PLANE_SIZE, PLANE_TRANSFORM, SCENERY, type BuildingLayout, type SceneryBlock } from '../city.constants';
import { BuildingLabel } from './building-label';

type FaceKind = 'back' | 'right' | 'left' | 'front' | 'top';
type FaceStatus = BuildStatus | 'scenery';

export type CitySceneProps = {
  mode?: CityMode;
  /** Camera zoom, 0.3–2. */
  scale?: number;
  /** Camera offset in px. */
  x?: number;
  y?: number;
  /** The building to highlight — linked both ways with the Features list (Sheet 03). */
  activeBuildingId?: BuildingId | null;
  /** Shows a passive label on every building, not just the active one. */
  labels?: boolean;
  /** Drives "progress" mode. Ignored for wire/drawing (forced blueprint) and lit (forced live). */
  features?: Pick<Feature, 'id' | 'status' | 'percent'>[];
  /** Hover/click handled only by pointer users — the Features list is the keyboard path. */
  interactive?: boolean;
  onBuildingHover?: (id: BuildingId | null) => void;
  onBuildingSelect?: (id: BuildingId) => void;
  className?: string;
};

function resolveStatus(
  mode: CityMode,
  id: BuildingId,
  features?: Pick<Feature, 'id' | 'status' | 'percent'>[],
): { status: BuildStatus; percent?: number } {
  if (mode === 'lit') return { status: 'live' };
  if (mode === 'wire' || mode === 'drawing') return { status: 'blueprint' };
  const feature = features?.find((f) => f.id === id);
  return feature ? { status: feature.status, percent: feature.percent } : { status: 'blueprint' };
}

function faceStyle(
  status: FaceStatus,
  hue: number,
  kind: FaceKind,
  mode: CityMode,
  { dim, focused, percent }: { dim: boolean; focused: boolean; percent?: number },
): CSSProperties {
  let style: CSSProperties;

  if (status === 'live') {
    const lightness = { top: 0.82, front: 0.64, left: 0.5, back: 0.56, right: 0.56 }[kind];
    let background = `oklch(${lightness} 0.13 ${hue})`;
    if (kind === 'front') {
      background = `repeating-linear-gradient(180deg, transparent 0 11px, rgb(255 238 200 / 0.6) 11px 14px), ${background}`;
    }
    if (kind === 'left') {
      background = `repeating-linear-gradient(90deg, transparent 0 11px, rgb(255 238 200 / 0.45) 11px 14px), ${background}`;
    }
    style = { background, border: '1px solid rgb(255 255 255 / 0.22)' };
  } else if (status === 'scenery') {
    style =
      mode === 'lit'
        ? {
            background:
              kind === 'top'
                ? '#2a3b57'
                : kind === 'front'
                  ? 'repeating-linear-gradient(180deg, transparent 0 9px, rgb(253 224 140 / 0.35) 9px 11px), #1c2a42'
                  : '#16223a',
            border: '1px solid rgb(148 163 184 / 0.25)',
          }
        : { background: 'rgb(59 130 246 / 0.035)', border: '1px solid rgb(59 130 246 / 0.38)' };
  } else if (status === 'building') {
    const p = percent ?? 50;
    const fill =
      kind === 'front'
        ? `linear-gradient(180deg, rgb(245 158 11 / 0.6) 0 ${p}%, rgb(245 158 11 / 0.06) ${p}%)`
        : kind === 'left'
          ? `linear-gradient(90deg, rgb(245 158 11 / 0.45) 0 ${p}%, rgb(245 158 11 / 0.05) ${p}%)`
          : 'rgb(245 158 11 / 0.07)';
    style = { background: fill, border: '1px dashed #f59e0b' };
  } else {
    style = {
      background:
        kind === 'top'
          ? 'repeating-linear-gradient(45deg, rgb(96 165 250 / 0.28) 0 1px, transparent 1px 8px), rgb(59 130 246 / 0.1)'
          : 'rgb(59 130 246 / 0.07)',
      border: `1px ${mode === 'drawing' ? 'dashed' : 'solid'} rgb(96 165 250 / 0.95)`,
    };
  }

  if (dim) style.opacity = 0.3;
  if (focused) {
    style.boxShadow = '0 0 22px rgb(96 165 250 / 0.85), inset 0 0 12px rgb(96 165 250 / 0.4)';
    style.border = '1px solid #bfdbfe';
  }

  return { position: 'absolute', boxSizing: 'border-box', ...style };
}

function Face({
  kind,
  geometry,
  status,
  hue,
  mode,
  dim,
  focused,
  percent,
}: {
  kind: FaceKind;
  geometry: CSSProperties;
  status: FaceStatus;
  hue: number;
  mode: CityMode;
  dim: boolean;
  focused: boolean;
  percent?: number;
}) {
  return <div style={{ ...faceStyle(status, hue, kind, mode, { dim, focused, percent }), ...geometry }} />;
}

function Box({
  block,
  status,
  hue,
  mode,
  dim,
  focused,
  percent,
  label,
  onMouseEnter,
  onMouseLeave,
  onClick,
  interactive,
}: {
  block: { x: number; y: number; w: number; d: number; h: number };
  status: FaceStatus;
  hue: number;
  mode: CityMode;
  dim: boolean;
  focused: boolean;
  percent?: number;
  label?: ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const { w, d, h } = block;
  const faceProps = { status, hue, mode, dim, focused, percent };

  return (
    <div
      className={interactive && onClick ? 'cursor-pointer pointer-events-auto' : undefined}
      style={{ position: 'absolute', left: block.x, top: block.y, width: w, height: d, transformStyle: 'preserve-3d' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <Face kind="back" geometry={{ left: 0, top: 0, width: w, height: h, transformOrigin: '0 0', transform: 'rotateX(90deg)' }} {...faceProps} />
      <Face kind="right" geometry={{ left: w, top: 0, width: h, height: d, transformOrigin: '0 0', transform: 'rotateY(-90deg)' }} {...faceProps} />
      <Face kind="left" geometry={{ left: 0, top: 0, width: h, height: d, transformOrigin: '0 0', transform: 'rotateY(-90deg)' }} {...faceProps} />
      <Face kind="front" geometry={{ left: 0, top: d, width: w, height: h, transformOrigin: '0 0', transform: 'rotateX(90deg)' }} {...faceProps} />
      <Face kind="top" geometry={{ left: 0, top: 0, width: w, height: d, transform: `translateZ(${h}px)` }} {...faceProps} />
      {label && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 0,
            height: 0,
            transformStyle: 'preserve-3d',
            transform: `translateZ(${h}px) rotateZ(45deg) rotateX(-60deg)`,
          }}
        >
          <div style={{ position: 'absolute', left: 0, bottom: 0, transform: 'translateX(-50%)' }}>{label}</div>
        </div>
      )}
    </div>
  );
}

/**
 * The shared isometric City scene (docs/design-system/03-layout-and-patterns.md#the-city-scene).
 * A controlled, presentational component — callers (Spark/Generating/HUD) own all state.
 */
export function CityScene({
  mode = 'progress',
  scale = 1,
  x = 0,
  y = 0,
  activeBuildingId = null,
  labels = false,
  features,
  interactive = true,
  onBuildingHover,
  onBuildingSelect,
  className,
}: CitySceneProps) {
  const isLit = mode === 'lit';

  return (
    <div className={className} aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ transform: `translate(${x}px, ${y + 120 * scale}px) scale(${scale})`, transformStyle: 'preserve-3d' }}>
        <div
          style={{
            position: 'relative',
            width: PLANE_SIZE,
            height: PLANE_SIZE,
            transformStyle: 'preserve-3d',
            transform: PLANE_TRANSFORM,
            border: '1px solid rgb(59 130 246 / 0.45)',
            backgroundColor: isLit ? 'rgb(30 58 95 / 0.45)' : 'rgb(11 18 32 / 0.4)',
            backgroundImage: `${
              isLit
                ? 'radial-gradient(circle at 50% 50%, rgb(245 158 11 / 0.22), transparent 65%),'
                : 'radial-gradient(circle at 50% 50%, rgb(59 130 246 / 0.18), transparent 70%),'
            } linear-gradient(rgb(59 130 246 / 0.22) 1px, transparent 1px), linear-gradient(90deg, rgb(59 130 246 / 0.22) 1px, transparent 1px), linear-gradient(90deg, transparent 145px, rgb(96 165 250 / 0.35) 145px 147px, transparent 147px 157px, rgb(96 165 250 / 0.35) 157px 159px, transparent 159px), linear-gradient(transparent 145px, rgb(96 165 250 / 0.35) 145px 147px, transparent 147px 157px, rgb(96 165 250 / 0.35) 157px 159px, transparent 159px)`,
            backgroundSize: '100% 100%, 20px 20px, 20px 20px, 100% 100%, 100% 100%',
          }}
        >
          {SCENERY.map((block: SceneryBlock, i) => (
            <Box key={`scenery-${i}`} block={block} status="scenery" hue={250} mode={mode} dim={mode === 'drawing' && i > 1} focused={false} />
          ))}

          {BUILDING_LAYOUT.map((building: BuildingLayout, i) => {
            const { status, percent } = resolveStatus(mode, building.id, features);
            const isFocused = activeBuildingId === building.id;
            const showLabel = (labels || isFocused) && mode !== 'drawing';

            return (
              <Box
                key={building.id}
                block={building}
                status={status}
                hue={building.hue}
                mode={mode}
                dim={mode === 'drawing' && i > 2}
                focused={isFocused}
                percent={percent}
                interactive={interactive}
                onMouseEnter={interactive ? () => onBuildingHover?.(building.id) : undefined}
                onMouseLeave={interactive ? () => onBuildingHover?.(null) : undefined}
                onClick={interactive ? () => onBuildingSelect?.(building.id) : undefined}
                label={
                  showLabel ? (
                    <BuildingLabel name={building.name} status={status} percent={percent} variant={isFocused ? 'card' : 'label'} />
                  ) : undefined
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
