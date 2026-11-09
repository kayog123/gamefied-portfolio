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
/audit/review/<id>?sig=… (noindex) → [Run full audit] · [Mark contacted] · [Decline]
  Server Action → after(): re-run checks + Grok analysis → save report
  → Resend emails the visitor /audit/report/<token> (noindex, 30 days)
```

## Rules

- **Passive only.** One page fetch plus `robots.txt`, `sitemap.xml`, the `http://` redirect and response headers. No path probing (`/.env`, `/.git`), no port scans, no fuzzing.
- **Locked details never reach the browser.** The server projects every result through `toPreview()`. Failing locked checks expose only `title` + `severity`. `content/audit-checks.ts` imports `server-only`, so the catalog's fix copy can't be bundled for the client.
- **Snapshots are created server-side.** `/api/audit/share` re-runs the checks (cheap thanks to the 24h cache) and never accepts preview data from the browser, so nobody can publish forged scores on this domain.
- **AI is approval-gated.** Grok runs only from the review page. If it fails, the report is built from the deterministic findings plus the catalog's canned `why`/`fix` copy, and Jovanni can re-run it.
- **Prompt-injection safe.** Grok receives the findings JSON only, never raw HTML.

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
| `auditRequest` | url, domain, name, email, message, consent, createdAt, status (`pending · running · completed · failed · contacted · declined`), previewSummary, report, model, tokensUsed, reportTokenHash, reportExpiresAt, snapshot (ref), error |
| `auditSnapshot` | shareId, url, domain, createdAt, expiresAt, preview (public view only), preparedFor (Studio only), source (`visitor · outreach`), views, lastViewedAt |

## Links

| Link | Who | Protection | Lifetime |
|------|-----|------------|----------|
| `/audit/s/<shareId>` | Anyone with the link | 10-char random id, noindex, robots-disallowed | 30 days, then "run a fresh one" |
| `/audit/review/<id>?sig=` | Jovanni | HMAC (`AUDIT_SIGNING_SECRET`); GET only displays, POST Server Action re-verifies | 7 days |
| `/audit/report/<token>` | The requester | 32-byte random token, only its hash stored, noindex | 30 days |

A shared link emails Jovanni the first time it's opened ("lead opened your audit"). Views are counted in `after()`.

## AI (full audit only)

- Provider: **xAI Grok** through its OpenAI-compatible API with native `fetch` (`lib/ai/xai.ts`), so no SDK package.
- Model: the current flagship, set with `XAI_MODEL`. Volume is tiny because every run is approved by hand, so quality beats price (~$0.03 per audit).
- Structured output: JSON schema generated from zod (`z.toJSONSchema`), and the response is validated with zod.

## Env

`XAI_API_KEY`, `XAI_MODEL`, `PAGESPEED_API_KEY` (required in practice: without a key Google answers 429), `NEXT_PUBLIC_SANITY_AUDIT_DATASET` (default `audits`), `SANITY_AUDIT_TOKEN`, `AUDIT_SIGNING_SECRET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

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
- **Review page `/audit/review/[requestId]?token=…`:** noindex, 404 for anything that isn't a valid signed link (7 days). Opening it only displays; "Mark contacted" and "Decline" are Server Actions that verify the token again. "Run full audit" arrives with Phase 4.
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
| 3b | Shareable snapshots, OG score card, view tracking, first-open email | — |
| 4 | Full audit: Grok, report page, delivery email | — |
| 5 | Polish: rate-limit rule, a11y, reduced motion, doc updates | — |

## Design notes

- Severity colors: `--color-danger` for critical; warning and info use neutral text plus an icon. Blue, amber and green stay reserved for build status.
- Amber: the results view has two primary buttons ("Get the full audit" and "Book a call"), an intentional exception to "one amber button per view" for the audit pages only. See Sheet 09 in `design-system/04-screens.md`.
