# Mobile Integration Guide

Digital Wealth Advisor exposes a versioned REST API (`/api/v1/*`) designed for embedding into a bank's mobile application via WebView or native HTTP client.

## Architecture

See [docs/pitch/architecture.md](pitch/architecture.md) for full data flow diagram.

```
Bank Mobile App → API Gateway (v1) → LLM Orchestration → PostgreSQL
                                   → NVIDIA NIM
                                   → Product RAG (bank-products.json)
```

## Authentication

See [docs/sso-simulation.md](sso-simulation.md) for SSO simulation details.

### `GET /api/v1/auth/bank-sso`

Simulates bank SSO session validation.

```bash
curl -b "your-clerk-session-cookie" "http://localhost:3000/api/v1/auth/bank-sso?bankUserId=demo"
```

### `GET /api/v1/nudges`

Returns contextual in-app nudges.

```bash
curl -b "your-clerk-session-cookie" http://localhost:3000/api/v1/nudges
```

## Endpoints

### `GET /api/v1/profile`

Returns user profile and risk assessment.

```bash
curl -b "your-clerk-session-cookie" http://localhost:3000/api/v1/profile
```

### `GET /api/v1/wealth-summary`

Returns net worth, portfolio, goals, and spending behavior.

```bash
curl -b "your-clerk-session-cookie" http://localhost:3000/api/v1/wealth-summary
```

### `GET /api/v1/insights`

Returns 3–5 AI-generated insight cards.

```bash
curl -b "your-clerk-session-cookie" http://localhost:3000/api/v1/insights
```

### `GET /api/v1/advisor/messages`

Returns chat history with Arya for a session.

```bash
curl -b "your-clerk-session-cookie" \
  "http://localhost:3000/api/v1/advisor/messages?sessionId=SESSION_ID"
```

### `GET /api/v1/advisor/sessions`

List all chat sessions for the authenticated user.

```bash
curl -b "your-clerk-session-cookie" http://localhost:3000/api/v1/advisor/sessions
```

### `POST /api/v1/advisor/sessions`

Create a new chat session.

```bash
curl -X POST -b "your-clerk-session-cookie" http://localhost:3000/api/v1/advisor/sessions
```

### `DELETE /api/v1/advisor/sessions/[id]?clear=true`

Clear messages in a session (`clear=true`) or delete the session entirely.

```bash
curl -X DELETE -b "your-clerk-session-cookie" \
  "http://localhost:3000/api/v1/advisor/sessions/SESSION_ID?clear=true"
```

### `POST /api/v1/advisor/feedback`

Submit thumbs up/down feedback on an assistant message.

```bash
curl -X POST -b "your-clerk-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{"messageId":"MSG_ID","rating":"HELPFUL"}' \
  http://localhost:3000/api/v1/advisor/feedback
```

### `POST /api/v1/advisor/chat/stream`

Streaming chat with Server-Sent Events (SSE) for low-latency perceived responses.

```bash
curl -N -X POST -b "your-clerk-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{"message":"How am I doing?","sessionId":"SESSION_ID"}' \
  http://localhost:3000/api/v1/advisor/chat/stream
```

### `GET /api/v1/auth/bank-sso?establish=1`

Simulate bank SSO handoff — sets session cookie and redirects to `/embed`.

```bash
curl -b "your-clerk-session-cookie" \
  "http://localhost:3000/api/v1/auth/bank-sso?establish=1&bankUserId=sarah-demo&redirect=/embed"
```

### `POST /api/v1/advisor/chat`

Send a message to Arya and receive a personalized response.

```bash
curl -X POST -b "your-clerk-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{"message":"How am I doing with my savings?","sessionId":"SESSION_ID"}' \
  http://localhost:3000/api/v1/advisor/chat
```

### `POST /api/v1/seed`

Load demo wealth data (holdings, goals, transactions) for the authenticated user.

```bash
curl -X POST -b "your-clerk-session-cookie" http://localhost:3000/api/v1/seed
```

## Response Format

All endpoints return a consistent envelope:

```json
{
  "success": true,
  "data": { }
}
```

Errors:

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

## Embedding in Mobile WebView

```html
<iframe src="https://wealth-advisor.yourbank.com/embed" style="width:100%;height:100%;border:none" />
```

The `/embed` route hides global chrome for a native micro-app experience. `/advisor` is also mobile-optimized (`max-w-md`, safe-area padding).

## Demo Flow for Judges

1. Sign up / sign in
2. Complete risk profile onboarding
3. Load demo data from dashboard or `POST /api/v1/seed`
4. View wealth summary and AI insights on dashboard
5. Open Arya mini chat widget from dashboard (bottom-right FAB)
6. Maximize to `/advisor` for full-screen chat with session history and feedback
7. Chat with Arya via `POST /api/v1/advisor/chat` from mobile clients

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `NVIDIA_API_KEY` | AI insights and Arya chat (falls back to rule-based if missing) |
| `CLERK_SECRET_KEY` | API authentication |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Client auth |
