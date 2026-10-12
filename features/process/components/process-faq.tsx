import { ChevronDown } from 'lucide-react';
import { PROCESS_FAQ } from '@/content/process';

/**
 * Visible FAQ. Native <details>/<summary>, so it works without JavaScript and
 * every answer is in the server-rendered HTML for crawlers.
 */
export function ProcessFaq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="grid grid-cols-1 gap-8 border-b border-grid px-5 py-12 md:grid-cols-[320px_1fr] md:gap-16 md:px-12 md:py-20">
      <h2 id="faq-heading" className="font-display text-[28px] font-semibold tracking-[-0.02em] text-text-strong md:text-[44px]">
        Common questions
      </h2>
      <div className="flex flex-col border-t border-grid">
        {PROCESS_FAQ.map((item) => (
          <details key={item.id} id={item.id} className="group border-b border-grid">
            <summary className="focus-blueprint flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-medium text-text-strong marker:hidden [&::-webkit-details-marker]:hidden md:text-xl">
              <h3 className="text-inherit">{item.question}</h3>
              <ChevronDown className="size-5 shrink-0 text-glow transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
            </summary>
            <p className="max-w-[720px] pb-5 font-sans text-[15px] leading-[1.6] text-muted md:text-base">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
