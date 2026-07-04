# Rubric Self-Score

One sentence per criterion — use in submission Q&A.

| Criterion | Answer |
|-----------|--------|
| **Innovation** | Arya proactively nudges on behavior changes (spending spikes, salary events) and narrates the live dashboard — not a static FAQ chatbot or rules-only PFM chart. |
| **Feasibility** | The prototype runs end-to-end on synthetic data shaped like IDBI sandbox fields, with a documented adapter stub (`lib/integrations/idbi-sandbox-adapter.js`) showing how live APIs plug in. |
| **Scalability** | API-first WebView embed serves unlimited concurrent users at ~$0.01–0.10 per session vs $15–50 per human RM advisory session. |
| **Business impact** | We estimate 15–25% AUM uplift among engaged users and 60–70% lower cost-per-advisory-session, based on industry PFM engagement benchmarks and RM cost models (see business-roi.md). |
| **Technical implementation** | Live Next.js 15 app with PostgreSQL, Prisma, NVIDIA NIM, Inngest jobs, audit logging, and `/api/v1` mobile APIs — demonstrable, not slideware. |
