import type { FaqItem, ProcessStage } from '@/content/process';
import { SITE_URL } from '@/lib/site';

/** `FAQPage`: only pass questions that are visibly answered on the page. */
export function faqPageSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** `HowTo`: the client-work process, one `HowToStep` per visible stage. */
export function processHowToSchema(stages: ProcessStage[], opts: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    step: stages.map((stage, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: stage.title,
      text: stage.summary,
      url: `${SITE_URL}${opts.path}#${stage.id}`,
    })),
  };
}
