'use client';

import { GeneratingScreen } from '@/features/generating';
import { useGame } from '@/features/game';
import { HudScreen } from '@/features/hud';
import { LaunchScreen } from '@/features/launch';
import { SparkScreen } from '@/features/spark';

/** "/" — the Blueprint game. Renders the current phase (Sheets 01–06). */
export default function GamePage() {
  const [{ phase }] = useGame();

  if (phase === 'generating') return <GeneratingScreen />;
  if (phase === 'hud') return <HudScreen />;
  if (phase === 'launch') return <LaunchScreen />;
  return <SparkScreen />;
}
