# 2 · Components

**Sheet 00 (`Blueprint 0 - Component Sheet.dc.html`) is the canonical spec** for every component in it. The screen boards (Sheets 01–08) show those components in context, and sometimes at a different size. Where the two disagree, the sheet defines the **default** and the screen value is a documented **variant**. Values are px unless noted. Color names refer to [Foundations](./01-foundations.md#color).

## Inventory (Sheet 00)

These are the components to build first, in the order the sheet lays them out. The proposed React API keeps naming consistent. Components go in `components/blueprint/` (see [File structure](../FILE-STRUCTURE.md)).

| # | Sheet section | Component | Proposed API |
|---|---------------|-----------|--------------|
| 1 | Swatches | (tokens only) | `tokens.css` |
| 2 | Buttons · default / hover / focus / disabled | `Button` | `variant: 'primary' \| 'secondary' \| 'ghost'`, `size: 'sm' \| 'md' \| 'lg'`, `iconLeft`, `iconRight`, `disabled`, `href` (renders as `next/link`; simpler than `asChild`, same job) |
| 3 | Input · default / focus / error | `TextField` | `label`, `error?: string`, `multiline?`, `maxLength?`, `showCount?` |
| 4 | Chips · preset / selected | `Chip` | `icon?`, `selected?`, `onClick` |
| 4b | Chips · status | `StatusTag` | `status: 'live' \| 'building' \| 'blueprint'`, `percent?` |
| 5 | Progress · segmented | `SegmentedProgress` | `segments: { status, percent? }[]`, `showHeader?` (off when a caller renders its own "N% built" line, e.g. the mobile project card) |
| 5b | Progress · continuous | `ProgressBar` | `value` (0–100) |
| 6 | Skill badge · collected / locked / new | `SkillShard` | `name`, `state: 'collected' \| 'locked' \| 'new'` |
| 7 | Panel · glass + corner ticks | `Panel` | `ticks: 2 \| 4`, `tone: 'blue' \| 'green'`, `title?`, `action?` |
| 8 | Tooltip · hover / focus | `BuildingLabel` | `name`, `status`, `percent?`, `variant: 'label' \| 'card'` |
| 9 | Annotations · dimension / title block | `DimensionLine`, `TitleBlock` | `label`, `orientation?` / `cells: { k, v }[]` |
| 10 | Proof card | `ProofCard` | `caseNo`, `title`, `problem`, `stack: string[]`, `href`, `thumb?` |
| 11 | Modal · mini-game shell | `GameModal` (+ `TimerRing`) | `eyebrow`, `title`, `seconds`, `remaining`, `step`, `onSkip`, `children` (board) |
| 12 | Type specimens | (tokens only) | Display / Body / Label (see below) |

### Type specimens (Sheet 00, bottom row)

The bottom row of the sheet shows these three styles. They're the defaults to use when nothing more specific applies:

| Role | Spec | Sample |
|------|------|--------|
| Display | Space Grotesk 600, 44 / 1, tracking −.03em, `#E2E8F0` | "Watch me build it." |
| Body | Inter 400, 16 / 1.6, `#CBD5E1` | "Brands shouldn't scroll through thousands of creators…" |
| Label | JetBrains Mono 500, 13 / 1.7, `#60A5FA`, uppercase | "PARSING FEATURES… 5 FOUND ✓" |

Section headings on the sheet itself use the standard label: mono 500 11, tracking .12em, `#94A3B8` (e.g. `BUTTONS · DEFAULT / HOVER / FOCUS / DISABLED`).

### Swatch

Each swatch is a 64 × 40 tile with a 1px `rgba(255,255,255,.15)` border and radius 3. Below it are the name (mono 10 muted) and the hex value (`#E2E8F0`), with a 6px gap. The swatch row sits in the sheet header, right-aligned, with a 10px gap.

---

## Buttons

There are three variants. Each has four states: default, hover, focus and disabled.

| Variant | Default | Hover | Focus | Disabled |
|---------|---------|-------|-------|----------|
| **Primary** (amber) | bg `#F59E0B`, text `#0B1220`, Space Grotesk 600 15, padding 12×18, radius 4, no border | bg `#FBBF24` + `0 0 24px rgba(245,158,11,.45)` | 2px `#60A5FA` outline, offset 3 | bg `#334155`, text `#94A3B8` |
| **Secondary** (blue outline) | 1px `#3B82F6`, bg `rgba(59,130,246,.12)`, text `#E2E8F0`, Inter 500 15, padding 11×17 | border `#60A5FA`, bg `.24`, text `#fff`, `0 0 18px rgba(59,130,246,.35)` | 2px `#60A5FA` outline, offset 3 | 1px `#334155`, transparent bg, text `#64748B` |
| **Ghost** (text) | no border/bg, text `#CBD5E1`, Inter 500 15, padding 11×14 | bg `rgba(148,163,184,.1)`, text `#F1F5F9`, underline offset 4 | 2px `#60A5FA` outline, offset 2 | text `#64748B` |

Usage:

- Only **one primary per view**. Examples: "Draft my blueprint", "Auto-build", "Power it up", "Send brief to Jovanni", "Talk to me" on content pages.
- Primary buttons can include a trailing icon (`arrow-right`, `play`, `send`) or a leading `zap`, with an 8–10px gap.
- Sizes: the default height is about 44px. Large/mobile buttons are **48–52px** tall (`height:52px`, font 16–17). Compact nav buttons use padding 9×14, font 14.
- The "Talk to me" nav button is secondary with a leading `message-circle` icon on game screens. On the content pages (07–08) it becomes primary.
- **Icon button:** 28 (panel header), 36 (desktop close) or 44 (mobile). It has a 1px `rgba(148,163,184,.35)` border (or `rgba(59,130,246,.3)` in panels), radius 4, transparent background and a 14–16 icon.

## Text input / textarea

| State | Spec |
|-------|------|
| Default | height 48, padding 0 14, 1px `rgba(148,163,184,.4)`, bg `rgba(15,25,45,.8)`, radius 4, Inter 400 15, placeholder `#94A3B8` |
| Focus | border `#60A5FA`, bg `.9`, ring `0 0 0 4px rgba(96,165,250,.2)`, text `#F1F5F9`, caret `#60A5FA` (2px) |
| Error | border `#F87171`; message below with a 6px gap, JetBrains Mono 500 11 UPPERCASE `#FCA5A5` (e.g. "ENTER A VALID EMAIL") |

### Hero idea input (Sheet 01)

This is a larger composite of the input:

- Width 880 (desktop), padding 22/22/16, radius 6, bg `rgba(15,25,45,.85)`, blur 14.
- Focus state: 1px `#60A5FA` + `0 0 0 4px rgba(96,165,250,.2), 0 0 60px rgba(59,130,246,.22)`.
- Text: Inter 400 22/1.45, min-height 68 (mobile 17px, min-height 96).
- Footer row: 1px top divider `rgba(59,130,246,.2)`, with a mono counter `0 / 500` and the hint `↵ ENTER TO DRAFT` on the left and the primary button on the right. On mobile, the button goes full-width below the card.
- Limit: 500 characters. **Enter** submits and **Shift+Enter** adds a newline.
- A dimension line sits above it (`880 PX · 500 CHAR MAX`). See Annotations.

## Chips

| Type | Spec |
|------|------|
| **Preset chip** | pill, padding 9×15 (mobile height 44), 1px `rgba(59,130,246,.4)`, bg `rgba(11,18,32,.7)`, Inter 500 14 `#E2E8F0`, leading 15px icon in `#60A5FA` |
| Hover | border `#60A5FA`, bg `rgba(59,130,246,.14)` |
| Selected | border `#60A5FA`, bg `rgba(59,130,246,.2)`, text `#fff`, leading `✓` |
| Focus | 2px `#60A5FA` outline, offset 2 |
| **Feature chip** (mobile HUD) | pill, height 40, padding 0 12, Inter 500 13, text and border in the status color (border at 40% alpha), bg `rgba(11,18,32,.85)`; hovered/selected → bg `rgba(59,130,246,.2)`, border `#60A5FA` |

The preset set is: SaaS Marketplace (`store`), AI Chatbot (`bot`), Booking App (`calendar-check`), Fintech Dashboard (`wallet`), Mobile App (`smartphone`).

## Status tag

These are small mono tags: JetBrains Mono 500 10, tracking .06em, radius 3.

| Status | Spec |
|--------|------|
| `LIVE` | padding 3×7, bg `rgba(34,197,94,.14)`, text `#4ADE80`, optional leading 10px `check` icon |
| `BUILDING` | padding 3×7, bg `rgba(245,158,11,.14)`, text `#FBBF24`. Can include progress: `BUILDING · 52%` |
| `BLUEPRINT` | padding 2×6, 1px `rgba(96,165,250,.5)`, transparent, text `#93C5FD` |

## Tech tag

These are neutral labels for stack items.

- **Neutral:** padding 3×8, 1px `rgba(148,163,184,.35)`, radius 3, JetBrains Mono 500 11 `#CBD5E1`.
- **Accent (suggested tech):** padding 5×10, 1px `rgba(96,165,250,.5)`, bg `rgba(59,130,246,.1)`, radius 4, mono 12 `#BFDBFE`.

## Progress

### Segmented ("Your project: 40% built")

- There's one segment per building, in a `repeat(n, 1fr)` grid with a 4px gap (3 on mobile). Each segment is 5px tall (4 on mobile) with square ends.
- Live segment: `#22C55E` + `0 0 8px rgba(34,197,94,.7)`.
- Building segment: `linear-gradient(90deg, #F59E0B <p>%, #1E3A5F <p>%)`.
- Empty segment: `#1E3A5F`.
- Header row: Inter 500 14 "Your project: **40%** built" (the percent is in mono `#60A5FA`, or `#4ADE80` once a building just went live or the project is at 100%). On the right is mono 11 `BUILDINGS 2/5`.
- When the project hits 100%, the segments collapse into one solid green bar with a glow.

### Continuous

- Track: 4px, `#1E3A5F`, radius 2. Fill: `#60A5FA`, radius 2, `0 0 10px #60A5FA`. Sheet 00 sets the 10px default; the large generating-screen bar uses 12px.
- Pair it with a Stat XL number (`68%`) and a mono label (`DRAFTING BLUEPRINT`).

### Timer ring (mini-game)

- SVG circle, stroke 4. Track `#1E3A5F`, fill `#F59E0B`, round caps, rotated −90°, draining clockwise.
- Sizes: 52 (sheet), 56 (mobile) and 68 (desktop modal). The center number is mono 600, two digits (`09`).
- Below 3s the fill turns red.

## Skill shard (badge)

Shards are collectible tech skills, with **+1 per building**.

| State | Spec |
|-------|------|
| Collected | padding 6×10, 1px `rgba(96,165,250,.7)`, bg `rgba(59,130,246,.16)`, radius 4, mono 500 12 `#BFDBFE`, `0 0 12px rgba(59,130,246,.3)`; filled diamond 7px |
| Locked | 1px **dashed** `rgba(148,163,184,.4)`, transparent, text `#94A3B8`; outline-only diamond |
| New (just earned) | padding 8×13, 1px `#60A5FA`, bg `rgba(59,130,246,.25)`, mono 13 `#fff`, `0 0 24px rgba(59,130,246,.6)`, diamond `#BFDBFE`, trailing `+1` in amber 10px |

The default set, in order, is: TypeScript, Next.js, PostgreSQL, NestJS, pgvector, AWS, Claude API, React Native.

The shard tray header reads `SKILL SHARDS · 3/8 COLLECTED`, with `+1 PER BUILDING` in glow on the right.

## Panel (glass + corner ticks)

```css
border: 1px solid rgba(59,130,246,.3);
border-radius: 6px;
backdrop-filter: blur(14px);
background:
  /* 10px L-shaped ticks in #60A5FA at the corners */
  linear-gradient(#60A5FA,#60A5FA) 0 0 / 10px 1px no-repeat,
  linear-gradient(#60A5FA,#60A5FA) 0 0 / 1px 10px no-repeat,
  linear-gradient(#60A5FA,#60A5FA) 100% 100% / 10px 1px no-repeat,
  linear-gradient(#60A5FA,#60A5FA) 100% 100% / 1px 10px no-repeat,
  rgba(11,18,32,.74);
```

- **Two-corner ticks** (top-left and bottom-right) are the default for HUD panels.
- **Four-corner ticks** are for the component-sheet panel and modals. Modals use 12px ticks.
- The tick color follows the panel's meaning. Use `#22C55E` for the proof card.
- **Panel header:** padding 14×16, bottom divider `rgba(59,130,246,.22)`, mono 11 tracking .12em `#94A3B8` title (`FEATURES · 2/5 LIVE`) with an optional icon button on the right.
- **Panel footer hint:** mono 11 `#94A3B8` (`↑↓ NAVIGATE · ↵ INSPECT`).

### Feature list row (inside the Features panel)

- Flex, gap 12, padding 9×10, radius 4, 1px transparent border.
- Contents: a 34px icon tile (always a glow-blue border/icon, regardless of status — only the trailing status tag carries status color), then the name (Inter 500 14) over a subtitle (Inter 400 12 muted), then a status tag on the right.
- Hover/selected: border `#60A5FA`, bg `rgba(59,130,246,.14)`, `0 0 18px rgba(59,130,246,.25)`. This is **linked both ways** with the matching building in the city.

## Tooltip (city labels)

| Variant | Spec |
|---------|------|
| **Label** (passive) | padding 5×9, bg `rgba(11,18,32,.88–.9)`, 1px border in the status color at 40%, radius 4, mono 500 11, leading 6px status dot. A 1px × 20–22 leader line in `rgba(148,163,184,.6)` drops to the roof |
| **Focus card** (hover/focus) | padding 10×12, bg `rgba(11,18,32,.92)`, 1px `#60A5FA`, radius 6, `0 0 24px rgba(59,130,246,.45)`, min-width 160–168. It shows the name (Space Grotesk 600 15), then a status line (mono 10, status color, dot, e.g. `● BUILDING · 52%`), then a divider and `CLICK TO INSPECT ↵`. The leader line is 1px × 30–34 `#60A5FA` |

## Annotations

These are blueprint decorations. Mark them `aria-hidden`.

- **Dimension line:** 1px × 9 end ticks in `#3B82F6`, a flex-1 1px line in `rgba(59,130,246,.55)`, and a mono 10 tracking .1em `#60A5FA` label in the middle (`880 PX · 500 CHAR MAX`). It can run vertically with `writing-mode: vertical-rl` (`H 210 · AUTH TOWER`).
- **Eyebrow rule:** 28px × 1 `#3B82F6` lines on both sides of a centered eyebrow (`SHEET 01 — SPARK`).
- **Title block:** a grid of cells with a 1px `rgba(59,130,246,.4)` outer border and `.3` cell dividers, on bg `rgba(11,18,32,.7)`. Each cell has padding 8×14, a mono 10 muted key over an 11px `#E2E8F0` value. The fields are PROJECT, DRAWN BY, SCALE, SHEET (or REV).
- **Coordinates readout:** mono 10 tracking .1em muted (`X 0720 · Y 0450 · GRID 32`). Live: X/Y follow the pointer in viewport px (zero-padded to 4 digits; `0720 / 0450` until the first move). `CoordinateReadout` in `components/blueprint/`.
- **Focus callout:** mono 10 `#60A5FA` `← FOCUS` placed outside the focused element.
- **Figure caption:** mono 10 muted, bottom-right of a diagram (`FIG. 01 · SIMPLIFIED`).

## Proof card ("Built this before ✓")

This card links a feature to a real shipped case study.

- 1px `rgba(34,197,94,.45)`, radius 6, bg `rgba(34,197,94,.05)`, **green** two-corner ticks, padding 16 (14 mobile).
- **Header:** mono 600 11 tracking .1em `#4ADE80` `BUILT THIS BEFORE ✓` (optionally with a leading `badge-check`). On the right is mono 10 muted `CASE 02`.
- **Body:** a `1fr | 120px` grid (132px in the detail panel). The left column has a title (Space Grotesk 600 18) and a one-line problem (Inter 13/1.5 muted). The right column has an architecture thumbnail: a mini blueprint diagram on a 12px grid, with 1px `#60A5FA` boxes and the AI node in green. Until a project has its own diagram, use the Sheet 00 placeholder: 78 tall, 1px `rgba(96,165,250,.35)`, radius 4, a 135° hatch (`rgba(59,130,246,.08)` 6px stripes) and a mono 9 muted label.
- **Footer:** neutral tech tags, then the link "Read case study →" (Inter 500 13, `#60A5FA`).

## Modal (mini-game shell)

### Base shell (Sheet 00)

This is a generic container that every mini-game reuses:

- 1px `rgba(96,165,250,.55)`, radius 8, four-corner 12px ticks, bg `rgba(11,18,32,.92)`, padding 20×22.
- **Header:** an eyebrow `MINI-GAME · {BUILDING}` (mono 11, tracking .12em, glow) above the title `{Challenge title}` (Space Grotesk 600 24). A 52px timer ring sits on the right.
- **Board slot:** height 110 (min), 1px **dashed** `rgba(96,165,250,.35)`, radius 6. It hosts any 15s game, played by drag on desktop and tap on mobile.
- **Footer:** a mono 11 muted step and key hint on the left (`STEP 1/2 · TAB · ↵`) and the skip link on the right (Inter 13 `#CBD5E1`, `Skip game, auto-build →`).

### In-context variant (Sheet 05, "Wire the API")

- Width 620, centered at `translate(-50%,-46%)`, 1px `rgba(96,165,250,.55)`, radius 8, four-corner 12px ticks, bg `rgba(11,18,32,.92)`, blur 18, modal shadow (see Foundations). Scrim `rgba(5,9,18,.62)`.
- **Header:** eyebrow (`MINI-GAME · AI BRAIN`), H3 Space Grotesk 600 28, one-line instruction, and the timer ring on the right.
- **Board:** height 230, 1px **dashed** `rgba(96,165,250,.35)`, radius 6, 16px grid.
- **Footer:** mono hints on the left (`LINKS 1/2` in glow, `TAB → PORT · ↵ LINK`) and the skip link on the right (`Skip game, auto-build →`).
- **Success variant:** the border and glow switch to green (`rgba(34,197,94,.6)`, `0 0 70px rgba(34,197,94,.18)`). It shows a headline "Building online ✓", a "+1 SKILL SHARD" pill, and the buttons "Back to city" (secondary) and "Next: {Building} →" (primary).

### Game nodes and ports

- Desktop node: 130 × 90, radius 6, bg `rgba(11,18,32,.92)`. It holds an icon (22), a name (Space Grotesk 600 14) and a tech label (mono 10). Active nodes get a 1px `#60A5FA` border and glow, and pending ones get `rgba(96,165,250,.45)`.
- Port: a 12px circle. Linked ports are `#60A5FA` with glow. The source port is `#F59E0B`. The target port is a hollow ring with a 2px `#60A5FA` border and a focus outline.
- Wire: solid blue at 2.5px when linked, **dashed amber** (`5 4`) while dragging.
- Mobile node (tap mode): full width, 76 high, radius 8, a 28px numbered circle, and a state label (`LINKED ✓` / `TAP NEXT`). The node colors follow the status (green / amber / blue). Nodes are joined by 2px × 22 vertical connectors.

## Bottom sheet (mobile)

- `border-radius: 16px 16px 0 0`, top border 1px `rgba(96,165,250,.4–.55)`, bg `rgba(11,18,32,.92–.96)`, blur 16.
- Grab handle: 40 × 4, radius 2, `#334155`, centered.
- States: **collapsed** (HUD, 212px tall: shards plus two CTAs) and **expanded** (detail, top at about 290px). Swipe or tap to expand.
- Footer CTAs are full width, 48–52 tall. In the HUD they're arranged as `1fr 1fr` ("Skip to my work" plus "Auto-build").

## Log console (Generating)

- Glass panel, 500 wide, with a header `BLUEPRINT.LOG` and a spinner plus `RUNNING` in glow.
- Rows use a `52px 1fr auto` grid in JetBrains Mono 13/1.4: timestamp `#64748B`, message `#E2E8F0`, `✓` `#22C55E`.
- The active line is glow-colored and ends with a blinking 8 × 15 block cursor.
- Spinner: a 12px ring, 1.5px `rgba(96,165,250,.3)`, with the top segment in `#60A5FA`.

## Project card (See My Work)

- 1px `rgba(59,130,246,.3)`, radius 6, bg `rgba(11,18,32,.85)`. Hover: border `#60A5FA`, `0 0 30px rgba(59,130,246,.2)`.
- **Image:** 16:10, bg `#0F1A2E` with a diagonal hatch placeholder, bottom border `.25`.
- **Body:** padding 20, gap 10. It holds an eyebrow `01 · AI AGENT`, a title (Space Grotesk 600 21), the problem (Inter 14 muted), tech tags, and a footer `RESULT` (mono 11 green) followed by a one-line result. The footer has a top divider and is pinned to the bottom.

## Form controls (brief / contact)

- **Checkbox:** 16–18 square, 1px `#60A5FA`, radius 3. When checked, it fills `#3B82F6` with a white 11px `check`. Its label is Inter 12/1.45 muted.
- **Consent and validation:** "Send" stays disabled until the email is valid **and** consent is checked.
