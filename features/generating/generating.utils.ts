import { PRESETS, type Preset } from '@/content/presets';

/**
 * Matches a visitor's idea to the closest preset by keyword overlap.
 * Pure and secret-free, so it's safe to run on either side:
 *  - the server route (`app/api/blueprint/route.ts`) uses it today, and will
 *    keep using it as a fallback once a real AI call is wired in (see
 *    docs/PACKAGES.md#open-decisions);
 *  - the client hook (`use-blueprint-generation.ts`) uses it if that route
 *    can't be reached at all, so generation never dead-ends.
 */
export function matchClosestPreset(idea: string): Preset {
  const words = idea
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  if (words.length === 0) return PRESETS[0];

  let best = PRESETS[0];
  let bestScore = -1;

  for (const preset of PRESETS) {
    const score = preset.keywords.reduce((total, keyword) => (words.includes(keyword) ? total + 1 : total), 0);
    if (score > bestScore) {
      bestScore = score;
      best = preset;
    }
  }

  return best;
}
