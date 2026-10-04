# Local setup and environment contract

This runbook is the executable handoff for the TrustMotion Agency Next.js application. It keeps local, preview, staging, and production configuration explicit and prevents production data or secrets from entering development.

## Prerequisites

- macOS 13+, Ubuntu 22.04+, or Windows 11 with WSL2
- Git 2.40+
- Node.js 22.14.0 (`.nvmrc`)
- Corepack and pnpm 9.15.5
- Optional Docker Desktop 4.x only for an explicitly approved local mail mock; the application has no database, queue, SMTP dependency, or required Docker service.
- Access to the client Sanity project is required for CMS reads and development seeding. The content fallback can run without it.

Verify the toolchain:

```bash
node --version    # v22.14.0
 git --version    # 2.40 or newer
corepack enable
corepack prepare pnpm@9.15.5 --activate
pnpm --version    # 9.15.5
```

## First run

Run from the repository root in this order:

```bash
corepack enable
corepack prepare pnpm@9.15.5 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
pnpm exec playwright install --with-deps
pnpm test:e2e
pnpm test:a11y
pnpm lighthouse
pnpm check:bundle
pnpm dev -- --hostname 127.0.0.1 --port 3000
```

Check the running app in another shell:

```bash
curl -fsS http://localhost:3000/api/health
```

Expected response is HTTP 200 with `{ "status": "ok", "releaseId": "..." }`. Stop the server with `Ctrl-C`.

## Local services and ports

| Service | Address | Required | Notes |
| --- | --- | --- | --- |
| Next.js app | `http://127.0.0.1:3000` | yes | `pnpm dev`; use the documented port in scripts |
| Sanity Studio | `http://127.0.0.1:3333` | optional | client-managed Studio repository; not a route in this app |
| Resend mock | `http://127.0.0.1:4010` | optional | test harness only; never configure this base URL in production |
| Database/queue/SMTP | none | no | provider adapters are mocked in unit/integration tests |

## Environment matrix

`.env.example` is the complete variable-name contract. `NEXT_PUBLIC_*` values are browser-visible; all other values are server-only. Values below are examples, not credentials.

| Variable | Local | PR/Preview | Staging | Production | Phase/status |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | localhost | isolated preview URL | staging HTTPS | canonical HTTPS | build, required |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | development project | isolated project | staging project | production project | build, required |
| `NEXT_PUBLIC_SANITY_DATASET` | `development` | `pr-<number>` | `staging` | `production` | build, required |
| `SANITY_API_VERSION` | `2025-01-01` | same pinned value | same | same | build/runtime, required |
| `SANITY_READ_TOKEN` | dev read token or empty for public reads | isolated read token | staging read token | production read token | runtime secret, required for private reads |
| `SANITY_PREVIEW_TOKEN` | dev preview token | isolated preview token | staging preview token | production preview token | runtime secret, preview only |
| `PREVIEW_SECRET` | random 32-byte dev value | generated | staging | production | runtime secret, preview required |
| `RESEND_API_KEY` | test key | test key | staging key | production key | runtime secret, required for inquiries |
| `INQUIRY_TO_EMAIL` | sandbox inbox | sandbox inbox | staging inbox | approved client inbox | runtime config, required |
| `INQUIRY_FROM_EMAIL` | verified test sender | verified test sender | staging sender | verified production sender | runtime config, required |
| `CALCOM_BOOKING_URL` | approved test HTTPS URL | test URL | staging URL | approved production URL | runtime config, required |
| `LEAD_ALLOWED_ORIGINS` | `http://localhost:3000` | exact preview origin | exact staging origin | exact canonical origin | runtime config, required |
| `RATE_LIMIT_SALT` | random development value | generated | staging | production | runtime secret, required |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | empty | empty/preview | staging domain | production domain | build, optional |
| `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL` | empty | empty/approved | approved | approved | build, optional |
| `NEXT_PUBLIC_ANALYTICS_CONSENT_MODE` | `opt-in` | `opt-in` | `opt-in` | `opt-in` | build, required |

`SANITY_REVALIDATE_SECRET` is disabled for the MVP. Legacy aliases (`SANITY_API_READ_TOKEN`, `SANITY_PREVIEW_SECRET`, `INQUIRY_DESTINATION_EMAIL`, `RESEND_FROM_EMAIL`, `ALLOWED_ORIGINS`) are rejected rather than silently taking precedence. Never place a Sanity write token in the web runtime.

## Seed data

Seed only disposable development or staging datasets with synthetic content:

```bash
pnpm sanity:seed -- --dataset development
pnpm sanity:export -- --dataset development --out ./artifacts/sanity-development.ndjson
```

The seed script must refuse `--dataset production`. Do not import real names, emails, case-study evidence, or production exports into local or PR environments.

## Common commands

```bash
pnpm dev -- --hostname 127.0.0.1 --port 3000
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm test:e2e
pnpm test:a11y
pnpm build && pnpm start -- --hostname 127.0.0.1 --port 3000
pnpm lighthouse
pnpm check:bundle
pnpm sanity:seed -- --dataset development
pnpm sanity:export -- --dataset development --out ./artifacts/sanity-development.ndjson
```

## Troubleshooting

- `pnpm: command not found`: run `corepack enable && corepack prepare pnpm@9.15.5 --activate`, then open a new shell.
- Frozen install fails: install Node 22.14.0 and ensure `pnpm-lock.yaml` is committed; never rewrite the lockfile in CI.
- Port 3000 or 3333 is busy: inspect with `lsof -nP -iTCP:3000 -sTCP:LISTEN` (or 3333), stop the owner, and retry.
- Sanity returns 401/403: verify project, dataset, pinned API version, and least-privilege token; do not use production credentials locally.
- Seed refuses: use `development` or `staging`; production refusal is intentional.
- Inquiry returns 403/429: set `LEAD_ALLOWED_ORIGINS=http://localhost:3000`, use a fresh synthetic email/idempotency key, and wait for the bounded rate window; do not disable controls.
- Health is not 200: ensure the app is listening on port 3000; health does not probe providers.
- Playwright browser missing: run `pnpm exec playwright install --with-deps` in Linux CI or `pnpm exec playwright install` locally.
- A public variable is missing: compare `.env.local` with `.env.example` and restart dev; public variables are captured at startup.
- A preview shows production content: stop the deployment, verify isolated dataset and no production secrets, then redeploy.

## Handoff checklist

Setup is complete only when health returns 200, synthetic seeded content renders, e2e/a11y/Lighthouse checks pass, and the operator can identify the Vercel SHA, Sanity dataset, variable owner, rollback deployment, and backup evidence location. See `spec/setup` and `spec/operations` in ORBIT for the deployment and recovery runbook.
