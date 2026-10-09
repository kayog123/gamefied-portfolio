import { useSyncExternalStore } from 'react';

function subscribe(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  };
}

/** Reactive `window.matchMedia` query. Server render (and the SSR snapshot) assumes `false`. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True at and above the desktop HUD breakpoint (Tailwind `md`, 768px). */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)');
}
