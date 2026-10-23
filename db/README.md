# ThinkFirst — Database Initialization & Migration Guide

This directory contains the database definition and initialization scripts for ThinkFirst on Supabase PostgreSQL.

---

## 🚀 Quick Setup in Supabase (1-Step Initialization)

1. Open your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. In the left navigation bar, open the **SQL Editor**.
3. Create a **New query**.
4. Copy and paste the entire contents of [`db/init.sql`](./init.sql).
5. Click **Run** (or `Ctrl+Enter`).

---

## 👑 4-Tier Role Hierarchy & Multi-Tenancy

ThinkFirst implements an institutional multi-tenant hierarchy:
```
           ┌─────────────────────────────┐
           │      Superadmin (Us)        │
           │ Creates Colleges & Admins   │
           └──────────────┬──────────────┘
                          │
                          ▼
           ┌─────────────────────────────┐
           │        College Admin        │
           │ Adds Teachers & Students to │
           │ their College               │
           └──────────────┬──────────────┘
                          │
                          ▼
           ┌─────────────────────────────┐
           │           Teacher           │
           │ Creates Classes/Subjects,   │
           │ Enrolls College Students    │
           └──────────────┬──────────────┘
                          │
                          ▼
           ┌─────────────────────────────┐
           │           Student           │
           │ Learns with Socratic Tutor, │
           │ Takes Diagnostic Quizzes    │
           └─────────────────────────────┘
```

1. **Superadmin (`superadmin`)**: Platform owners who provision institutions (`colleges`) and assign College Admins.
2. **College Admin (`admin`)**: Institutional administrators who add and manage teachers and students within their college.
3. **Teacher (`teacher`)**: Educators who create subjects (`teacher_subjects`) and enroll students from their college into classes (`memberships`).
4. **Student (`student`)**: Learners who access assigned subjects, engage with the grounded Socratic AI Tutor, and track mastery.

---

## 📋 What `init.sql` Provisions

1. **Extensions**:
   - `pgvector` (Vector similarity search using `vector(768)`)
   - `uuid-ossp` and `pgcrypto` (Cryptographic UUID functions)

2. **15 Canonical PostgreSQL Tables**:
   - `profiles`: User profiles linked to `auth.users`, with roles (`admin`, `teacher`, `student`).
   - `teacher_subjects`: Subject cohorts created by teachers (e.g. "Physics 101 - 2026").
   - `memberships`: Student enrollment in teacher subjects.
   - `curriculum_topics`: Hierarchical syllabus tree (`module`, `topic`, `subtopic`).
   - `learning_materials`: Metadata for teacher handouts and PDFs stored in Supabase Storage.
   - `note_embeddings`: 768-dimensional vector chunks for Gemini Embedding 2 with HNSW index.
   - `quizzes`: Subject quizzes created by teachers or Quiz Agent.
   - `quiz_questions`: Individual questions with choices, correct answers, and rubrics.
   - `quiz_attempts`: Student quiz test sessions.
   - `quiz_responses`: Granular student answer logs and evaluation feedback.
   - `student_topic_mastery`: Deterministic mastery scores ($0.0 \rightarrow 1.0$) and confidence values.
   - `student_mastery_history`: Historical audit trail of student mastery evaluations over time.
   - `tutor_conversations`: Socratic chat threads scoped to subject and student.
   - `tutor_messages`: Individual conversation turns (`user`, `assistant`, `system`).
   - `teacher_insights`: Aggregated pedagogical signals and intervention recommendations.

3. **Performance & Vector Indexes**:
   - HNSW index on `note_embeddings.embedding` using `vector_cosine_ops` ($m=16$, $ef\_construction=64$).
   - Multi-tenant foreign key indexes on `profiles(college_id)` and all relational child tables.

4. **Security & Row-Level Security (RLS)**:
   - RLS enabled across all 15 tables.
   - Helper functions: `is_superadmin()`, `is_college_admin()`, `is_subject_teacher()`, `is_subject_member()`, `get_current_role()`, `get_user_college_id()`.
   - Subject-scoped vector similarity search procedure: `match_note_embeddings()`.

5. **Auth Trigger**:
   - `on_auth_user_created`: Automatically creates a `public.profiles` row with `college_id` whenever a user signs up.
