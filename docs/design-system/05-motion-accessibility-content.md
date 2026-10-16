# 5 · Motion, accessibility & content

## Motion

### Tokens

| Token | Value | Use |
|-------|-------|-----|
| `ease-out-expo` | `cubic-bezier(.2,.8,.2,1)` | Panels, sheets, camera moves |
| `ease-out` | `ease-out` | Progress fills |
| `dur-fast` | 150ms | Shake, hover, focus |
| `dur-base` | 320ms | Panel slide-in, sheet expand |
| `dur-slow` | 600ms | Progress segment fill |
| `dur-build` | 900ms | Building wireframe → solid sweep |
| `stagger-log` | 120ms | Log lines typing in |
| `stagger-proof` | 80ms | Proof card after the panel |

### Choreography by screen

| Screen | Motion |
|--------|--------|
| All game screens (01–06) | Ambient light pulses run along the blueprint grid lines like blood through veins (`components/layout/grid-pulses.tsx`): a bright head with a fading tail, one cycle of travel then a rest. Behind everything, pointer-transparent, hidden under reduced motion. Each streak has a glowing head, and `components/layout/pulse-shooter.tsx` makes them an optional mini game: click or tap a streak to shoot it (+10), hit the head for a bonus (+25); the score sits bottom-left. `components/layout/bug-crawler.tsx` adds one or two bugs that wander the whole viewport (a second one joins after a delay, killed bugs respawn); click or tap one for +50 (the hit test lives in the shooter, which owns the score). Decorative, `aria-hidden`, not mounted under reduced motion. |
| 01 Spark | The grid fades in. The faint wireframe city slowly orbits behind the vignette. The input border pulses once on load. The H1 types, holds, erases and cycles through short follow-up questions ("Who is it for?", "What problem does it solve?") to coax detail; it stops once the visitor types, and the stable question stays in the DOM for screen readers and crawlers. A preset tap typewriters its text into the input, then submits. |
| 02 Generating | Wireframe edges draw in stroke by stroke (dashed → solid), with buildings appearing in parse order. Log lines type in with a 120ms stagger, and a ✓ pops after each. The percentage counts up in sync with the bar. |
| 03 HUD | Progress segments fill left → right (600ms, ease-out) when a building goes live. Shards pop in at scale 0.6 → 1.08 → 1 with a blue flash. Hovering a building or row makes the building glow and shows its tooltip. |
| 04 Detail | The panel slides in from the right (320ms, `ease-out-expo`) while the camera eases the building into the left third. The proof card fades up 80ms later. |
| 05 Mini-game | The modal scales 0.96 → 1 with a backdrop blur. While dragging, the wire follows the pointer as dashed amber, then snaps solid blue on a valid port. A wrong port causes a 150ms shake. The timer ring drains clockwise and turns red under 3s. On success, the building sweeps from wireframe to solid, bottom to top (900ms), and the shard flies to the inventory. |
| 06 Launch | When the last building goes live, there's a 1s pause. Then the rocket lifts off with an amber trail, the camera tilts up, and every window lights in a ripple from the center. The brief types in section by section. |
| 07 Work | Cards lift on hover (border → `#60A5FA` plus a soft glow). The hero H1 and the contact H2 type in once, the first time they scroll into view (`TypeOnView`); the full text is in the server HTML and shown immediately under reduced motion. The Experience heading types in too, and its timeline rows reveal one by one on scroll (`RevealOnView`: fade up, diamond pops, connector draws down, 120ms stagger). Nothing else animates. |

### Rules

- **Respect `prefers-reduced-motion`.** Turn off the orbit, typewriter, ripple and rocket. Replace slides with fades of 150ms or less, and jump progress bars straight to their final values.
- Motion serves state. Something animates only when its status changes or the visitor acts on it.
- Never block input while something animates. Skip links stay clickable throughout.

## Accessibility

### Focus

- There's one focus style everywhere: a **2px `#60A5FA` outline** with a 2–3px offset. Use it on buttons, chips, ports, cards and icon buttons. The game HUD and the static pages share it.
- Use `:focus-visible`, and never remove outlines without a replacement.
- When the detail panel or a modal opens, move focus to its close button (or the first control). On close (Esc), return focus to the element that opened it, such as the building's list row.
- Trap focus inside modals and expanded sheets.

### Keyboard map

| Context | Keys |
|---------|------|
| Idea input | **Enter** submits · **Shift+Enter** adds a newline |
| Features list | **↑ / ↓** navigate · **↵** inspect |
| Detail panel | **Esc** closes |
| Mini-game | **Tab** moves to the next port · **↵** links |
| Global | Skip links are always reachable by Tab from the top bar |

Show these hints in the UI as mono labels, styled like `↑↓ NAVIGATE · ↵ INSPECT`.

### Contrast and sizing

- Body text `#E2E8F0`, muted text `#94A3B8` and glow `#60A5FA` all pass AA on `#0B1220`. Don't put text in `#64748B` or `#1E3A5F` unless it's decorative or disabled.
- Amber buttons always use **navy text** (`#0B1220`), never white.
- Mobile touch targets are at least **44 × 44** (preset chips, nav links and icon buttons are sized for this).
- Don't rely on status color alone. Always pair it with a text label (`LIVE`, `BUILDING`, `BLUEPRINT`) or an icon.

### Semantics

- Annotations, grid lines, coordinates and title blocks are decorative. Mark them `aria-hidden="true"`.
- The city is presentational. The Features list is the accessible equivalent: each building's name, status and action must be reachable there.
- Use `role="progressbar"` with `aria-valuenow` on the bars and the timer ring, and announce generation log updates through a polite live region.
- The mini-game must be skippable, and the skip must be reachable before the game starts.
- Forms need visible labels (or `aria-label`), errors linked with `aria-describedby`, and the disabled Send button must explain why it's disabled.

## Content & voice

**Voice:** first person, confident, short and plain. It sounds like an engineer talking to a client, not a marketer.

| Do | Don't |
|----|-------|
| "Tell me your idea. Watch me build it." | "Unlock limitless innovation with cutting-edge solutions." |
| "Brands shouldn't scroll through thousands of creators." | Jargon without a reason |
| "Jovanni finished it for you" (timeout) | "You failed" / "Time's up!" |
| "Your project is LIVE (in blueprint form)" | Overclaiming that a real product was built |

### Conventions

- **Sentence case** for headlines, buttons and links ("Draft my blueprint", "Read case study →").
- **UPPERCASE mono** for labels, eyebrows, counters and status ("FEATURES · 2/5 LIVE").
- Separate inline metadata with a middle dot `·` with spaces around it. Use an em dash in eyebrows (`SHEET 01 — SPARK`).
- Arrows mark direction: `→` for forward/next, `←` for back, `↓` for on-page jumps, `▶` for play, `↵` for the Enter key.
- Format counts as `n/total` (`2/5`, `3/8`). Show percentages without decimals.
- Use numbered sheet and section labels: `SHEET 01`, `CASE 02`, `01 — PROBLEM`.
- Building names follow a city metaphor: Auth **Tower**, Payments **Bank**, AI **Brain**, **Marketplace**, Notification **Antenna**.
- Placeholders stay obviously fake (`[metric]`, `[Role] · [Company]`) until real data replaces them. Never invent metrics.
- Email copy is consent-first: "No newsletters."
