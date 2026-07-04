# Demo Script — Judge Walkthrough (~5 minutes)

## Personas

| Persona | Profile | Demo purpose |
|---------|---------|--------------|
| **Sarah** | Moderate risk, high savings, balanced portfolio | Healthy saver, surplus invest nudges |
| **Raj** | Aggressive risk, high weekend spend, equity-heavy | Spending spike nudges, budget warnings |

---

## Scripted Journey

### 1. Bank app entry (30s)
- Open `http://localhost:3000/embed` — micro-app inside bank mobile WebView
- Note: *"Customer is already authenticated via YourBank SSO — no separate login"*
- Click **Simulate bank login** or `GET /api/v1/auth/bank-sso?establish=1&bankUserId=sarah-demo`

### 2. Cold start (30s) — optional but recommended
- Sign up as new user → complete onboarding including **DPDP consent** step
- Skip demo seed → show **Cold Start banner** on dashboard
- Open `/embed` → Arya greets with thin-data message (no fabricated spending insights)

### 3. Load Sarah persona (30s)
- Dashboard → **Load demo data** → select **Sarah**
- Wealth summary cards appear in embed; dashboard populates

### 4. Proactive nudge moment (30s)
- Wait for push toast (~2.5s) or show contextual nudge banner
- For **Raj** persona: highlight **spending spike** or **expense surge** nudge
- Note: *"This is behavior-triggered advisory — not a reactive chatbot"*

### 5. Unified embed + narration (60s)
- On `/embed`, point at compact wealth summary (net worth, savings, goals)
- Quick prompt: **"Walk me through my dashboard"**
- Arya cites live numbers with XAI data points
- Toggle **voice output** (speaker icon) for TTS demo

### 6. Persona contrast (45s)
- **Load demo data** → select **Raj**
- Show different rebalance suggestion, lower savings rate, equity concentration nudge
- Same engine, visibly different outputs

### 7. Compliance (30s)
- Show disclaimer: education-only, not SEBI advice
- Click **Why this?** on an insight
- Ask: *"Talk to human"* → handoff card with ticket ID
- Mention audit trail in database

### 8. API for mobile (30s)
```bash
curl /api/v1/wealth-summary
curl /api/v1/insights
curl -X POST /api/v1/advisor/chat -d '{"message":"Walk me through my dashboard"}'
curl /api/v1/nudges
```

### Closing line
*"YourBank scales personalized wealth advisory to millions via AI — 15–25% AUM uplift potential, without adding human RMs."*

See [video-script.md](./video-script.md) for backup recording.
