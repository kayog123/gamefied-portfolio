import { PageWrapper } from '@/components/layout/page-wrapper';
import { JsonLd } from '@/components/seo/json-ld';
import { PROCESS_FAQ, PROCESS_STAGES, PROCESS_UPDATED } from '@/content/process';
import { faqPageSchema, processHowToSchema } from '@/lib/seo/schema';
import { ProcessFaq } from './process-faq';
import { ProcessHero } from './process-hero';
import { ProcessStages } from './process-stages';

/** `/process`: how I work with clients, from discovery call to delivery, plus a visible FAQ. */
export function ProcessPage() {
  return (
    <PageWrapper
      after={
        <>
          <JsonLd
            data={processHowToSchema(PROCESS_STAGES, {
              name: 'How Jovanni Jungco works with clients, from discovery call to delivery',
              description: 'Seven stages: discovery call, brief and scope, blueprint, build, review, launch, and handover.',
              path: '/process',
            })}
          />
          <JsonLd data={faqPageSchema(PROCESS_FAQ)} />
        </>
      }
    >
      <ProcessHero updated={PROCESS_UPDATED} />
      <ProcessStages />
      <ProcessFaq />
    </PageWrapper>
  );
}
