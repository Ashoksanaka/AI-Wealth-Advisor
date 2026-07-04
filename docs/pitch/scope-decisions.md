# Scope Decisions — Hackathon Build

Locked decisions for judges and pitch narrative. Reference this when asked "why did you build it this way?"

## 1. Avatar Definition

**Decision:** Animated **2D conversational agent** (Arya) with text chat, Web Speech API voice input, and browser TTS voice output.

**Not in scope:** 3D rendered avatar, video avatar, or voice-only assistant without visual persona.

**Rationale:** Delivers a recognizable persona and voice interface within hackathon timeline. 3D/video deferred to Phase 2 ([phase-2-roadmap.md](./phase-2-roadmap.md)).

**Implementation:** [`components/advisor/advisor-avatar.jsx`](../../components/advisor/advisor-avatar.jsx), [`components/advisor/advisor-chat.jsx`](../../components/advisor/advisor-chat.jsx)

---

## 2. Target Customer Segment

**Decision:** **Mass-market retail / self-directed investors** — salaried professionals and young earners who use mobile banking daily but lack access to a human relationship manager.

**Explicitly not:** HNI (high net-worth individuals) who already receive dedicated RMs.

**Persona examples:**
- **Sarah** — 25, software engineer, high savings rate, moderate risk, first-time investor
- **Raj** — 32, sales manager, aggressive risk appetite, high discretionary spending, needs budget discipline

**Problem fit:** The brief states wealth advisory is "inaccessible" to a large number of customers — this maps to retail scale, not private banking.

---

## 3. Bank Mobile Integration Model

**Decision:** **Embedded WebView micro-app** deep-linked from the bank's native mobile app, backed by REST API v1.

**Not in scope:** Native SDK, standalone app with separate login.

**Flow:**
1. Customer taps "Wealth Advisor" in YourBank mobile app
2. Bank passes SSO token → `GET /api/v1/auth/bank-sso`
3. WebView loads `/embed` with authenticated session
4. All data flows through `/api/v1/*` endpoints

**Rationale:** WebView is the fastest path to production for Indian banks (IDBI, etc.) without app-store releases. API-first design allows future native SDK wrapper.

**Docs:** [mobile-integration.md](../mobile-integration.md), [sso-simulation.md](../sso-simulation.md)

---

## 4. Data Strategy

**Decision:** **Self-generated synthetic seed data** shaped like IDBI sandbox fields, with a documented adapter stub for production API mapping.

**Not in scope (prototype):** Live IDBI sandbox API integration.

**Rationale:**
- Demo reliability — no network dependency during live judging
- Seed personas (Sarah/Raj) produce deterministic, contrasting outputs for judges
- Adapter stub (`lib/integrations/idbi-sandbox-adapter.js`) proves feasibility without blocking the demo

**Judge answer:** *"We run on synthetic data today that mirrors IDBI sandbox schema. The adapter layer is built — swapping mock for live APIs is a configuration change, not an architecture change."*

---

## Summary Table

| Decision | Choice | Defend with |
|----------|--------|-------------|
| Avatar | 2D animated + voice | Live demo at `/embed` |
| Segment | Retail / self-directed | Sarah & Raj personas |
| Integration | WebView + API v1 | `/embed`, SSO simulation |
| Data | Mock seed + IDBI adapter stub | `actions/seed.js`, adapter file |
