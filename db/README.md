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

## 📋 What `init.sql` Provisions

1. **Extensions**:
   - `pgvector` (Vector similarity search using `vector(768)`)
   - `uuid-ossp` and `pgcrypto` (Cryptographic UUID functions)

2. **14 Relational & Vector Tables**:
   - `profiles`: User profiles linked to `auth.users` with RBAC roles (`admin`, `teacher`, `student`).
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
   - `learning_sessions`: Student study/tutoring sessions.
   - `tutor_conversations`: Socratic chat threads scoped to subject and student.
   - `tutor_messages`: Individual conversation turns (`user`, `assistant`, `system`).
   - `teacher_insights`: Aggregated pedagogical signals and intervention recommendations.

3. **Performance & Vector Indexes**:
   - HNSW index on `note_embeddings.embedding` using `vector_cosine_ops` ($m=16$, $ef\_construction=64$).
   - Foreign key and query filter indexes on all frequently accessed relational paths.

4. **Security & Row-Level Security (RLS)**:
   - RLS enabled across all 14 tables.
   - Helper functions: `is_subject_teacher()`, `is_subject_member()`, `get_current_role()`, `is_admin()`.
   - Classroom/Subject-scoped vector similarity search procedure: `match_note_embeddings()`.

5. **Auth Trigger**:
   - `on_auth_user_created`: Automatically creates a `public.profiles` row whenever a user signs up via Supabase Auth.
