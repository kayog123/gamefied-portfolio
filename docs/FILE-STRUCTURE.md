# File structure, naming & custom hooks

How code is organized in this repo, what to call things, and how to write custom hooks.

Stack: **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**. The path alias `@/*` points at the repo root (see `tsconfig.json`), so imports look like `@/components/blueprint/button`.

> Next.js 16 differs from older versions. Check `node_modules/next/dist/docs/` before adding framework files. For example, **`middleware.ts` is now `proxy.ts`**.

---

## 1 · File structure

### Principles

1. **`app/` is for routing only.** It holds pages, layouts, route handlers and Next special files. Feature logic and UI live outside it.
2. **Organize by feature, share by layer.** Code used by one feature lives in that feature's folder. Code used by two or more features moves up into `components/`, `hooks/` or `lib/`.
3. **Server by default.** Components are Server Components unless they need state, effects, browser APIs or event handlers. Put `'use client'` on the **smallest** interactive component, not on whole pages.
4. **Content is data.** Projects, case studies, skills, presets and building definitions are typed data files, not hard-coded JSX.
5. **One-way imports:** `app → features → components / hooks / lib → (nothing)`. Shared layers never import from `features/`, and one feature never imports from another feature's internals.

### Tree

```
fullstack-portfolio/
├─ app/                          # Routes only
│  ├─ (game)/                    # Route group: full-viewport blueprint experience
│  │  ├─ layout.tsx              # Fixed 100dvh shell, GameProvider
│  │  └─ page.tsx                # "/"  →  Spark → Generating → HUD → … → Launch
│  ├─ (site)/                    # Route group: static, scrollable pages
│  │  ├─ layout.tsx              # Site top bar + footer
│  │  └─ work/
│  │     ├─ page.tsx             # "/work"         (07 See My Work)
│  │     └─ [slug]/
│  │        └─ page.tsx          # "/work/coda-compliance-tool"  (08 Case study)
│  ├─ api/
│  │  └─ blueprint/
│  │     └─ route.ts             # POST idea → structured blueprint (server-only AI call)
│  ├─ components/                # Dev-only UI kit preview (Sheet 00), excluded from prod
│  │  └─ page.tsx
│  ├─ layout.tsx                 # Root: <html>, fonts, metadata
│  ├─ globals.css                # @import "tailwindcss" + Blueprint tokens
│  ├─ not-found.tsx
│  ├─ error.tsx
│  ├─ icon.svg / opengraph-image.tsx
│  └─ sitemap.ts / robots.ts
│
├─ features/                     # One folder per experience (maps to the design sheets)
│  ├─ spark/                     # 01 Intro / Spark
│  │  ├─ components/
│  │  │  ├─ idea-input.tsx
│  │  │  └─ preset-chips.tsx
│  │  ├─ hooks/
│  │  │  └─ use-typewriter.ts
│  │  └─ index.ts                # Public API of the feature
│  ├─ generating/                # 02 Generating
│  │  ├─ components/ (blueprint-log.tsx, generation-progress.tsx)
│  │  ├─ hooks/ (use-blueprint-generation.ts)
│  │  ├─ server/ (generate-blueprint.ts, prompt.ts, fallback.ts)   # server-only
│  │  └─ index.ts
│  ├─ city/                      # Shared isometric City scene (all modes)
│  │  ├─ components/ (city-scene.tsx, building.tsx, building-label.tsx)
│  │  ├─ city.constants.ts       # Building layout, hues, scenery
│  │  └─ index.ts
│  ├─ hud/                       # 03 Main HUD
│  ├─ building-detail/           # 04 Detail panel / sheet
│  ├─ mini-game/                 # 05 Wire the API
│  ├─ launch/                    # 06 Launch + project brief
│  └─ game/                      # Cross-screen game state (the "engine")
│     ├─ game-provider.tsx
│     ├─ game.reducer.ts
│     ├─ game.types.ts
│     └─ hooks/ (use-game.ts, use-build-progress.ts)
│
├─ components/                   # Shared, feature-agnostic UI
│  ├─ blueprint/                 # Sheet 00 UI kit
│  │  ├─ button.tsx
│  │  ├─ text-field.tsx
│  │  ├─ chip.tsx
│  │  ├─ status-tag.tsx
│  │  ├─ segmented-progress.tsx
│  │  ├─ progress-bar.tsx
│  │  ├─ skill-shard.tsx
│  │  ├─ panel.tsx
│  │  ├─ dimension-line.tsx
│  │  ├─ title-block.tsx
│  │  ├─ proof-card.tsx
│  │  ├─ game-modal.tsx
│  │  ├─ timer-ring.tsx
│  │  └─ index.ts                # Barrel: re-exports the kit
│  └─ layout/                    # Top bar, logo, bottom sheet, site footer
│
├─ hooks/                        # Shared custom hooks (used by 2+ features)
│  ├─ use-reduced-motion.ts
│  ├─ use-media-query.ts
│  ├─ use-hotkeys.ts
│  ├─ use-countdown.ts
│  ├─ use-count-up.ts
│  ├─ use-focus-return.ts
│  └─ use-disclosure.ts
│
├─ lib/                          # Framework-agnostic utilities and clients
│  ├─ cn.ts                      # className join helper
│  ├─ format.ts                  # Percent, counters ("2/5"), timestamps
│  ├─ analytics.ts
│  └─ ai/                        # AI client wrapper (server-only)
│
├─ content/                      # Typed content data (no JSX)
│  ├─ projects.ts                # 6 shipped projects
│  ├─ case-studies/
│  │  ├─ coda-compliance-tool.ts
│  │  └─ …
│  ├─ skills.ts
│  ├─ experience.ts
│  ├─ presets.ts                 # 5 idea presets + their fallback blueprints
│  └─ spark-questions.ts         # Rotating Sheet 01 headline questions
│
├─ types/                        # Global/shared types (domain models)
│  └─ blueprint.ts               # Feature, Building, BuildStatus, Blueprint, Shard…
│
├─ public/                       # Static assets (images, OG fallbacks, résumé PDF)
├─ docs/                         # Goals, design system, this file
├─ proxy.ts                      # Only if needed (Next 16 name for middleware)
└─ next.config.ts / tsconfig.json / eslint.config.mjs / package.json
```

### Where does this file go?

| You're adding… | Put it in |
|----------------|-----------|
| A new URL | `app/…/page.tsx` (keep it thin: fetch data, compose feature components) |
| UI for one experience/screen | `features/<feature>/components/` |
| A Sheet 00 / design-system primitive | `components/blueprint/` |
| Layout chrome (top bar, sheet, footer) | `components/layout/` |
| A hook used by one feature | `features/<feature>/hooks/` |
| A hook used by 2+ features | `hooks/` |
| Pure helper (no React) | `lib/` (or `features/<feature>/<name>.utils.ts` if local) |
| Code that must never reach the browser | `features/<feature>/server/` or `lib/ai/`, with `import 'server-only'` at the top |
| Project / case-study / skill copy | `content/` |
| A type shared across features | `types/` (local types stay in `<feature>/<name>.types.ts`) |
| Images, fonts files, downloadable PDFs | `public/` |

### Feature folder anatomy

Every feature folder uses the same shape. Only create the subfolders you need:

```
features/<feature>/
├─ components/        # React components (PascalCase exports, kebab-case files)
├─ hooks/             # Feature-local hooks
├─ server/            # Server-only code (AI calls, data access) — 'server-only'
├─ <feature>.types.ts
├─ <feature>.constants.ts
├─ <feature>.utils.ts
└─ index.ts           # The ONLY entry point other code may import
```

Import a feature only through its `index.ts` (`import { HudScreen } from '@/features/hud'`), never `@/features/hud/components/...` from outside the feature.

### Server vs client boundaries

- **Pages and layouts** are Server Components. They read `content/` and pass plain data down as props.
- **Interactive leaves** (`idea-input.tsx`, `city-scene.tsx`, `game-modal.tsx`, …) start with `'use client'`. Everything they import is bundled for the client too, so keep heavy server-only modules out of their import graph.
- **Secrets** (AI keys, email-service keys) are used only in `app/api/**/route.ts`, Server Actions or `server/` folders. Those files `import 'server-only'` so an accidental client import fails the build.
- The **2D pages (`(site)`)** must stay static. They never import the City scene or game state.

---

## 2 · Naming conventions

### Files and folders

| Thing | Convention | Example |
|-------|------------|---------|
| Folders | `kebab-case` | `building-detail/`, `mini-game/` |
| Component files | `kebab-case.tsx` | `segmented-progress.tsx` |
| Hook files | `use-kebab-case.ts` | `use-countdown.ts` |
| Utility / lib files | `kebab-case.ts` | `format.ts`, `cn.ts` |
| Role-suffixed files | `<name>.<role>.ts` | `game.reducer.ts`, `city.constants.ts`, `hud.types.ts`, `spark.utils.ts` |
| Tests | Next to the file, `.test.ts(x)` | `use-countdown.test.ts`, `button.test.tsx` |
| Next.js special files | Exactly as Next defines them, lowercase | `page.tsx`, `layout.tsx`, `route.ts`, `not-found.tsx`, `proxy.ts` |
| Route groups / private folders | `(group)` / `_private` | `(game)`, `(site)`, `_internal` |
| Dynamic segments | `[camelCase]` | `[slug]` |
| Content slugs | `kebab-case`, also the URL | `coda-compliance-tool` |

Why kebab-case files: they avoid case-sensitivity bugs between Windows/macOS and Linux CI, and they match Next's own lowercase files.

### Code

| Thing | Convention | Example |
|-------|------------|---------|
| React components | `PascalCase` named export | `export function ProofCard()` |
| Component props type | `<Component>Props` | `type ProofCardProps = {…}` |
| Hooks | `useCamelCase` | `useCountdown`, `useBlueprintGeneration` |
| Functions / variables | `camelCase`, verbs for functions | `formatPercent`, `buildBrief` |
| Booleans | `is` / `has` / `can` / `should` prefix | `isLive`, `hasFocus`, `canSend` |
| Event props | `on<Event>` | `onSelect`, `onExpire`, `onSkip` |
| Handlers inside components | `handle<Event>` | `handleSubmit` |
| Constants (module-level, fixed) | `SCREAMING_SNAKE_CASE` | `MAX_IDEA_LENGTH = 500`, `GAME_SECONDS = 15` |
| Types / interfaces | `PascalCase`, no `I` prefix | `Building`, `BuildStatus` |
| Union literal values | lowercase strings that match the design | `'blueprint' \| 'building' \| 'live'` |
| Enum-like maps | `PascalCase` object + `as const` | `BuildingId.AiBrain` |
| Server Actions | verb + noun + `Action` | `sendBriefAction` |
| Route handlers | HTTP verb exports | `export async function POST()` |
| CSS custom properties | `--kebab-case`, from tokens | `--color-glow` |

Other code rules:

- **Use named exports everywhere** except Next special files, which require `export default` (`page.tsx`, `layout.tsx`, …).
- Each component file has **one exported component**. Small private subcomponents can live in the same file, unexported.
- **Use the domain words from the design:** *blueprint, building, shard, sheet, brief, proof, preset*. Don't invent synonyms like "tile" or "badge2".
- Barrels (`index.ts`) go only at **feature roots** and `components/blueprint/`. Don't nest barrels.

### Import order

Let ESLint/Prettier sort imports where possible. The order is:

1. `react`, `next/*`
2. Third-party packages
3. `@/types`, `@/lib`, `@/hooks`, `@/components`
4. `@/features/*`
5. Relative imports (`./`, `../`), used **only** inside the same feature or component folder

---

## 3 · Custom hooks

### When to write a hook

Write a custom hook when **stateful or effectful logic** is:

- **used in two or more components** (e.g. reduced-motion checks, hotkeys), or
- **noisy enough to hide what a component does** (timers, subscriptions, focus management, streaming), or
- **a single behavior from the design spec** (the 15s timer ring, typewriter presets, count-up percentages).

**Don't** write a hook for:

- Pure calculations. Use a plain function in `lib/` or `*.utils.ts`.
- Data fetching that can run on the server. Fetch it in the Server Component instead.
- Wrapping one `useState` with no extra logic.

### Rules

1. **Name starts with `use`, file starts with `use-`.** One hook per file. Small private helper hooks can live in the same file.
2. **Client-only.** Hooks run only in Client Components. The hook file itself doesn't need `'use client'`; the component that uses it does.
3. **SSR-safe.** Never touch `window`, `document` or `matchMedia` during render. Read browser state inside effects or with `useSyncExternalStore`, and give it a server snapshot.
4. **Always clean up.** Clear every interval, listener, observer, animation frame and `AbortController` in the effect's cleanup.
5. **Stable return shapes.** Return an **object** when there are 3+ values (`{ remaining, progress, isExpired }`). Return a **tuple** only for `useState`-like pairs (`[isOpen, toggle]`).
6. **Callbacks in, events out.** Accept callbacks as options (`onExpire`). Read them with `useEffectEvent` (React 19.2+) so they don't retrigger effects.
7. **Respect reduced motion.** Any hook that animates (typewriter, count-up, ripples) must skip to the end state when `useReducedMotion()` is true.
8. **Typed and documented.** Export the options and return types. Add a one-line JSDoc saying what the hook does and which design sheet it serves.
9. **Tested.** Hooks in `hooks/` get a `*.test.ts` with React Testing Library's `renderHook` and fake timers.

### Hook catalog (planned)

**Shared (`hooks/`)**

| Hook | Purpose | Used by |
|------|---------|---------|
| `useReducedMotion()` | `prefers-reduced-motion` as a boolean | All motion |
| `useMediaQuery(query)` | Reactive media query (desktop vs mobile layouts) | HUD, detail, launch |
| `useHotkeys(map, opts)` | Keyboard shortcuts (Esc, ↑/↓, ↵, Enter vs Shift+Enter) | Spark, HUD, detail, mini-game |
| `useCountdown(seconds, opts)` | Drift-free countdown with `onExpire` | Mini-game timer ring |
| `useCountUp(target, opts)` | Animated number for `68%` and progress percentages | Generating, HUD |
| `useTypeOnView({ length })` | Reveals text once, when it first scrolls into view; full text for SSR and reduced motion (`components/type-on-view.tsx`) | Work hero, Contact |
| `useInView({ threshold })` | True once an element has scrolled into view (sticky) (`components/reveal-on-view.tsx`) | Work experience timeline |
| `useFocusReturn(isOpen)` | Remembers the trigger and restores focus on close | Detail panel, modal, sheets |
| `useDisclosure()` | `isOpen` / `open` / `close` / `toggle` | Panels, sheets, modals |

**Feature-local**

| Hook | Feature | Purpose |
|------|---------|---------|
| `useTypewriter(text, opts)` | `spark` | Types a preset into the idea input, then calls `onDone` |
| `useRotatingTypewriter({ lines, paused })` | `spark` | Types, holds, erases and cycles the Sheet 01 headline questions (`content/spark-questions.ts`); frozen on the full line when paused or reduced motion |
| `useBlueprintGeneration()` | `generating` | Calls `/api/blueprint`, streams log lines and progress, falls back to the closest preset on error |
| `useGame()` | `game` | Reads game state and dispatch from `GameProvider` |
| `useBuildProgress()` | `game` | Derived values: `percent`, `liveCount`, segment statuses, collected shards |
| `useLinkedHover()` | `hud` / `city` | Two-way hover/focus between list rows and buildings |
| `useWireGame()` | `mini-game` | Ports, links, drag/tap/keyboard input, success and timeout auto-complete |

### Game state

Game state is **`useReducer` + Context** in `features/game/`. There's no extra state library in v1:

- `game.reducer.ts` is a pure reducer with typed actions (`IDEA_SUBMITTED`, `BLUEPRINT_READY`, `BUILDING_SELECTED`, `BUILDING_LIVE`, `AUTO_BUILD`, `RESET`, …). It's easy to unit test.
- `game-provider.tsx` (`'use client'`) holds the reducer and exposes it through context.
- Components never call `useContext` directly. They use `useGame()` or a narrower derived hook like `useBuildProgress()`.
- Keep derived values derived. Compute `percent` from `buildings` and don't store it.

### Examples

**SSR-safe browser state with `useSyncExternalStore`:**

```ts
// hooks/use-reduced-motion.ts
import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** True when the visitor prefers reduced motion. Server render assumes false. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
```

**Timer with cleanup and a callback that doesn't retrigger the effect:**

```ts
// hooks/use-countdown.ts
import { useEffect, useEffectEvent, useState } from 'react';

export type UseCountdownOptions = {
  running?: boolean;
  onExpire?: () => void;
};

export type UseCountdownResult = {
  remaining: number; // seconds, fractional
  progress: number;  // 1 → 0, drives the timer ring
  isExpired: boolean;
};

/** Drift-free countdown for the mini-game timer ring (Sheet 05). */
export function useCountdown(
  seconds: number,
  { running = true, onExpire }: UseCountdownOptions = {},
): UseCountdownResult {
  const [remaining, setRemaining] = useState(seconds);
  const handleExpire = useEffectEvent(() => onExpire?.());

  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, seconds - (performance.now() - start) / 1000);
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(id);
        handleExpire();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [running, seconds]);

  return { remaining, progress: remaining / seconds, isExpired: remaining === 0 };
}
```

**Using hooks in a component.** Logic stays in the hooks and the component stays readable:

```tsx
// components/blueprint/timer-ring.tsx
'use client';

import { useCountdown } from '@/hooks/use-countdown';

type TimerRingProps = { seconds: number; onExpire: () => void; size?: 52 | 56 | 68 };

export function TimerRing({ seconds, onExpire, size = 52 }: TimerRingProps) {
  const { remaining, progress } = useCountdown(seconds, { onExpire });
  const isUrgent = remaining < 3;
  // …render the SVG ring from `progress`; stroke turns red when `isUrgent`
}
```

### Hook review checklist

- [ ] Named `useX`, in `use-x.ts`, in the right folder (shared vs feature)
- [ ] No browser APIs during render. Server snapshot provided if needed
- [ ] Every effect cleans up
- [ ] Callbacks read through `useEffectEvent` or refs, not as effect dependencies
- [ ] Respects `useReducedMotion()` if it animates
- [ ] Options and return types exported, with a JSDoc line
- [ ] Test added (shared hooks)
