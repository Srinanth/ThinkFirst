# ThinkFirst — Agent Entrypoint & Quick Reference

Welcome, AI Coding Agent (Codex, Antigravity, Claude, etc.)!  
This file provides immediate operational rules and reference links for the **ThinkFirst** backend codebase.

---

## ⚡ 4 Immutable Operational Laws

1. **COMMIT ONLY AFTER SUCCESSFUL FEATURE COMPLETION**:
   - Do NOT commit for every small micro-edit or unfinished work.
   - Only commit when a full feature from [`docs/FEATURE_TRACKER.md`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/docs/FEATURE_TRACKER.md) is completed, passes `pnpm run lint` (zero TypeScript errors), and has updated documentation.
   - Work on the active branch: **`dev/deepak`**.
2. **ALWAYS UPDATE DOCS WHEN CODE CHANGES**:
   - Any time you add/modify an endpoint, database table, feature, or pattern, you **MUST immediately update the matching doc in `docs/`**.
3. **DETERMINISTIC STATE LAW**:
   - *"Agents reason over evidence; deterministic services maintain canonical learning state."*
   - AI Agents extract structured evidence tokens; the Deterministic Mastery Engine calculates student mastery scores in `student_topic_mastery`. Never let an LLM directly set or modify student grades.
4. **MODULAR MONOLITH STANDARD**:
   - Follow `src/modules/<feature-name>/` with dedicated routes, controller, service, schemas, and types. Use middlewares and utils for repeated logic.

---

## 🌿 Team Git Branch Structure

- **Remote**: `https://github.com/Srinanth/ThinkFirst.git`
- `main`: Production-ready locked releases.
- `development`: Primary integration branch.
- `dev/srinanth`: Backend & Database.
- `dev/deepak`: **Current active working branch** (Curriculum Agent & Notes Retrieval Agent).
- `dev/rinz`: Next.js Frontend & UI.
- `dev/antony`: Quiz Agent & Evaluator Agent.

---

## 📚 Complete Project Documentation Suite

| Document | Path | Purpose |
|---|---|---|
| **Product Requirements Document** | [`docs/PRD.md`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/docs/PRD.md) | Problem statement, user personas, functional & non-functional requirements, KPIs |
| **System Architecture** | [`docs/ARCHITECTURE.md`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/docs/ARCHITECTURE.md) | Multi-layered architecture, Mastra agent workflows, sequence diagrams, system boundaries |
| **Architectural Decisions (ADR)** | [`docs/ARCHITECTURE_DECISIONS.md`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/docs/ARCHITECTURE_DECISIONS.md) | Rationale for pgvector, Gemini 3.8 Flash, deterministic mastery boundary |
| **Database Architecture** | [`docs/DATABASE.md`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/docs/DATABASE.md) | 14 PostgreSQL tables, pgvector HNSW indexing, table dictionaries, data structures |
| **Row-Level Security (RLS)** | [`docs/RLS_POLICIES.md`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/docs/RLS_POLICIES.md) | Supabase multi-tenant isolation, RBAC policies, and SQL security helper functions |
| **REST API Documentation** | [`docs/API_DOCUMENTATION.md`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/docs/API_DOCUMENTATION.md) | All endpoints, request/response JSON contracts, middlewares, and error formats |
| **Feature Tracker** | [`docs/FEATURE_TRACKER.md`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/docs/FEATURE_TRACKER.md) | Progress matrix, completion status, task assignments, and post-hackathon roadmap |
| **Detailed Agent Instructions** | [`docs/AGENT_INSTRUCTIONS.md`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/docs/AGENT_INSTRUCTIONS.md) | Step-by-step developer guidelines, modular design rules, commit instructions |
