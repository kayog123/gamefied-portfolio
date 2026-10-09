import type { CaseStudy } from './case-study.types';

export const browserAutomationAgent: CaseStudy = {
  slug: 'browser-automation-agent',
  lead: 'A browser agent that completes multi-step tasks on sites with no API to call, by actually driving a real browser.',
  meta: { role: 'AI + full-stack engineering', stack: 'Claude API · browser-use · Next.js', timeline: '[x weeks]', type: 'Client project' },
  problem:
    'Some tasks only exist behind a web UI — no API, no webhook, just a page meant for a human to click through. Doing them by hand, over and over, was the only option.',
  architecture: [
    { name: 'Task instruction', tech: 'natural language' },
    { name: 'LLM planner', tech: 'Claude API', accent: true },
    { name: 'browser-use', tech: 'drives real browser' },
    { name: 'Target site', tech: 'no API available' },
    { name: 'Result', tech: 'extracted or confirmed' },
  ],
  decisions: [
    {
      title: 'Drive a real browser, not scrape HTML',
      why: 'Many of these sites are JS-heavy and actively resist scraping. A real, visible browser session behaves exactly like a human visitor.',
      cost: 'Slower and more resource-heavy per task than a direct HTTP request would be.',
    },
    {
      title: 'LLM re-plans after every page, not a fixed script',
      why: 'Sites change their layout often enough that a hardcoded click sequence breaks. The agent reads the current page and decides the next action each step.',
      cost: 'More LLM calls per task, and occasional wrong turns that need a retry step.',
    },
    {
      title: 'Stop and ask on anything destructive',
      why: 'An agent that can click anything needs a hard line before payments, deletions or anything irreversible — those steps pause for a human to confirm.',
      cost: "Fully unattended runs aren't possible for tasks that cross that line.",
    },
  ],
  stack: [
    { name: 'LLM', role: 'Planning & page understanding' },
    { name: 'browser-use', role: 'Real browser driving' },
    { name: 'Next.js', role: 'Task dashboard' },
    { name: 'Vercel', role: 'Hosting & deployment' },
  ],
  results: [
    { metric: '[metric]', description: 'Tasks completed without a human step-in.' },
    { metric: '[metric]', description: 'Average steps per completed task.' },
    { metric: '[metric]', description: 'Hours of manual browsing replaced per week.' },
  ],
};
