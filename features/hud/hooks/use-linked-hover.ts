import { useState } from 'react';
import type { BuildingId } from '@/types/blueprint';
import { useHotkeys } from '@/hooks/use-hotkeys';

export type UseLinkedHoverResult = {
  activeId: BuildingId | null;
  setActive: (id: BuildingId | null) => void;
};

/**
 * The two-way hover/focus link between the Features list and the City scene
 * (docs/design-system/03-layout-and-patterns.md#interaction), plus the HUD's
 * ↑/↓ · ↵ keyboard path (docs/design-system/05-motion-accessibility-content.md#keyboard-map).
 */
export function useLinkedHover(orderedIds: BuildingId[], onInspect: (id: BuildingId) => void): UseLinkedHoverResult {
  const [activeId, setActiveId] = useState<BuildingId | null>(null);

  function move(delta: 1 | -1) {
    setActiveId((current) => {
      if (orderedIds.length === 0) return current;
      const index = current ? orderedIds.indexOf(current) : -1;
      const next = (index + delta + orderedIds.length) % orderedIds.length;
      return orderedIds[next];
    });
  }

  useHotkeys({
    ArrowDown: (e) => {
      e.preventDefault();
      move(1);
    },
    ArrowUp: (e) => {
      e.preventDefault();
      move(-1);
    },
    Enter: () => {
      if (activeId) onInspect(activeId);
    },
  });

  return { activeId, setActive: setActiveId };
}
