# 1 · Foundations

## Color

### Core palette (Sheet 00 swatches)

| Token | Hex | Role |
|-------|-----|------|
| `navy` | `#0B1220` | Page background, CTA text on amber |
| `grid` | `#1E3A5F` | Grid lines, dividers, top-bar border, empty progress track |
| `wire` | `#3B82F6` | Wireframe lines, secondary-button border, dimension ticks |
| `glow` | `#60A5FA` | Accent text, focus ring, active borders, eyebrow labels |
| `live` | `#22C55E` | Live / done / proof |
| `cta` | `#F59E0B` | Primary button, "building" state, trade-off labels |
| `text` | `#E2E8F0` | Default foreground |
| `muted` | `#94A3B8` | Secondary text, mono labels, placeholders |

### Extended scale

| Token | Hex | Used for |
|-------|-----|----------|
| `text-strong` | `#F1F5F9` | Headings, big numbers |
| `text-soft` | `#CBD5E1` | Ghost links, long body copy on panels |
| `text-faint` | `#64748B` | Timestamps, disabled secondary text |
| `slate-700` | `#334155` | Disabled primary fill, sheet grab handle |
| `glow-soft` | `#93C5FD` | "Blueprint" status text |
| `glow-pale` | `#BFDBFE` | Collected shard text, link hover, focus border on city |
| `live-text` | `#4ADE80` | "Live" status text on dark |
| `live-pale` | `#86EFAC` | Accent node text in mini diagrams |
| `cta-hover` | `#FBBF24` | Primary hover fill, "building" status text |
| `danger` | `#F87171` | Input error border |
| `danger-text` | `#FCA5A5` | Error message |
| `input-bg` | `rgba(15,25,45,.8)`–`.9` | Field backgrounds |
| `image-bg` | `#0F1A2E` | Screenshot / image placeholders |

### Translucency recipes

Most surfaces are an alpha of a core color. Reuse these exact values:

| Use | Value |
|-----|-------|
| Glass panel fill | `rgba(11,18,32,.74)` (HUD), `.78`–`.86` (heavier), `.92`–`.96` (modal, sheet) |
| Top-bar fill | `rgba(11,18,32,.6)` desktop, `.7` mobile |
| Panel border | `rgba(59,130,246,.3)`; `.35`–`.45` for more emphasis |
| Inner divider | `rgba(59,130,246,.2)`–`.25` |
| Secondary-button fill | `rgba(59,130,246,.12)` → hover `.24` |
| Selected / hover row fill | `rgba(59,130,246,.14)`–`.2` |
| Neutral outline | `rgba(148,163,184,.35)`–`.4` |
| Status tag fill | live `rgba(34,197,94,.14)` · building `rgba(245,158,11,.14)` |
| Modal scrim | `rgba(5,9,18,.5)`–`.62` |

### Status semantics

| State | Solid | Text on dark | Tag fill | Meaning |
|-------|-------|--------------|----------|---------|
| Blueprint | `#60A5FA` | `#93C5FD` | none, 1px border `rgba(96,165,250,.5)` | Planned and not started |
| Building | `#F59E0B` | `#FBBF24` | `rgba(245,158,11,.14)` | In progress, or the next action |
| Live | `#22C55E` | `#4ADE80` | `rgba(34,197,94,.14)` | Done, shipped, proven |

The timer ring turns **red** when there's less than 3s left. That's the only time red appears outside form errors.

### Building hues (City scene)

Live buildings are tinted with `oklch(L 0.13 hue)`. The lightness depends on the face: top .82, front .64, left .50, back/right .56.

| Building | id | Hue |
|----------|----|-----|
| Auth Tower | `auth` | 255 |
| Payments Bank | `pay` | 160 |
| AI Brain | `ai` | 300 |
| Marketplace | `shop` | 75 |
| Notification Antenna | `notif` | 25 |

## Typography

Load the fonts with `next/font/google` in `app/layout.tsx` and expose them as CSS variables.

| Family | Weights | Variable | Job |
|--------|---------|----------|-----|
| **Space Grotesk** | 500, 600, 700 | `--font-display` | Headlines, titles, logo, primary buttons |
| **Inter** | 400, 500, 600 | `--font-sans` | Body copy, links, secondary/ghost buttons, inputs |
| **JetBrains Mono** | 400, 500, 600 | `--font-mono` | Eyebrows, labels, stats, status tags, logs, annotations, kbd hints |

### Type scale

| Style | Font | Size / line-height | Tracking | Example |
|-------|------|--------------------|----------|---------|
| Display XL | Space Grotesk 600 | 96 / .98 | −.04em | "Your idea → Live product." (7a) |
| Display L | Space Grotesk 600 | 78–80 / 1.0 | −.035em | "What do you want to build?" |
| Display M | Space Grotesk 600 | 56 / 1.02 | −.03em | Contact headline |
| H1 mobile | Space Grotesk 600 | 42–48 / 1.0–1.04 | −.03em | Mobile hero |
| H2 section | Space Grotesk 600 | 44 | −.02em | "Shipped work" |
| H2 panel | Space Grotesk 600 | 30–34 / 1.05–1.1 | −.02em | "CreatorBid", "AI Brain" |
| H3 card | Space Grotesk 600 | 18–24 / 1.2 | — | Card titles |
| Button L | Space Grotesk 600 | 15–17 | — | Primary CTA |
| Lead | Inter 400 | 19–20 / 1.5–1.55 | — | Hero subcopy |
| Body | Inter 400 | 14–16 / 1.55–1.6 | — | Panel and case-study copy |
| Body S | Inter 400 | 12–13 / 1.45–1.5 | — | Captions, card problem text |
| UI | Inter 500 | 13–15 | — | Nav links, secondary buttons |
| Stat XL | JetBrains Mono 600 | 56 / 1 | −.04em | "68%" |
| Eyebrow | JetBrains Mono 500 | 10–12 | .12–.14em, UPPERCASE | "SHEET 01 — SPARK" |
| Label | JetBrains Mono 500 | 10–11 | .06–.1em, UPPERCASE | "BUILDINGS 2/5", status tags |
| Code / log | JetBrains Mono 400 | 12–13 / 1.4 | — | Generation log |

Rules:

- Mono text is **always uppercase** when it's a label. Tech names in tags and shards keep their own casing ("pgvector", "Next.js").
- Units and percent signs in big stats drop to about 40% size and take the glow color: `68<span>%</span>`.
- Use `text-wrap: pretty` on paragraphs and `text-wrap: balance` on multi-line headlines.
- The logo wordmark is "JOVANNI" in Space Grotesk 600, 14–15px, tracking .06em. It follows a 9px diamond outline (1.5px `#60A5FA` border, rotated 45°).

## Spacing

The base unit is **4px**. Commonly used steps: `4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 28 · 32 · 48 · 56 · 64 · 80 · 96`.

| Context | Value |
|---------|-------|
| Desktop screen gutter (HUD) | 32px (24px for right-docked panels) |
| Desktop content-page gutter | 48px; case-study body 160px |
| Mobile gutter | 16px (HUD) / 20px (content) |
| Section padding (content pages) | 80–96px vertical |
| Panel padding | 14–18px (HUD), 22–28px (detail panel) |
| Gap between chips and tags | 5–10px |
| Gap between stacked panel rows | 4px |

## Grid & background

**The blueprint grid** is the signature background. It has two layers:

```css
background-color: #0B1220;
background-image:
  linear-gradient(rgba(30,58,95,.6) 1px, transparent 1px),
  linear-gradient(90deg, rgba(30,58,95,.6) 1px, transparent 1px),
  linear-gradient(rgba(30,58,95,.28) 1px, transparent 1px),
  linear-gradient(90deg, rgba(30,58,95,.28) 1px, transparent 1px);
background-size: 160px 160px, 160px 160px, 32px 32px, 32px 32px; /* desktop */
/* mobile: 120px major / 24px minor */
```

Variants:

- **Game screens (01–06):** the two-level grid above, with 32px minor and 160px major cells.
- **Content pages (07–08) and the component sheet:** a single level at `rgba(30,58,95,.45)`, 32px desktop and 24px mobile.
- **Intro vignette:** `radial-gradient(ellipse 60% 55% at 50% 42%, rgba(11,18,32,.85), transparent 80%)` behind the headline.
- **Launch glow:** add `radial-gradient(ellipse 50% 60% at 33% 60%, rgba(245,158,11,.12), transparent 70%)`.

The layout grid on content pages is 12 columns with a 24px gap. Case-study sections use a `240px | 1fr` label/content split with a 48px gap.

## Radii

| Token | Value | Used for |
|-------|-------|----------|
| `xs` | 3px | Status tags, tech tags, checkboxes |
| `sm` | 4px | Buttons, inputs, icon buttons, shards, small cards |
| `md` | 6px | Panels, proof card, project cards, input shell |
| `lg` | 8px | Modals, mobile cards |
| `xl` | 10px | Mobile floating card |
| `sheet` | 16px 16px 0 0 | Mobile bottom sheets |
| `pill` | 999px | Preset chips, mobile feature chips |

The look is **squared-off**: never go above 8px on desktop UI.

## Surfaces & elevation

There are no traditional drop shadows. Depth comes from **glass, borders and glow**.

| Level | Recipe |
|-------|--------|
| Canvas | Grid background |
| Glass panel | `background: rgba(11,18,32,.74)`; `backdrop-filter: blur(14px)`; `border: 1px solid rgba(59,130,246,.3)`; radius 6 |
| Hero panel | Glass panel plus **corner ticks** (see Components) |
| Slide-in panel | `rgba(11,18,32,.86)`, blur 18, left border `rgba(96,165,250,.45)`, `box-shadow: -30px 0 60px rgba(0,0,0,.35)` |
| Modal | `rgba(11,18,32,.92)`, blur 18, `box-shadow: 0 30px 80px rgba(0,0,0,.5), 0 0 60px rgba(59,130,246,.15)` |

Glow is the emphasis tool. Use these values:

- Focus input: `0 0 0 4px rgba(96,165,250,.2), 0 0 60px rgba(59,130,246,.22)`
- Selected row: `0 0 18px rgba(59,130,246,.25)`
- Primary hover: `0 0 24px rgba(245,158,11,.45)`
- Progress fill: `0 0 12px #60A5FA` (blue) or `0 0 8px rgba(34,197,94,.7)` (live segment)

## Iconography

- Use **Lucide** icons. In React, use the `lucide-react` package rather than the CDN mask trick the mockups use.
- Sizes are 12–16px inline, 22–24px in feature tiles, and 18px in primary CTAs. Icons inherit `currentColor`.
- Feature icon tiles are 34px (list) or 44–48px (detail), with a 1px border in the status color at 35% alpha and radius 4–6.
- Icons used in the designs: `message-circle`, `arrow-right`, `pencil`, `panel-right-close`, `check`, `badge-check`, `play`, `zap`, `x`, `download`, `calendar`, `send`, `rocket`, `menu`, `monitor`, `server`, `database`, `lock-keyhole`, `landmark`, `brain`, `store`, `radio-tower`, `bot`, `calendar-check`, `wallet`, `smartphone`.
- The **diamond glyph** is a 6–8px rotated square. It's the system's bullet. It marks skill shards and list items, and it appears in the logo.
