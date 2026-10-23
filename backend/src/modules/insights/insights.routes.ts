import { Router } from 'express';
import { insightsController } from './insights.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requireSubjectMembership } from '../../middlewares/membership.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { updateInsightStatusSchema } from './insights.schemas.js';

const router = Router();

// List insights for class
router.get(
  '/:subjectId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  insightsController.list
);

// Insight Agent: synthesize fresh class diagnostic insights
router.post(
  '/:subjectId/generate',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  insightsController.generate
);

// Update status of insight (active, dismissed, resolved)
router.patch(
  '/detail/:insightId/status',
  requireAuth,
  requireRole(['teacher', 'admin']),
  validateRequest({ body: updateInsightStatusSchema }),
  insightsController.updateStatus
);

// Delete insight
router.delete(
  '/detail/:insightId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  insightsController.delete
);

export const insightsRoutes: Router = router;
