import { JsonLd } from '@/components/seo/json-ld';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AUDIT_HERO, AUDIT_UPDATED, CATEGORY_INFO } from '@/content/audit-page';
import { auditPageSchema } from '@/lib/seo/schema';
import { AUDIT_CATEGORIES } from '../audit.constants';
import { AuditScanner } from './audit-scanner';

/** `/audit`: the free website audit (Sheet 09). Hero and "what we check" are server-rendered; the scanner is the client leaf. */
export function AuditPage() {
  return (
    <PageWrapper after={<JsonLd data={auditPageSchema(AUDIT_HERO.title, AUDIT_HERO.lead)} />}>
      <section className="border-b border-grid px-5 pb-2 pt-12 md:px-12 md:pt-20">
        <div className="font-mono text-[11px] tracking-eyebrow text-glow md:text-xs">{AUDIT_HERO.eyebrow}</div>
        <h1 className="mt-3.5 max-w-[900px] text-balance font-display text-4xl font-semibold leading-[1.02] tracking-display text-text-strong md:mt-[22px] md:text-[72px] md:tracking-[-0.04em]">
          {AUDIT_HERO.title}
        </h1>
        <p className="mb-8 mt-4 max-w-[720px] text-pretty font-sans text-base leading-[1.55] text-muted md:mb-10 md:mt-[26px] md:text-[19px]">
          {AUDIT_HERO.lead}
        </p>
      </section>

      <AuditScanner />

      <section aria-labelledby="what-we-check" className="border-t border-grid px-5 py-12 md:px-12 md:py-20">
        <h2 id="what-we-check" className="font-display text-2xl font-semibold tracking-[-0.02em] text-text-strong md:text-[44px]">
          What the audit checks
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {AUDIT_CATEGORIES.map((category, index) => (
            <li key={category} className="flex flex-col gap-2 rounded-panel border border-wire/25 bg-glass p-5">
              <p className="font-mono text-[11px] tracking-eyebrow text-glow">
                {String(index + 1).padStart(2, '0')} — {CATEGORY_INFO[category].label.toUpperCase()}
              </p>
              <h3 className="font-display text-lg font-semibold text-text-strong">{CATEGORY_INFO[category].question}</h3>
              <p className="font-sans text-sm leading-[1.55] text-muted">{CATEGORY_INFO[category].blurb}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-[720px] font-sans text-sm leading-[1.6] text-muted">
          The free audit is passive and read-only: it loads one page, plus robots.txt, the sitemap and the response headers, exactly
          like a visitor&apos;s browser would. It does not log in, scan ports or look for hidden files. The most important findings and a
          fix plan are part of the full audit, which I run and review myself.
        </p>
        <p className="mt-5 font-mono text-xs tracking-label text-text-faint">
          LAST UPDATED · <time dateTime={AUDIT_UPDATED}>{AUDIT_UPDATED}</time>
        </p>
      </section>
    </PageWrapper>
  );
}
