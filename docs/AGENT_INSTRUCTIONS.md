# ThinkFirst — AI Coding Agent Instructions & Architecture Guide

**Target Agents**: Codex, Claude, Antigravity, Gemini, and Autonomous Assistants  
**Project**: ThinkFirst (`realm-hack`)  
**Team**: Odysseus (Backend & Agentic Core)  
**Document Version**: 2.0.0  
**Effective Date**: October 2026  
**Git Remote**: `https://github.com/Srinanth/ThinkFirst.git`  
**Active Work Branch**: `dev/srinanth`  

---

## ⚡ 1. Cardinal Git & Operational Rules

### Rule 1: COMMIT ONLY AFTER SUCCESSFUL FEATURE COMPLETION
> **STRICT INSTRUCTION**: **Do NOT commit after every little code update or incremental edit.**  
> Only create a Git commit when a discrete feature from [`docs/FEATURE_TRACKER.md`](./FEATURE_TRACKER.md) is **fully completed, tested, and passes compilation** (`pnpm run lint` / `tsc --noEmit`).

#### Commit Protocol:
1. Complete the feature code.
2. Verify code builds cleanly with zero errors (`pnpm run lint`).
3. Update the corresponding docs in `docs/` and mark the feature `[x] Completed` in [`docs/FEATURE_TRACKER.md`](./FEATURE_TRACKER.md).
4. Stage and commit changes using Conventional Commits with the feature ID:
   ```bash
   git add .
   git commit -m "feat(subjects): implement teacher subject CRUD endpoints and membership middleware (BE-07)"
   ```
5. Push to the designated remote developer branch (`dev/srinanth`).

### Rule 2: TEAM BRANCHING WORKFLOW
The repository uses a disciplined team branching model:
- `main`: Locked production-ready code.
- `development`: Primary integration branch.
- Developer branches:
  - `dev/srinanth` — **Current working branch** (Backend, Database, Core APIs).
  - `dev/deepak` — Curriculum Agent & Notes Retrieval Agent.
  - `dev/rinz` — Frontend Web App (Next.js 15, Tailwind v4, shadcn/ui).
  - `dev/antony` — Quiz Agent & Evaluator Agent.
- All development by Srinanth must occur on **`dev/srinanth`**.

### Rule 3: ALWAYS KEEP DOCUMENTATION IN SYNC WITH CODE
Whenever code changes, **immediately update the corresponding documentation**:
- **Added or changed an API endpoint?** $\rightarrow$ Update [`docs/API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).
- **Added or modified database tables, columns, indexes, or RLS?** $\rightarrow$ Update [`docs/DATABASE.md`](./DATABASE.md) and [`docs/RLS_POLICIES.md`](./RLS_POLICIES.md).
- **Completed or progressed a feature?** $\rightarrow$ Update [`docs/FEATURE_TRACKER.md`](./FEATURE_TRACKER.md).
- **Architectural or pattern change?** $\rightarrow$ Update [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) or [`docs/ARCHITECTURE_DECISIONS.md`](./ARCHITECTURE_DECISIONS.md).

### Rule 4: RESPECT THE DETERMINISTIC BOUNDARY
> **"Agents reason over evidence; deterministic services maintain canonical learning state."**  
> AI Agents (Gemini/Mastra) are probabilistic evaluators. They **NEVER** directly assign grades or calculate final student mastery scores. Agents output structured **Evidence Tokens**; the **Deterministic Mastery Engine** calculates updates to `student_topic_mastery`.

---

## 2. Codebase Architecture & Modularity

The backend must follow a strict **Feature-Based Modular Monolith** architecture:

```
backend/
├── src/
│   ├── config/                        # Environment variables, database & AI clients
│   │   ├── env.ts                     # Zod-validated environment config
│   │   └── supabase.ts                # Supabase client singleton & admin client
│   │
│   ├── middlewares/                   # Global and route-level middlewares
│   │   ├── auth.middleware.ts         # Verifies Supabase Bearer JWT
│   │   ├── role.middleware.ts         # RBAC guard (requireRole(['teacher', 'admin']))
│   │   ├── membership.middleware.ts   # Multi-tenancy guard for teacher_subjects
│   │   ├── validation.middleware.ts   # Generic Zod validator (validateRequest)
│   │   └── errorHandler.middleware.ts # Global error boundary & response formatter
│   │
│   ├── utils/                         # Reusable utilities (DRY principle)
│   │   ├── response.util.ts           # Standard API envelopes (sendSuccess, sendError)
│   │   ├── errors.util.ts             # AppError class hierarchy (NotFound, BadRequest, etc.)
│   │   └── vector.util.ts             # Vector search RPC helper
│   │
│   ├── modules/                       # Domain-specific feature modules
│   │   ├── auth/                      # Profile & user hooks
│   │   ├── subjects/                  # Teacher subjects & memberships
│   │   ├── curriculum/                # Syllabus ingestion & curriculum_topics
│   │   ├── materials/                 # Learning materials & note_embeddings
│   │   ├── quizzes/                   # Quizzes, questions & attempts
│   │   ├── tutor/                     # Socratic chat sessions & SSE streaming
│   │   ├── mastery/                   # Deterministic Mastery Engine & student_topic_mastery
│   │   └── insights/                  # Teacher insights & diagnostics
│   │
│   ├── app.ts                         # Express app setup & middleware mounting
│   └── server.ts                      # Server bootstrap
│
├── db/                                # Supabase database scripts
│   ├── init.sql                       # 1-click database initialization script
│   └── README.md                      # Database setup instructions
│
├── package.json
└── tsconfig.json
```

---

## 3. Checklist for Feature Completion & Commit

When an AI agent (Codex/Antigravity) finishes a feature:

1. **Verify Code Compiles**:
   ```bash
   pnpm run lint
   ```
2. **Synchronize Docs**:
   - Check off feature in [`docs/FEATURE_TRACKER.md`](./FEATURE_TRACKER.md) (`[x] Completed`).
   - Update API contracts in [`docs/API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) if endpoints changed.
3. **Commit Code**:
   - Stage files: `git add .`
   - Commit: `git commit -m "feat(<module>): <description> (<FEATURE_ID>)"`
   - Push: `git push origin dev/srinanth`
