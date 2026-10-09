# Goals

What this portfolio is for, who it serves, and what "done" means. For how it looks and behaves, see the [Blueprint design system](./design-system/README.md).

## Mission

**Turn a visitor's idea into a reason to hire me.**

Most portfolios list projects. This one has the visitor type an idea, then shows it being "drafted" as a blueprint city. Each building is a feature, and each one is backed by a real project I've shipped. The visitor leaves with a project brief, and I get a qualified lead.

> Tell me your idea. Watch me build it.

## Audiences

| Audience | What they want | Where they go |
|----------|----------------|---------------|
| **Prospective clients** (founders, small teams, agencies) | Confidence that I can build *their* product | The game: 01 Spark → 06 Launch → send brief |
| **Recruiters / hiring managers** | Skills, experience and proof, fast | 07 See My Work → 08 Case studies |
| **Engineers / peers** | How I think about architecture and trade-offs | Case-study architecture and decisions sections |

## Primary goals

1. **Generate qualified leads.** Visitors who finish the flow send a brief with their idea, features, stack and roadmap, plus their email.
2. **Prove capability with evidence, not claims.** Every feature in a generated blueprint links to a shipped case study ("Built this before ✓").
3. **Be memorable.** The blueprint-city experience should be something people share and remember.
4. **Never block the visitor.** Every step can be skipped, and the 2D portfolio is always one click away. A failed AI call or a game timeout still moves the visitor forward.
5. **Serve recruiters just as well.** The static See My Work page works with no 3D, no game and no JavaScript-heavy loading.

## Success measures

Targets are TBD until there's baseline traffic. Track these from launch:

| Metric | Definition |
|--------|------------|
| Idea submission rate | Visitors who submit an idea or preset ÷ landing visitors |
| Completion rate | Visitors who reach 06 Launch ÷ idea submissions |
| Brief send rate | Briefs sent ÷ visitors who reached 06 Launch |
| Skip-to-work rate | Visitors who choose See My Work. This is healthy, not a failure. |
| Case-study views | Reads per case study, and which proof cards drive them |
| Generation reliability | Successful AI drafts ÷ attempts (failures fall back to a preset) |

## Product scope

### In scope (v1)

| Sheet | Experience |
|-------|------------|
| 00 | Blueprint UI kit (shared components and tokens) |
| 01 | Spark: idea input and 5 presets |
| 02 | Generating: AI parses the idea into features and stack, with a live log |
| 03 | HUD: blueprint city, features list, skill shards, Auto-build |
| 04 | Building detail: why it's needed, suggested tech, proof card |
| 05 | Mini-game: "Wire the API" (15s, skippable, can't lose) |
| 06 | Launch: lit city, project brief, PDF, book a call, send brief |
| 07 | See My Work: static portfolio (hero, 6 projects, skills, experience, contact) |
| 08 | Case study template, used for all 6 projects |

### Non-goals

- **Real code generation.** The output is a blueprint and brief, explicitly "LIVE (in blueprint form)".
- **Accounts, logins or saved projects** in v1.
- **Marketing email.** Email is used only to reply about the brief ("No newsletters").
- **Breakpoints beyond desktop and mobile** as designed targets. Tablet should work but isn't separately designed.
- **More mini-games** beyond "Wire the API" in v1. The modal shell is built to support them later.

## Quality bar

- **Accessibility:** WCAG 2.2 AA. Fully keyboard-playable, with the reduced-motion fallbacks listed in the design system.
- **Performance:** See My Work and case studies are statically rendered and fast on mobile. The 3D city loads only on game screens and never delays the 2D pages.
- **Resilience:** an AI failure falls back to the closest preset, and the visitor never sees an error screen in the flow.
- **Honesty:** no invented metrics. Placeholders (`[metric]`, `[Role]`) stay until real data replaces them.
- **Privacy:** the brief and email are sent only with explicit consent.

## Tech direction

- **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS v4**, styled with Blueprint tokens.
- Fonts come from `next/font` (Space Grotesk, Inter, JetBrains Mono). Icons come from `lucide-react`.
- The idea → blueprint step runs server-side so API keys never reach the browser. Its output is structured (features, stack, matching case studies).
- Case-study and project content lives in typed data files, so one template renders all six.

## Milestones

| # | Milestone | Done when |
|---|-----------|-----------|
| M0 | **Foundations** | Tokens in `globals.css`, fonts in the layout, blueprint background, starter page removed |
| M1 | **UI kit** | Every Sheet 00 component built, plus a `/components` preview page that matches the sheet |
| M2 | **See My Work + case studies** | 07 and 08 are live with real content. This ships first so recruiters are covered early |
| M3 | **Spark + Generating** | Idea input, presets, the AI draft with preset fallback, and the log UI |
| M4 | **City + HUD + Detail** | City scene (all modes), features list ↔ building linking, detail panel and sheet |
| M5 | **Mini-game** | "Wire the API" playable by drag, tap and keyboard, with skip and timeout auto-complete |
| M6 | **Launch + brief** | Lit city, brief panel, PDF, book a call, consented email send |
| M7 | **Polish & launch** | Motion pass, reduced-motion, a11y audit, analytics for the metrics above, deploy |

## Open questions

- [ ] **AI provider and model** for the idea → blueprint step. Claude is the likely default, since it's already in the showcased stack.
- [ ] **Brief delivery:** which email service sends the brief, and where submissions are stored.
- [ ] **Book a call:** which scheduling link (e.g. Cal.com or Calendly).
- [ ] **PDF generation:** server-rendered or client-side.
- [ ] **Real content:** experience entries (roles and dates), case-study metrics, screenshots and a portrait photo.
- [ ] **Analytics tool** to track the success measures.
- [ ] **Hosting:** Vercel is assumed.
