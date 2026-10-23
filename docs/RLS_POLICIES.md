# ThinkFirst — Supabase Row-Level Security (RLS) & RBAC Policies

**Project**: ThinkFirst  
**Team**: Odysseus  
**Track**: Agentic AI · RealmHack 2026  
**Document Version**: 2.0.0  
**SQL Provisioning**: Included directly in [`db/init.sql`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/db/init.sql)  

---

## 1. Multi-Tenant Subject Security Model

ThinkFirst enforces complete multi-tenancy at the database layer using PostgreSQL Row-Level Security (RLS). Every operation is authorized using the user's authenticated Supabase identity (`auth.uid()`) and verified against their role in `public.profiles` and their enrollment in `public.teacher_subjects` / `public.memberships`.

---

## 2. PostgreSQL Helper Security Functions

```sql
-- 1. Get current authenticated user's platform role
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Check if current user is platform Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- 3. Check if user is the assigned instructor of a subject offering
CREATE OR REPLACE FUNCTION public.is_subject_teacher(sub_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_subjects 
    WHERE id = sub_id AND teacher_id = auth.uid()
  ) OR public.is_admin();
$$;

-- 4. Check if user is an enrolled member (student or teacher) of a subject offering
CREATE OR REPLACE FUNCTION public.is_subject_member(sub_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE teacher_subject_id = sub_id AND student_id = auth.uid()
  ) OR public.is_subject_teacher(sub_id);
$$;
```

---

## 3. RLS Policies by Table

### 3.1 `profiles`
- **SELECT**: Accessible by all authenticated users (to display instructor and student names).
- **UPDATE**: Users can update their own row, but cannot change their `role`.

### 3.2 `teacher_subjects`
- **SELECT**: Visible to the instructor (`teacher_id = auth.uid()`), enrolled students (`public.is_subject_member(id)`), or platform admins.
- **INSERT**: Permitted for teachers and admins only (`teacher_id = auth.uid()`).
- **UPDATE/DELETE**: Permitted only for the subject's teacher or admin.

### 3.3 `memberships`
- **SELECT**: Visible to all members of the subject.
- **INSERT**: Students can enroll themselves (`student_id = auth.uid()`).
- **DELETE**: Teachers can remove students from their subjects.

### 3.4 `curriculum_topics`
- **SELECT**: Accessible to all enrolled subject members.
- **ALL**: Manageable by the subject teacher or admin.

### 3.5 `learning_materials`
- **SELECT**: Accessible to all enrolled subject members.
- **ALL**: Manageable by the subject teacher or admin.

### 3.6 `note_embeddings` (Vector Embeddings)
- **SELECT**: Accessible to enrolled subject members through their parent `learning_materials.teacher_subject_id`.
- **ALL**: Manageable by the subject teacher or automated backend worker.

### 3.7 `quizzes` & `quiz_questions`
- **SELECT**: Teachers see all; students see quizzes and questions only if `status = 'published'`.
- **ALL**: Manageable by the subject teacher.

### 3.8 `quiz_attempts` & `quiz_responses`
- **SELECT**: Students can read their own attempts and answers; teachers can view all student submissions for their subjects.
- **INSERT**: Students can submit attempts and answers for subjects they are enrolled in.
- **UPDATE**: Teachers or grading engines can update marks and evaluations.

### 3.9 `student_topic_mastery`
- **SELECT**: Student can view their own mastery scores; teacher can inspect all student mastery records for their subject.
- **ALL**: Only teachers and backend service roles can insert or recalculate mastery scores.

### 3.10 `learning_sessions`, `tutor_conversations`, `tutor_messages`
- **SELECT**: Students access their own conversations; teachers can audit conversations within their subject classes.
- **INSERT**: Students can post messages to their active conversations.

### 3.11 `teacher_insights`
- **SELECT**: Accessible only by the subject teacher or platform admin.
- **UPDATE**: Teachers can change status (`active`, `dismissed`, `resolved`).
