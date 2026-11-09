'use client';

import { Send, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/blueprint';
import { cn } from '@/lib/cn';
import { BOOK_A_CALL_URL, SOCIAL_LINKS } from '@/lib/site';
import { auditRequestSchema } from '../audit.schemas';
import { useTurnstile } from '../hooks/use-turnstile';

type SubmitState = { status: 'idle' } | { status: 'submitting' } | { status: 'sent' } | { status: 'error'; message: string };

const FIELD =
  'focus-blueprint h-11 rounded-control border border-wire/30 bg-input px-3 font-sans text-[15px] text-text-strong placeholder:text-muted';

export type RequestDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  /** The audited page (after redirects). */
  url: string;
  domain: string;
  /** The shared audit this request starts from, if any. */
  shareId?: string;
};

/**
 * "Get the full audit" (Sheet 09 · 09d): a native <dialog>, so focus is trapped, Esc closes it and
 * focus returns to the button that opened it with no extra code. The sent state tells the visitor what happens next.
 */
export function RequestDialog({ isOpen, onClose, url, domain, shareId }: RequestDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' });
  const { containerRef, token, isRequired, hasError, reset: resetHumanCheck } = useTurnstile({ enabled: isOpen });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const isSubmitting = submit.status === 'submitting';
  const canSubmit = !isSubmitting && (!isRequired || token !== null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const parsed = auditRequestSchema.safeParse({ url, name, email, message, consent, turnstileToken: token ?? undefined, shareId });
    if (!parsed.success) {
      setSubmit({ status: 'error', message: parsed.error.issues[0]?.message ?? 'Please check the form.' });
      return;
    }

    setSubmit({ status: 'submitting' });
    try {
      const response = await fetch('/api/audit/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(30_000),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setSubmit({ status: 'error', message: body?.error ?? `Something went wrong. Please email me at ${SOCIAL_LINKS.email}.` });
        return;
      }
      setSubmit({ status: 'sent' });
    } catch {
      setSubmit({ status: 'error', message: `That took too long. Please try again, or email me at ${SOCIAL_LINKS.email}.` });
    } finally {
      // Cloudflare tokens work once, so a retry needs a fresh one.
      resetHumanCheck();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="request-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[calc(100%-32px)] max-w-[520px] rounded-modal border border-wire/35 bg-glass-modal p-0 text-text shadow-modal backdrop:bg-scrim backdrop:backdrop-blur-[2px]"
    >
      <div className="flex flex-col gap-[18px] p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11px] font-medium tracking-eyebrow text-glow">FULL AUDIT · {domain.toUpperCase()}</p>
            <h2 id="request-title" className="font-display text-[26px] font-semibold leading-[1.1] tracking-[-0.02em] text-text-strong md:text-3xl">
              {submit.status === 'sent' ? 'Request received' : 'Get the full audit'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-blueprint -mr-2 -mt-2 grid size-11 shrink-0 place-items-center rounded-control text-muted hover:text-text-strong"
          >
            <X className="size-[18px]" aria-hidden />
          </button>
        </div>

        {submit.status === 'sent' ? (
          <div role="status" className="flex flex-col gap-4">
            <p className="font-sans text-[15px] leading-[1.55] text-text-soft">
              Thanks{name ? `, ${name.trim().split(/\s+/)[0]}` : ''}. I&apos;ll review {domain} and email the full report to{' '}
              <span className="font-mono text-sm text-text-strong">{email}</span> within [X business days].
            </p>
            <ol className="flex flex-col gap-2.5 rounded-panel border border-wire/25 bg-glass p-4 font-sans text-sm leading-[1.45] text-text-soft">
              {['I run the deep checks again on your live site.', 'I review the findings and the fix plan myself.', 'You get a private report link, valid for 30 days.'].map(
                (step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="shrink-0 font-mono text-xs text-glow">{String(index + 1).padStart(2, '0')}</span>
                    {step}
                  </li>
                ),
              )}
            </ol>
            <p className="font-sans text-sm text-muted">
              Want to talk it through sooner?{' '}
              <a href={BOOK_A_CALL_URL} className="focus-blueprint text-glow-soft hover:text-glow-pale" {...(BOOK_A_CALL_URL.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                Book a 30-minute call
              </a>
              .
            </p>
            <div className="flex justify-end">
              <Button type="button" variant="secondary" onClick={onClose}>
                Back to the results
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <p className="font-sans text-[15px] leading-[1.55] text-muted">
              I&apos;ll run the deep checks, review the results myself and send you a private report with the locked findings and a fix plan.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 font-sans text-[13px] font-medium text-text-soft">
                Name
                <input className={FIELD} name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label className="flex flex-col gap-1.5 font-sans text-[13px] font-medium text-text-soft">
                Email
                <input className={FIELD} name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 font-sans text-[13px] font-medium text-text-soft">
              <span>
                What should I focus on? <span className="font-normal text-muted">Optional</span>
              </span>
              <textarea
                name="message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. We’re not showing up on Google, or we’re about to relaunch."
                className={cn(FIELD, 'h-auto resize-y py-2.5 leading-[1.5]')}
              />
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 font-sans text-[13px] leading-[1.5] text-text-soft">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="focus-blueprint mt-0.5 size-[18px] shrink-0 accent-glow" />
              Email me about this audit only. No newsletters.
            </label>

            <div ref={containerRef} />
            {hasError && (
              <p className="font-sans text-[13px] text-danger-text">The human check didn&apos;t load. Reload the page, or email me at {SOCIAL_LINKS.email}.</p>
            )}
            <div role="alert" aria-live="assertive">
              {submit.status === 'error' && <p className="font-sans text-sm text-danger-text">{submit.message}</p>}
            </div>

            <div className="flex flex-wrap justify-end gap-2.5">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={!canSubmit} iconRight={<Send className="size-[18px]" aria-hidden />}>
                {isSubmitting ? 'Sending…' : 'Request full audit'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
