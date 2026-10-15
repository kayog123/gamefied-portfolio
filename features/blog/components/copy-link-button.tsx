'use client';

import { Check, Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/blueprint';

/** Copies the current page URL; confirms for two seconds. */
export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
        } catch {
          // Clipboard blocked: the link stays in the address bar.
        }
      }}
      iconLeft={copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
    >
      <span aria-live="polite">{copied ? 'Copied' : 'Copy link'}</span>
    </Button>
  );
}
