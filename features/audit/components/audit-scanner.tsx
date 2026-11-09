'use client';

import { ArrowRight, Globe, RotateCw } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/blueprint';
import { cn } from '@/lib/cn';
import { normalizeAuditUrl } from '../audit.utils';
import { useAuditScan } from '../hooks/use-audit-scan';
import { AuditProgress } from './audit-progress';
import { AuditResults } from './audit-results';

/** The interactive part of `/audit`: URL form, scanning state and results. Everything else is server-rendered. */
export function AuditScanner() {
  const { state, progress, scan } = useAuditScan();
  const [url, setUrl] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const isScanning = state.status === 'scanning';
  const isDone = state.status === 'done';
  const error = inputError ?? (state.status === 'error' ? state.message : null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isScanning) return;
    if (!normalizeAuditUrl(url)) {
      setInputError('That doesn’t look like a website address. Try something like example.com.');
      return;
    }
    setInputError(null);
    void scan(url);
  }

  return (
    <div className="flex flex-col gap-10 px-5 py-10 md:gap-12 md:px-12 md:py-14">
      <form onSubmit={handleSubmit} noValidate className="flex max-w-[680px] flex-col gap-2.5">
        <label htmlFor="audit-url" className="font-mono text-[11px] tracking-label text-muted">
          WEBSITE ADDRESS
        </label>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div
            className={cn(
              'flex h-14 flex-1 items-center gap-3 rounded-panel border bg-input px-4 focus-within:shadow-glow-input',
              error ? 'border-danger' : 'border-wire/35 focus-within:border-glow',
            )}
          >
            <Globe className="size-[18px] shrink-0 text-glow" aria-hidden />
            <input
              id="audit-url"
              name="url"
              type="text"
              inputMode="url"
              autoComplete="url"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="yourwebsite.com"
              value={url}
              disabled={isScanning}
              onChange={(event) => setUrl(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'audit-url-error' : 'audit-url-hint'}
              className="min-w-0 flex-1 bg-transparent font-mono text-base text-text-strong outline-none placeholder:text-muted disabled:text-muted"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isScanning}
            variant={isDone ? 'secondary' : 'primary'}
            className="h-14 justify-center"
            iconRight={isDone ? <RotateCw className="size-4" aria-hidden /> : isScanning ? undefined : <ArrowRight className="size-[18px]" aria-hidden />}
          >
            {isScanning ? 'Auditing…' : isDone ? 'Audit again' : 'Run free audit'}
          </Button>
        </div>
        {error ? (
          <p id="audit-url-error" role="alert" className="font-sans text-sm text-danger-text">
            {error}
          </p>
        ) : (
          <p id="audit-url-hint" className="font-sans text-[13px] text-muted">
            Free, no sign-up. Takes about 10 seconds.
          </p>
        )}
      </form>

      {state.status === 'scanning' && <AuditProgress domain={hostOf(state.url)} progress={progress} />}

      {state.status === 'done' && (
        <>
          <p role="status" className="sr-only">
            Audit of {hostOf(state.preview.finalUrl)} complete.
          </p>
          <AuditResults preview={state.preview} />
        </>
      )}
    </div>
  );
}

/** Display host for what the visitor typed; falls back to the raw text if it can't be parsed. */
function hostOf(input: string): string {
  return normalizeAuditUrl(input)?.hostname ?? input;
}
