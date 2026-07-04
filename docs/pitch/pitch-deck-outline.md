# Pitch Deck Outline (10–12 slides)

Export to Google Slides / PDF for submission.

---

## Slide 1 — Title
- **Digital Wealth Advisor (Arya)**
- Avatar-based AI wealth management for bank mobile apps
- Team name, hackathon, date

## Slide 2 — Problem
- Wealth advisory is fragmented and inaccessible at retail scale
- Human RMs cannot serve millions of self-directed investors
- Existing PFM apps lack proactive, personalized guidance

## Slide 3 — Target Segment
- **Mass-market retail** — salaried professionals, first-time investors
- Not HNI (they already have RMs)
- Personas: Sarah (saver) and Raj (aggressive spender)

## Slide 4 — Solution
- Arya: 2D conversational avatar inside bank mobile WebView
- Behavioral analytics + proactive nudges + goal-based guidance
- Unified dashboard the avatar narrates

## Slide 5 — Live Demo Screenshot
- `/embed` with SSO badge, wealth summary cards, chat
- Annotate: nudge toast, XAI "Why this?"

## Slide 6 — Differentiation vs PFM / Chatbot
| | Rules PFM | FAQ Chatbot | Arya |
|---|---|---|---|
| Proactive nudges | Rare | No | Yes (spending spike, salary) |
| Live data narration | Static charts | Generic | Personalized |
| Bank integration | Standalone | Standalone | WebView + API v1 |

## Slide 7 — Architecture
- Mermaid from [architecture.md](./architecture.md)
- Highlight: avatar layer, behavioral engine, IDBI adapter stub

## Slide 8 — Compliance
- Education-only (not SEBI IA advice)
- DPDP consent at onboarding
- Audit trail + human handoff
- Bank SSO — no duplicate login

## Slide 9 — Business Model
- Bank licenses embed + API
- Revenue: AUM uplift on bank products, reduced RM cost-to-serve
- Freemium education tier; premium goal planning (future)

## Slide 10 — Business Impact
- **15–25% AUM uplift** among engaged users (industry PFM benchmarks)
- **60–70% lower cost-per-advisory-session** vs human RM ($15–50 → ~$0.01–0.10 API)
- **20% improvement** in 90-day retention for wealth module users
- See [business-roi.md](./business-roi.md)

## Slide 11 — Feasibility & Roadmap
- Runs today on synthetic data shaped like IDBI sandbox
- Adapter stub ready for live API swap
- Phase 2: real SSO, vector RAG, trade execution ([phase-2-roadmap.md](./phase-2-roadmap.md))

## Slide 12 — Ask / Close
- Working prototype demo
- Backup video link
- Team contact
