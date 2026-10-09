import { useState } from 'react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SendState = 'idle' | 'sending' | 'sent' | 'error';

export type UseBriefFormResult = {
  email: string;
  setEmail: (value: string) => void;
  consent: boolean;
  setConsent: (value: boolean) => void;
  isValidEmail: boolean;
  canSend: boolean;
  state: SendState;
  send: () => void;
};

/**
 * "Send brief to Jovanni" (Sheet 06) — disabled until the email is valid and
 * consent is checked, per docs/GOALS.md#quality-bar.
 */
export function useBriefForm(projectName: string): UseBriefFormResult {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SendState>('idle');

  const isValidEmail = EMAIL_PATTERN.test(email);
  const canSend = isValidEmail && consent && state !== 'sending';

  function send() {
    if (!canSend) return;
    setState('sending');
    fetch('/api/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, projectName, consent }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`/api/brief responded ${res.status}`);
        setState('sent');
      })
      .catch(() => setState('error'));
  }

  return { email, setEmail, consent, setConsent, isValidEmail, canSend, state, send };
}
