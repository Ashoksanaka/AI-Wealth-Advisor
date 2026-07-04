<div align="center">

# Digital Wealth Advisor

**Avatar-based AI wealth management for Indian retail banking — personalized advisory from spending, investments, and goals via Arya, your digital wealth advisor.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Currency](https://img.shields.io/badge/Currency-INR-2E7D32?style=flat-square)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Currency (INR)](#currency-inr)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Demo Walkthrough](#demo-walkthrough)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Security and Compliance](#security-and-compliance)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Hackathon](#hackathon)

---

## Overview

Digital Wealth Advisor brings relationship-manager-quality guidance to retail banking customers at scale. The product combines a unified wealth dashboard with **Arya**, a 2D conversational avatar that narrates live financial data, delivers proactive behavioral nudges, and supports voice interaction.

Built for **Indian retail banking**:

- All monetary values are **INR-native (₹)** — no multi-currency or FX layer
- Demo personas (Sarah, Raj) use India-scale amounts — lakhs for goals, NIFTYBEES, Indian salary bands
- Embeddable inside a bank mobile app via **WebView** (`/embed`) and a **versioned REST API** (`/api/v1/*`)
- IDBI sandbox adapter stub for production field mapping ([`lib/integrations/idbi-sandbox-adapter.js`](lib/integrations/idbi-sandbox-adapter.js))

---

## Features

### Arya — AI Wealth Advisor

- Conversational chat grounded in real portfolio, spending, and goal context
- Streaming SSE responses with live thinking-status animation
- Voice input (Web Speech API) and browser TTS output
- Human handoff card for complex queries
- Explainable recommendations ("Why this?") on insights and chat messages
- Cold-start handling for thin-data users with adaptive greetings
- Micro-invest and goal-contribution sliders in chat (INR amounts)

### Wealth Dashboard

- Accounts, transactions, budgets, and monthly email reports
- Portfolio holdings with allocation charts
- Financial goals with progress tracking and scenario planning
- AI-generated insight cards (NVIDIA NIM with rule-based fallback)
- Receipt scanning via vision model

### Behavioral Analytics

- Spending categorization and month-over-month trends
- Weekend spending spikes and expense-surge detection
- Salary and surplus detection for invest-now nudges
- Goal drift alerts and portfolio concentration awareness
- Risk profile from onboarding (conservative / moderate / aggressive)
- Portfolio rebalance recommendations

### Bank Mobile Integration

- `/embed` — WebView micro-app with SSO badge and wealth summary cards
- `/api/v1/*` — REST API for native or hybrid mobile clients
- Simulated bank SSO via `GET /api/v1/auth/bank-sso`
- Documented IDBI sandbox adapter stub for production data mapping

### Compliance and Trust

- DPDP consent captured at onboarding
- Educational-guidance disclaimers on advisor surfaces
- Bank-approved product catalog guardrails (no off-catalog tickers)
- Audit event logging for chat, insights, and handoffs
- PII sanitization before LLM calls

---

## Currency (INR)

The app is **INR-native**. All UI, nudges, advisor copy, and transactional emails display amounts in **Indian Rupees (₹)**.

| Topic | Detail |
|-------|--------|
| Formatter | [`lib/format-currency.js`](lib/format-currency.js) — `formatINR()`, `formatINRCompact()`, `CURRENCY_SYMBOL` |
| Display format | Indian grouping via `Intl.NumberFormat('en-IN')` — e.g. `₹1,23,456` |
| Compact format | Chart axes and tooltips — e.g. `₹1.2L`, `₹50K` |
| API responses | `/api/v1/wealth-summary` and related endpoints return **raw numeric amounts**; mobile/native clients should format as INR on display |
| Demo data | Stored values are already India-scale; no database conversion or FX logic |
| Nudge threshold | Projected surplus nudge fires when surplus **> ₹5,000** |
| Micro-invest slider | **₹500–₹50,000** range (default **₹1,000**) |
| Goal contribution slider | **₹500–₹10,000**/month (default **₹2,000**) |

---

## Architecture

```
Bank Mobile App  -->  /api/v1/* (REST)  -->  Domain Services  -->  PostgreSQL
       |                      |                    |
       v                      v                    +--> NVIDIA NIM (advisor + insights)
   /embed WebView        Clerk Auth                +--> Inngest (background jobs)
                                                +--> Resend (email)
                                                +--> Arcjet (shield + bot detection)
```

Full data-flow diagram: [docs/pitch/architecture.md](docs/pitch/architecture.md)

Mobile API design: [docs/mobile-integration.md](docs/mobile-integration.md)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router), React 19 |
| Styling | Tailwind CSS, Radix UI, shadcn-style components |
| Database | PostgreSQL 16, Prisma 6 |
| Auth | Clerk |
| AI | NVIDIA NIM (Llama, DeepSeek, vision models) |
| Background jobs | Inngest |
| Email | Resend, React Email |
| Security | Arcjet (shield, bot detection) |
| Charts | Recharts |
| Forms / validation | React Hook Form, Zod |
| Deployment | Vercel (primary), Docker Compose (local / self-hosted) |

---

## Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL 16** (local install, Docker, or managed — Neon / Supabase)
- Service accounts (free tiers available):
  - [Clerk](https://dashboard.clerk.com) — authentication
  - [NVIDIA NIM](https://build.nvidia.com) — AI advisor and insights
  - [Resend](https://resend.com) — transactional email
  - [Arcjet](https://app.arcjet.com) — request shielding
  - [Inngest Cloud](https://app.inngest.com) — production background jobs (optional locally with Docker Inngest dev server)

---

## Quick Start

### Local development (npm)

```shell
git clone <repository-url>
cd AI-wealth-management
npm i --legacy-peer-deps
cp .env.example .env
```

Edit `.env` with your credentials, then migrate and start:

```shell
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Add `http://localhost:3000` as an allowed origin and redirect URL in your [Clerk dashboard](https://dashboard.clerk.com).

### Docker (full stack with Inngest dev server)

```shell
cp .env.docker.example .env
docker compose up --build
```

First-time database setup:

```shell
docker compose exec app npx prisma migrate deploy
```

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| Inngest Dev UI | http://localhost:8288 |
| PostgreSQL | localhost:5432 |

### Verify demo readiness

```shell
npm run demo:verify
```

Checks that key pages, components, integration stubs, and pitch docs are present.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection (pooled URL on Vercel / Supabase port `6543`) |
| `DIRECT_URL` | Yes | Direct PostgreSQL URL for Prisma migrations |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk client key (build-time on Docker) |
| `CLERK_SECRET_KEY` | Yes | Clerk server key |
| `NVIDIA_API_KEY` | Yes* | NVIDIA NIM API key (*app falls back to rules if missing) |
| `NVIDIA_MODEL` | No | Advisor model; use `meta/llama-3.1-8b-instruct` |
| `NVIDIA_VISION_MODEL` | No | Receipt scanning model |
| `RESEND_API_KEY` | Yes | Email delivery |
| `RESEND_FROM_EMAIL` | No | Sender address (verified domain in production) |
| `ARCJET_KEY` | Yes | Arcjet project key |
| `ARCJET_ENV` | No | `development` or `production` |
| `INNGEST_EVENT_KEY` | Prod | Inngest Cloud event key |
| `INNGEST_SIGNING_KEY` | Prod | Inngest Cloud signing key |
| `ALLOW_DEMO_SEED` | No | Set `true` to allow `POST /api/v1/seed` in production |

Templates:

- [`.env.example`](.env.example) — local / Vercel reference
- [`.env.docker.example`](.env.docker.example) — Docker Compose with Inngest dev server
- [`.env.prod.example`](.env.prod.example) — production checklist

---

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint via `next lint` |
| `npm run demo:verify` | Check demo-critical files exist |
| `npm run email` | Preview React Email templates |
| `postinstall` | `prisma generate` (runs automatically on install) |

---

## Demo Walkthrough

1. **Sign up** and complete risk-profile onboarding (includes DPDP consent)
2. **Load demo data** from the dashboard — choose **Sarah** (moderate saver) or **Raj** (aggressive spender)
3. **Confirm INR display** — net worth, budgets, goals, and portfolio should show **₹** (e.g. `₹1,23,456`), not `$`
4. **Explore** wealth summary, AI insights, portfolio, and goals on `/dashboard`
5. **Chat with Arya** at `/advisor` — try voice, quick prompts, invest slider (₹500–₹50,000), and human handoff
6. **Open `/embed`** for the bank micro-app experience
7. **Test the API** — `POST /api/v1/advisor/chat`, `GET /api/v1/nudges`, `GET /api/v1/wealth-summary`

Full judge demo script: [docs/pitch/demo-script.md](docs/pitch/demo-script.md)

---

## API Overview

All `/api/v1/*` endpoints require Clerk authentication (session cookie or bearer token). Responses use a `{ success, data }` envelope. Monetary fields are **numeric INR values** without a currency symbol.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Health check (`{ ok: true }`) |
| `GET` | `/api/v1/profile` | User profile and risk assessment |
| `GET` | `/api/v1/wealth-summary` | Net worth, portfolio, goals, spending |
| `GET` | `/api/v1/insights` | AI-generated insight cards |
| `GET` | `/api/v1/nudges` | Proactive behavioral nudges |
| `GET` | `/api/v1/auth/bank-sso` | Bank SSO simulation |
| `GET` | `/api/v1/advisor/sessions` | List chat sessions |
| `POST` | `/api/v1/advisor/sessions` | Create chat session |
| `DELETE` | `/api/v1/advisor/sessions/[id]` | Clear or delete session |
| `GET` | `/api/v1/advisor/messages` | Chat history for a session |
| `POST` | `/api/v1/advisor/chat` | Send message to Arya |
| `POST` | `/api/v1/advisor/chat/stream` | Streaming chat (SSE) |
| `POST` | `/api/v1/advisor/feedback` | Message feedback (helpful / not) |
| `POST` | `/api/v1/seed` | Load demo persona data (auth required) |
| `GET/POST/PUT` | `/api/inngest` | Inngest function handler |

Full curl examples and WebView embedding: [docs/mobile-integration.md](docs/mobile-integration.md)

SSO simulation: [docs/sso-simulation.md](docs/sso-simulation.md)

---

## Deployment

### Vercel (recommended)

Production stack: **Vercel + managed Postgres (Supabase / Neon) + Inngest Cloud + Clerk**.

1. Copy [`.env.prod.example`](.env.prod.example) as a reference for Vercel env vars
2. Create a managed database:
   - **Supabase:** `DATABASE_URL` = transaction pooler, port **6543**, append `?pgbouncer=true`; `DIRECT_URL` = session pooler, port **5432**
   - URL-encode special characters in the database password (`@` → `%40`, `#` → `%23`, `$` → `%24`)
3. Add all env vars in the Vercel dashboard **before** the first deploy
4. Run migrations once: `npx prisma migrate deploy`
5. Deploy via Git integration or `vercel --prod`
6. Register Inngest sync URL: `https://<your-domain>/api/inngest`
7. Configure Clerk production domain and redirect URLs

Build configuration in [`vercel.json`](vercel.json): `prisma generate && next build`.

Full walkthrough: [docs/deploy/vercel.md](docs/deploy/vercel.md)

**Pre-deploy checklist**

- Never commit `.env` — secrets belong in Vercel env vars only
- Rotate Clerk, NVIDIA, Arcjet, and Resend keys if credentials were ever shared
- Set `NVIDIA_MODEL=meta/llama-3.1-8b-instruct` for reliable advisor chat
- Demo seed is blocked in production unless `ALLOW_DEMO_SEED=true`

### Docker (self-hosted)

Uses standalone Next.js output. Set `NEXT_PUBLIC_CLERK_*` vars in `.env` before build — they are baked in at image build time.

```shell
docker compose -f docker-compose.prod.yml up --build -d
```

Health check: `GET http://localhost:3000/api/health`

Migrations run automatically on container start. Background jobs require [Inngest Cloud](https://www.inngest.com) with `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`.

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/mobile-integration.md](docs/mobile-integration.md) | REST API reference and WebView embedding |
| [docs/sso-simulation.md](docs/sso-simulation.md) | Bank SSO simulation flow |
| [docs/deploy/vercel.md](docs/deploy/vercel.md) | Vercel deployment guide |
| [docs/pitch/architecture.md](docs/pitch/architecture.md) | System architecture and data flow |
| [docs/pitch/scope-decisions.md](docs/pitch/scope-decisions.md) | Avatar, segment, integration, data strategy |
| [docs/pitch/compliance-narrative.md](docs/pitch/compliance-narrative.md) | SEBI, DPDP, audit trail, escalation |
| [docs/pitch/demo-script.md](docs/pitch/demo-script.md) | Live demo script for judges |
| [docs/pitch/business-roi.md](docs/pitch/business-roi.md) | Business impact and ROI estimates |
| [docs/pitch/rubric-self-score.md](docs/pitch/rubric-self-score.md) | Hackathon rubric self-assessment |
| [docs/pitch/pitch-deck-outline.md](docs/pitch/pitch-deck-outline.md) | Pitch deck slide outline |
| [docs/pitch/video-script.md](docs/pitch/video-script.md) | Backup demo video script |
| [docs/pitch/phase-2-roadmap.md](docs/pitch/phase-2-roadmap.md) | Post-hackathon roadmap |

---

## Security and Compliance

- **Authentication** — Clerk for web and API; simulated bank SSO for embed demos
- **Request protection** — Arcjet shield and bot detection on all routes
- **PII handling** — `lib/pii-sanitizer.js` strips emails, phones, and names before LLM calls
- **Consent** — DPDP checkbox at onboarding; `consentGivenAt` stored on risk profile
- **Product guardrails** — Recommendations limited to bank-approved catalog (`lib/product-rag.js`)
- **Audit trail** — `AdvisorAuditEvent` records for chat, insights, and handoffs
- **Production hardening** — Unauthenticated seed endpoint removed; `POST /api/v1/seed` gated unless `ALLOW_DEMO_SEED=true`

Details: [docs/pitch/compliance-narrative.md](docs/pitch/compliance-narrative.md)

---

## Project Structure

```
app/
  (main)/          Dashboard, advisor, portfolio, goals, onboarding, accounts
  (auth)/          Clerk sign-in / sign-up
  embed/           Bank WebView micro-app
  api/
    v1/            Versioned REST API for mobile integration
    inngest/       Background job handler
    health/        Health check endpoint
components/
  advisor/         Arya avatar, chat, thinking status, handoff, action widgets
  embed/           Embed-mode wealth summary
  onboarding/      Risk profile wizard
  nudges/          Push notification center
lib/
  format-currency.js  INR formatting (formatINR, formatINRCompact)
  services/           Advisor and wealth domain services
  integrations/       IDBI sandbox adapter stub
  nvidia-ai.js        NVIDIA NIM client with model fallbacks
  wealth-advisor.js   LLM orchestration and fallbacks
  wealth-stats.js     Behavioral analytics engine
actions/              Next.js server actions
prisma/               Schema and migrations
docs/                 Architecture, API, deployment, pitch materials
scripts/              Docker entrypoints, demo verification
emails/               React Email templates (INR amounts)
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Advisor chat hangs or times out | Set `NVIDIA_MODEL=meta/llama-3.1-8b-instruct` in `.env` |
| Clerk redirect loop | Add `http://localhost:3000` to allowed origins and redirect URLs in Clerk dashboard |
| Prisma P1000 / P1001 on Vercel | Verify `DATABASE_URL` (pooled, port 6543) and `DIRECT_URL` (session pooler); URL-encode password |
| `.next` permission denied after Docker | `sudo rm -rf .next` then rebuild (Docker may create root-owned files) |
| Background jobs not running | Local: use `docker compose` with Inngest dev server. Prod: configure Inngest Cloud |
| Demo seed fails in production | Set `ALLOW_DEMO_SEED=true` or use a preview/staging environment |
| Amounts show wrong symbol | App is INR-native; redeploy latest build if you see legacy `$` formatting |
| `npm run lint` fails on typescript | `typescript` is in devDependencies; run `npm run build` to verify compile |

---

## Hackathon

Built for a bank hackathon brief: avatar-based digital wealth advisory integrated into mobile banking for Indian retail customers.

| Resource | Link |
|----------|------|
| Scope decisions | [docs/pitch/scope-decisions.md](docs/pitch/scope-decisions.md) |
| Live demo script | [docs/pitch/demo-script.md](docs/pitch/demo-script.md) |
| Compliance narrative | [docs/pitch/compliance-narrative.md](docs/pitch/compliance-narrative.md) |
| Architecture | [docs/pitch/architecture.md](docs/pitch/architecture.md) |
| Pitch deck outline | [docs/pitch/pitch-deck-outline.md](docs/pitch/pitch-deck-outline.md) |
| Prototype performance report | [docs/pitch/prototype-performance-report.md](docs/pitch/prototype-performance-report.md) |
| Backup video script | [docs/pitch/video-script.md](docs/pitch/video-script.md) |
| Rubric self-score | [docs/pitch/rubric-self-score.md](docs/pitch/rubric-self-score.md) |
| Business ROI | [docs/pitch/business-roi.md](docs/pitch/business-roi.md) |
