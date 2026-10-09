import { useEffect, useEffectEvent, useState } from 'react';
import type { Blueprint } from '@/types/blueprint';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { matchClosestPreset } from '../generating.utils';

export type LogLine = {
  timestamp: string;
  message: string;
  ok?: boolean;
  indent?: boolean;
};

export type UseBlueprintGenerationOptions = {
  idea: string;
  onComplete: (blueprint: Blueprint) => void;
};

export type UseBlueprintGenerationResult = {
  logs: LogLine[];
  /** 0–100, counts up in sync with the bar/stat (Sheet 02). */
  percent: number;
  /** The in-progress log line, e.g. "Drafting blueprint… 68%". */
  activeMessage: string;
};

const TOTAL_MS = 4200;

async function fetchBlueprint(idea: string) {
  try {
    const res = await fetch('/api/blueprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea }),
    });
    if (!res.ok) throw new Error(`/api/blueprint responded ${res.status}`);
    return (await res.json()) as { blueprint: Blueprint; stackLine: string[]; proofsCount: number };
  } catch {
    // Resilience rule (docs/GOALS.md#quality-bar): never show an error screen —
    // fall back to the closest preset client-side if the route is unreachable.
    const preset = matchClosestPreset(idea);
    return { blueprint: preset.blueprint, stackLine: preset.stackLine, proofsCount: preset.proofsCount };
  }
}

function formatTimestamp(ms: number): string {
  return (ms / 1000).toFixed(2).padStart(5, '0');
}

/**
 * Drives the Generating screen (Sheet 02): fetches the blueprint (falling
 * back to the closest preset on any failure), then plays a short scripted
 * log + progress choreography before calling `onComplete`.
 */
export function useBlueprintGeneration({ idea, onComplete }: UseBlueprintGenerationOptions): UseBlueprintGenerationResult {
  const reducedMotion = useReducedMotion();
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [percent, setPercent] = useState(0);
  const [activeMessage, setActiveMessage] = useState('Reading idea…');
  const handleComplete = useEffectEvent((blueprint: Blueprint) => onComplete(blueprint));

  useEffect(() => {
    let cancelled = false;
    let frame: number;

    fetchBlueprint(idea).then(({ blueprint, stackLine, proofsCount }) => {
      if (cancelled) return;

      const wordCount = idea.trim().split(/\s+/).filter(Boolean).length || 1;
      const featureIds = blueprint.features.map((f) => f.id).join(' · ');
      const timeline: { atMs: number; line: LogLine }[] = [
        { atMs: 120, line: { timestamp: formatTimestamp(120), message: `Reading idea… ${wordCount} word${wordCount === 1 ? '' : 's'}`, ok: true } },
        { atMs: 640, line: { timestamp: formatTimestamp(640), message: `Parsing features… ${blueprint.features.length} found`, ok: true } },
        { atMs: 910, line: { timestamp: formatTimestamp(910), message: `  ${featureIds}`, indent: true } },
        { atMs: 1480, line: { timestamp: formatTimestamp(1480), message: `Selecting stack… ${stackLine.join(' · ')}`, ok: true } },
        { atMs: 1870, line: { timestamp: formatTimestamp(1870), message: `Matching shipped projects… ${proofsCount} proof${proofsCount === 1 ? '' : 's'}`, ok: true } },
      ];

      if (reducedMotion) {
        setLogs(timeline.map((t) => t.line));
        setPercent(100);
        handleComplete(blueprint);
        return;
      }

      const start = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = now - start;
        setLogs(timeline.filter((t) => t.atMs <= elapsed).map((t) => t.line));
        const nextPercent = Math.min(100, Math.round((elapsed / TOTAL_MS) * 100));
        setPercent(nextPercent);
        setActiveMessage(elapsed >= TOTAL_MS ? 'Drafting blueprint… done' : `Drafting blueprint… ${nextPercent}%`);

        if (elapsed >= TOTAL_MS) {
          handleComplete(blueprint);
          return;
        }
        frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [idea, reducedMotion]);

  return { logs, percent, activeMessage };
}
