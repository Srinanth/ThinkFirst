import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors.util.js';

export type SubjectAccessScope = 'teacher' | 'member' | 'any';

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

      const subjectId = req.params.subjectId || req.params.id || req.body.teacherSubjectId;

      if (!subjectId) {
        return next(); // If no subject id in params or body, skip or let route handle
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

      if (scope === 'teacher') {
        if (!isTeacher) {
          return next(new ForbiddenError('Only the assigned instructor can perform this action'));
        }
        return next();
      }

      if (isTeacher) {
        return next();
      }

      // Check student enrollment in memberships
      const { data: membership, error: memError } = await supabaseAdmin
        .from('memberships')
        .select('teacher_subject_id, student_id')
        .eq('teacher_subject_id', subjectId)
        .eq('student_id', req.user.id)
        .single();

      if (memError || !membership) {
        return next(new ForbiddenError('You are not an enrolled member of this subject'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
