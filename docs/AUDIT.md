# Website audit

A free, passive website audit (SEO · Security · Maintainability · Performance) that doubles as a lead funnel. Visitors get a useful preview; the most important findings and the AI analysis unlock only after they reach out and Jovanni approves a full audit. Related docs: [Goals](./GOALS.md) · [File structure](./FILE-STRUCTURE.md) · [Packages](./PACKAGES.md) · [SEO](./SEO-GEO-AEO.md)

## Flow

```
/audit (indexable)  → visitor enters a URL (+ Turnstile)
  POST /api/audit/preview      code-only checks                       0 AI tokens
  POST /api/audit/performance  PageSpeed Insights (separate, slow)     0 AI tokens
  → preview: scores, open findings in full, locked findings as title + severity only
  → [Share this audit] → /audit/s/<shareId>   (snapshot, noindex, 30 days)
  → [Get the full audit] (the one amber CTA) → name, email, message, consent
POST /api/audit/request → auditRequest (Sanity, private dataset) → Resend emails Jovanni a signed review link
/audit/review/<id>?token=… (noindex) → [Run full audit] · [Mark contacted] · [Decline]
  Server Action → lock → after(): fresh checks + Grok analysis → save report (draft, nothing sent)
  Jovanni reads it at /audit/report/<id>?token=… → [Send report to <email>] → Resend emails the requester (30 days)
```

## Rules

- **Passive only.** One page fetch plus `robots.txt`, `sitemap.xml`, the `http://` redirect and response headers. No path probing (`/.env`, `/.git`), no port scans, no fuzzing.
- **Locked details never reach the browser.** The server projects every result through `toPreview()`. Failing locked checks expose only `title` + `severity`. `content/audit-checks.ts` imports `server-only`, so the catalog's fix copy can't be bundled for the client.
- **Snapshots are created server-side.** `/api/audit/share` re-runs the checks (cheap thanks to the 24h cache) and never accepts preview data from the browser, so nobody can publish forged scores on this domain.
- **AI is approval-gated.** Grok runs only from the review page's "Run full audit" button. If it fails, is slow or answers off-schema, the report is the deterministic one (same findings, the catalog's `why`/`fix` wording, the standard summary), and Jovanni can re-run it.
- **Nothing reaches the requester unread.** Running the audit only produces a draft. A second button, "Send report", emails it, because the site promises "reviewed by me before it reaches you".
- **Prompt-injection hardened.** Grok receives findings JSON only (never HTML), and everything copied from the audited site is labelled untrusted, length-capped and stripped of control characters and code fences. See "Full audit (Phase 4)".

## SSRF guard (`features/audit/server/ssrf-guard.ts`, `safe-fetch.ts`)

- `http`/`https` only, ports 80/443 only, no credentials in the URL.
- DNS is resolved once; every address is checked against a `net.BlockList` of private, loopback, link-local, CGNAT, multicast, reserved and cloud-metadata ranges (IPv4, IPv6 and IPv4-mapped IPv6).
- The request uses `node:http(s)` with a custom `lookup` that returns only the validated address, so DNS rebinding can't swap it.
- Redirects are followed manually (max 5) and every hop is re-validated.
- 10s timeout; 2 MB cap on the decompressed body (zip-bomb safe).

## Open vs locked checks

The catalog in `content/audit-checks.ts` is the source of truth. Each check has a `tier`. **Any failing `critical` check is locked too**, whatever its tier.

| Category | Open (full detail in the preview) | Locked (title + severity until the full audit) |
|----------|-----------------------------------|-----------------------------------------------|
| SEO | Title, meta description, single `<h1>`, canonical, `lang`, viewport, Open Graph, image alt text, `robots.txt`, sitemap | Indexability (`noindex`), structured data (JSON-LD) |
| Security | HTTPS redirect, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, clickjacking protection | Content-Security-Policy quality, cookie flags, mixed content, TLS certificate, server/version disclosure |
| Maintainability | Doctype, HTML size, compression, `Cache-Control`, response time, deprecated HTML | Render-blocking scripts |
| AI analysis | — | Prioritized fix plan, effort estimates, business impact |

Rationale: open checks are the well-known basics, so showing them proves the audit is real and useful. Locked checks are the ones that are hardest to diagnose and most valuable to fix.

**Scoring:** per category, `round(100 × passed weight ÷ total weight)` with weights critical 3, warning 2, info 1.

## Data (Sanity, **private** dataset `audits`)

The blog dataset may be public. Audit data contains emails, so it lives in a separate private dataset, written with a server-only token and shown in a second "Audits" Studio workspace.

| Type | Fields |
|------|--------|
| `auditRequest` | url, domain, name, email, message, consent, status (`pending · running · completed · failed · contacted · declined`), previewSummary, sharedFrom; for the full audit: reportJson (the report, read back through a strict zod schema), reportGeneratedAt, reportUsedAi, reportModel, tokensUsed, reportExpiresAt (editable: set it to the past to revoke), reportStartedAt, reportError, sentAt, sendError |
| `auditSnapshot` | shareId, url, domain, expiresAt, previewJson (the public preview projection as JSON, read back through a strict zod schema), preparedFor (editable in Studio only), views, lastViewedAt |

## Links

| Link | Who | Protection | Lifetime |
|------|-----|------------|----------|
| `/audit/s/<shareId>` | Anyone with the link | 10-char random id, noindex, robots-disallowed | 30 days, then "run a fresh one" |
| `/audit/review/<id>?sig=` | Jovanni | HMAC (`AUDIT_SIGNING_SECRET`); GET only displays, POST Server Action re-verifies | 7 days |
| `/audit/report/<id>?token=` | The requester (and Jovanni, to preview) | HMAC token (purpose `report`), noindex, plus the stored `reportExpiresAt` | 30 days from sending |

## Shared audits (Phase 3b)

- **Create:** "Create share link" on the results calls `POST /api/audit/share` with the scan ticket. The server re-runs the checks itself, stores only the public preview (`toPreview`), and returns `/audit/s/<shareId>`. The browser never supplies results, so nobody can publish forged scores under this domain. The same URL shared again within 24 h reuses its snapshot, which bounds how many documents one visitor can create.
- **Link:** 10 random URL-safe characters, noindex, disallowed in `robots.txt`, valid 30 days (`expiresAt`, editable in Studio to extend or end a link). An expired link shows "This audit is out of date" with a button to run a fresh one.
- **Page:** read-only results (scores, "What this means", findings, full-audit panel). No speed card and no share button. "Get the full audit" works from here and records the share ID on the request ("Came from …" on the review page and in the email).
- **Personalising:** set `preparedFor` on the snapshot in `/studio/audits`. The page shows "PREPARED FOR …" (escaped, max 80 characters), and **only those links** email Jovanni the first time they are opened. Visitor-created links never email, so someone sharing their score with a colleague isn't noise. `preparedFor` is deliberately not settable from the page, so nobody can put arbitrary text under this domain.
- **Views:** counted in `after()`, atomically (`inc`), so exactly one caller sees `views === 1`. Link-preview bots (Slack, WhatsApp, LinkedIn, Facebook, X, Discord, Googlebot, curl, headless browsers), requests without a user agent and prefetches are not counted. This is a heuristic: some email scanners and unfurlers will slip through, so the email is a hint, not proof.
- **Share image:** `opengraph-image` draws a 1200×630 card (domain, three scores, critical and locked counts) from the stored preview only. Unknown or unreadable IDs get a generic card, because crawlers cache whatever they receive. It uses the default font until a font file is added to the repo.
- **Not shared:** the speed score. It is measured live, not stored.

## Full audit (Phase 4)

**Running it** (`runFullAuditAction` → `generateFullReport`)
- **Lock first:** `claimReportRun` is a compare-and-set on the document revision, so a double click or a second tab can't start two runs or spend the AI twice. A run still "running" after 5 minutes was cut off and may be started again.
- **Then in `after()`**, so the click answers at once and the review page refreshes itself until the report is ready. The review page's `maxDuration` (60 s) bounds the whole run; fresh checks run first (never the cached free scan), and Grok gets whatever is left of a 55 s budget. With under 10 s left the AI is skipped.
- **Failure handling:** the site can't be audited → status `failed` with the reason, and the AI is never called. Grok missing, slow, rejected or off-schema → the deterministic report is stored and the review page says so. Unexpected errors are recorded, never thrown at the page.

**What Grok is asked** (`lib/ai/xai.ts`, `full-audit-prompt.ts`)
- Provider: **xAI Grok** through its OpenAI-compatible Chat Completions (`https://api.x.ai/v1`) with native `fetch`, so no SDK package. Structured output via `response_format: json_schema`, with the schema generated from zod (`z.toJSONSchema`) so the two can't drift. The schema is deliberately plain (no length keywords); limits are enforced afterwards.
- Model: `XAI_MODEL`, default `grok-4.7`. The default came from secondary sources, not xAI's own model page, so confirm it. A wrong name shows up as an `[xai] HTTP 4xx` line in the logs and a standard-wording report, never as a failed run. Cost is roughly a few cents per audit and tokens are recorded on the request.
- It returns: a `summary`, a `businessImpact`, and an ordered `plan` of up to 12 items, each pointing at one failing finding by its exact id with an action, an effort and an impact.

**What the AI can and cannot do** (`build-report.ts`)
- It can write prose and reorder the plan. It **cannot add, remove or change a finding, score or count**: the stored `result` is the deterministic one.
- Plan ids that don't exist, repeats, and findings that passed are dropped; prose is capped (1,200 characters, actions 400); empty prose means the AI is treated as unavailable; a critical finding the model left out is appended, because a report must never lose a critical issue.

**Prompt injection** (the audited site is a stranger's)
- Titles, header values and URLs come from the target site and could talk to the model. Defenses, in layers: the system prompt says all of it is untrusted data and never to be followed; only findings are sent (no HTML, no header dump, no cookies); every string is control-character-stripped, whitespace-collapsed, fence-defused and length-capped (evidence 300 characters); the answer must match a strict schema; plan ids must exist in the input; the output is only ever rendered as text; and Jovanni reads the report before it is sent.

**Delivering**
- The report page (`/audit/report/…`) leads with the summary, then the ordered plan, then every failing finding with evidence / why / how to fix, then what passed. Nothing is locked. The footer line says "AI-assisted" only when the AI was actually used.
- "Send report" emails the link and restarts the 30 days. **Resend's shared sender only delivers to your own address**, so until a domain is verified (`CONTACT_FROM_EMAIL`) this fails; the failure is recorded on the request and the review page keeps the link ready to copy and send by hand.
- Report links are signed, not stored (a change from the original plan of a stored hash): the review page can show the link again at any time. `reportExpiresAt` is the kill switch.
- Not in the report yet: the PageSpeed score and the LCP element / Core Web Vitals root causes.

## Env

`XAI_API_KEY`, `XAI_MODEL` (default `grok-4.7`), `PAGESPEED_API_KEY` (required in practice: without a key Google answers 429), `NEXT_PUBLIC_SANITY_AUDIT_DATASET` (default `audits`), `SANITY_AUDIT_TOKEN`, `AUDIT_SIGNING_SECRET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

## Performance (PageSpeed)

- Separate request after the main results, so the page never waits on it (Lighthouse takes 10–30 s). Route `maxDuration = 60`; the client gives up at 65 s.
- Open: the mobile score plus LCP, CLS and TBT. Locked (full audit): the LCP element and render-blocking resources. `parsePageSpeed` keeps only the open fields.
- Cached about a day per URL; failures (quota, timeout, unscorable page) for seconds, and the card then says "Couldn’t measure speed right now" without affecting the rest of the audit.
- Google fetches the page itself, so nothing reaches our network, but the URL is still checked as public to avoid spending quota on junk.
- The summary ("What this means for you") does not use the performance score yet.

## Lead capture (Phase 3)

- **Bot check:** Cloudflare Turnstile (no package: script tag + `fetch` verification) on the scan form and the request dialog, in `interaction-only` mode. Server side, no secret in development skips the check; **in production a missing secret fails closed** (503).
- **Scan ticket:** `/api/audit/preview` verifies Turnstile once, then returns an HMAC ticket bound to the final URL (15 min). `/api/audit/performance` requires it, so the slow speed test needs no second token and can't be hit directly.
- **`POST /api/audit/request`:** validate (zod) → Turnstile → duplicate check (same email + domain still `pending` is acknowledged without a second email) → our own re-scan for scores and counts (8 s budget, never trusted from the browser) → save as `pending` → email Jovanni a signed review link. Each step degrades instead of failing the visitor: no store configured → email only; stored but email failed → still a success; neither → 502/503 with the contact email.
- **Review page `/audit/review/[requestId]?token=…`:** noindex, 404 for anything that isn't a valid signed link (7 days). Opening it only displays; "Mark contacted" and "Decline" are Server Actions that verify the token again. "Run full audit" and "Send report" are covered under "Full audit (Phase 4)".
- **Studio:** a second embedded Studio at `/studio/audits` for the private dataset; the blog Studio at `/studio` is untouched.
- **Signing:** `AUDIT_SIGNING_SECRET` (16+ chars). Tokens are `<expiry>.<HMAC-SHA256>` over purpose + value + expiry, so a scan ticket can't be replayed as a review link. In production a missing secret fails closed.
- **To go live:** create a **private** dataset named `audits` in the Sanity project, create a token with write access to it, set the env vars below, and set a Vercel Firewall rate-limit rule on `/api/audit/*`.

## Abuse limits

- Turnstile on the scan, share and request forms.
- A Vercel Firewall rate-limit rule on `/api/audit/*` (dashboard config, no code).
- Previews cached for 24h per normalized URL (`'use cache'` + `cacheLife`). Best-effort on serverless.
- At most one pending request per email + domain.

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | Engine: SSRF-safe fetch, checks, `toPreview`, `POST /api/audit/preview`, unit tests (`npm test`) | ✅ Done (Turnstile check added in Phase 3) |
| 2 | PageSpeed Insights: `POST /api/audit/performance`, 4th "Performance · mobile" card that fills in after the other results | ✅ Built; needs `PAGESPEED_API_KEY` for a live run (not yet verified end to end) |
| — | **Design:** Sheet 09 · Audit (canvas), documented in `design-system/04-screens.md` | ✅ Done |
| 2b | `/audit` page: URL form, scanning state, results, "What this means for you", findings list, full-audit panel (mailto and Calendly for now) | ✅ Built; not yet checked in a browser |
| 3 | Lead capture: Turnstile on scan + request, private `audits` dataset, request dialog, signed review page, emails | ✅ Built; not yet run against real Sanity/Turnstile/Resend keys |
| 3b | Shareable snapshots, share image, view tracking, first-open email | ✅ Built; not yet run against a real Sanity dataset |
| 4 | Full audit: run + lock, Grok analysis with deterministic fallback, report page, send step | ✅ Built; Grok not yet called against the real API |
| 5 | Polish: rate-limit rule, a11y, reduced motion, doc updates | — |

## Design notes

- Severity colors: `--color-danger` for critical; warning and info use neutral text plus an icon. Blue, amber and green stay reserved for build status.
- Amber: the results view has two primary buttons ("Get the full audit" and "Book a call"), an intentional exception to "one amber button per view" for the audit pages only. See Sheet 09 in `design-system/04-screens.md`.
