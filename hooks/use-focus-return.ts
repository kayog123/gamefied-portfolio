import { useEffect, useRef } from 'react';

/**
 * Remembers whatever had focus when a panel/modal/sheet opened, and restores
 * it on close (docs/design-system/05-motion-accessibility-content.md#focus).
 * Call unconditionally; pass the current `isOpen` state.
 */
export function useFocusReturn(isOpen: boolean): void {
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      return;
    }
    const trigger = triggerRef.current;
    if (trigger instanceof HTMLElement) trigger.focus();
  }, [isOpen]);
}
