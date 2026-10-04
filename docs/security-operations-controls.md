# TrustMotion Agency security and operations controls

This document is the security review artifact for the technical handbook. It turns the
security and operations specification into controls that have an owner, an implementation
location, a test location, and a retained release artifact. A missing or failed control blocks
promotion.

## Scope and canonical contracts

- **Public application:** Next.js App Router on Vercel.
- **Canonical inquiry endpoint:** `POST /api/inquiries`. The singular `/api/inquiry` alias is
  unsupported and must not be implemented. This follows the handbook contract and prevents
  duplicate route contracts.
- **Providers:** published Sanity reads, restricted Sanity preview, server-side Resend delivery,
  server-validated HTTPS Cal.com redirect, and opt-in Plausible aggregate analytics.
- **Data rule:** the application stores no inquiry database. Inquiry content goes only to the
  fixed Resend recipient and the client-owned mailbox/provider policy.
- **Synthetic-data rule:** CI, preview, staging, screenshots, fixtures, backups used for tests,
  and monitoring contain no production secrets or real personal data.

## Ownership and evidence map

Every row is a release gate. The owner attaches the named artifact under
`release-evidence/<release-id>/` or `ci-artifacts/<sha>/`. A verbal confirmation or screenshot
without the stated machine-readable result is not evidence.

| Control | Owner | Implementation boundary | Verification | Required evidence |
|---|---|---|---|---|
| HTTPS, canonical host and HSTS | DevOps | Vercel domain policy; `middleware.ts` | `tests/integration/headers.test.ts` | `ci-artifacts/<sha>/security/headers.json` |
| CSP, frame, referrer, permissions and COOP headers | Security | `middleware.ts` header policy | `tests/integration/headers.test.ts` and CSP report review | `ci-artifacts/<sha>/security/csp.json` |
| Method, media type and 16 KiB body limit | Backend | `app/api/inquiries/route.ts` request envelope | `tests/integration/inquiries-security.test.ts` | `ci-artifacts/<sha>/security/request-defenses.json` |
| Exact origin/Referer policy and no CORS | Security | `lib/security/origin.ts`, route boundary | cross-origin and missing-origin integration cases | same `request-defenses.json` plus production header output |
| Duplicate-key and unknown-field rejection | Backend | JSON parser/schema boundary | duplicate JSON keys, `__proto__`, arrays, trailing content | `request-defenses.json` with provider-call count `0` |
| Field normalization and injection rejection | Backend | `lib/security/validation.ts` | CR/LF, controls, bidi, HTML/script, invalid Unicode and bounds | `ci-artifacts/<sha>/security/injection.json` |
| Honeypot and layered abuse limits | Backend | `lib/security/rate-limit.ts` and WAF | provider-mock load test at 5/15m, 20/24h, 3/24h keyed digest | `ci-artifacts/<sha>/security/abuse-delivery.json` |
| Timeout, one retry and global breaker | Backend + DevOps | typed Resend adapter; route deadline | 4s provider timeout, 5s route deadline, 50/10m or 80% quota breaker | `abuse-delivery.json` and alert event |
| Fixed Resend sender/recipient and escaped plain text | Backend | `lib/adapters/resend.ts` | CRLF/header injection and mock destination assertions | `ci-artifacts/<sha>/security/fixed-recipient.json` |
| Request IDs and allow-list redaction | Security | `lib/security/redaction.ts` and logger adapter | sentinel PII scan over structured logs and responses | `ci-artifacts/<sha>/security/redaction-retention.json` |
| Public content excludes drafts | System architect | typed Sanity published adapter | published/cache-isolation test | `ci-artifacts/<sha>/security/cache-isolation.json` |
| Preview secret/session isolation | Security | preview route, draft mode and server token | constant-time invalid/expired/rotated secret; cookie/header assertions | `cache-isolation.json` and `preview.json` |
| Cal.com redirect allow-list | Backend | `app/book/route.ts` and config validation | reject non-HTTPS/unapproved hosts; no query/PII passthrough | `ci-artifacts/<sha>/security/open-redirect.json` |
| Consent-gated analytics | Frontend + Security | consent boundary and Plausible adapter | no-consent, withdrawal, blocked-script network assertions | `ci-artifacts/<sha>/privacy/analytics-consent.json` |
| Supply-chain and secret safety | DevOps | lockfile, CI permissions, build/source maps | SCA, secret, bundle and source-map scans | `ci-artifacts/<sha>/security/sca.json`, `secret-scan.json`, `bundle.json` |
| Staging provider synthetic | DevOps | `.github/workflows/staging-synthetic.yml` | every 5 minutes; test Sanity read and test Resend delivery only | `release-evidence/<release-id>/synthetics/` |
| Sanity backup and isolated restore | DevOps + content owner | `.github/workflows/sanity-backup.yml` | daily export/checksum; monthly and post-schema restore | `release-evidence/backup/<date>/export.json`, `restore.json` |
| Immutable promotion and rollback | DevOps + client owner | Vercel deployment promotion | SHA equality, smoke and rollback rehearsal | `release-evidence/<release-id>/promotion.json`, `rollback.json` |
| Incident alerting and escalation | DevOps | Vercel/provider dashboards and operations channel | controlled alert events for abuse, breaker, CSP and provider failures | `release-evidence/<release-id>/alerts.json` |

## Request-defense acceptance tests

The executable suite belongs in `tests/integration/inquiries-security.test.ts`. It must run against
a provider mock and assert both the HTTP response and provider call count. No test may use a real
Resend key or mailbox.

| Test case | Expected result | Provider calls |
|---|---|---:|
| `GET /api/inquiries` | `405 METHOD_NOT_ALLOWED`, generic body with opaque request ID | 0 |
| non-JSON or unsupported charset | `415 UNSUPPORTED_MEDIA_TYPE` | 0 |
| body over 16 KiB | `413 PAYLOAD_TOO_LARGE` | 0 |
| malformed JSON, array, primitive, trailing bytes or duplicate key | `400 VALIDATION_ERROR` | 0 |
| unknown field, `__proto__`, constructor/prototype key | `400 VALIDATION_ERROR` | 0 |
| absent `Origin` and absent `Referer` | `403 ORIGIN_NOT_ALLOWED` | 0 |
| non-allow-listed exact origin or Referer | `403 ORIGIN_NOT_ALLOWED` | 0 |
| CR/LF, controls, bidi override, HTML/script or invalid Unicode field | `400 VALIDATION_ERROR` | 0 |
| invalid enum, missing/false consent, or out-of-range field | `400 VALIDATION_ERROR` | 0 |
| non-empty honeypot | timing-safe generic response; no provider-visible data | 0 |
| same idempotency key and same endpoint/environment fingerprint | prior safe result replay | 1 total |
| same idempotency key with different fingerprint | `409 DUPLICATE_REQUEST` | 0 for conflict |
| limit exceeded | `429 RATE_LIMITED` with `Retry-After` from 1–900 seconds | 0 |
| provider timeout/5xx after one bounded retry | `503 DELIVERY_UNAVAILABLE` | <=2 |
| accepted valid request | `202 {status:"accepted",requestId,message}` and `Cache-Control: no-store` | 1 |

Responses must not reflect submitted values, provider errors, stack traces, cookies, tokens,
redirect targets, or internal quota details. The test scans serialized response headers, body and
captured logs for sentinel name, email, company and message values.

## Provider, content and preview tests

The security suite also requires the following tests in `tests/integration/provider-boundaries.test.ts`:

1. **Resend boundary:** the adapter always uses server configuration for `INQUIRY_TO_EMAIL` and
   `INQUIRY_FROM_EMAIL`; CR/LF in input cannot create a header; content is escaped plain text;
   arbitrary headers, recipients, sender and metadata are impossible through the request body.
2. **Sanity boundary:** public queries are fixed/allow-listed, use the published read token, reject
   draft/unverified/expired proof, and validate the typed response. The preview token is absent
   from client bundles, RSC payloads, source maps and response bodies.
3. **Preview boundary:** invalid, expired and rotated `PREVIEW_SECRET` values fail generically;
   successful preview sets only a `Secure; HttpOnly; SameSite=Lax` cookie with a maximum eight-hour
   lifetime; preview responses are `private, no-store`; exit expires the cookie.
4. **Cal.com boundary:** `CALCOM_BOOKING_URL` must be an absolute HTTPS URL on the approved host;
   configuration with `javascript:`, HTTP, userinfo, unapproved host, query PII or arbitrary
   redirect is rejected before deployment.
5. **Analytics boundary:** Plausible script/events are absent before explicit opt-in and after
   withdrawal; events contain only the allow-listed aggregate event name and no form values,
   identifiers, query data or booking details.

## Logging, retention and access acceptance

`lib/security/redaction.ts` is the only application/security logging boundary. An allow-list test
must prove that a structured event can contain only UTC timestamp, environment, route, outcome,
reason code, status, latency bucket, random request ID and (when essential and restricted) provider
message ID.

The redaction fixture contains sentinel name, email, company, goals, budget, timeline, consent,
cookie, preview header, token, full IP, user-agent, query string, Cal.com value and provider
exception. The resulting log, response, deployment artifact and analytics payload must contain none
of those sentinels. Logs are retained for at most 30 days, access is limited to named owner and
responders, and deletion/access procedures are linked from the release record.

Evidence paths:

- `ci-artifacts/<sha>/security/redaction-retention.json`
- `release-evidence/<release-id>/privacy/` for privacy/fallback results
- `release-evidence/<release-id>/access-review.json` for named access and rotation owners

## Backup, rollback and incident runbook

### Backup and restore

1. At `02:00 UTC` daily, `.github/workflows/sanity-backup.yml` authenticates with GitHub OIDC and
   exports only the production Sanity dataset to encrypted client-owned storage.
2. The job verifies the object checksum and records dataset, object URI, byte count, checksum, key
   ID, completion time and expiry. It never stores a production export in GitHub artifacts, Git,
   or a developer machine.
3. Retain 30 daily exports and delete expired exports weekly; record `deletion.json`. Alert on
   missing, failed or mismatched exports, retry once, page DevOps after 30 minutes and the client
   owner after 60 minutes.
4. Monthly and after every schema change, restore the newest export into an isolated dataset,
   compare deterministic counts/checksums, render the homepage and one case study, capture
   `restore.json`, then delete the isolated dataset.
5. A failed restore blocks promotion. Target RPO is 24 hours and content RTO is 4 hours.

### Immutable deployment and rollback

1. CI records `git rev-parse HEAD` at `ci-artifacts/<sha>/release/commit.txt`.
2. DevOps verifies the Vercel deployment Source Commit SHA exactly matches that artifact. A mismatch
   blocks promotion.
3. After required checks and client approval, DevOps promotes the existing immutable staging
   deployment; it does not rebuild from a moving branch.
4. For draft leakage, inquiry failure, a security issue, sustained 5xx, or a performance/
   accessibility gate regression, DevOps selects the previous known-good Vercel deployment and
   chooses **Promote to Production** within 15 minutes of the rollback decision.
5. Re-run health, read-only route/header and controlled staging checks. Record incident ID, old/new
   SHA, deployment URLs, UTC times, smoke results, cause and follow-up in
   `release-evidence/<release-id>/rollback.json`.
6. If a provider configuration alone is faulty, disable that optional integration and use the
   documented fallback while the incident is assessed. There is no application database rollback;
   Sanity schema changes require the isolated restore procedure above.

### Alert and escalation path

- Alert after two consecutive health failures; API 5xx >=2%; inquiry delivery failures >=5% or
  five in 10 minutes; Sanity fallback >=3 in 5 minutes; Cal.com redirect failures >=3 in 10
  minutes; or representative CWV thresholds fail three consecutive samples.
- Page the client-owned operations channel. DevOps acknowledges within 30 minutes, investigates,
  and escalates to the client owner at 60 minutes. Any production alert gets an incident record.
- Security immediately flags suspected credential exposure, draft disclosure, PII leakage, origin
  bypass, CSP regression or duplicate delivery; revoke/rotate affected secrets, preserve only
  redacted evidence, and block promotion until the relevant gate is rerun.

## Release gate

Promotion is blocked unless the release record links every required artifact in the ownership map,
all request-defense/provider/preview/redaction tests pass, CI scans report no unowned high/critical
finding, synthetic checks use staging-only providers, and backup/rollback evidence is current.
Re-run the relevant controls after any change to preview/auth, inquiry fields, providers, analytics,
origins, CSP, dependencies, hosting or secrets.

References: `spec/security`, `spec/security/threat-model`, `spec/security/identity`,
`spec/security/validation`, `spec/security/operations`, `spec/security/deployment-checklist`,
`spec/operations`, `spec/testing`, and issue `TMA-2-2`.
