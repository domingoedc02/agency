# Delivery and verification foundation

This checklist turns the TrustMotion Agency handbook into executable CI evidence and a repeatable handoff. It is deliberately limited to verification and delivery expectations; product behavior remains owned by the implementation issues.

## Verification matrix

| Requirement | Owner | Automated check / path | CI evidence |
| --- | --- | --- | --- |
| Node/pnpm pins and frozen dependencies | DevOps | `.nvmrc`, `package.json engines/packageManager`, `pnpm install --frozen-lockfile` | `ci-artifacts/<sha>/release/toolchain.txt` |
| Type and lint quality | Developer + reviewer | `pnpm lint`, `pnpm typecheck`, `pnpm format:check` | `ci-artifacts/<sha>/quality/static-and-unit.txt` |
| Unit/domain/provider boundaries | Developer | `pnpm test`, `tests/unit/**`, `tests/integration/**` | same quality artifact |
| Build reproducibility | DevOps | `pnpm build`; record `git rev-parse HEAD` | `ci-artifacts/<sha>/release/commit.txt`, build log |
| Secret/SCA safety | Security + DevOps | pinned secret scan, `pnpm audit --audit-level=high` | `ci-artifacts/<sha>/security/{secret-scan,audit,sca}.txt` |
| Security headers, cache isolation, request defenses | Security | `tests/integration/security/**` and header assertions | `ci-artifacts/<sha>/security/{headers,csp,cache-isolation,request-defenses}.json` |
| Inquiry abuse, idempotency, redaction | Security + backend | `tests/integration/inquiry/**` | `ci-artifacts/<sha>/security/{abuse-delivery,idempotency,redaction-retention}.json` |
| No-JS core journeys | Frontend + QA | `tests/browser/no-js.spec.ts` | `ci-artifacts/<sha>/browser/playwright-report/` |
| Reduced-motion behavior | Frontend + QA | `tests/browser/reduced-motion.spec.ts` | same Playwright report |
| WCAG 2.2 AA | Frontend + QA | `pnpm test:a11y` with axe; manual NVDA/VoiceOver sign-off | `ci-artifacts/<sha>/browser/a11y-report/`, `release-evidence/<release-id>/assistive-technology.md` |
| Performance budgets | Frontend + DevOps | `pnpm lighthouse`, `pnpm check:bundle` | `ci-artifacts/<sha>/performance/{lighthouse-report,bundle-budget.json}` |
| LCP/INP/CLS thresholds | Frontend + QA | Lighthouse assertions: LCP <=2.5s, INP <=200ms, CLS <=0.1 | Lighthouse report |
| Initial JS budget | Frontend + DevOps | Brotli route budget <=250 KiB | bundle-budget JSON |
| Content proof and fallback safety | Content owner + QA | `tests/integration/content/**`, verified fixture assertions | `ci-artifacts/<sha>/privacy/fallback.json` |
| API health behavior | DevOps | `curl -fsS /api/health`; no provider calls | `release-evidence/<release-id>/smoke.json` |
| Staging provider synthetics | DevOps | `.github/workflows/staging-synthetic.yml`, cron `*/5 * * * *` | `release-evidence/<release-id>/synthetics/` |
| Sanity backup and restore | DevOps + content owner | `.github/workflows/sanity-backup.yml`; monthly isolated restore | `release-evidence/backup/<date>/{export,restore}.json` |
| Immutable promotion and rollback | DevOps + client owner | SHA/deployment equality and read-only smoke | `release-evidence/<release-id>/promotion.json`, `rollback.json` |
| Logging retention and no-PII | Security + DevOps | redaction/retention integration test and review | `ci-artifacts/<sha>/security/redaction-retention.json` |

CI must fail closed for any check above. Artifacts are retained for 30 days and contain no real secrets, lead data, tokens, cookies, or unredacted provider responses.

## Branch, PR, and evidence handoff

1. Start with the assigned issue in ORBIT; transition it to **In progress** before creating a branch or writing code.
2. Create one branch from protected `main`: `<issue-key-lowercase>-<short-kebab-slug>` (for example, `tma-2-3-delivery-verification`). Never share branches across issues.
3. Keep commits imperative and <=72 characters (`scope: verb object`). Do not commit `.env.local`, generated output, real PII, production exports, or secrets.
4. Run the relevant checks locally, then the complete gate before requesting review: `pnpm lint && pnpm typecheck && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e && pnpm test:a11y && pnpm lighthouse && pnpm check:bundle`.
5. Push the branch and open a PR that states the issue key, behavior, files, test commands/results, accessibility/performance evidence, configuration or migration impact, rollback, and follow-up. The PR must end with the required generated attribution line.
6. Reviewer verifies the acceptance criteria and retained evidence, then approves or requests exact changes. Changes stay on the same branch; rerun affected gates and return the issue to In review.
7. Merge only through protected `main` after required reviews and green CI. No production promotion occurs from an unreviewed branch.

## Promotion, rollback, and incident handoff

- CI records the tested SHA in `ci-artifacts/<sha>/release/commit.txt`. Vercel's deployment source SHA must match it exactly; otherwise promotion is blocked.
- Preview uses isolated Sanity data and test Resend/Cal.com destinations. Staging runs health, read-only routes, a synthetic content read, and one synthetic inquiry to the sandbox. Never submit real leads from CI or production smoke.
- The client owner approves production. DevOps promotes the already-tested immutable staging deployment and records deployment ID/URL, SHA, approver, UTC, smoke results, and rollback target in `release-evidence/<release-id>/promotion.json`.
- Roll back in Vercel Dashboard by promoting the previous known-good deployment; target completion is under 15 minutes. Trigger for draft leakage, broken CTA, inquiry failure, security issue, sustained API 5xx >=2%, or quality-gate regression. Record old/new SHA, URLs, UTC, incident ID, smoke results, cause, and follow-up in `rollback.json`.
- For an incident, DevOps acknowledges within 30 minutes and escalates to the client owner at 60 minutes. User-symptom alerts: API 5xx >=2% in five minutes, health failure twice consecutively, inquiry delivery failures >=5% or five in ten minutes, Sanity fallback >=3 in five minutes, Cal.com redirect failures >=3 in ten minutes, or three consecutive CWV breaches.
- Daily Sanity production exports run at 02:00 UTC to encrypted client-owned storage through GitHub OIDC. Keep 30 daily exports and verify checksum. Monthly and post-schema restores use an isolated dataset; RPO is 24 hours, content RTO 4 hours, and code rollback under 15 minutes.

## Day-one implementation sequence

1. Establish the pins, project scripts, `.env.example`, and forbidden legacy aliases; prove a clean frozen install.
2. Add config validation and the security/header/request-ID boundary before routes or provider adapters.
3. Implement typed domain contracts and use cases, then adapter seams for Sanity, Resend, Cal.com, and Plausible.
4. Add the health route and content fallback before editorial reads; verify no-provider health behavior.
5. Build semantic server-rendered pages and no-JS/reduced-motion UI; add form validation, origin, rate-limit, honeypot, consent, idempotency, and redaction tests.
6. Add Sanity schemas/fixtures and protected preview; prove invalid/withdrawn proof never renders.
7. Add CI gates, artifact retention, staging synthetics, backup workflow, and immutable deployment evidence before requesting production approval.
8. Run accessibility, performance, security, and provider-failure tests; obtain content/security/QA sign-offs; then promote the exact tested SHA.

## Dependencies and stop conditions

- The client must provide environment-specific Sanity project/datasets, verified Resend sender/destination, approved Cal.com HTTPS URLs, Vercel targets, OIDC storage, and named approvers before staging/production gates can pass.
- Do not use production secrets or real PII in local, PR, CI, fixtures, exports, or smoke tests.
- Do not merge when a quality/security gate is red, evidence is missing, SHA does not match deployment, backup restore has failed, or an unresolved high/critical audit or secret finding exists.
- A missing provider is handled by typed fallback and an explicit staging failure; it is not bypassed by disabling origin, rate limits, consent, redaction, or preview controls.
