'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/blueprint';

export type CopyFieldProps = { label: string; value: string };

/** A read-only field that selects itself on focus, with a "Copy link" button. */
export function CopyField({ label, value }: CopyFieldProps) {
  const id = useId();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
    } catch {
      // Clipboard access can be blocked; the value is selected when the field is focused.
    }
  }

  return (
    <div className="flex gap-2">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        readOnly
        value={value}
        onFocus={(event) => event.currentTarget.select()}
        className="focus-blueprint h-10 min-w-0 flex-1 rounded-control border border-wire/30 bg-input px-3 font-mono text-xs text-text-soft"
      />
      <Button variant="secondary" size="sm" onClick={handleCopy} iconLeft={isCopied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}>
        {isCopied ? 'Copied' : 'Copy link'}
      </Button>
    </div>
  );
}
