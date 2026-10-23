import { Router } from 'express';
import { subjectsController } from './subjects.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requireSubjectMembership } from '../../middlewares/membership.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { createSubjectSchema, enrollStudentSchema, updateSubjectSchema } from './subjects.schemas.js';

const router = Router();

// Subject offerings CRUD
router.post(
  '/',
  requireAuth,
  requireRole(['teacher', 'admin']),
  validateRequest({ body: createSubjectSchema }),
  subjectsController.create
);

router.get(
  '/',
  requireAuth,
  subjectsController.list
);

router.get(
  '/:subjectId',
  requireAuth,
  requireSubjectMembership('any'),
  subjectsController.getById
);

router.put(
  '/:subjectId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: updateSubjectSchema }),
  subjectsController.update
);

router.delete(
  '/:subjectId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  subjectsController.delete
);

// Student Roster & Enrollment
router.post(
  '/:subjectId/join',
  requireAuth,
  requireRole(['student']),
  subjectsController.join
);

router.post(
  '/:subjectId/enroll',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: enrollStudentSchema }),
  subjectsController.enroll
);

router.get(
  ['/:subjectId/roster', '/:subjectId/members'],
  requireAuth,
  requireSubjectMembership('any'),
  subjectsController.getRoster
);

router.delete(
  '/:subjectId/roster/:studentId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  subjectsController.removeStudent
);

export const subjectsRoutes: Router = router;
