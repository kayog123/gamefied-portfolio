'use client';

import { SegmentedProgress, SkillShard } from '@/components/blueprint';
import { CityScene } from '@/features/city';
import { GameTopBar } from '@/components/layout/top-bar';
import { useGame } from '@/features/game';
import { useIsDesktop } from '@/hooks/use-media-query';
import { useBriefForm } from '../hooks/use-brief-form';
import { ProjectBriefMobile } from './project-brief-mobile';
import { ProjectBriefPanel } from './project-brief-panel';
import { RocketLaunch } from './rocket-launch';

/** Sheet 06 — Launch / Completion: the lit city and the project brief. */
export function LaunchScreen() {
  const [{ blueprint }] = useGame();
  const isDesktop = useIsDesktop();
  const form = useBriefForm(blueprint?.projectName ?? '');

  if (!blueprint) return null;

  const allLiveSegments = blueprint.features.map(() => ({ status: 'live' as const }));

  function handlePrint() {
    window.print();
  }

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ backgroundImage: 'radial-gradient(ellipse 50% 60% at 33% 60%, rgb(245 158 11 / 0.12), transparent 70%)' }}
    >
      <CityScene mode="lit" scale={isDesktop ? 1.05 : 0.42} x={isDesktop ? -240 : 0} y={isDesktop ? 40 : -190} interactive={false} />
      <RocketLaunch />

      <GameTopBar context={blueprint.projectName} center={<SegmentedProgress segments={allLiveSegments} />} mobileLeft={<span className="font-mono text-xs text-live-text">100% · {blueprint.features.length}/{blueprint.features.length}</span>} />

      {isDesktop ? (
        <>
          <div className="absolute left-8 top-24 z-30 w-[440px]">
            <div className="font-mono text-[11px] tracking-eyebrow text-live-text">LAUNCH SEQUENCE COMPLETE · T+00:03</div>
            <h1 className="mt-3 text-balance font-display text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] text-text-strong">
              🚀 Your project is LIVE (in blueprint form)
            </h1>
          </div>

          <div className="absolute bottom-7 left-8 z-30 flex w-[560px] flex-wrap gap-1.5">
            {blueprint.shards.map((name) => (
              <SkillShard key={name} name={name} state="collected" />
            ))}
          </div>

          <ProjectBriefPanel blueprint={blueprint} form={form} onPrint={handlePrint} className="absolute right-6 top-[88px] z-30 bottom-6 w-[540px]" />
        </>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="relative z-30 px-5 pt-4.5 font-display text-[22px] font-semibold leading-[1.15] text-text-strong">
            🚀 Your project is LIVE (in blueprint form)
          </div>
          <div className="relative z-30 mt-auto flex max-h-[65%] flex-col gap-2.5 overflow-y-auto rounded-t-sheet border-t border-glow/50 bg-navy/[0.96] p-5">
            <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-slate-line" aria-hidden />
            <ProjectBriefMobile blueprint={blueprint} form={form} onPrint={handlePrint} />
          </div>
        </div>
      )}
    </div>
  );
}
