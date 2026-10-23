# ThinkFirst — Product Requirements Document (PRD)

**Project Name**: ThinkFirst  
**Team**: Odysseus (Srinanth M V, Rinz Loji, Deepak J Mathew, Antonyamal Varghese)  
**Track**: Agentic AI · RealmHack 2026  
**Document Version**: 1.0.0  
**Status**: Approved / In Development  

---

## 1. Executive Summary

Current generative AI chatbots act as answer dispensaries: students query them for homework solutions, copy-paste answers, and bypass the cognitive strain necessary for deep conceptual retention. This results in **"hollow learning"**—where student test grades appear acceptable or artificially inflated, yet foundational critical thinking collapses. Concurrently, teachers suffer from an **educator blind spot**: they lack real-time telemetry into student misunderstandings until post-exam failure occurs.

**ThinkFirst** resolves this dilemma with an **Agentic AI & Deterministic Learning Platform**. ThinkFirst replaces answer-dispensing chatbots with an **AI Socratic Tutor** strictly grounded in teacher-provided syllabus and notes via classroom-scoped `pgvector` RAG. Crucially, ThinkFirst bifurcates AI reasoning from learning state: **Mastra AI agents evaluate student dialogue and quizzes into structured evidence**, while a **Deterministic Mastery Engine** updates canonical student knowledge snapshots. This eliminates educator blind spots through a real-time **Teacher Analytics Dashboard**.

---

## 2. Problem Statement & Market Gap

1. **Overreliance on Generative AI**: Students use chatbots as shortcuts to acquire direct answers without internalizing problem-solving logic.
2. **Hollow Learning**: Superficial completion of tasks creates an illusion of competence while critical thinking and subject mastery decline.
3. **One-Size-Fits-All Chatbots**: Off-the-shelf LLMs have no awareness of a student's prior mastery state, curriculum pacing, or syllabus boundaries.
4. **Educator Blind Spot**: Teachers cannot observe where comprehension breaks down during individual study; help consistently arrives too late.
5. **The Structural Gap**: No production system combines **strict Socratic guidance**, **syllabus-grounded vector RAG**, **deterministic mastery verification**, and **real-time teacher diagnostic telemetry**.

---

## 3. Product Vision & Core Objectives

### 3.1 Core Objectives
- **Promote Active Learning**: Eliminate answer-copying by enforcing step-by-step Socratic reasoning that prompts the student to think before revealing insights.
- **Eliminate Educator Blind Spots**: Surface immediate, granular signals to teachers when comprehension breaks down in specific topics.
- **Ensure Syllabus Grounding**: Constrain all AI responses, quizzes, and tutoring strictly to teacher-uploaded materials via classroom-scoped `pgvector` RAG.
- **Maintain Deterministic Learning State**: Enforce the fundamental law: **"Agents reason over evidence; deterministic services maintain canonical learning state."**

---

## 4. Target Personas & User Journeys

```
                    ┌─────────────────────────┐
                    │     Platform Owner      │
                    │      (Superadmin)       │
                    │   Creates Colleges &    │
                    │  Assigns College Admins │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      College Admin      │
                    │ Adds Teachers & Students│
                    │   to their College      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │         Teacher         │
                    │ Creates Classes/Subjects│
                    │ Enrolls College Students│
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │         Student         │
                    │ Takes Adaptive Quizzes, │
                    │ Socratic Tutor Chat     │
                    └─────────────────────────┘
```

### 4.1 Persona 1: Platform Superadmin (Us)
- **Profile**: ThinkFirst platform administrators and founders.
- **Responsibilities**: Provisions institutional accounts (`colleges`), configures global LLM & vector quotas, and onboards College Admins.

### 4.2 Persona 2: College Administrator (Admin)
- **Profile**: Dean, academic director, or department head managing an institution or campus.
- **Responsibilities**: Manages faculty roster, provisions teachers and students belonging to the college, and oversees college-wide performance metrics.

### 4.3 Persona 3: The Educator (Teacher)
- **Profile**: Instructor managing classes and subject offerings.
- **Journey**: Creates subject cohorts (`teacher_subjects`), adds enrolled students from the college, ingests syllabus and lecture notes, and monitors real-time learning gap analytics.

### 4.4 Persona 4: The Learner (Student)
- **Profile**: College student engaged in active coursework.
- **Journey**: Logs into student dashboard, studies topics with the Socratic AI Tutor, takes diagnostic adaptive quizzes, and develops verifiable conceptual mastery without shortcut answer copy-pasting.

---

## 5. Functional Requirements

### 5.1 Authentication & Role-Based Access Control (RBAC)
- **Supabase Auth**: Secure email/password and OAuth authentication.
- **Roles**: `student`, `teacher`, `admin`.
- **Classroom Multi-Tenancy**: All student interactions, notes, embeddings, quizzes, and analytics must be isolated per `classroom_id`.

### 5.2 Teacher Content Ingestion & Curriculum Structuring
- **Syllabus Parsing**: Accepts course syllabus in PDF, TXT, or Markdown format.
- **Curriculum Agent**: Extracts a hierarchical curriculum tree (Units $\rightarrow$ Topics $\rightarrow$ Learning Objectives $\rightarrow$ Prerequisites).
- **Teacher Notes Management**: Upload and storage of teacher notes and slides.
- **Notes & Retrieval Agent**: Splits teacher notes into semantically coherent chunks, computes embeddings via Gemini Embedding 2, and indexes them in `pgvector` with classroom metadata.

### 5.3 Socratic AI Tutor ("Talk to Teacher")
- **Refusal to Answer Directly**: The tutor MUST NOT output final solutions, full essays, or direct answers to homework problems.
- **Grounded Reasoning**: Uses similarity search against the classroom's vector database to ensure responses match the teacher's designated curriculum.
- **Adaptive Scaffolding**: Adjusts questioning difficulty based on the student's current JSONB Knowledge Snapshot.
- **Streaming Response**: Real-time token streaming using Server-Sent Events (SSE).

### 5.4 Diagnostic & Personalized Quizzes
- **Quiz Agent**: Dynamically generates multi-format questions (Multiple Choice, Short Concept Explanation, Step-by-Step Reasoning) targeted at a student's unmastered learning objectives.
- **Evaluator Agent**: Evaluates student responses, parses reasoning traces, and extracts structured evidence tokens (`mastery_signal`, `misconception_tag`, `confidence_level`).

### 5.5 Deterministic Mastery Engine
- **Canonical Learning State**: Persisted as a `JSONB` document per student per classroom (`student_knowledge_snapshots`).
- **Deterministic Math**: Evaluator Agent yields evidence; the Mastery Engine deterministically updates node scores using a mathematically sound weighted progression model (e.g., exponential moving average with decay on failed concepts).
- **Auditability**: Every mastery modification links directly to an immutable `learning_evidence` event ID.

### 5.6 Teacher Analytics & Insight Generation
- **Insight Agent**: Aggregates classroom-wide knowledge snapshots to extract:
  - Top 3 hardest concepts for the class.
  - Active misconceptions and recurring reasoning fallacies.
  - Distribution of students across mastery quartiles (Novice, Developing, Proficient, Master).
  - Recommended teaching adjustments for the upcoming lecture.

---

## 6. Non-Functional Requirements (NFRs)

| Category | Requirement | Target Metric |
|---|---|---|
| **Latency** | Socratic Tutor first token latency | $< 1200\text{ ms}$ |
| **Latency** | Quiz generation latency | $< 3500\text{ ms}$ |
| **Security** | Multi-tenant classroom isolation | 100% enforced via Supabase Row-Level Security (RLS) & API middleware |
| **Accuracy** | Syllabus Grounding & Anti-Hallucination | $> 95\%$ grounded citations in teacher notes; zero direct answer leaks |
| **Modularity** | Code Architecture | Feature-based modular structure; separation of agents, controllers, services, middlewares |
| **Scalability** | Concurrent classroom queries | Horizontal stateless Node.js / Express scaling; pgvector HNSW indexing |

---

## 7. Success Metrics & KPIs

1. **Active Engagement Rate**: Ratio of student reasoning steps taken per question vs. direct answers requested.
2. **Mastery Progression**: Measurable delta in topic mastery scores over repeated quiz and tutor cycles.
3. **Educator Intervention Time**: Hours saved by teachers using the automated analytics dashboard to prepare targeted reviews.
4. **Leakage Rate (Cheating Prevention)**: Zero successful direct answer prompts during Socratic tutor evaluation benchmark.
