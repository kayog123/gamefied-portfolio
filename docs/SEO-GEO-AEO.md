# SEO · GEO · AEO

How this portfolio gets found by search engines (**SEO**), cited by AI assistants and AI search (**GEO**, Generative Engine Optimization), and used as the direct answer to questions (**AEO**, Answer Engine Optimization).

Related docs: [Goals](./GOALS.md) · [File structure](./FILE-STRUCTURE.md) · [Packages](./PACKAGES.md)

---

## The core problem

The home page (`/`) is an interactive game. A crawler or AI model fetching it gets a 3D city and an input box, which is **almost no indexable meaning**. If we do nothing, the most impressive page will also be the least discoverable.

**Strategy:**

| Route | Role in search | Indexed |
|-------|----------------|---------|
| `/` (game) | Brand entry point. Server-renders its **real text** (H1, intro, nav links to `/work`) and carries the site-wide `WebSite` + `Person` schema | ✅ |
| `/work` (07 See My Work) | **Primary entity page.** Who I am, what I build, skills, experience, 6 projects. Where most rankings and AI citations should land | ✅ |
| `/work/[slug]` (08 Case study) | **Primary content pages.** Long-tail queries ("NestJS BullMQ pgvector compliance tool"), proof that gets cited | ✅ |
| `/api/*` | Endpoints | ❌ disallow |
| `/components` (UI kit preview) | Dev only | ❌ `noindex` (and excluded from prod) |
| Visitor-generated blueprints | Ephemeral client state with no URLs | — (never create indexable URLs for them) |

Rule: **everything a human or machine needs to understand who I am and what I've shipped must exist as server-rendered HTML on `/work` and `/work/[slug]`.** The game is a layer on top, not the source of truth.

---

## 1 · SEO (classic search)

### Technical foundation

All of this uses **built-in Next.js 16 metadata APIs**, so no SEO package is needed.

| Item | Implementation | File |
|------|----------------|------|
| Site URL | `SITE_URL` env var → `metadataBase` | `lib/site.ts`, `app/layout.tsx` |
| Titles | Template `"%s · Jovanni — Full-stack & AI Engineer"`, default for `/` | `app/layout.tsx` |
| Per-page metadata | `export const metadata` (static) or `generateMetadata` (case studies) | each `page.tsx` |
| Canonical URLs | `alternates: { canonical: '/work/…' }` on every indexable page | each `page.tsx` |
| Sitemap | Generated from `content/` (home, `/work`, every case study) with `lastModified` | `app/sitemap.ts` |
| Robots | Allow all, disallow `/api/` and `/components`, point to sitemap | `app/robots.ts` |
| Open Graph / X cards | Blueprint-styled images generated per page (navy grid, mono eyebrow, Space Grotesk title) | `app/opengraph-image.tsx`, `app/(site)/work/[slug]/opengraph-image.tsx` |
| Icons / manifest | Diamond logo mark | `app/icon.svg`, `app/apple-icon.png`, `app/manifest.ts` |
| 404 | Helpful `not-found.tsx` that links to `/work` and case studies | `app/not-found.tsx` |
| Language | `<html lang="en">` | `app/layout.tsx` |

**Static by default.** `/work` and `/work/[slug]` are prerendered (`generateStaticParams` over `content/case-studies`). Prerendered pages resolve metadata at build time, so crawlers always get complete `<head>` tags.

### Root metadata (sketch)

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Jovanni — Full-stack & AI Engineer · Your idea → Live product',
    template: '%s · Jovanni — Full-stack & AI Engineer',
  },
  description:
    'I build products end to end: web and mobile apps, AI agents, payments, maps and automation. Type your idea and watch it become a blueprint.',
  openGraph: { type: 'website', siteName: 'Jovanni', locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
};
```

### Sitemap and robots (sketch)

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { caseStudies } from '@/content/case-studies';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE.url}/work`, changeFrequency: 'monthly', priority: 1 },
    ...caseStudies.map((cs) => ({
      url: `${SITE.url}/work/${cs.slug}`,
      lastModified: cs.updatedAt,
      changeFrequency: 'yearly' as const,
      priority: 0.9,
    })),
  ];
}
```

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/components'] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
```

### On-page rules

- **One `<h1>` per page**, and it should say what the page is. On `/work` the visual headline is "Your idea → Live product." Pair it with a visible role line ("Full-stack & AI Engineer") in the same header so the entity is unambiguous.
- **Headings are real headings** (`h1`→`h2`→`h3`), not styled `div`s. The mono eyebrows (`01 — PROBLEM`) are decoration, and the section name goes in the heading.
- **Descriptive link text.** "Read the CODA Compliance Tool case study", not "click here". Proof cards and "Next case study" links are our internal-link graph, so every case study should be linked from at least 2 places.
- **Images** use `next/image` with real `alt` text ("Review dashboard showing flagged clauses with cited rules"), explicit sizes and modern formats. Decorative grid and annotation art is CSS or `aria-hidden`.
- **URLs** are short kebab-case slugs that match the content (`/work/mapbox-fare-payment-system`), and they never change once published. If a slug must change, add a `redirects` entry in `next.config.ts`.
- **Breadcrumbs** on case studies: `Work › CODA Compliance Tool`, both visible and as `BreadcrumbList` schema.

### Performance (Core Web Vitals)

| Metric | Target | Main risk here | Mitigation |
|--------|--------|----------------|------------|
| LCP | < 2.5s | Hero headline web fonts; city scene on `/` | `next/font` (self-hosted, `display: swap`); city is client-only and loads after the server-rendered intro text |
| CLS | < 0.1 | Fonts swapping, images without size | `next/font` size-adjust fallbacks; fixed `width`/`height` on images and the portrait frame |
| INP | < 200ms | Game interactions, big client bundles | Keep `'use client'` leaves small; no 3D/game code in the `(site)` bundle |

The `(site)` pages **never import** City or game code (see [File structure](./FILE-STRUCTURE.md#server-vs-client-boundaries)).

---

## 2 · GEO (Generative Engine Optimization)

The goal is for AI assistants (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews, Copilot) to **understand who Jovanni is and what Jovanni builds, and cite these pages** when asked things like *"full-stack engineers who build AI agents with Claude and pgvector"*.

### Principles

1. **Be one clear entity.** Use the same name, role and one-line description everywhere: site, schema, GitHub, LinkedIn, résumé. Link them all with `sameAs`.
2. **State facts plainly in HTML.** Models quote sentences. Write self-contained, factual sentences that make sense when lifted out of context:
   - ✅ "The CODA Compliance Tool checks long documents against compliance rules using NestJS, BullMQ, PostgreSQL with pgvector and the Claude API."
   - ❌ "We cooked up something cool here 🚀"
3. **Specific beats vague.** Name the technologies, the problem, the constraints and the result. Real numbers are highly citable, which is why placeholders like `[metric]` must be replaced with real figures **or removed**, never invented ([Goals → Honesty](./GOALS.md#quality-bar)).
4. **Structure helps extraction.** Short sections, descriptive headings, lists and tables, and a summary at the top of every case study.
5. **Freshness.** Show "Last updated" dates on case studies and in `dateModified` schema, and keep the sitemap `lastModified` accurate.
6. **Corroboration.** AI systems trust what's consistent across sources. Mirror key facts in the GitHub profile README, LinkedIn and any write-ups, and link back to the canonical case study.

### Structured data (JSON-LD)

Rendered as a `<script type="application/ld+json">` in the layout or page, as Next recommends, **escaping `<` as `<`** to prevent XSS. Type it with `schema-dts` (see [Packages](./PACKAGES.md)). Use one connected graph with stable `@id`s:

| Schema | Where | Key fields |
|--------|-------|------------|
| `Person` (`@id: /#person`) | Root layout | `name`, `jobTitle`, `description`, `url`, `image`, `sameAs` (GitHub, LinkedIn), `knowsAbout` (from `content/skills.ts`), `email` *(only if you want it public)* |
| `WebSite` (`@id: /#website`) | Root layout | `name`, `url`, `author → /#person` |
| `ProfilePage` | `/work` | `mainEntity → /#person`, `dateModified` |
| `ItemList` of `CreativeWork` | `/work` | The 6 projects, each with `url` → case study |
| `Article` (or `TechArticle`) | `/work/[slug]` | `headline`, `description`, `author → /#person`, `datePublished`, `dateModified`, `image`, `about` (technologies), `keywords` |
| `BreadcrumbList` | `/work/[slug]` | Work › Case study |
| `FAQPage` | `/work` FAQ section (see AEO) | Only for questions **visibly answered** on the page |

```tsx
// components/seo/json-ld.tsx (Server Component)
import type { Thing, WithContext } from 'schema-dts';

export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
```

Build schema objects from `content/` in `lib/seo/schema.ts`, so the schema can never drift from the visible page.

### AI crawler access

Most AI products crawl with their own user agents (e.g. `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`). For a portfolio whose goal is to be **found and cited**, the default is to **allow them**, and the `robots.ts` above already does via `userAgent: '*'`. If we ever want to opt out of model *training* while staying in AI *search*, add per-agent rules. That's a deliberate decision to record in [Open decisions](#open-decisions).

### `llms.txt` (optional, low cost)

`llms.txt` is a **proposed** convention (not an official standard, and support varies by AI provider): a Markdown file at `/llms.txt` that summarizes the site and links its key pages for language models. It's cheap to generate from `content/`, so we'll add it as a route handler:

```
app/llms.txt/route.ts   →  GET returns text/markdown built from content/projects.ts + case studies
```

Contents: a one-paragraph bio, services, skills, and a list of case studies, each with a one-line summary and URL. Treat it as a bonus. The HTML pages and schema remain the primary signal.

---

## 3 · AEO (Answer Engine Optimization)

The goal is to be the **direct answer**, as a featured snippet, a voice answer, or the sentence an AI assistant quotes.

### Writing answer-first content

- **Answer-first case studies.** Open every case study with a 40–60 word **summary** stating what was built, for whom, with what, and the outcome. Put it before the screenshot.
- **Question-shaped headings** where natural, with the answer in the first sentence below:
  - "What problem did the CODA Compliance Tool solve?"
  - "Why use pgvector inside Postgres instead of a separate vector database?"
- **Definitions and comparisons as lists or tables.** The case-study "Key decisions & trade-offs" cards are ideal answer material. Keep each one to a decision, a reason and a trade-off in plain sentences.
- **Concise first, detail second.** Short answer paragraph, then depth.

### FAQ section on `/work`

Add a visible FAQ near the contact section that answers what clients and recruiters actually ask. Draft questions:

- What kinds of products do you build?
- Which tech stack do you use? *(Next.js, NestJS, PostgreSQL/pgvector, Claude API, AWS, React Native)*
- Do you build AI agents and RAG systems?
- Do you work with startups and agencies? Freelance or full-time?
- How does a project usually start? *(the blueprint → brief → call flow)*
- What time zones do you work in? *(fill in)*

Mark these up as `FAQPage`. Note: Google currently shows FAQ rich results only for a narrow set of authoritative sites, so **don't expect FAQ snippets in Google**. The markup and the clear Q&A text still help AI answer engines and on-page AEO. Never add FAQ schema for questions that aren't visible on the page.

### The game's role in AEO

The blueprint flow (presets like "AI Chatbot", "Booking App", "Fintech Dashboard") maps to real search intent such as *"how to build a booking app"* or *"stack for an AI chatbot"*. **Later (post-v1)**, consider static, indexable pages per preset ("Blueprint: AI Chatbot": features, suggested stack, roadmap, linked case studies) generated from `content/presets.ts`. Track this as an idea, not a v1 commitment.

---

## Target topics and keywords

These are starting hypotheses. Validate them with Search Console data after launch.

| Intent | Example queries | Landing page |
|--------|-----------------|--------------|
| Hire / brand | "Jovanni full-stack developer", "Jovanni AI engineer" | `/`, `/work` |
| Hire / service | "freelance full-stack AI engineer", "Next.js NestJS developer for hire", "AI agent developer" | `/work` |
| Proof / long-tail | "AI compliance document review pgvector Claude", "Mapbox fare calculation payments", "Shopify Recharge AI customer service agent" | `/work/[slug]` |
| Learning / answers | "pgvector vs dedicated vector database", "BullMQ for long-running AI jobs" | Case-study decision sections |

---

## Measurement

| Tool | What for |
|------|----------|
| Google Search Console | Indexing, queries, CTR, Core Web Vitals, rich-result validity |
| Bing Webmaster Tools | Bing indexing. Several AI assistants draw on Bing's index |
| Rich Results Test / Schema Markup Validator | Validate JSON-LD before each release |
| Lighthouse / PageSpeed Insights | Performance, SEO and a11y audits for `/work` and one case study |
| Analytics (see [Packages → Open decisions](./PACKAGES.md#open-decisions)) | Referrals from AI products (e.g. `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com`) as a GEO signal |
| Manual AI checks (monthly) | Ask several assistants "Who is Jovanni, the full-stack & AI engineer?" and a few service queries; note whether the site is cited and accurate |

Add these to the [success measures](./GOALS.md#success-measures): **organic clicks**, **indexed pages**, **AI referral sessions**, **case-study entrances from search**.

---

## Checklists

### Every indexable page

- [ ] Unique `title` (≤ 60 chars) and `description` (≈ 140–160 chars)
- [ ] `alternates.canonical` set
- [ ] OG image renders (blueprint style) and is ≤ 1200 × 630
- [ ] Exactly one `<h1>`; heading levels in order
- [ ] Key facts visible as server-rendered text (check with JavaScript disabled)
- [ ] JSON-LD present, valid, and matches visible content
- [ ] Images have meaningful `alt`; decorative art is `aria-hidden`
- [ ] Linked from at least one other page; links use descriptive text

### Every case study

- [ ] 40–60 word answer-first summary at the top
- [ ] Problem → Architecture → Decisions → Stack → Results, with real headings
- [ ] Real results or the section removed. No `[metric]` placeholders in production
- [ ] `datePublished` / `dateModified` shown and in schema
- [ ] Breadcrumb + "Next case study" link

### Before launch

- [ ] `SITE_URL` set for production; `metadataBase` resolves absolute URLs
- [ ] `sitemap.xml` and `robots.txt` reachable and correct
- [ ] `/components` and `/api/*` not indexable
- [ ] Search Console and Bing Webmaster Tools verified; sitemap submitted
- [ ] Lighthouse SEO = 100 and performance ≥ 90 on `/work` (mobile)
- [ ] `sameAs` profiles (GitHub, LinkedIn) live and linking back to the site
- [ ] `llms.txt` generated (optional)

---

## Open decisions

- [ ] **Production domain.** Needed for `metadataBase`, canonicals and the sitemap.
- [ ] **Public identity details for schema.** Full name as it should appear, headshot, which profiles go in `sameAs`, whether to publish an email, and location/time zone (helps "engineer in [region]" queries; only if you're comfortable sharing).
- [ ] **AI crawler policy.** Allow all (default), or block training crawlers while allowing AI search.
- [ ] **Per-preset blueprint pages** (post-v1 AEO idea): yes or no.
