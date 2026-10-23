import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors.util.js';

export type SubjectAccessScope = 'teacher' | 'member' | 'any';

/**
 * Resolves the target teacher_subject_id from route params or body.
 * Supports:
 * - req.params.subjectId
 * - req.params.id
 * - req.body.teacherSubjectId
 * - req.params.quizId
 * - req.params.materialId
 * - req.params.insightId
 * - req.params.topicId
 * - req.params.conversationId
 * - req.params.attemptId
 */
async function resolveSubjectId(req: Request): Promise<{ subjectId?: string; ownerStudentId?: string }> {
  let subjectId = req.params.subjectId || req.params.id || req.body?.teacherSubjectId;
  if (subjectId) return { subjectId };

  if (req.params.quizId) {
    const { data } = await supabaseAdmin
      .from('quizzes')
      .select('teacher_subject_id')
      .eq('id', req.params.quizId)
      .maybeSingle();
    return { subjectId: data?.teacher_subject_id };
  }

  if (req.params.materialId) {
    const { data } = await supabaseAdmin
      .from('learning_materials')
      .select('teacher_subject_id')
      .eq('id', req.params.materialId)
      .maybeSingle();
    return { subjectId: data?.teacher_subject_id };
  }

  if (req.params.insightId) {
    const { data } = await supabaseAdmin
      .from('teacher_insights')
      .select('teacher_subject_id')
      .eq('id', req.params.insightId)
      .maybeSingle();
    return { subjectId: data?.teacher_subject_id };
  }

  if (req.params.topicId) {
    const { data } = await supabaseAdmin
      .from('curriculum_topics')
      .select('teacher_subject_id')
      .eq('id', req.params.topicId)
      .maybeSingle();
    return { subjectId: data?.teacher_subject_id };
  }

  if (req.params.attemptId) {
    const { data } = await supabaseAdmin
      .from('quiz_attempts')
      .select('student_id, quizzes!inner(teacher_subject_id)')
      .eq('id', req.params.attemptId)
      .maybeSingle();
    const quizData = data?.quizzes as unknown as { teacher_subject_id: string } | undefined;
    return { subjectId: quizData?.teacher_subject_id, ownerStudentId: data?.student_id };
  }

  if (req.params.conversationId) {
    const { data } = await supabaseAdmin
      .from('tutor_conversations')
      .select('student_id, teacher_subject_id')
      .eq('id', req.params.conversationId)
      .maybeSingle();
    return { subjectId: data?.teacher_subject_id, ownerStudentId: data?.student_id };
  }

  return {};
}

export const requireSubjectMembership = (scope: SubjectAccessScope = 'any') => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      // Check if user is platform admin (bypasses membership check)
      if (req.user.role === 'admin') {
        return next();
      }

      const { subjectId, ownerStudentId } = await resolveSubjectId(req);

      if (!subjectId) {
        return next(); // If no subject entity is targetable, let route controller handle
      }

      // Check subject existence and instructor
      const { data: subject, error: subError } = await supabaseAdmin
        .from('teacher_subjects')
        .select('id, teacher_id')
        .eq('id', subjectId)
        .single();

      if (subError || !subject) {
        return next(new NotFoundError('Teacher subject not found'));
      }

      const isTeacher = subject.teacher_id === req.user.id;

      // STRICT TEACHER ISOLATION: A teacher can NEVER view or modify another teacher's subject/resources
      if (req.user.role === 'teacher') {
        if (!isTeacher) {
          return next(new ForbiddenError('You do not have access to another teacher\'s subject data'));
        }
        return next();
      }

      // If scope requires teacher authority (e.g. creating/editing content, reviewing analytics)
      if (scope === 'teacher') {
        return next(new ForbiddenError('Only the assigned instructor can perform this action'));
      }

      // If student is accessing an entity tied to a specific student (attempt or conversation), verify student ownership
      if (ownerStudentId && ownerStudentId !== req.user.id) {
        return next(new ForbiddenError('You do not have permission to access another student\'s session'));
      }

      // Verify student enrollment in memberships
      const { data: membership, error: memError } = await supabaseAdmin
        .from('memberships')
        .select('teacher_subject_id, student_id')
        .eq('teacher_subject_id', subjectId)
        .eq('student_id', req.user.id)
        .maybeSingle();

      if (memError || !membership) {
        return next(new ForbiddenError('You are not an enrolled member of this subject'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
