# 4 · Screens

This is the full flow. The sheet numbers match the design boards. Each entry lists its layout and camera, then its content, then its behavior. Motion details are collected in [Motion](./05-motion-accessibility-content.md#motion).

```
01 Spark ──submit──▶ 02 Generating ──done──▶ 03 HUD ──select──▶ 04 Detail ──Power it up──▶ 05 Mini-game
   │                      │ (AI fails → closest preset)  ▲                                     │
   │                      └─ Cancel → 01                 └──────────── Back to city ◀──────────┘
   │                                                     all 5 live ──▶ 06 Launch
   └── "Skip → See my work" (from any game screen) ──▶ 07 See My Work ──▶ 08 Case Study
```

---

## 01 · Intro / Spark

**Purpose:** collect the visitor's idea.

**Desktop**

- City in `wire` mode, opacity .16, scale 1.7, `y 380`, with a center vignette.
- A centered 880px column starting at top 150:
  - Eyebrow with rules: `SHEET 01 — SPARK`
  - H1: "What do you want to build?" (78px, single line)
  - Lead: "Tell me your idea. Watch me build it."
  - Dimension line, then the hero idea input (focus state shown)
  - `OR START FROM A PRESET`, then 5 preset chips
- Bottom-left: a title block (PROJECT UNTITLED · DRAWN BY JOVANNI · SCALE 1:1 · SHEET 01 / 06).
- Bottom-right: the coordinates readout.

**Mobile:** a left-aligned column (left/right 20, top 104) with H1 at 42px. The input card has a min-height of 96 and a full-width 52px CTA below it. Preset chips are 44px tall. The footer reads `SHEET 01 / 06 · SCALE 1:1`. City scale .75.

**Behavior**

- Placeholder: "e.g. A marketplace where creators bid on brand campaigns".
- Enter submits and Shift+Enter adds a newline. The limit is 500 characters, shown in a live counter.
- Tapping a preset types its text into the input with a typewriter effect, then submits.

## 02 · Generating

**Purpose:** show the idea being parsed into a blueprint. This usually takes 3–6s.

**Desktop**

- City in `drawing` mode at scale 1.15.
- An "idea pill" centered at top 92: `YOUR IDEA | "…quoted idea…"`.
- Bottom-left (500w): the `BLUEPRINT.LOG` console with timestamped lines:
  - `Reading idea… 9 words ✓`
  - `Parsing features… 5 found ✓`
  - (indented) `auth · payments · ai-match · market · notify`
  - `Selecting stack… Next.js · NestJS · Postgres ✓`
  - `Matching shipped projects… 4 proofs ✓`
  - active: `Drafting blueprint… 68%▍`
- Bottom-right (300w): `68%` Stat XL, a continuous bar, `DRAFTING BLUEPRINT`, and a **Cancel** link.
- A vertical dimension annotation on the right edge: `H 210 · AUTH TOWER`.

**Mobile:** City scale .52, `y −150`. A single floating card (bottom 16, radius 10) holds the quoted idea, the 36px stat, the bar, a short log and the active line.

**Behavior:** if the AI call fails, fall back to the **closest preset blueprint**. Don't show an error screen. Cancel returns to 01.

## 03 · Blueprint City: main HUD

**Purpose:** the hub. It shows the generated project and its buildings, and lets the visitor build them.

**Desktop:** see the [HUD layout](./03-layout-and-patterns.md#hud-layout-sheet-03-desktop). City `progress` mode, scale 1.12, `x −60`, `labels` on, with the focus following hover.

**Content**

- `PROJECT 001 · GENERATED FROM YOUR IDEA`, then the project name (H2 34), a 2-line summary, and `✎ EDIT IDEA`.
- Features panel: `FEATURES · 2/5 LIVE`. Each row shows an icon, name, subtitle and status.

  | Feature | Short | Subtitle | Icon |
  |---------|-------|----------|------|
  | Auth Tower | Auth | Sign-up, roles, sessions | `lock-keyhole` |
  | Payments Bank | Payments | Escrow & creator payouts | `landmark` |
  | AI Brain | AI Brain | Creator ↔ campaign matching | `brain` |
  | Marketplace | Market | Campaigns, bids, offers | `store` |
  | Notification Antenna | Notify | Email, push, in-app | `radio-tower` |

- Shard tray: `SKILL SHARDS · 3/8 COLLECTED`.
- CTAs: "Skip to my work" (ghost) and **Auto-build ▶** (primary).

**Mobile (3b):** a floating project card, a feature-chip row, and the collapsed bottom sheet. City scale .55, `y −70`.

**Behavior**

- Buildings and list rows are linked both ways.
- ↑/↓ moves through the list and ↵ inspects the selected item.
- The sidebar collapses to a 48px icon rail.
- Auto-build completes the remaining buildings in sequence.

## 04 · Building detail panel

**Purpose:** explain one feature and prove it has been built before.

**Desktop:** a right-docked 480px panel. City `focus` on the building, scale 1.1, `x −230` (building in the left third).

- Header: `BUILDING 03 / 05 · X 220 Y 230` and a close button. **Focus lands here when the panel opens.**
- Identity: a 48px status-colored icon tile, the name (H2 30), and a status tag (`BUILDING · 52%`).
- `WHY YOUR PROJECT NEEDS THIS`: a paragraph.
- `SUGGESTED TECH`: accent tech tags (e.g. Claude API, pgvector, PostgreSQL, BullMQ).
- A proof card linking to the matching case study.
- Sticky footer: **⚡ Power it up** (52px primary), then `15-SEC MINI-GAME · WIRE THE API` and "Auto-build this →".
- Bottom-left hint: `[ESC] CLOSE PANEL`.

**Mobile (4b):** an expanded bottom sheet with a 44px close button, a shorter paragraph, a compact proof card, "Power it up", and "Auto-build this instead".

**Behavior:** Esc closes the panel and returns focus to that building's list row.

## 05 · Mini-game: "Wire the API"

**Purpose:** a 15-second interaction that makes building a feature tactile.

**Desktop (5a, playing):** a modal over a scrim. Three nodes (Frontend · NEXT.JS → Backend · NESTJS → Database · POSTGRES) sit on the board. The visitor drags from port to port. The footer shows `LINKS 1/2` and `TAB → PORT · ↵ LINK`, plus "Skip game, auto-build →".

**Success (5b):** a green modal containing:

- The three linked nodes
- "Building online ✓" and "AI Brain is live. Wired in 6.2s."
- A "+1 SKILL SHARD · Claude API" pill
- Buttons: "Back to city" and **"Next: Marketplace →"**

The progress bar in the top bar updates, with the new percent in green.

**Mobile (5c):** a tap-based bottom sheet ("Tap the nodes in order."). It shows numbered node rows with states (`LINKED ✓` / `TAP NEXT`) and a skip link.

**Behavior**

- Drag on desktop and tap on mobile. The keyboard path is Tab to a port, then ↵ to link.
- A wrong port triggers a shake. A timeout **never fails**: the building auto-completes with the message "Jovanni finished it for you".

## 06 · Launch / completion

**Purpose:** celebrate and convert. It produces a project brief and asks for an email.

**Desktop**

- City in `lit` mode, scale 1.05, `x −240`, `y 40`, with an amber ground glow. A rocket icon rises on an amber trail.
- Top bar: `100%` in green and a single solid green bar.
- Left: `LAUNCH SEQUENCE COMPLETE · T+00:03` (green eyebrow) and the H1 "🚀 Your project is LIVE (in blueprint form)".
- Bottom-left: all 8 shards collected.
- Right: a 540w **Project brief** panel (`Project brief · CreatorBid`, `REV A · <date>`) with these sections:
  - `FEATURES · 5`: a 2-column ✓ list
  - `SUGGESTED STACK`: key/value mono rows (WEB, API, DATA, AI, INFRA, MOBILE)
  - `PHASED ROADMAP`: 3 cards (MVP green border · v1 blue · Scale neutral)
- Panel footer:
  - "Download brief (PDF)" and "Book a call" (secondary, side by side)
  - An email input with **Send brief to Jovanni** (primary)
  - A consent checkbox: "I agree to share this brief and my email with Jovanni so he can reply. No newsletters."

**Mobile (6b):** the H1 at the top, then a sheet with accordions (Features 5 · Suggested stack 8 · Roadmap 3), the email field, the consent checkbox, the Send button, then PDF and Book a call.

**Behavior:** Send is disabled until the email is valid and consent is checked. The PDF uses the same brief data.

## 07 · See My Work (2D fallback)

**Purpose:** a static, fast, recruiter-friendly portfolio with no 3D and no game.

**Sections (desktop, 48px gutters)**

1. **Hero:** a `1fr | 400px` grid.
   - Left: eyebrow `JOVANNI — FULL-STACK & AI ENGINEER`, Display XL "Your idea → / Live product.", a lead paragraph, and the buttons "Talk to me" (primary) and "See case studies ↓".
   - Right: a 400 × 460 portrait frame with a dimension line above it.
2. **Shipped work:** a 3-column grid of 6 project cards (`06 PROJECTS`).
3. **Skills:** a `320px | 1fr` split with 4 group cards (Frontend, Backend, Data & AI, Infra) and diamond-bulleted items.
4. **Experience:** a `180 | 24 | 1fr` timeline with diamond nodes and a vertical line. The entries are placeholders until real roles and dates are added.
5. **Contact:** a tinted band (`rgba(59,130,246,.05)`).
   - Left: eyebrow `CONTACT` in amber and "Have an idea? / Let's build it for real."
   - Right: email and message fields, "Book a call" and "Send message", and GITHUB · LINKEDIN · EMAIL links.

**Mobile (7b):** a menu button, the 48px hero, a full-width "Play the blueprint ▶", the first 2 project cards, and "View all 6 projects".

## 08 · Case study

**Purpose:** a deep dive. One template serves all six projects.

**Desktop (160px side gutters)**

- Top bar: "← All work", the logo, and "Talk to me".
- Eyebrow `CASE STUDY 02 · AI / COMPLIANCE`, an 80px H1, and a 20px lead.
- A meta row with 4 columns between blue hairlines: ROLE · STACK · TIMELINE · TYPE.
- A 480px hero screenshot.
- Numbered sections in a `240 | 1fr` split:
  1. `01 — PROBLEM`: a 20px paragraph
  2. `02 — ARCHITECTURE`: a blueprint diagram (`FIG. 01 · SIMPLIFIED`)
  3. `03 — KEY DECISIONS & TRADE-OFFS`: 3 cards, each with a dashed amber `TRADE-OFF` footer
  4. `04 — STACK`: 4 accent tiles
  5. `05 — RESULTS`: 3 metric cards with a green top border (`[metric]` placeholders). The label is in green.
- Footer: `NEXT CASE STUDY` and a large link to the next study.

**Mobile (8b):** a 38px H1, a single column, and the architecture diagram as a vertical stack.

---

## Sample data

The designs use **CreatorBid** as the example project:

> A two-sided marketplace where creators bid on brand campaigns, with escrow payments and AI matching between brands and creators.

Use it for fixtures, Storybook and empty states. The real project is generated from the visitor's idea, and the 5 presets are the fallbacks.
