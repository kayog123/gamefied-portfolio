import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { TURNSTILE_SITE_KEY } from '../audit.constants';

type TurnstileWidgetOptions = {
  sitekey: string;
  appearance: 'always' | 'execute' | 'interaction-only';
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
};

type TurnstileApi = {
  render: (element: HTMLElement, options: TurnstileWidgetOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise: Promise<void> | null = null;

/** Loads Cloudflare's script once per page. A failed load can be retried by the next caller. */
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      scriptPromise = null;
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export type UseTurnstileOptions = {
  /** Render the widget only while true (e.g. while a dialog is open). */
  enabled?: boolean;
};

export type UseTurnstileResult = {
  /** Attach to an empty <div> where the widget should appear. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** The latest single-use token, or null until the visitor passes (and again after `reset`). */
  token: string | null;
  /** False when no site key is configured: nothing to wait for (local development). */
  isRequired: boolean;
  hasError: boolean;
  /** Fetch a fresh token. Call after every submit, because Cloudflare tokens work once. */
  reset: () => void;
};

/**
 * Cloudflare Turnstile bot check with no package: loads Cloudflare's script and renders the widget
 * explicitly, in `interaction-only` mode so it is invisible unless a visitor looks suspicious (Sheet 09).
 * SSR-safe: everything browser-side runs in the effect.
 */
export function useTurnstile({ enabled = true }: UseTurnstileOptions = {}): UseTurnstileResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const siteKey = TURNSTILE_SITE_KEY;
    if (!siteKey || !enabled) return;
    let isCancelled = false;

    loadTurnstile()
      .then(() => {
        const container = containerRef.current;
        if (isCancelled || !container || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(container, {
          sitekey: siteKey,
          appearance: 'interaction-only',
          callback: (value) => {
            setHasError(false);
            setToken(value);
          },
          'expired-callback': () => setToken(null),
          'error-callback': () => {
            setToken(null);
            setHasError(true);
          },
        });
      })
      .catch(() => {
        if (!isCancelled) setHasError(true);
      });

    return () => {
      isCancelled = true;
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [enabled]);

  const reset = useCallback(() => {
    setToken(null);
    if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
  }, []);

  return { containerRef, token, isRequired: Boolean(TURNSTILE_SITE_KEY), hasError, reset };
}
