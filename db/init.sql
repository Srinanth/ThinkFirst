-- ============================================================================
-- ThinkFirst — Supabase Complete Database Initialization Script
-- Project: ThinkFirst | Team Odysseus | RealmHack 2026
-- Description: Run this script directly in the Supabase SQL Editor to provision
--              all extensions, tables, foreign keys, indexes, and RLS policies.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- 2. TABLE CREATION
-- ============================================================================

-- Table 1: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: teacher_subjects
CREATE TABLE IF NOT EXISTS public.teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title TEXT NULL,
  subject TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  class_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_teacher_subject_offering UNIQUE (teacher_id, subject, academic_year, class_name)
);

-- Table 3: memberships
CREATE TABLE IF NOT EXISTS public.memberships (
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (teacher_subject_id, student_id)
);

-- Table 4: curriculum_topics
CREATE TABLE IF NOT EXISTS public.curriculum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_subject_id UUID REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  parent_topic_id UUID REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('module', 'topic', 'subtopic')),
  description TEXT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 5: learning_materials
CREATE TABLE IF NOT EXISTS public.learning_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  curriculum_topic_id UUID REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  material_type TEXT NULL,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'ready', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 6: note_embeddings
CREATE TABLE IF NOT EXISTS public.note_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_material_id UUID NOT NULL REFERENCES public.learning_materials(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(768) NOT NULL,
  metadata JSONB NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 7: quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  curriculum_topic_id UUID REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 8: quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  curriculum_topic_id UUID REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false', 'short_answer', 'reasoning_step')),
  options JSONB NULL,
  correct_answer JSONB NOT NULL,
  explanation TEXT NULL,
  difficulty TEXT NOT NULL,
  marks NUMERIC NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 9: quiz_attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score NUMERIC NULL,
  max_score NUMERIC NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ NULL,
  graded_at TIMESTAMPTZ NULL
);

-- Table 10: quiz_responses
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  student_answer JSONB NOT NULL,
  is_correct BOOLEAN NULL,
  marks_awarded NUMERIC NULL,
  feedback TEXT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 11: student_topic_mastery
CREATE TABLE IF NOT EXISTS public.student_topic_mastery (
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  curriculum_topic_id UUID NOT NULL REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
  mastery_score NUMERIC NOT NULL CHECK (mastery_score >= 0 AND mastery_score <= 1),
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  last_assessed_at TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, teacher_subject_id, curriculum_topic_id)
);

-- Table 12: learning_sessions
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('ai_tutor', 'revision', 'practice'))
);

-- Table 13: tutor_conversations
CREATE TABLE IF NOT EXISTS public.tutor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  learning_session_id UUID REFERENCES public.learning_sessions(id) ON DELETE SET NULL,
  title TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 14: tutor_messages
CREATE TABLE IF NOT EXISTS public.tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.tutor_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  curriculum_topic_id UUID REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 15: teacher_insights
CREATE TABLE IF NOT EXISTS public.teacher_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_subject_id UUID NOT NULL REFERENCES public.teacher_subjects(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('struggling_topic', 'student_needs_support', 'class_progress')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  curriculum_topic_id UUID REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  evidence JSONB NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. PERFORMANCE INDEXES
-- ============================================================================

-- Vector similarity index (HNSW with Cosine distance)
CREATE INDEX IF NOT EXISTS idx_note_embeddings_vector 
ON public.note_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Foreign Key & Filter Indexes
CREATE INDEX IF NOT EXISTS idx_memberships_student ON public.memberships(student_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_topics_subject ON public.curriculum_topics(teacher_subject_id, parent_topic_id);
CREATE INDEX IF NOT EXISTS idx_learning_materials_subject ON public.learning_materials(teacher_subject_id);
CREATE INDEX IF NOT EXISTS idx_note_embeddings_material ON public.note_embeddings(learning_material_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON public.quizzes(teacher_subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_student ON public.quiz_attempts(quiz_id, student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_attempt ON public.quiz_responses(quiz_attempt_id);
CREATE INDEX IF NOT EXISTS idx_tutor_conv_student_subject ON public.tutor_conversations(student_id, teacher_subject_id);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_conversation ON public.tutor_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_teacher_insights_subject ON public.teacher_insights(teacher_subject_id, status);

-- ============================================================================
-- 4. ROW-LEVEL SECURITY HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_subject_teacher(sub_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_subjects 
    WHERE id = sub_id AND teacher_id = auth.uid()
  ) OR public.is_admin();
$$;

CREATE OR REPLACE FUNCTION public.is_subject_member(sub_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE teacher_subject_id = sub_id AND student_id = auth.uid()
  ) OR public.is_subject_teacher(sub_id);
$$;

-- Vector search stored procedure helper (Classroom-scoped)
CREATE OR REPLACE FUNCTION match_note_embeddings(
  p_teacher_subject_id UUID,
  p_query_embedding VECTOR(768),
  p_match_threshold NUMERIC,
  p_match_count INT
)
RETURNS TABLE (
  id UUID,
  learning_material_id UUID,
  chunk_index INT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT 
    ne.id,
    ne.learning_material_id,
    ne.chunk_index,
    ne.content,
    1 - (ne.embedding <=> p_query_embedding) AS similarity
  FROM public.note_embeddings ne
  JOIN public.learning_materials lm ON lm.id = ne.learning_material_id
  WHERE lm.teacher_subject_id = p_teacher_subject_id
    AND (1 - (ne.embedding <=> p_query_embedding)) > p_match_threshold
  ORDER BY ne.embedding <=> p_query_embedding
  LIMIT p_match_count;
$$;

-- ============================================================================
-- 5. ENABLE ROW-LEVEL SECURITY (RLS) & POLICIES
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
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_insights ENABLE ROW LEVEL SECURITY;

-- 5.1 profiles policies
CREATE POLICY "Profiles readable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- 5.2 teacher_subjects policies
CREATE POLICY "Teacher subjects viewable by assigned teacher, members, or admin"
ON public.teacher_subjects FOR SELECT TO authenticated
USING (teacher_id = auth.uid() OR public.is_subject_member(id) OR public.is_admin());

CREATE POLICY "Teachers can create subjects"
ON public.teacher_subjects FOR INSERT TO authenticated
WITH CHECK (teacher_id = auth.uid() AND public.get_current_role() IN ('teacher', 'admin'));

CREATE POLICY "Teachers can update their own subjects"
ON public.teacher_subjects FOR UPDATE TO authenticated
USING (teacher_id = auth.uid() OR public.is_admin())
WITH CHECK (teacher_id = auth.uid() OR public.is_admin());

-- 5.3 memberships policies
CREATE POLICY "Memberships viewable by subject members"
ON public.memberships FOR SELECT TO authenticated
USING (public.is_subject_member(teacher_subject_id));

CREATE POLICY "Students can self-enroll into subjects"
ON public.memberships FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can remove students from their subjects"
ON public.memberships FOR DELETE TO authenticated
USING (public.is_subject_teacher(teacher_subject_id));

-- 5.4 curriculum_topics policies
CREATE POLICY "Curriculum topics viewable by subject members"
ON public.curriculum_topics FOR SELECT TO authenticated
USING (public.is_subject_member(teacher_subject_id));

CREATE POLICY "Teachers can manage curriculum topics"
ON public.curriculum_topics FOR ALL TO authenticated
USING (public.is_subject_teacher(teacher_subject_id))
WITH CHECK (public.is_subject_teacher(teacher_subject_id));

-- 5.5 learning_materials policies
CREATE POLICY "Learning materials viewable by subject members"
ON public.learning_materials FOR SELECT TO authenticated
USING (public.is_subject_member(teacher_subject_id));

CREATE POLICY "Teachers can manage learning materials"
ON public.learning_materials FOR ALL TO authenticated
USING (public.is_subject_teacher(teacher_subject_id))
WITH CHECK (public.is_subject_teacher(teacher_subject_id));

-- 5.6 note_embeddings policies
CREATE POLICY "Embeddings viewable by subject members via material"
ON public.note_embeddings FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.learning_materials lm
    WHERE lm.id = note_embeddings.learning_material_id
      AND public.is_subject_member(lm.teacher_subject_id)
  )
);

CREATE POLICY "Teachers can insert/manage embeddings"
ON public.note_embeddings FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.learning_materials lm
    WHERE lm.id = note_embeddings.learning_material_id
      AND public.is_subject_teacher(lm.teacher_subject_id)
  )
);

-- 5.7 quizzes policies
CREATE POLICY "Quizzes readable by subject members"
ON public.quizzes FOR SELECT TO authenticated
USING (
  public.is_subject_teacher(teacher_subject_id) 
  OR (public.is_subject_member(teacher_subject_id) AND status = 'published')
);

CREATE POLICY "Teachers can manage quizzes"
ON public.quizzes FOR ALL TO authenticated
USING (public.is_subject_teacher(teacher_subject_id))
WITH CHECK (public.is_subject_teacher(teacher_subject_id));

-- 5.8 quiz_questions policies
CREATE POLICY "Quiz questions readable if quiz is accessible"
ON public.quiz_questions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id
      AND (public.is_subject_teacher(q.teacher_subject_id) OR (public.is_subject_member(q.teacher_subject_id) AND q.status = 'published'))
  )
);

CREATE POLICY "Teachers can manage quiz questions"
ON public.quiz_questions FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id AND public.is_subject_teacher(q.teacher_subject_id)
  )
);

-- 5.9 quiz_attempts policies
CREATE POLICY "Students see own attempts; Teachers see class attempts"
ON public.quiz_attempts FOR SELECT TO authenticated
USING (
  student_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_attempts.quiz_id AND public.is_subject_teacher(q.teacher_subject_id)
  )
);

CREATE POLICY "Students can start quiz attempts"
ON public.quiz_attempts FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students or teachers can update attempts"
ON public.quiz_attempts FOR UPDATE TO authenticated
USING (
  student_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_attempts.quiz_id AND public.is_subject_teacher(q.teacher_subject_id)
  )
);

-- 5.10 quiz_responses policies
CREATE POLICY "Students see own responses; Teachers see subject responses"
ON public.quiz_responses FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts qa
    WHERE qa.id = quiz_responses.quiz_attempt_id AND (qa.student_id = auth.uid() OR public.is_subject_teacher((SELECT q.teacher_subject_id FROM public.quizzes q WHERE q.id = qa.quiz_id)))
  )
);

CREATE POLICY "Students can submit quiz responses"
ON public.quiz_responses FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts qa
    WHERE qa.id = quiz_responses.quiz_attempt_id AND qa.student_id = auth.uid()
  )
);

-- 5.11 student_topic_mastery policies
CREATE POLICY "Mastery visible to student or subject teacher"
ON public.student_topic_mastery FOR SELECT TO authenticated
USING (student_id = auth.uid() OR public.is_subject_teacher(teacher_subject_id));

CREATE POLICY "Subject teacher or backend service can update mastery"
ON public.student_topic_mastery FOR ALL TO authenticated
USING (public.is_subject_teacher(teacher_subject_id))
WITH CHECK (public.is_subject_teacher(teacher_subject_id));

-- 5.12 learning_sessions & tutor_conversations & tutor_messages policies
CREATE POLICY "Students manage own learning sessions"
ON public.learning_sessions FOR ALL TO authenticated
USING (student_id = auth.uid() OR public.is_subject_teacher(teacher_subject_id))
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students access own conversations; Teachers can audit"
ON public.tutor_conversations FOR SELECT TO authenticated
USING (student_id = auth.uid() OR public.is_subject_teacher(teacher_subject_id));

CREATE POLICY "Students can create conversations"
ON public.tutor_conversations FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid() AND public.is_subject_member(teacher_subject_id));

CREATE POLICY "Messages readable by conversation owner or teacher"
ON public.tutor_messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tutor_conversations tc
    WHERE tc.id = tutor_messages.conversation_id 
      AND (tc.student_id = auth.uid() OR public.is_subject_teacher(tc.teacher_subject_id))
  )
);

CREATE POLICY "Users can post to their conversations"
ON public.tutor_messages FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tutor_conversations tc
    WHERE tc.id = tutor_messages.conversation_id AND tc.student_id = auth.uid()
  )
);

-- 5.13 teacher_insights policies
CREATE POLICY "Insights visible to subject teacher"
ON public.teacher_insights FOR SELECT TO authenticated
USING (public.is_subject_teacher(teacher_subject_id));

CREATE POLICY "Teachers can update insight status"
ON public.teacher_insights FOR UPDATE TO authenticated
USING (public.is_subject_teacher(teacher_subject_id))
WITH CHECK (public.is_subject_teacher(teacher_subject_id));

-- ============================================================================
-- 6. AUTOMATED PROFILE SYNC TRIGGER (ON AUTH SIGNUP)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'ThinkFirst User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on every Supabase Auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
