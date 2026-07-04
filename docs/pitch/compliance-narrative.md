# Compliance & Regulatory Narrative

Pitch talking points for judges. Pair with live demo of disclaimers, XAI, audit log, and handoff.

## SEBI: Guidance vs Regulated Investment Advice

**Position:** Arya provides **financial education and goal-based guidance**, not personalized investment advice under SEBI IA regulations.

**How we enforce this:**
- Product recommendations limited to YourBank approved catalog ([`lib/product-rag.js`](../../lib/product-rag.js))
- Unapproved tickers are declined in chat ([`lib/wealth-advisor.js`](../../lib/wealth-advisor.js))
- Disclaimer on every advisor surface: *"Educational guidance only — not SEBI-regulated investment advice"*
- No guaranteed returns; capital-at-risk messaging

**Judge line:** *"We sit on the education and bank-product guidance side of the line. A SEBI-registered IA layer would be added for bespoke portfolio mandates in production."*

---

## DPDP Act, 2023 — Consent & Data Use

**Position:** Personalization requires explicit, informed consent; users can withdraw.

**Implementation:**
- Consent checkbox at onboarding step 5 ([`components/onboarding/onboarding-wizard.jsx`](../../components/onboarding/onboarding-wizard.jsx))
- `consentGivenAt` stored on `RiskProfile` (Prisma)
- PII sanitized before LLM calls ([`lib/pii-sanitizer.js`](../../lib/pii-sanitizer.js))
- Data minimization: only wealth-relevant fields sent to NVIDIA NIM

**Judge line:** *"Consent is captured at onboarding under DPDP. We log when it was given and only process data needed for the advisory experience."*

---

## Audit Trail for Recommendations

**Position:** Every recommendation is traceable for grievance redress.

**Implementation:**
- `AdvisorAuditEvent` model in PostgreSQL
- `logAdvisorEvent()` called on chat, insights, handoff ([`lib/audit/advisor-audit.js`](../../lib/audit/advisor-audit.js))
- Metadata includes inputs used (risk profile, data points)

**Judge line:** *"If a customer disputes a nudge, we can replay the event with the data that drove it."*

---

## Human Escalation Path

**Position:** Complex or high-value queries escalate to a human RM.

**Implementation:**
- "Talk to human" intent detection ([`lib/sentiment.js`](../../lib/sentiment.js))
- Handoff card with ticket ID and conversation summary ([`components/advisor/handoff-card.jsx`](../../components/advisor/handoff-card.jsx))
- Phase 2: live RM queue integration

---

## Bank Auth Reuse (SSO)

**Position:** No separate login in production — customer arrives pre-authenticated from the bank app.

**Implementation:**
- Simulated SSO via `GET /api/v1/auth/bank-sso` ([`lib/bank-sso.js`](../../lib/bank-sso.js))
- Embed page shows SSO badge ([`app/embed/page.jsx`](../../app/embed/page.jsx))
- Production: OAuth/SAML token exchange (documented in [sso-simulation.md](../sso-simulation.md))

**Judge line:** *"We never ask retail customers to create a second password. The bank session is the session."*
