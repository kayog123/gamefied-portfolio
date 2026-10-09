<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project docs: read before writing code

This repo is the **Blueprint** portfolio. The docs in `docs/` are the source of truth for *what* we build and *how*. **Before writing or changing code, read the docs relevant to the task.** Follow them over your own defaults. If a doc and the code disagree, follow the doc and point out the mismatch.

| Doc | Read it when… |
|-----|---------------|
| `docs/GOALS.md` | Starting any feature: mission, audiences, scope / non-goals, quality bar, milestones (M0–M7), open questions |
| `docs/FILE-STRUCTURE.md` | Creating any file or hook: folder layout, naming conventions, server/client boundaries, custom-hook rules and catalog |
| `docs/PACKAGES.md` | Before `npm i` anything: approved/planned packages, "deliberately not using" list, rules for adding a package |
| `docs/SEO-GEO-AEO.md` | Building any page, metadata, sitemap/robots, OG images, JSON-LD, or writing page copy |
| `docs/design-system/README.md` | Any UI work. Index of the Blueprint design system |
| `docs/design-system/01-foundations.md` | Colors, typography, spacing, radii, surfaces, icons |
| `docs/design-system/02-components.md` | Building any UI component. Sheet 00 inventory, proposed APIs, exact specs and states |
| `docs/design-system/03-layout-and-patterns.md` | App shell, top bar, HUD, City scene, responsive rules |
| `docs/design-system/04-screens.md` | Implementing a specific screen (Sheets 01–08) |
| `docs/design-system/05-motion-accessibility-content.md` | Animations, keyboard/focus, a11y, copy and voice |
| `docs/design-system/tokens.css` | Styling. Tailwind v4 `@theme` tokens and utilities to use instead of raw values |

## Non-negotiables (summary; details are in the docs)

- **Structure:** `app/` is for routes only. Feature code goes in `features/<feature>/` (import only through its `index.ts`). Shared UI goes in `components/` (Sheet 00 kit in `components/blueprint/`), shared hooks in `hooks/`, utilities in `lib/`, typed content in `content/`, shared types in `types/`.
- **Naming:** kebab-case files and folders, PascalCase components (named exports), `useX` hooks in `use-x.ts`, role suffixes like `game.reducer.ts`. Use the design's domain words (blueprint, building, shard, brief, proof, preset).
- **Server first:** put `'use client'` only on small interactive leaves. Secrets live only in route handlers, Server Actions or `server/` folders that `import 'server-only'`. The `(site)` pages never import City or game code.
- **Styling:** use Blueprint tokens and utilities from `tokens.css`, not ad-hoc hex values. One amber primary CTA per view. Status colors (blue blueprint / amber building / green live) mean only that. The 2px `#60A5FA` focus outline goes everywhere.
- **Hooks:** SSR-safe (no browser APIs during render; use `useSyncExternalStore` for browser state), always clean up, callbacks through `useEffectEvent`, respect `useReducedMotion()`.
- **State:** game state is `useReducer` + Context in `features/game/`. No extra state, animation, form or 3D libraries without updating `docs/PACKAGES.md` first.
- **UX rules:** every game step is skippable, AI failure falls back to the closest preset, and a timeout never fails the visitor.
- **SEO:** every indexable page needs metadata, a canonical URL, one `<h1>`, server-rendered key facts, and JSON-LD built from `content/`. Escape `<` in JSON-LD.
- **Accessibility:** WCAG 2.2 AA, fully keyboard-playable, `prefers-reduced-motion` honored.
- **Honesty:** never invent metrics, roles or dates. Keep placeholders (`[metric]`) until real data exists.

## Keeping docs in sync

- When a change alters a documented decision (new package, new folder, new component API, resolved open question), **update the relevant doc in the same change**.
- The Claude Design project (`claude.ai/design/p/93f3c92c-c2fd-4758-a61c-06316d5b5a27`) is the visual source of truth. Sheet 00 is canonical for components. If the design changes, update `docs/design-system/` to match.
