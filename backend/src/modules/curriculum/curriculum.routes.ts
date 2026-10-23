import { Router } from 'express';
import { curriculumController } from './curriculum.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requireSubjectMembership } from '../../middlewares/membership.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { createTopicSchema, bulkCurriculumSchema, updateTopicSchema } from './curriculum.schemas.js';

const router = Router();

// Create manual topic
router.post(
  '/:subjectId/topics',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: createTopicSchema }),
  curriculumController.create
);

// Get curriculum tree for a subject
router.get(
  '/:subjectId/tree',
  requireAuth,
  requireSubjectMembership('any'),
  curriculumController.getTree
);

// Update topic node
router.put(
  '/topics/:topicId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  validateRequest({ body: updateTopicSchema }),
  curriculumController.update
);

// Delete topic node
router.delete(
  '/topics/:topicId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  curriculumController.delete
);

// Deterministic Bulk Curriculum Import: structure modules, topics & subtopics
router.post(
  '/:subjectId/bulk',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: bulkCurriculumSchema }),
  curriculumController.bulkCreate
);

export const curriculumRoutes: Router = router;
