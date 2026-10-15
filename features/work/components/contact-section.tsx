'use client';

import { Calendar, Send } from 'lucide-react';
import { Button } from '@/components/blueprint';
import { TypeOnView } from '@/components/type-on-view';
import { BOOK_A_CALL_URL, SOCIAL_LINKS } from '@/lib/site';
import { useContactForm } from '../hooks/use-contact-form';

function SocialLink({ label, href }: { label: string; href?: string }) {
  if (!href) {
    return (
      <span className="font-mono text-xs tracking-label text-text-faint" title="Coming soon">
        {label}
      </span>
    );
  }
  return (
    <a
      href={href}
      {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="focus-blueprint font-mono text-xs tracking-label text-glow hover:text-glow-pale"
    >
      {label}
    </a>
  );
}

/** Sheet 07 "Have an idea? Let's build it for real." contact section. */
export function ContactSection() {
  const { email, setEmail, message, setMessage, canSend, state, send } = useContactForm();

  return (
    <section id="contact" className="grid grid-cols-1 items-center gap-8 border-t border-grid bg-wire/[0.05] px-5 py-12 md:grid-cols-[1fr_520px] md:gap-16 md:px-12 md:py-[88px]">
      <div>
        <div className="font-mono text-xs tracking-eyebrow text-cta">CONTACT</div>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-text-strong md:mt-4 md:text-[56px] md:leading-[1.02]">
          <TypeOnView text={"Have an idea?\nLet's build it for real."} />
        </h2>
      </div>

      <div className="flex flex-col gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-label="Your email"
          className="focus-blueprint h-12 rounded-control border border-muted/40 bg-input px-3.5 font-sans text-sm text-text-strong placeholder:text-muted"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What are you building?"
          aria-label="What are you building?"
          rows={4}
          className="focus-blueprint min-h-24 resize-y rounded-control border border-muted/40 bg-input p-3.5 font-sans text-sm text-text-strong placeholder:text-muted"
        />
        <div className="grid grid-cols-2 gap-2">
          <Button href={BOOK_A_CALL_URL} variant="secondary" className="justify-center" iconLeft={<Calendar className="size-[15px]" aria-hidden />}>
            Book a call
          </Button>
          <Button onClick={send} disabled={!canSend} className="justify-center" iconRight={<Send className="size-[15px]" aria-hidden />}>
            {state === 'sent' ? 'Sent ✓' : 'Send message'}
          </Button>
        </div>
        <div role="status" aria-live="polite">
          {state === 'sent' && <p className="font-mono text-[11px] text-live-text">Got it. I&apos;ll reply to your email soon.</p>}
          {state === 'error' && (
            <p className="font-mono text-[11px] text-danger-text">
              Something went wrong. Try again, or email me at {SOCIAL_LINKS.email}.
            </p>
          )}
        </div>
        <div className="mt-1.5 flex gap-4.5">
          <SocialLink label="LINKEDIN" href={SOCIAL_LINKS.linkedin} />
          <SocialLink label="INSTAGRAM" href={SOCIAL_LINKS.instagram} />
          <SocialLink label="EMAIL" href={SOCIAL_LINKS.email ? `mailto:${SOCIAL_LINKS.email}` : undefined} />
        </div>
      </div>
    </section>
  );
}
