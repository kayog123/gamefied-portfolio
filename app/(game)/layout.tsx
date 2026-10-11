import { GameProvider } from '@/features/game';

/**
 * The full-viewport, fixed shell for the Blueprint game (Sheets 01–06).
 * See docs/design-system/03-layout-and-patterns.md#app-shell.
 */
export default function GameLayout({ children }: LayoutProps<'/'>) {
  return (
    <GameProvider>
      <div className="bg-blueprint fixed inset-0 overflow-x-hidden overflow-y-auto">{children}</div>
    </GameProvider>
  );
}
