# TrustMotion Agency technical handbook

The approved technical handbook is maintained in ORBIT issue `TMA-2`. This repository artifact is the implementation handoff index; the issue remains canonical for the complete product, architecture, security, operations, testing, and release contract.

## Handoff artifacts

- `SETUP.md` — pinned Node/pnpm toolchain, environment matrix, local services, first run, synthetic seed guardrails, troubleshooting, and handoff checklist.
- `docs/security-operations-controls.md` — security and operations control ownership, implementation boundaries, acceptance tests, evidence paths, backup/restore, rollback, alerting, escalation, and release gates.
- `docs/delivery-verification.md` — verification matrix, CI evidence, branch/PR rules, promotion and rollback handoff, day-one sequencing, dependencies, and stop conditions.
- `TMA-2` in ORBIT — canonical handbook sections, API and user flows, security model, data rules, operational decisions, measurement definitions, and unresolved launch approvals.

## Completion checklist

- [x] Repository setup and environment contract documented.
- [x] Security and operations controls mapped to owners, code boundaries, tests, and evidence.
- [x] Delivery, verification, accessibility, performance, no-JS, reduced-motion, and release handoff defined.
- [x] All three foundation subtasks independently reviewed and merged.
- [ ] Sprint 2 implementation creates the application and executable checks described by this handbook.
- [ ] Client-owned provider accounts, production tiers, recipient/SLA, and measurement targets approved before release.

## Canonical implementation constraints

- Next.js App Router with strict TypeScript; server-render by default.
- `POST /api/inquiries` is the only inquiry endpoint; no singular alias or stored lead database.
- Sanity, Resend, Cal.com, Plausible, and GSAP remain behind typed boundaries.
- No secrets, real inquiry PII, production exports, or provider credentials in Git, fixtures, URLs, bundles, logs, or analytics.
- Core journeys remain usable without JavaScript, GSAP, or analytics; reduced-motion and keyboard behavior are functional requirements.
- Promotion requires the exact tested commit, passing security/accessibility/performance gates, synthetic-provider evidence, and current backup/rollback evidence.

## Sprint 2 starting sequence

1. Establish the Next.js/package/tooling baseline and CI workflow.
2. Add configuration validation, security headers, request IDs, and the no-provider health route.
3. Add domain contracts, provider adapters, content fallback, and typed Sanity reads.
4. Implement semantic landing/contact/book/work/privacy routes and the inquiry security boundary.
5. Add unit, integration, browser, accessibility, and reduced-motion checks before visual polish.
