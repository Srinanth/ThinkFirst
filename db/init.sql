-- ============================================================================
-- ThinkFirst — Supabase Canonical Database Initialization Script
-- Project: ThinkFirst | Team Odysseus | RealmHack 2026
-- Source of Truth: Canonical Supabase Database (Project: qbazezxihrczscigtqel)
-- Last Synced: October 2026 (All 15 Canonical Tables Synced)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- 2. CANONICAL TABLE DEFINITIONS (Synced with Supabase Live Schema)
-- ============================================================================

-- 1. Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  college TEXT NULL,
  role TEXT NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'teacher'::text, 'student'::text])),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  password CHARACTER VARYING NULL DEFAULT 'NULL'::character varying
);

-- 2. Table: teacher_subjects
CREATE TABLE IF NOT EXISTS public.teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  subject TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  class_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_teacher_subject_offering UNIQUE (teacher_id, subject, academic_year, class_name)
);

-- 3. Table: memberships
CREATE TABLE IF NOT EXISTS public.memberships (
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (teacher_subject_id, student_id)
);

-- 4. Table: curriculum_topics
CREATE TABLE IF NOT EXISTS public.curriculum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  parent_topic_id UUID NULL REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  node_type TEXT NOT NULL DEFAULT 'topic'::text CHECK (node_type = ANY (ARRAY['module'::text, 'topic'::text, 'subtopic'::text]))
);

-- 5. Table: learning_materials
CREATE TABLE IF NOT EXISTS public.learning_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  curriculum_topic_id UUID NULL REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  material_type TEXT NULL,
  processing_status TEXT NOT NULL DEFAULT 'pending'::text CHECK (processing_status = ANY (ARRAY['pending'::text, 'processing'::text, 'ready'::text, 'failed'::text])),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Table: note_embeddings
CREATE TABLE IF NOT EXISTS public.note_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_material_id UUID NOT NULL REFERENCES public.learning_materials(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
  content TEXT NOT NULL,
  embedding VECTOR(768) NOT NULL,
  metadata JSONB NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_note_embeddings_material_chunk UNIQUE (learning_material_id, chunk_index)
);

-- 7. Table: quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  curriculum_topic_id UUID NULL REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
  question_count INTEGER NOT NULL DEFAULT 0,
  exam_duration INTEGER NOT NULL DEFAULT 30 CHECK (exam_duration > 0),
  status TEXT NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Table: quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  curriculum_topic_id UUID NULL REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type = ANY (ARRAY['multiple_choice'::text, 'short_answer'::text, 'long_answer'::text])),
  options JSONB NULL,
  correct_answer JSONB NOT NULL,
  explanation TEXT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
  marks NUMERIC NOT NULL DEFAULT 1 CHECK (marks > (0)::numeric),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_quiz_question_position UNIQUE (quiz_id, "position")
);

-- 9. Table: quiz_attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score NUMERIC NULL CHECK (score IS NULL OR score >= (0)::numeric),
  max_score NUMERIC NULL CHECK (max_score IS NULL OR max_score >= (0)::numeric),
  status TEXT NOT NULL DEFAULT 'in_progress'::text CHECK (status = ANY (ARRAY['in_progress'::text, 'submitted'::text, 'graded'::text])),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ NULL,
  graded_at TIMESTAMPTZ NULL,
  CONSTRAINT chk_attempt_score_max CHECK (score IS NULL OR max_score IS NULL OR score <= max_score),
  CONSTRAINT uq_quiz_attempt_student UNIQUE (quiz_id, student_id)
);

-- 10. Table: quiz_responses
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  student_answer JSONB NOT NULL,
  is_correct BOOLEAN NULL,
  marks_awarded NUMERIC NULL CHECK (marks_awarded IS NULL OR marks_awarded >= (0)::numeric),
  feedback TEXT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_attempt_question UNIQUE (quiz_attempt_id, question_id)
);

-- 11. Table: student_topic_mastery
CREATE TABLE IF NOT EXISTS public.student_topic_mastery (
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  curriculum_topic_id UUID NOT NULL REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
  mastery_score NUMERIC NOT NULL CHECK (mastery_score >= (0)::numeric AND mastery_score <= (1)::numeric),
  confidence NUMERIC NOT NULL CHECK (confidence >= (0)::numeric AND confidence <= (1)::numeric),
  last_assessed_at TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, teacher_subject_id, curriculum_topic_id)
);

-- 12. Table: student_mastery_history
CREATE TABLE IF NOT EXISTS public.student_mastery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  curriculum_topic_id UUID NOT NULL REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
  mastery_score NUMERIC NOT NULL CHECK (mastery_score >= (0)::numeric AND mastery_score <= (1)::numeric),
  confidence NUMERIC NOT NULL CHECK (confidence >= (0)::numeric AND confidence <= (1)::numeric),
  assessment_source TEXT NOT NULL CHECK (assessment_source = ANY (ARRAY['quiz'::text, 'ai_tutor'::text])),
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_quiz_id UUID NULL REFERENCES public.quizzes(id) ON DELETE SET NULL
);

-- 13. Table: tutor_conversations
CREATE TABLE IF NOT EXISTS public.tutor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  title TEXT NULL,
  session_type TEXT NOT NULL CHECK (session_type = ANY (ARRAY['ai_tutor'::text, 'revision'::text, 'practice'::text])),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Table: tutor_messages
CREATE TABLE IF NOT EXISTS public.tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.tutor_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content TEXT NOT NULL CHECK (length(TRIM(BOTH FROM content)) > 0),
  curriculum_topic_id UUID NULL REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Table: teacher_insights
CREATE TABLE IF NOT EXISTS public.teacher_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type = ANY (ARRAY['weak_areas'::text, 'strong_areas'::text, 'summary'::text])),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  curriculum_topic_id UUID NULL REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  student_id UUID NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evidence JSONB NULL,
  status TEXT NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'dismissed'::text, 'resolved'::text])),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_mastery_history_student_topic 
ON public.student_mastery_history USING btree (student_id, curriculum_topic_id, assessed_at);

CREATE INDEX IF NOT EXISTS idx_tutor_messages_conversation 
ON public.tutor_messages USING btree (conversation_id, created_at);

-- Vector similarity index (HNSW with Cosine distance)
CREATE INDEX IF NOT EXISTS idx_note_embeddings_vector 
ON public.note_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- 4. ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mastery_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_insights ENABLE ROW LEVEL SECURITY;
