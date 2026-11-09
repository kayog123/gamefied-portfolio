'use client';

import { Check, Copy, Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/blueprint';
import { SNAPSHOT_TTL_DAYS } from '../audit.constants';

type ShareState = { status: 'idle' } | { status: 'creating' } | { status: 'ready'; link: string } | { status: 'error'; message: string };

export type ShareAuditPanelProps = {
  /** The audited page (after redirects). */
  url: string;
  /** The scan ticket from `/api/audit/preview`. */
  ticket: string;
};

/**
 * "Share this audit" (Sheet 09): asks the server for a link to a snapshot of these results. The server
 * re-runs the checks and stores only the public preview, so nothing here can forge what the link shows.
 */
export function ShareAuditPanel({ url, ticket }: ShareAuditPanelProps) {
  const [share, setShare] = useState<ShareState>({ status: 'idle' });
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const id = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [isCopied]);

  async function handleCreate() {
    setShare({ status: 'creating' });
    try {
      const response = await fetch('/api/audit/share', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url, ticket }),
        signal: AbortSignal.timeout(35_000),
      });
      const body = (await response.json().catch(() => null)) as { link?: string; error?: string } | null;
      if (!response.ok || !body?.link) {
        setShare({ status: 'error', message: body?.error ?? 'Couldn’t create the link right now. Please try again.' });
        return;
      }
      setShare({ status: 'ready', link: body.link });
    } catch {
      setShare({ status: 'error', message: 'Creating the link took too long. Please try again.' });
    }
  }

  async function handleCopy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
    } catch {
      // Clipboard access can be blocked; the link is in the field above, selected on focus.
    }
  }

  return (
    <section aria-labelledby="share-title" className="flex flex-col gap-3 rounded-panel border border-wire/25 bg-glass p-5">
      <h2 id="share-title" className="font-display text-lg font-semibold text-text-strong">
        Share this audit
      </h2>
      <p className="font-sans text-[13px] leading-[1.5] text-muted">
        Send these results to your team or developer. The link shows this preview and works for {SNAPSHOT_TTL_DAYS} days.
      </p>

      {share.status === 'ready' ? (
        <div className="flex gap-2">
          <label htmlFor="share-link" className="sr-only">
            Share link
          </label>
          <input
            id="share-link"
            readOnly
            value={share.link}
            onFocus={(event) => event.currentTarget.select()}
            className="focus-blueprint h-10 min-w-0 flex-1 rounded-control border border-wire/30 bg-input px-3 font-mono text-xs text-text-soft"
          />
          <Button variant="secondary" size="sm" onClick={() => handleCopy(share.link)} iconLeft={isCopied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}>
            {isCopied ? 'Copied' : 'Copy link'}
          </Button>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={handleCreate}
          disabled={share.status === 'creating'}
          className="self-start"
          iconLeft={<Link2 className="size-4" aria-hidden />}
        >
          {share.status === 'creating' ? 'Creating link…' : 'Create share link'}
        </Button>
      )}

      <div role="status" aria-live="polite">
        {share.status === 'ready' && <p className="sr-only">Share link created.</p>}
        {share.status === 'error' && <p className="font-sans text-sm text-danger-text">{share.message}</p>}
      </div>
    </section>
  );
}
