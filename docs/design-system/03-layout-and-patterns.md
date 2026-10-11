# 3 · Layout & patterns

## Breakpoints

| Name | Reference frame | Notes |
|------|-----------------|-------|
| Mobile | 390 × 844 | Single column, bottom sheets, 44px minimum touch targets |
| Desktop | 1440 × 900 | Full HUD with floating glass panels |

The designs only cover these two frames. For in-between widths (tablet, about 768–1279):

- Keep the desktop HUD.
- Collapse the Features panel to a 48px icon rail (the design calls for this collapse).
- Scale the city down.
- Switch to the mobile layout below about 768px.

Avoid horizontal page scroll at every width.

## App shell

The game screens (01–06) are **full-viewport and fixed** (`100dvh`, `overflow: hidden`). The city scene fills the viewport and the UI floats over it in absolutely positioned layers:

```
z-0  grid background (on the shell)
z-10 City scene (pointer-events only on buildings)
z-20 vignettes / scrims
z-30 floating HUD panels
z-40 top bar
z-50 slide-in panel / bottom sheet
z-60 modal + scrim
```

The shell itself is `position: fixed; inset: 0` and is the only scroll container (`overflow-y: auto`), so the document never scrolls. Screens 02–06 fill it exactly (`h-full`, `overflow: hidden`). **Sheet 01 (Spark) is the exception:** it is `min-h-full` and grows with its content, so on viewports shorter than the content (for example 1920 × 1080 at 150% OS scaling, about 1280 × 640 CSS px) the visitor scrolls the shell to reach the preset chips instead of having them clipped. Its top bar is sticky.

The content pages (07–08) are **normal scrolling documents** on the single-level grid. They have no 3D scene, so they load as static HTML for recruiters and crawlers.

## Top bar

| | Desktop | Mobile |
|---|---------|--------|
| Height | 64 | 56 |
| Padding | 0 32 (content pages 0 48) | 0 16 |
| Fill | `rgba(11,18,32,.6)` + blur 10 | `rgba(11,18,32,.7)` |
| Border | bottom 1px `#1E3A5F` | same |

**Left:** the logo (diamond + JOVANNI), followed on desktop by a muted mono context (`/ BLUEPRINT`, or `/ CREATORBID` once a project exists).

**Center (HUD screens):** a 420px segmented progress block. The grid is `1fr auto 1fr`.

**Right:** a ghost link "Skip → See my work" (mobile: "My work") and the secondary button "Talk to me".

On mobile HUD screens with a project open, the left slot can show `40% · 2/5` in mono glow instead of the logo.

On content pages, the center holds nav links (Work, Skills, Experience, Contact). The right holds "Play the blueprint ▶" (secondary) and "Talk to me" (primary). The case-study page swaps the left slot for "← All work".

## HUD layout (Sheet 03, desktop)

```
┌──────────────────────── top bar (64) ────────────────────────┐
│ logo        [ Your project: 40% built ▮▮▯▯▯ ]   skip · talk │
├──────────────────────────────────────────────────────────────┤
│ PROJECT 001 · …                               ┌ FEATURES ──┐ │
│ CreatorBid (H2 34)        [ City scene ]      │ rows ×5    │ │
│ summary 380w                                  │ ↑↓ · ↵     │ │
│ ✎ EDIT IDEA                                   └────────────┘ │
│                                                     300w     │
│ ┌ SKILL SHARDS · 3/8 ─────────────┐   Skip to my work [Auto-build▶] │
│ └ 600w ───────────────────────────┘                          │
└──────────────────────────────────────────────────────────────┘
```

- Project intro: left 32, top 96, width 380.
- Features panel: right 24, top 88, width 300. It collapses to a 48px icon rail.
- Shard tray: left 32, bottom 28, width 600.
- CTA cluster: right 24, bottom 28.
- City: offset slightly left (`x: -60`) to leave room for the panel.

### Mobile HUD (3b)

- A floating project card under the top bar: left/right 16, top 68, radius 8. It has the name, `40% · 2/5`, and a segmented bar.
- A horizontal feature-chip row sits above the bottom sheet (`bottom: 228`). It scrolls horizontally.
- A collapsed bottom sheet (212px) holds the shard strip and two CTAs.

## Detail panel (Sheet 04)

- **Desktop:** a right-docked sheet from the top bar to the bottom, 480 wide, padding 28. It has a header row, a scrollable body and a sticky footer CTA. The camera eases the selected building into the left third of the screen.
- **Mobile:** an expanded bottom sheet (top about 290). It has the same content with shorter copy, and the CTAs are pinned to the bottom with `margin-top: auto`.
- **Section label pattern:** a mono 11 tracking .12em `#60A5FA` label above the content. Examples: `WHY YOUR PROJECT NEEDS THIS`, `SUGGESTED TECH`.

## The City scene

`City` is the shared isometric scene. Build it as a single reusable component (CSS 3D or a canvas/WebGL equivalent).

### Projection

- A 440 × 440 plane with `transform: rotateX(60deg) rotateZ(-45deg)` and `transform-style: preserve-3d`.
- Each building is a box with back/left/right/front/top faces, sized `w × d × h` in plane units.
- The ground plane has a 20px grid in `rgba(59,130,246,.22)`, a road cross at 145–159px, a 1px `rgba(59,130,246,.45)` border and a central radial glow.

### Props

The design mockup's `live`/`building` counters were a static-preview convenience.
The shipped `CitySceneProps` (`features/city/components/city-scene.tsx`) take the
real per-building state instead, since a visitor can bring buildings live out of
sequence (Sheet 05):

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `mode` | `CityMode` (`'wire' \| 'drawing' \| 'progress' \| 'lit'`) | `progress` | See modes below |
| `scale` | number 0.3–2 | 1 | Camera zoom |
| `x`, `y` | number | 0 | Camera offset in px (the `y` offset adds `120 * scale`) |
| `activeBuildingId` | `BuildingId \| null` | `null` | Highlights one building and shows its focus card — fed by the Features list hover/focus state, two-way linked (see Interaction below) |
| `labels` | boolean | false | Shows passive labels on all buildings |
| `features` | `Pick<Feature, 'id' \| 'status' \| 'percent'>[]` | — | Drives `progress` mode's per-building status. Ignored in `wire`/`drawing` (forced blueprint) and `lit` (forced live) |
| `interactive` | boolean | true | Set false for non-interactive backgrounds (Spark's `wire` city, Generating's `drawing` city) |
| `onBuildingHover`, `onBuildingSelect` | `(id) => void` | — | Pointer-only; the Features list is the keyboard path (see a11y notes) |

`CityScene` is a controlled, presentational component — it owns no state itself. The caller (Spark/Generating/HUD) supplies everything, including the camera presets per screen listed in [Screens](./04-screens.md).

### Modes

| Mode | Used on | Look |
|------|---------|------|
| `wire` | Intro background | Every building in blueprint style, solid blue edges, at 16–18% opacity behind a vignette |
| `drawing` | Generating | Dashed blue edges, with later buildings dimmed to 30% as they're "drawn in" |
| `progress` | HUD, detail, game | Mixed live / building / blueprint |
| `lit` | Launch | All live; scenery turns warm navy with amber window strips |

### Face styles

- **Blueprint:** fill `rgba(59,130,246,.07)`. The roof has a 45° hatch (`rgba(96,165,250,.28)`, 8px pitch). The edge is 1px `rgba(96,165,250,.95)`, dashed in `drawing` mode.
- **Building:** a 1px **dashed** `#F59E0B` edge. The front and left faces fill amber up to the build percentage (`rgba(245,158,11,.6)` / `.45`). The remainder sits at about 5% alpha.
- **Live:** an oklch hue fill per building (see Foundations), a 1px `rgba(255,255,255,.22)` edge, and cream window strips (`rgba(255,238,200,.6)`, every 14px).
- **Scenery:** filler blocks drawn as blueprint outlines at `.38` alpha, or warm-lit in `lit` mode.
- **Focused:** a 1px `#BFDBFE` edge with `0 0 22px rgba(96,165,250,.85), inset 0 0 12px rgba(96,165,250,.4)`.

### Default building layout (plane coords)

| id | name | x | y | w | d | h |
|----|------|---|---|---|---|---|
| auth | Auth Tower | 40 | 50 | 70 | 70 | 210 |
| pay | Payments Bank | 180 | 30 | 120 | 80 | 100 |
| ai | AI Brain | 170 | 180 | 100 | 100 | 150 |
| shop | Marketplace | 30 | 220 | 90 | 120 | 56 |
| notif | Notifications | 330 | 200 | 40 | 40 | 250 |

### Interaction

- Hovering or focusing a building highlights its Features-list row and shows its focus card. Hovering the row highlights the building. The link works **both ways**.
- Click/Enter on a building opens the detail panel. On mobile, tapping a building or chip opens the detail sheet.
- Camera presets per screen are listed in [Screens](./04-screens.md).

## Recurring patterns

- **Eyebrow → headline → lead.** Every hero and panel opens with a mono eyebrow in glow, then a Space Grotesk headline, then muted Inter copy.
- **Stat + bar + label.** A big mono number, a thin bar and a mono caption. Used for generation progress and the HUD.
- **"Why → tech → proof → CTA".** The structure for any feature detail: explain the need, suggest the stack, show a shipped case, then offer the action.
- **Problem → Architecture → Decisions → Stack → Results.** The case-study template. Section labels are numbered (`01 — PROBLEM`). Results use `[metric]` placeholders until real numbers exist.
- **Blueprint diagrams.** Architecture figures use the same styling as the city: a 16px grid, 1px `#60A5FA` boxes, a green box for the AI/LLM node, a dashed box for outputs, arrowheads made from CSS borders, and a figure caption. Mobile stacks the boxes vertically with 1px × 16 connectors.
