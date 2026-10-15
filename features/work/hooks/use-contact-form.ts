import { useState } from 'react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SendState = 'idle' | 'sending' | 'sent' | 'error';

export type UseContactFormResult = {
  email: string;
  setEmail: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  canSend: boolean;
  state: SendState;
  send: () => void;
};

/** "Have an idea? Let's build it for real." form (Sheet 07). */
export function useContactForm(): UseContactFormResult {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<SendState>('idle');

  const canSend = EMAIL_PATTERN.test(email) && message.trim().length > 0 && state !== 'sending';

  function send() {
    if (!canSend) return;
    setState('sending');
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, message }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`/api/contact responded ${res.status}`);
        setEmail('');
        setMessage('');
        setState('sent');
      })
      .catch(() => setState('error'));
  }

  return { email, setEmail, message, setMessage, canSend, state, send };
}
