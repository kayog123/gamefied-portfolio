import 'server-only';
import type { Preset } from '@/content/presets';
import { matchClosestPreset } from '../generating.utils';

export type GenerateBlueprintResult = {
  preset: Preset;
};

/**
 * Turns a visitor's idea into a blueprint.
 *
 * TODO(docs/PACKAGES.md#open-decisions): wire a real AI provider here
 * (structured output validated with zod) once one is chosen. Until then —
 * and whenever that call fails — this falls back to the closest preset,
 * which is the resilience rule from docs/GOALS.md#quality-bar.
 */
export async function generateBlueprint(idea: string): Promise<GenerateBlueprintResult> {
  return { preset: matchClosestPreset(idea) };
}
