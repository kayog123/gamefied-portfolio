import { GameProvider } from '@/features/game';

/**
 * The full-viewport, fixed shell for the Blueprint game (Sheets 01–06).
 * See docs/design-system/03-layout-and-patterns.md#app-shell.
 */
export default function GameLayout({ children }: LayoutProps<'/'>) {
  return (
    <GameProvider>
      <div className="bg-blueprint h-dvh overflow-hidden">{children}</div>
    </GameProvider>
  );
}
