import { useEffect, useEffectEvent } from 'react';

export type HotkeyCombo = 'ArrowUp' | 'ArrowDown' | 'Enter' | 'Escape' | 'Tab' | (string & {});

export type HotkeyMap = Partial<Record<HotkeyCombo, (event: KeyboardEvent) => void>>;

export type UseHotkeysOptions = {
  /** When false, the hook detaches its listener entirely. Defaults to true. */
  enabled?: boolean;
  /** Fire even when focus is inside a text input/textarea. Defaults to false. */
  allowInInputs?: boolean;
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

/**
 * Binds a map of key combos ("Escape", "ArrowUp") to handlers on `window`.
 * Used for Esc-to-close, ↑/↓ list navigation and ↵-to-inspect/link (see
 * docs/design-system/05-motion-accessibility-content.md#keyboard-map).
 */
export function useHotkeys(map: HotkeyMap, { enabled = true, allowInInputs = false }: UseHotkeysOptions = {}) {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!allowInInputs && isTypingTarget(event.target)) return;
    const handler = map[event.key];
    if (!handler) return;
    handler(event);
  });

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
