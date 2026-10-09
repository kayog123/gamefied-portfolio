import type { CaseStudy } from './case-study.types';

export const automatedVideoPipeline: CaseStudy = {
  slug: 'automated-video-pipeline',
  lead: 'A render-to-publish pipeline that turns a script into a posted video with no manual export-and-upload step in between.',
  meta: { role: 'Backend + automation engineering', stack: 'NestJS · BullMQ · AWS', timeline: '[x weeks]', type: 'Client project' },
  problem:
    'Every short video meant exporting from an editor, renaming files, and posting to each platform by hand — ten to fifteen minutes of repetitive work per clip, for creators publishing daily.',
  architecture: [
    { name: 'Script / assets', tech: 'input' },
    { name: 'Render queue', tech: 'BullMQ' },
    { name: 'Workers', tech: 'render job', accent: true },
    { name: 'Platform APIs', tech: 'social posting' },
    { name: 'Published post', tech: 'scheduled or live' },
  ],
  decisions: [
    {
      title: 'Queue renders instead of rendering in-request',
      why: 'A render can take minutes; BullMQ workers pick up jobs, retry failures and report progress without holding a request open.',
      cost: 'Needs its own worker infrastructure and a job-status UI, where a simple script had neither.',
    },
    {
      title: 'One pipeline, many platform targets',
      why: "A render job fans out to each platform's own posting API, so one render produces every version a creator needs.",
      cost: "Each platform's API has its own quirks and rate limits to handle separately.",
    },
    {
      title: "Schedule posts, don't just publish immediately",
      why: 'Creators plan posting times in advance; the pipeline queues a post for its scheduled time instead of always publishing the moment a render finishes.',
      cost: 'Needs reliable scheduled-job execution, not just a one-shot queue.',
    },
  ],
  stack: [
    { name: 'NestJS', role: 'Pipeline orchestration' },
    { name: 'Queue workers', role: 'Render jobs' },
    { name: 'Social APIs', role: 'Multi-platform posting' },
    { name: 'AWS', role: 'Render compute & storage' },
  ],
  results: [
    { metric: '[metric]', description: 'Minutes of manual work saved per clip.' },
    { metric: '[metric]', description: 'Clips published per week, same team size.' },
    { metric: '[metric]', description: 'Posting errors needing a manual retry.' },
  ],
};
