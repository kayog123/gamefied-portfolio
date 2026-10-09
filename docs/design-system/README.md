# Blueprint Design System

The visual language for the portfolio. It comes from the Claude Design project **"Blueprint"**: Sheet 00 (Component Sheet), Sheets 01–08 (Intro → Case Study), and the shared `City` scene.

The site is drawn like an **engineering blueprint**. Everything sits on a navy drafting sheet with a blue grid, wireframe lines and mono-type annotations. The visitor's idea is "drafted" into a city of features, and each building powers up from **blueprint → building → live**.

## Documents

| # | Doc | What's in it |
|---|-----|--------------|
| 1 | [Foundations](./01-foundations.md) | Color tokens, typography, spacing, grid, radii, surfaces, iconography |
| 2 | [Components](./02-components.md) | Sheet 00 inventory with proposed React APIs, then buttons, inputs, chips, status tags, progress, skill shards, panels, tooltips, annotations, proof card, modal, sheets |
| 3 | [Layout & patterns](./03-layout-and-patterns.md) | App shell, top bar, HUD layout, responsive rules, the City scene |
| 4 | [Screens](./04-screens.md) | Screen-by-screen spec for the full flow (Sheets 01–08) |
| 5 | [Motion, a11y & content](./05-motion-accessibility-content.md) | Durations and easings, keyboard and focus rules, voice and copy |
| — | [`tokens.css`](./tokens.css) | Drop-in Tailwind v4 `@theme` tokens |

## Core principles

1. **The drafting sheet is the canvas.** Every screen starts on navy `#0B1220` with the two-level blue grid. Never use a plain or white background.
2. **Three typefaces, three jobs.** Space Grotesk for display and actions, Inter for reading, JetBrains Mono for every label, number, status and annotation.
3. **Status is color.** Blue = blueprint (planned), amber = building (in progress / primary action), green = live (done / proof). Don't use these hues for anything else.
4. **Amber is rare.** Each view has one amber primary CTA. Secondary actions are blue-outlined, and tertiary ones are ghost text.
5. **Glass over the city.** Overlays are translucent navy with a backdrop blur, a 1px blue hairline border and, on hero panels, corner tick marks.
6. **Annotate like a drawing.** Dimension lines, title blocks, coordinates (`X 0720 · Y 0450 · GRID 32`) and sheet numbers (`SHEET 01 / 06`) carry the theme. Use them as decoration and orientation, not as content.
7. **Never block the visitor.** Every game step has a skip ("Skip → See my work", "Auto-build", "Skip game, auto-build →"). Failures fall back gracefully. A timeout auto-completes the step and never shows a "lose" state.
8. **Two breakpoints are designed.** The reference frames are desktop at 1440 × 900 and mobile at 390 × 844.

## Source of truth

Design project: `claude.ai/design/p/93f3c92c-c2fd-4758-a61c-06316d5b5a27`

| File | Covers |
|------|--------|
| `Blueprint 0 - Component Sheet.dc.html` | Sheet 00, the UI kit and swatches |
| `Blueprint 1 - Intro, Generating, HUD.dc.html` | Sheets 01–03 |
| `Blueprint 2 - Detail, Mini-game, Launch.dc.html` | Sheets 04–06 |
| `Blueprint 3 - See My Work, Case Study.dc.html` | Sheets 07–08 |
| `City.dc.html` | The isometric city scene and its modes |

**Sheet 00 is the canonical component spec.** It defines each component's default look and states. The screen boards show those components in context and may use documented variants. If a value here disagrees with the design file, the design file wins. Update this doc to match.
