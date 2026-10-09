# Packages

What we depend on, why, and the rules for adding anything new. Related docs: [Goals](./GOALS.md) · [File structure](./FILE-STRUCTURE.md) · [Design system](./design-system/README.md).

## Environment

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | **≥ 20.9** (required by Next 16). Local: 24.x | Pin it in `.nvmrc` / `engines` once CI exists |
| Package manager | **npm** | `package-lock.json` is committed. Don't mix in yarn/pnpm/bun lockfiles |
| Bundler | **Turbopack** (Next 16 default) | Tailwind runs through the `@tailwindcss/turbopack` loader (see `next.config.ts`) |

`next.config.ts` also enables `cacheComponents` and `partialPrefetching`. Read `node_modules/next/dist/docs/` before changing them.

---

## Installed today

### Runtime (`dependencies`)

| Package | Version | Why |
|---------|---------|-----|
| `next` | 16.4.0 | Framework: App Router, Server Components, route handlers |
| `react` | 19.3.0 | UI. We rely on React 19 APIs (`useEffectEvent`, `useActionState`, `use`) |
| `react-dom` | 19.3.0 | DOM renderer (must match `react` exactly) |

### Tooling (`devDependencies`)

| Package | Why |
|---------|-----|
| `typescript` | Type checking (strict) |
| `@types/node`, `@types/react`, `@types/react-dom` | Type definitions |
| `tailwindcss` (v4) | Styling. Tokens live in `@theme` (see `docs/design-system/tokens.css`) |
| `@tailwindcss/turbopack` | Turbopack loader for Tailwind v4 CSS |
| `eslint`, `eslint-config-next` | Linting (`core-web-vitals` + `typescript` presets) |

---

## Planned packages

Each one is tied to a goal or design requirement. Install them **when the milestone that needs them starts** ([GOALS.md → Milestones](./GOALS.md#milestones)), not all up front.

### Core (M0–M1: Foundations and UI kit)

| Package | Type | Why | Install |
|---------|------|-----|---------|
| `lucide-react` | dep | The design's icon set (`brain`, `zap`, `lock-keyhole`…). Tree-shaken React components instead of the mockups' CDN masks | `npm i lucide-react` |
| `clsx` | dep | Conditional class names | `npm i clsx tailwind-merge` |
| `tailwind-merge` | dep | Resolves conflicting Tailwind classes in `cn()` (`lib/cn.ts`), so variant overrides work | (above) |
| `server-only` | dep | Fails the build if server code (AI keys, email) is imported into a Client Component | `npm i server-only` |
| `prettier` + `prettier-plugin-tailwindcss` | dev | Consistent formatting and sorted Tailwind classes | `npm i -D prettier prettier-plugin-tailwindcss` |

Fonts (Space Grotesk, Inter, JetBrains Mono) come from the **built-in `next/font/google`**, so there's no package to install.

### Data and validation (M2–M3: Content and the AI draft)

| Package | Type | Why |
|---------|------|-----|
| `zod` | dep | Validates the AI's structured blueprint output (features, stack, matching case studies) and form input (email, consent) on both server and client. Gives us typed results |
| AI SDK (see [Open decisions](#open-decisions)) | dep | Server-only call for idea → blueprint. Likely `@anthropic-ai/sdk`, since Claude is already in the showcased stack |

### Lead capture (M6: Launch and brief)

| Package | Type | Why |
|---------|------|-----|
| Email service SDK (see [Open decisions](#open-decisions)) | dep | Sends the brief to Jovanni after consent. Server-only |
| PDF generator (see [Open decisions](#open-decisions)) | dep | "Download brief (PDF)" from the same brief data |

### SEO / GEO (M2: See My Work and case studies)

| Package | Type | Why |
|---------|------|-----|
| `schema-dts` | dev | Types for JSON-LD (`Person`, `ProfilePage`, `Article`, `BreadcrumbList`). Types only, nothing ships to the browser. See [SEO-GEO-AEO.md](./SEO-GEO-AEO.md#structured-data-json-ld) |

Sitemap, robots, metadata, OG images and icons all use **built-in Next.js metadata APIs**, so no SEO package is needed.

### Testing (from M1 onward)

| Package | Type | Why |
|---------|------|-----|
| `vitest` | dev | Unit tests for reducers, utils and hooks |
| `@vitejs/plugin-react` | dev | JSX/TSX support in Vitest |
| `jsdom` | dev | DOM environment for component and hook tests |
| `@testing-library/react` | dev | `render` / `renderHook` for components and custom hooks |
| `@testing-library/user-event` | dev | Realistic keyboard and pointer input (Enter vs Shift+Enter, ↑/↓, Tab to ports) |
| `@testing-library/jest-dom` | dev | DOM matchers (`toBeDisabled`, `toHaveFocus`) |
| `@playwright/test` | dev | End-to-end tests: the full Spark → Launch flow, skips, mobile viewport (390 × 844) |
| `@axe-core/playwright` | dev | Automated accessibility checks for the WCAG 2.2 AA goal |

```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm i -D @playwright/test @axe-core/playwright && npx playwright install
```

### Launch (M7)

| Package | Type | Why |
|---------|------|-----|
| Analytics (see [Open decisions](#open-decisions)) | dep | Tracks the [success measures](./GOALS.md#success-measures) |

---

## Deliberately *not* using (v1)

| Instead of… | We use… | Reason |
|-------------|---------|--------|
| `three`, `@react-three/fiber` | **CSS 3D transforms** (`preserve-3d`, `rotateX(60deg) rotateZ(-45deg)`) | The City design is already built with CSS 3D boxes. Five buildings don't justify a WebGL bundle. Revisit if we need lighting or orbiting beyond what CSS can do |
| `framer-motion` / `motion` | **CSS transitions/keyframes + Web Animations API** | The motion spec is small (slides, pops, sweeps, count-ups). Tokens are already in `tokens.css`. Add `motion` only if choreography gets unmanageable |
| Redux, Zustand, Jotai | **`useReducer` + Context** (`features/game/`) | One game state tree with a handful of actions |
| `react-hook-form` / Formik | **React 19 `<form action>` + `useActionState` + `zod`** | Only 2 small forms (brief and contact) |
| SWR / TanStack Query | **Server Components + route handlers** | Content is static, and the only client fetch is the one-off blueprint generation |
| CSS-in-JS, Sass, UI kits (MUI, shadcn copies) | **Tailwind v4 + Blueprint tokens** | The design system is custom. Generic kits would fight it |
| `moment`, `lodash` | Native `Intl` / modern JS | Not needed |
| `axios` | Native `fetch` | Built in. Next extends it for caching |

---

## Rules for adding a package

Before running `npm i`, check every box:

1. **Is it needed now?** It should be tied to the current milestone or a doc'd requirement, not "might be handy".
2. **Can the platform do it?** Check Next built-ins (`next/font`, `next/image`, `next/og`, metadata, route handlers), React 19 APIs and Web APIs first.
3. **Client cost.** For anything imported by a `'use client'` file, check the bundle size (e.g. bundlephobia). It should be tree-shakeable and ESM. The 2D `(site)` pages must stay lightweight.
4. **Health.** It should be actively maintained (a release in the last ~12 months), typed (ships its own types or has good `@types`), and permissively licensed (MIT, Apache-2.0, BSD or ISC).
5. **Compatibility.** It must support React 19 and Next 16 (App Router and Server Components), and must not pin an older React.
6. **Server-only?** If it touches secrets, only import it from `server/` folders, route handlers or Server Actions that start with `import 'server-only'`.
7. **Document it.** Add a row to this file with the package, why we need it and what it replaces, in the same PR.

### Versioning and updates

- **Commit `package-lock.json`.** Use `npm ci` in CI.
- `next`, `react`, `react-dom` and `eslint-config-next` are pinned to **exact versions** and upgraded together on purpose. Read the Next upgrade guide in `node_modules/next/dist/docs/01-app/02-guides/upgrading/` first.
- Other packages use `^` ranges. Run `npm outdated` monthly and update in small, separate PRs.
- Run `npm audit` before each deploy. Fix high and critical issues promptly.
- Never commit `.env*` files. Each package's API keys are listed in `.env.example` (names only, no values).

---

## Open decisions

These match the open questions in [GOALS.md](./GOALS.md#open-questions). When one is decided, move it into a table above and tick it off there.

| Need | Candidates | Leaning |
|------|------------|---------|
| AI provider (idea → blueprint) | `@anthropic-ai/sdk`, Vercel `ai` SDK | `@anthropic-ai/sdk`: matches the showcased stack, structured output validated with `zod`. Until chosen, `app/api/blueprint` and `app/api/brief` validate and respond honestly without calling out to a real provider — see the `TODO` comments in `features/generating/server/generate-blueprint.ts` and `app/api/brief/route.ts` |
| Email delivery | `resend` (+ `@react-email/components`), Postmark, Nodemailer + SMTP | `resend`: simple API, React email templates. `/api/brief` validates and acknowledges today but doesn't send anything real yet |
| Brief PDF | ~~`@react-pdf/renderer` (server)~~ → **`window.print()` + a print stylesheet (shipped)** | No new dependency: `#brief-print-area` (Sheet 06) isolates via `@media print` in `app/globals.css`. Revisit `@react-pdf/renderer` only if a one-click download (no print dialog) becomes a real requirement |
| Analytics | `@vercel/analytics`, Plausible, PostHog | `@vercel/analytics` if hosting on Vercel. PostHog if we need funnels |
| Booking | Cal.com embed, Calendly link | **Interim: `BOOK_A_CALL_URL` in `lib/site.ts` points at `/work#contact` (shipped).** Swap in a real scheduling link once chosen |
