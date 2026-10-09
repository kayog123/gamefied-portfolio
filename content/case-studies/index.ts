import { PROJECTS } from '../projects';
import { aiCustomerServiceAgent } from './ai-customer-service-agent';
import { automatedVideoPipeline } from './automated-video-pipeline';
import { browserAutomationAgent } from './browser-automation-agent';
import { codaComplianceTool } from './coda-compliance-tool';
import { mapboxFarePaymentSystem } from './mapbox-fare-payment-system';
import { pawpay } from './pawpay';

export type { CaseStudy, ArchitectureStep, Decision, ResultMetric } from './case-study.types';

/** All 6 case studies (Sheet 08), keyed by slug — one per `content/projects.ts` entry. */
export const CASE_STUDIES = {
  'set-dialer': aiCustomerServiceAgent,
  'nexus-odm': codaComplianceTool,
  'filipina-dating-app': pawpay,
  'livelihood-mobile-app': automatedVideoPipeline,
  'behold-bohol-trip': mapboxFarePaymentSystem,
  'love-bohol-portal': browserAutomationAgent,
};

export function getCaseStudy(slug: string) {
  const project = PROJECTS.find((p) => p.slug === slug);
  const caseStudy = CASE_STUDIES[slug as keyof typeof CASE_STUDIES];
  if (!project || !caseStudy) return undefined;
  return { project, caseStudy };
}

/** The next case study in `content/projects.ts` order, wrapping to the first. */
export function getNextProject(slug: string) {
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  return PROJECTS[(index + 1) % PROJECTS.length];
}
