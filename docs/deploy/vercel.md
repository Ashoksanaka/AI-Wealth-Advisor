# Deploy to Vercel

Step-by-step guide for deploying with **Vercel + managed Postgres + Inngest Cloud**.

## 1. Database

Create a PostgreSQL database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel Postgres.

- `DATABASE_URL` — pooled connection string (Neon `-pooler` host, Supabase transaction pooler port `6543`)
- `DIRECT_URL` — direct connection for Prisma migrations (non-pooled host)

## 2. Environment variables

Copy [`.env.example`](../.env.example) and set every value in the Vercel project dashboard **before** the first production deploy.

Required groups:

| Group | Variables |
|-------|-----------|
| Database | `DATABASE_URL`, `DIRECT_URL` |
| Clerk | `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY` |
| NVIDIA | `NVIDIA_API_KEY`, `NVIDIA_MODEL` |
| Email | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| Security | `ARCJET_KEY`, `ARCJET_ENV=production` |
| Inngest | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` |

Do **not** set `INNGEST_DEV`, `INNGEST_BASE_URL`, or `INNGEST_SERVE_HOST` on Vercel.

Recommended model: `NVIDIA_MODEL=meta/llama-3.1-8b-instruct`

## 3. Run migrations

From your machine with production `DATABASE_URL` and `DIRECT_URL` exported:

```shell
npx prisma migrate deploy
```

Or use the Vercel CLI with env pulled locally:

```shell
vercel env pull .env.local
npx prisma migrate deploy
```

## 4. Deploy

Connect the GitHub repo to Vercel, or deploy manually:

```shell
vercel --prod
```

Build settings are in [`vercel.json`](../vercel.json):

- `installCommand`: `npm ci --legacy-peer-deps`
- `buildCommand`: `prisma generate && next build`

## 5. Clerk production URLs

In the [Clerk dashboard](https://dashboard.clerk.com), add your Vercel domain:

- Allowed origins: `https://your-app.vercel.app`
- Redirect URLs for sign-in/sign-up flows

Match `NEXT_PUBLIC_CLERK_*_URL` values if you use custom paths.

## 6. Inngest Cloud

1. Create an app at [app.inngest.com](https://app.inngest.com)
2. Set sync URL: `https://your-app.vercel.app/api/inngest`
3. Copy `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` into Vercel env vars
4. Redeploy so background jobs (budget alerts, monthly reports, recurring transactions) register

## 7. Health check

After deploy, verify:

```shell
curl https://your-app.vercel.app/api/health
# {"ok":true}
```

## Pre-deploy security checklist

- Never commit `.env` — use Vercel environment variables only
- Rotate API keys if `.env` was ever shared or committed
- Demo seed is **disabled** in production unless `ALLOW_DEMO_SEED=true` is explicitly set
- Use a verified `RESEND_FROM_EMAIL` domain in production
