import { TimerRing } from '@/components/blueprint';
import { TOTAL_LINKS } from '../mini-game.constants';
import type { UseWireGameResult } from '../hooks/use-wire-game';
import { WireGameBoard } from './wire-game-board';
import { WireGameTapList } from './wire-game-tap-list';

export type MiniGamePlayingProps = {
  buildingName: string;
  isDesktop: boolean;
  game: UseWireGameResult;
  onSkip: () => void;
};

/** The in-progress "Wire the API" modal content (Sheets 05a / 05c). */
export function MiniGamePlaying({ buildingName, isDesktop, game, onSkip }: MiniGamePlayingProps) {
  const { linksMade, shake, pendingPortId, dragFromPortId, dragPoint, remaining, progress, startDrag, updateDrag, endDrag, selectPort, attemptNode } = game;

  return (
    <>
      <div className="flex items-start justify-between px-6 pt-5.5 md:px-6">
        <div>
          <div className="font-mono text-[11px] tracking-label text-glow">MINI-GAME · {buildingName.toUpperCase()}</div>
          <h3 className="mt-2 font-display text-2xl font-semibold text-text-strong md:text-[28px]">Wire the API</h3>
          <p className="mt-1.5 max-w-[420px] font-sans text-sm text-muted">
            {isDesktop ? 'Drag from each port to connect Frontend → Backend → Database.' : 'Tap the nodes in order.'}
          </p>
        </div>
        <TimerRing progress={progress} remaining={remaining} size={isDesktop ? 68 : 56} />
      </div>

      {isDesktop ? (
        <WireGameBoard
          linksMade={linksMade}
          shake={shake}
          pendingPortId={pendingPortId}
          dragFromPortId={dragFromPortId}
          dragPoint={dragPoint}
          startDrag={startDrag}
          updateDrag={updateDrag}
          endDrag={endDrag}
          selectPort={selectPort}
        />
      ) : (
        <div className="px-6">
          <WireGameTapList linksMade={linksMade} shake={shake} onTapNode={attemptNode} />
        </div>
      )}

      <div className="flex items-center justify-between gap-3 px-6 pb-5 pt-4">
        {isDesktop ? (
          <div className="flex items-center gap-4 font-mono text-[11px] tracking-label text-muted">
            <span className="text-glow">
              LINKS {linksMade}/{TOTAL_LINKS}
            </span>
            <span>TAB → PORT · ↵ LINK</span>
          </div>
        ) : (
          <span />
        )}
        <button type="button" onClick={onSkip} className="focus-blueprint font-sans text-[13px] text-text-soft">
          Skip game, auto-build →
        </button>
      </div>
    </>
  );
}
