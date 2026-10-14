/**
 * The shipped projects (Sheet 07 "Shipped work" grid).
 * Each links to a full case study at `/work/[slug]` (Sheet 08).
 */
export type ProjectPlatform = 'web' | 'mobile';
export type ProjectScope = 'frontend' | 'fullstack';

export const PLATFORM_LABEL: Record<ProjectPlatform, string> = { web: 'Web', mobile: 'Mobile' };
export const SCOPE_LABEL: Record<ProjectScope, string> = { frontend: 'Front end', fullstack: 'Full stack' };

export type Project = {
  slug: string;
  /** "01"–"06" — also used as the case study's CASE number. */
  idx: string;
  kind: string;
  /** Where it runs. Drives the Web / Mobile filter on /work. */
  platform: ProjectPlatform;
  /** How much of it I built. A filter chip only appears once a project uses that value. */
  scope: ProjectScope;
  title: string;
  /** Path under /public for the project screenshot, e.g. "/projects/set-dialer.png". Null = placeholder. */
  image: string | null;
  /** Optional phone screenshot. When set, the shot renders as a layered desktop + phone mockup. */
  mobileImage?: string;
  /** Placeholder label for the screenshot slot when no image is supplied. */
  shot: string;
  problem: string;
  stack: string[];
  result: string;
  /** External URL — a live site or a video link. */
  url: string | null;
  /** Determines the label and icon shown on the card link. */
  urlKind: 'live' | 'video' | null;
};

export const PROJECTS: Project[] = [
  {
    slug: 'set-dialer',
    idx: '01',
    kind: 'SAAS / VOICE',
    platform: 'web',
    scope: 'fullstack',
    title: 'Set Dialer',
    image: '/projects/set-dialer.png',
    shot: 'screenshot — dialer dashboard',
    problem: 'Real estate agents manually dialed leads from spreadsheets with no way to track calls or take notes.',
    stack: ['Next.js', 'Twilio', 'GraphQL', 'AWS Amplify', 'NoSQL'],
    result: 'Auto-dialer pulls leads from CSV upload and logs in-call notes and dispositions.',
    url: 'https://drive.google.com/file/d/16ILMzy6uqzarXAx3DklfQ1JyMqha6ypN/view?usp=sharing',
    urlKind: 'video',
  },
  {
    slug: 'nexus-odm',
    idx: '02',
    kind: 'MARKETPLACE',
    platform: 'web',
    scope: 'fullstack',
    title: 'Nexus ODM',
    image: '/projects/nexus-odm-desktop.png',
    mobileImage: '/projects/nexus-odm-mobile.png',
    shot: 'screenshot — collaboration dashboard',
    problem: 'Influencers and brands had no dedicated space to find, pitch and manage partnership deals.',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Pusher.js', 'AWS'],
    result: 'Real-time marketplace where brands post campaigns and influencers apply and collaborate.',
    url: 'https://nexus-odm.com/',
    urlKind: 'live',
  },
  {
    slug: 'filipina-dating-app',
    idx: '03',
    kind: 'SOCIAL / DATING',
    platform: 'web',
    scope: 'fullstack',
    title: 'Filipina Dating App',
    image: '/projects/filipina-dating-app-desktop.png',
    mobileImage: '/projects/filipina-dating-app-mobile.png',
    shot: 'screenshot — match feed',
    problem: 'No dedicated platform connecting Filipina singles with international partners behind a secure paywall.',
    stack: ['Next.js', 'Clerk', 'Drizzle ORM', 'PlanetScale', 'PayPal', 'AWS'],
    result: 'Subscription-gated chat and media uploads with PayPal payment processing.',
    url: 'https://filipinadreamgirl-lime.vercel.app/en',
    urlKind: 'live',
  },
  {
    slug: 'livelihood-mobile-app',
    idx: '04',
    kind: 'MOBILE / MARKETPLACE',
    platform: 'mobile',
    scope: 'fullstack',
    title: 'Livelihood Mobile App',
    image: '/projects/livelihood.png',
    shot: 'screenshot — product marketplace',
    problem: 'Local residents in Tagbilaran had no easy way to sell products directly to tourists and residents.',
    stack: ['React Native', 'TypeScript', 'PlanetScale', 'Algolia', 'AWS', 'Redux'],
    result: 'Mobile marketplace with real-time chat and full-text product search for local vendors.',
    url: 'https://drive.google.com/file/d/1BrJ6ujcbphltkupJ5bK3f3NrlDQFhDam/view?usp=sharing',
    urlKind: 'video',
  },
  {
    slug: 'behold-bohol-trip',
    idx: '05',
    kind: 'MOBILE / TRANSPORT',
    platform: 'mobile',
    scope: 'fullstack',
    title: 'Behold Bohol Trip',
    image: '/projects/bbtrip.png',
    shot: 'screenshot — booking screen',
    problem: 'Tourists were overcharged by drivers with no reliable way to book transport at fair, fixed rates.',
    stack: ['React Native', 'TypeScript', 'PlanetScale', 'Pusher.js', 'AWS'],
    result: 'Fixed-rate booking app connecting tourists with tricycle, motorcycle and SUV drivers.',
    url: 'https://drive.google.com/file/d/1XpIY8oJPg2ZERlCYvEXvgEdC-_MP-flu/view?usp=sharing',
    urlKind: 'video',
  },
  {
    slug: 'love-bohol-portal',
    idx: '06',
    kind: 'ADMIN / CMS',
    platform: 'web',
    scope: 'fullstack',
    title: 'Love Bohol Portal',
    image: '/projects/love-bohol-portal-desktop.png',
    mobileImage: '/projects/love-bohol-portal-mobile.png',
    shot: 'screenshot — business dashboard',
    problem: 'Business owners had no way to manage their listings displayed inside the Skyride Travel mobile app.',
    stack: ['Next.js', 'DynamoDB', 'Algolia', 'AWS S3', 'MUI'],
    result: 'CMS portal feeding live business data directly into the Skyride mobile travel app.',
    url: 'https://www.beholdbohol.com/',
    urlKind: 'live',
  },
  {
    slug: 'roofing-company',
    idx: '07',
    kind: 'WEBSITE / ROOFING',
    platform: 'web',
    scope: 'frontend',
    title: 'Roofing Company',
    image: '/projects/roofing-company-desktop.png',
    mobileImage: '/projects/roofing-company-mobile.png',
    shot: 'screenshot — roofing company site',
    problem: 'A roofing company needed a professional website to present its services and win quote requests.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    result: 'Responsive marketing site built front end only, deployed on Vercel.',
    url: 'https://roofing-company-gamma.vercel.app/',
    urlKind: 'live',
  },
  {
    slug: 'women-essentials',
    idx: '08',
    kind: 'WEBSITE / E-COMMERCE',
    platform: 'web',
    scope: 'frontend',
    title: 'Women Essentials',
    image: '/projects/women-essentials-desktop.png',
    mobileImage: '/projects/women-essentials-mobile.png',
    shot: 'screenshot — storefront',
    problem: 'A women’s essentials brand needed a storefront front end to showcase its products online.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    result: 'Responsive storefront UI built front end only, deployed on Vercel.',
    url: 'https://women-essentials-sand.vercel.app/',
    urlKind: 'live',
  },
  {
    slug: 'travel-and-tours',
    idx: '09',
    kind: 'WEBSITE / TRAVEL',
    platform: 'web',
    scope: 'frontend',
    title: 'Travel and Tours',
    image: '/projects/travel-and-tours-desktop.png',
    mobileImage: '/projects/travel-and-tours-mobile.png',
    shot: 'screenshot — travel and tours site',
    problem: 'A travel and tours business needed a website to present destinations and packages to visitors.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    result: 'Responsive travel site built front end only, deployed on Vercel.',
    url: 'https://travel-and-tours-blush.vercel.app/',
    urlKind: 'live',
  },
  {
    slug: 'real-estate',
    idx: '10',
    kind: 'WEBSITE / REAL ESTATE',
    platform: 'web',
    scope: 'frontend',
    title: 'Real Estate',
    image: '/projects/real-estate-desktop.png',
    mobileImage: '/projects/real-estate-mobile.png',
    shot: 'screenshot — property listings',
    problem: 'A real estate business needed a website to showcase property listings to prospective buyers.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    result: 'Responsive property site built front end only, deployed on Vercel.',
    url: 'https://real-estate-topaz-five.vercel.app/',
    urlKind: 'live',
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
