# Architecture & Data Flow

```mermaid
flowchart TB
  subgraph client [ClientLayer]
    BankApp[YourBank Mobile App]
    WebView[Embed WebView /embed]
    WebUI[Full Web Dashboard]
  end

  subgraph gateway [APIGateway_v1]
    Profile[GET /profile]
    Wealth[GET /wealth-summary]
    Insights[GET /insights]
    Chat[POST /advisor/chat]
    Sessions[GET /advisor/sessions]
    Feedback[POST /advisor/feedback]
    Nudges[GET /nudges]
    SSO[GET /auth/bank-sso]
  end

  subgraph bff [BFF_ServerActions]
    AdvisorActions[actions/advisor.js]
  end

  subgraph domain [DomainServices]
    AdvisorSvc[advisor-service.js]
    AuditLog[advisor-audit.js]
  end

  subgraph orchestration [LLM Orchestration]
    AryaEngine[wealth-advisor.js]
    BehavioralEngine[wealth-stats.js]
    RAG[product-rag.js]
    PII[pii-sanitizer.js]
    Sentiment[sentiment.js]
  end

  subgraph avatar [AvatarLayer]
    AvatarUI[advisor-avatar.jsx]
    VoiceIO[WebSpeech + TTS]
  end

  subgraph adapter [DataIntegration]
    SeedData[seed.js personas]
    IdbiAdapter[idbi-sandbox-adapter.js]
  end

  subgraph data [DataLayer]
    Postgres[(PostgreSQL)]
    Inngest[Inngest Jobs]
  end

  subgraph external [External]
    NVIDIA[NVIDIA NIM API]
    Resend[Resend Email]
  end

  subgraph planned [Production Planned]
    Redis[(Redis Sessions)]
    VectorDB[(Vector DB RAG)]
  end

  subgraph presentation [PresentationLayer]
    Widget[AryaWidget]
    AdvisorPage[AdvisorPage]
  end

  BankApp --> WebView
  BankApp --> gateway
  WebView --> gateway
  WebUI --> gateway
  Widget --> AdvisorActions
  AdvisorPage --> AdvisorActions
  AdvisorActions --> AdvisorSvc
  AdvisorSvc --> AuditLog
  gateway --> AdvisorSvc
  gateway --> AryaEngine
  AryaEngine --> RAG
  AryaEngine --> PII
  AryaEngine --> Sentiment
  AryaEngine --> BehavioralEngine
  AryaEngine --> NVIDIA
  AvatarUI --> AdvisorActions
  VoiceIO --> AvatarUI
  gateway --> SeedData
  SeedData -.-> IdbiAdapter
  IdbiAdapter -.-> Postgres
  AdvisorSvc --> Postgres
  gateway --> Postgres
  Inngest --> Postgres
  Inngest --> Resend
  AryaEngine -.-> Redis
  RAG -.-> VectorDB
```

## Data flow summary

1. User opens wealth module from bank app (SSO-authenticated session)
2. Frontend calls `/api/v1/wealth-summary` for unified financial snapshot
3. Insights and chat requests hit `wealth-advisor.js` orchestration layer
4. PII is stripped before prompts reach NVIDIA NIM
5. Approved products injected via lightweight RAG (`bank-products.json`)
6. Responses rendered in avatar chat UI (widget or full page) with action widgets and feedback
7. Chat sessions, audit events, and feedback stored in PostgreSQL for bank CRM traceability
8. Background jobs (Inngest) handle recurring transactions, budget alerts, monthly emails

## Current vs planned

| Component | Hackathon MVP | Production |
|-----------|---------------|------------|
| Session | Clerk auth + DB chat sessions | Bank SSO + Redis |
| Chat history | Per-session threads in PostgreSQL | CRM integration |
| Feedback | Thumbs + audit log | Model fine-tuning pipeline |
| Product RAG | JSON keyword match | Pinecone vector search |
| Nudges | In-app toasts | Push notifications |
| Database | PostgreSQL | PostgreSQL + read replicas |
