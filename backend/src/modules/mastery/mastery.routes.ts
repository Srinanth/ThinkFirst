import { Router } from 'express';
import { masteryController } from './mastery.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requireSubjectMembership } from '../../middlewares/membership.middleware.js';

const router = Router();

// Student views own mastery status
router.get(
  '/:subjectId/me',
  requireAuth,
  requireSubjectMembership('member'),
  masteryController.getMyMastery
);

// Teacher views student's mastery profile
router.get(
  '/:subjectId/students/:studentId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  masteryController.getStudentMastery
);

// Progression history timeline
router.get(
  '/:subjectId/history',
  requireAuth,
  requireSubjectMembership('any'),
  masteryController.getHistory
);

// Teacher class-wide mastery overview dashboard
router.get(
  '/:subjectId/overview',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  masteryController.getClassOverview
);

export const masteryRoutes: Router = router;
