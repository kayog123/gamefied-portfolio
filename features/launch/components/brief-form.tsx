'use client';

import { Calendar, Check, Download, Send } from 'lucide-react';
import { Button } from '@/components/blueprint';
import { BOOK_A_CALL_URL } from '@/lib/site';
import type { UseBriefFormResult } from '../hooks/use-brief-form';

export type BriefFormProps = {
  form: UseBriefFormResult;
  onPrint: () => void;
  layout?: 'desktop' | 'mobile';
};

/** Email + consent + Send/PDF/Book a call (Sheet 06). Shared by desktop and mobile. */
export function BriefForm({ form, onPrint, layout = 'desktop' }: BriefFormProps) {
  const { email, setEmail, consent, setConsent, canSend, state, send } = form;

  const downloadBook = (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="secondary" size="sm" onClick={onPrint} className="justify-center" iconLeft={<Download className="size-[15px]" aria-hidden />}>
        {layout === 'desktop' ? 'Download brief (PDF)' : 'Download PDF'}
      </Button>
      <Button variant="secondary" size="sm" href={BOOK_A_CALL_URL} className="justify-center" iconLeft={<Calendar className="size-[15px]" aria-hidden />}>
        Book a call
      </Button>
    </div>
  );

  const emailRow = (
    <div className={layout === 'desktop' ? 'flex gap-2' : 'flex flex-col gap-2'}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        aria-label="Your email"
        className="focus-blueprint h-11 flex-1 rounded-control border border-muted/40 bg-input px-3 font-sans text-sm text-text-strong placeholder:text-muted"
      />
      {layout === 'mobile' && (
        <label className="flex items-start gap-2.5 font-sans text-xs leading-[1.4] text-muted">
          <ConsentBox checked={consent} onChange={setConsent} />
          Share this brief and my email with Jovanni.
        </label>
      )}
      <Button
        onClick={send}
        disabled={!canSend}
        className={layout === 'desktop' ? 'px-4' : 'h-[50px] justify-center'}
        iconRight={layout === 'desktop' ? <Send className="size-[15px]" aria-hidden /> : undefined}
      >
        {state === 'sent' ? 'Sent ✓' : 'Send brief to Jovanni'}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {layout === 'desktop' ? (
        <>
          {downloadBook}
          {emailRow}
          <label className="flex items-start gap-2.5 font-sans text-xs leading-[1.45] text-muted">
            <ConsentBox checked={consent} onChange={setConsent} />
            I agree to share this brief and my email with Jovanni so he can reply. No newsletters.
          </label>
        </>
      ) : (
        <>
          {emailRow}
          {downloadBook}
        </>
      )}
      {state === 'error' && (
        <p className="font-mono text-[11px] text-danger-text">Something went wrong — try again in a moment.</p>
      )}
    </div>
  );
}

function ConsentBox({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="focus-blueprint mt-0.5 grid size-4 shrink-0 place-items-center rounded-tag border border-glow"
      style={checked ? { background: 'var(--color-wire)' } : undefined}
    >
      {checked && <Check className="size-2.5 text-white" aria-hidden />}
    </button>
  );
}
