/**
 * How I work with clients, from the first call to delivery (`/process`).
 *
 * DRAFT: this is a proposed process. Edit stages and answers here as the real
 * process becomes clear. Anything in [square brackets] is a placeholder
 * (docs/GOALS.md → Honesty): replace it with a real value or remove it before
 * launch. Never invent durations, prices or terms.
 */

/** Real date this content was last edited. Update it whenever the content changes. */
export const PROCESS_UPDATED = '2026-10-12';

export type ProcessStage = {
  /** URL-safe id, also the anchor (`/process#discovery-call`). */
  id: string;
  /** Mono label, e.g. "01". */
  step: string;
  title: string;
  /** One plain sentence: what happens in this stage. */
  summary: string;
  /** Typical duration. Placeholder until confirmed. */
  duration: string;
  /** What I need from the client. */
  fromYou: string[];
  /** What the client gets at the end of the stage. */
  fromMe: string[];
};

export const PROCESS_STAGES: ProcessStage[] = [
  {
    id: 'discovery-call',
    step: '01',
    title: 'Discovery call',
    summary:
      'We talk through your idea, who it is for, and what a good result looks like. I ask questions and tell you honestly whether I am the right fit.',
    duration: '[30–45 min]',
    fromYou: ['A rough idea or problem to solve', 'Any existing product, brand or links', 'Your target launch date, if you have one'],
    fromMe: ['Straight feedback on scope and feasibility', 'A clear yes or no on whether I can help', 'The next step in writing'],
  },
  {
    id: 'brief-and-scope',
    step: '02',
    title: 'Brief and scope',
    summary:
      'I turn the call into a written brief: goals, features, what is in and out of scope, and an estimate with a timeline.',
    duration: '[2–3 days]',
    fromYou: ['Review and correct the brief', 'Answers to open questions', 'Sign-off on scope and budget'],
    fromMe: ['A written project brief', '[Estimate and payment terms]', 'A prioritized feature list (must-have vs. later)'],
  },
  {
    id: 'blueprint',
    step: '03',
    title: 'Blueprint',
    summary:
      'Before writing production code I plan the architecture, data model, third-party services and key screens, so there are no big surprises later.',
    duration: '[3–5 days]',
    fromYou: ['Feedback on screens and flows', 'Access to any services or accounts I need'],
    fromMe: ['Architecture and data-model outline', 'Screen flows or wireframes', 'Milestone plan with demo dates'],
  },
  {
    id: 'build',
    step: '04',
    title: 'Build',
    summary:
      'I build in small increments and ship working features to a staging site, so you can see real progress instead of waiting for a big reveal.',
    duration: '[depends on scope]',
    fromYou: ['Quick feedback on each demo', 'Content, copy and assets when needed'],
    fromMe: ['[Weekly] demo or progress update', 'A live staging link you can click through', 'Open decisions raised early, not at the end'],
  },
  {
    id: 'review',
    step: '05',
    title: 'Review and testing',
    summary:
      'We go through the whole product together. I fix bugs, handle agreed revisions, and check performance, accessibility and security basics.',
    duration: '[3–7 days]',
    fromYou: ['One consolidated round of feedback', 'Final approval of the build'],
    fromMe: ['Bug fixes and agreed revisions', 'Testing across devices and browsers', 'A short launch checklist'],
  },
  {
    id: 'launch',
    step: '06',
    title: 'Launch',
    summary:
      'I deploy to production, connect your domain and services, and watch the first live traffic closely.',
    duration: '[1–2 days]',
    fromYou: ['Domain and hosting access', 'Go-live approval'],
    fromMe: ['Production deployment', 'Monitoring and error tracking set up', 'A quick walkthrough of how it runs'],
  },
  {
    id: 'handover',
    step: '07',
    title: 'Handover and support',
    summary:
      'You get the code, documentation and access. After launch I fix issues in the agreed support window, and we can keep working together if you want to grow the product.',
    duration: '[support window]',
    fromYou: ['Report any issues you find', 'Decide on next features, if any'],
    fromMe: ['Source code and documentation', '[Post-launch support window]', 'Optional ongoing maintenance or new features'],
  },
];

export type FaqItem = {
  id: string;
  question: string;
  /** Self-contained, 40–80 words, names Jovanni so it still makes sense when quoted out of context. */
  answer: string;
};

export const PROCESS_FAQ: FaqItem[] = [
  {
    id: 'how-do-you-work-with-clients',
    question: 'How does Jovanni work with clients from first call to delivery?',
    answer:
      'Jovanni works in seven stages: discovery call, brief and scope, blueprint, build, review and testing, launch, and handover with support. Each stage has a clear output, such as a written brief, an architecture plan, or a staging link, so you always know what is done and what comes next.',
  },
  {
    id: 'how-does-a-project-start',
    question: 'How does a project start?',
    answer:
      'A project starts with a discovery call. Jovanni listens to your idea, asks about users and goals, and says honestly whether the project is a good fit. If it is, a written brief with scope, estimate and timeline follows, and nothing starts until you approve it.',
  },
  {
    id: 'how-long-does-a-project-take',
    question: 'How long does a project take?',
    answer:
      'The timeline depends on the scope of the project. A small, focused build takes less time than a product with payments, AI features or several integrations. Jovanni gives a timeline in the written brief after the discovery call, and splits the work into milestones with demo dates, so you can see progress and adjust priorities along the way.',
  },
  {
    id: 'how-do-you-price-projects',
    question: 'How does Jovanni price projects?',
    answer:
      '[Pricing model: fixed price per milestone, hourly, or monthly retainer.] Jovanni sends a written estimate after the discovery call, and the scope in the brief defines what the price covers. Changes to scope are discussed and agreed before any extra work starts.',
  },
  {
    id: 'what-tech-stack-do-you-use',
    question: 'Which tech stack does Jovanni use?',
    answer:
      'Jovanni builds with TypeScript, Next.js and React on the front end, React Native for mobile, and Node.js on the back end. Data lives in PostgreSQL, with pgvector for AI search. Jovanni deploys on AWS and Vercel, and uses the Claude API for AI features. The stack is chosen to fit your project.',
  },
  {
    id: 'do-you-build-ai-agents',
    question: 'Does Jovanni build AI agents and RAG systems?',
    answer:
      'Yes. Jovanni has built an AI customer service agent, a browser automation agent and a compliance tool that uses retrieval over PostgreSQL with pgvector and the Claude API. Each one is described in a case study on the work page, including the decisions and trade-offs.',
  },
  {
    id: 'who-owns-the-code',
    question: 'Who owns the code and the product?',
    answer:
      'Ownership terms: you own the code and assets on final payment. At handover Jovanni delivers the source code, documentation and access to every service set up for the project, so you are never locked in to Jovanni.',
  },
  {
    id: 'what-happens-after-launch',
    question: 'What happens after launch?',
    answer:
      'After launch Jovanni monitors the first live traffic and fixes issues during the agreed support window of support window. After that you can run the product on your own with the documentation, or continue with ongoing maintenance and new features.',
  },
  {
    id: 'which-time-zone',
    question: 'Which time zone does Jovanni work in?',
    answer:
      'Jovanni works remotely and adjusts working hours to what the client needs, so there is no fixed time zone. Meeting times and the amount of overlap are agreed during the discovery call. Updates are written and asynchronous by default, with calls scheduled when a conversation is faster than a message.',
  },
];
