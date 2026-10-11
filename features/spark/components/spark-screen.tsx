'use client';

import { useState } from 'react';
import { CityScene } from '@/features/city';
import { CoordinateReadout, TitleBlock } from '@/components/blueprint';
import { GameTopBar } from '@/components/layout/top-bar';
import { useGame } from '@/features/game';
import { useIsDesktop } from '@/hooks/use-media-query';
import type { Preset } from '@/content/presets';
import { IdeaInput } from './idea-input';
import { PresetChips } from './preset-chips';
import { TypedHeadline } from './typed-headline';
import { useTypewriter } from '../hooks/use-typewriter';

function EyebrowRule({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-xs font-medium tracking-eyebrow text-glow">
      <span className="h-px w-7 bg-wire" aria-hidden />
      {children}
      <span className="h-px w-7 bg-wire" aria-hidden />
    </div>
  );
}

/** Sheet 01 — Intro / Spark: collects the visitor's idea. */
export function SparkScreen() {
  const [, dispatch] = useGame();
  const isDesktop = useIsDesktop();
  const [idea, setIdea] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const { isTyping, start } = useTypewriter({
    onTick: setIdea,
    onDone: (fullText) => dispatch({ type: 'IDEA_SUBMITTED', idea: fullText }),
  });

  function handlePresetSelect(preset: Preset) {
    setSelectedPresetId(preset.id);
    start(preset.ideaText);
  }

  function handleSubmit(value: string) {
    dispatch({ type: 'IDEA_SUBMITTED', idea: value });
  }

  return (
    <div className="relative flex min-h-full flex-col overflow-clip">
      <div className="absolute inset-0 opacity-[0.18] md:opacity-[0.16]">
        <CityScene mode="wire" scale={isDesktop ? 1.7 : 0.75} y={isDesktop ? 380 : 300} interactive={false} />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 42%, rgb(11 18 32 / 0.85), transparent 80%)' }}
      />

      <GameTopBar context="BLUEPRINT" className="sticky top-0" />

      <div className="relative flex flex-1 flex-col items-center px-5 pb-10 pt-10 md:px-0 md:pb-10 md:pt-[60px] min-[1440px]:pt-[90px]">
        <div className="flex w-full max-w-[880px] flex-col items-start gap-0 md:items-center md:text-center">
          <div className="hidden md:flex">
            <EyebrowRule>SHEET 01 — SPARK</EyebrowRule>
          </div>
          <TypedHeadline
            paused={idea.length > 0}
            className="mt-3.5 text-balance font-display text-[42px] font-semibold leading-[1.04] tracking-display text-text-strong md:mt-[22px] md:text-[56px] md:leading-[1.03] lg:whitespace-nowrap min-[1440px]:text-[78px] min-[1440px]:leading-[1.02]"
          />
          <p className="mt-3 font-sans text-base text-muted md:mt-[18px] md:text-[19px]">
            Tell me your idea. Watch me build it.
          </p>

          <IdeaInput
            value={idea}
            onChange={setIdea}
            onSubmit={handleSubmit}
            disabled={isTyping}
            autoFocus={isDesktop}
            className="mt-7 md:mt-8"
          />

          <div className="mt-7 font-mono text-[11px] tracking-eyebrow text-muted md:mt-9">
            OR START FROM A PRESET
          </div>
          <PresetChips onSelect={handlePresetSelect} selectedId={selectedPresetId} className="mt-3 md:mt-3.5" />
        </div>
      </div>

      <div className="relative hidden shrink-0 items-end justify-between px-8 pb-8 md:flex">
        <TitleBlock
          cells={[
            { k: 'PROJECT', v: 'UNTITLED' },
            { k: 'DRAWN BY', v: 'JOVANNI JUNGCO' },
            { k: 'SCALE', v: '1 : 1' },
            { k: 'SHEET', v: '01 / 06' },
          ]}
        />
        <CoordinateReadout />
      </div>
      <div className="relative shrink-0 px-5 pb-5 font-mono text-[10px] tracking-label text-muted md:hidden">
        SHEET 01 / 06 · SCALE 1:1
      </div>
    </div>
  );
}
