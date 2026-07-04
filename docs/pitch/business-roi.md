# Business Value & ROI

## One-paragraph impact estimate

For a bank serving **1M retail mobile users**, deploying Arya to the **top 20% most engaged** (~200K users) could drive a **15–25% uplift in investment product adoption** among that cohort — translating to meaningful AUM growth on bank-owned MF/FD products — while reducing **cost-per-advisory-session by 60–70%** ($15–50 human RM → ~$0.01–0.10 API). Assumptions: industry PFM engagement benchmarks (15–30% adoption lift with personalized nudges), RM fully-loaded cost of $15–50/session, NVIDIA NIM inference at fractional cents per turn. See scalability table below.

## Problem

Wealth advisory is fragmented and inaccessible. Human relationship managers (RMs) cannot scale to millions of retail customers.

## Solution ROI

### Lower Customer Acquisition Cost (CAC)
- AI advisor **Arya** handles initial guidance without human RM time
- Onboarding + risk profiling automated — reduces RM-assisted account opening cost
- **Estimate**: 60–70% reduction in cost-per-advisory-session vs human-only model

### Increase Assets Under Management (AUM)
- Personalized nudges at salary receipt and surplus detection drive incremental investments
- Micro-investing ($25+) lowers barrier for young savers like Sarah
- Goal-based scenario planning increases commitment to long-term investing
- **Estimate**: 15–25% uplift in investment product adoption among engaged users

### Improve Retention & DAU
- In-app insights and behavioral patterns create daily engagement hooks
- Avatar chat provides emotional, accessible interface vs intimidating finance apps
- Embedded micro-app increases touchpoints within existing bank app
- **Estimate**: 20% improvement in 90-day retention for wealth module users

## Scalability

| Metric | Human RM model | AI Avatar model |
|--------|----------------|-----------------|
| Concurrent users | ~50 per RM | Unlimited |
| Cost per advice session | $15–50 | ~$0.01–0.10 (API) |
| Availability | Business hours | 24/7 |
| Personalization depth | High (manual) | High (data-driven) |

## Bank integration value

- **API-first** design enables any bank mobile app to embed via WebView
- **SSO simulation** demonstrates zero-friction entry from host app
- Regulatory guardrails (disclaimers, XAI, approved products only) reduce compliance risk
