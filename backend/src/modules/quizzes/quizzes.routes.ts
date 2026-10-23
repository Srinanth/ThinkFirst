import { Router } from 'express';
import { quizzesController } from './quizzes.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requireSubjectMembership } from '../../middlewares/membership.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import {
  createQuestionSchema,
  createQuizSchema,
  generateQuizSchema,
  submitAttemptSchema,
  updateQuizSchema,
  updateQuizStatusSchema,
} from './quizzes.schemas.js';

const router = Router();

// Create quiz manually (defaults to 'draft')
router.post(
  '/:subjectId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: createQuizSchema }),
  quizzesController.create
);

// List quizzes in subject (students only see published; teachers see all)
router.get(
  '/:subjectId',
  requireAuth,
  requireSubjectMembership('any'),
  quizzesController.list
);

// Get single quiz with questions
router.get(
  '/detail/:quizId',
  requireAuth,
  requireSubjectMembership('any'),
  quizzesController.getById
);

// Update quiz status (draft -> published -> archived)
router.patch(
  '/detail/:quizId/status',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: updateQuizStatusSchema }),
  quizzesController.updateStatus
);

// Update general quiz details
router.patch(
  '/detail/:quizId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: updateQuizSchema }),
  quizzesController.update
);

// Delete quiz and associated questions
router.delete(
  '/detail/:quizId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  quizzesController.delete
);

// Add question to quiz
router.post(
  '/detail/:quizId/questions',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: createQuestionSchema }),
  quizzesController.addQuestion
);

// Quiz Agent: generate diagnostic quiz from topic & materials (saved as 'draft')
router.post(
  '/:subjectId/generate',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: generateQuizSchema }),
  quizzesController.generateQuiz
);

// Student: start attempt
router.post(
  '/detail/:quizId/attempts',
  requireAuth,
  requireRole(['student']),
  requireSubjectMembership('member'),
  quizzesController.startAttempt
);

// Student: submit attempt (evaluated by AI Evaluator Agent & updates Mastery Engine)
router.post(
  '/attempts/:attemptId/submit',
  requireAuth,
  requireRole(['student']),
  requireSubjectMembership('member'),
  validateRequest({ body: submitAttemptSchema }),
  quizzesController.submitAttempt
);

// Get results and rubric feedback
router.get(
  '/attempts/:attemptId/results',
  requireAuth,
  requireSubjectMembership('any'),
  quizzesController.getResults
);

export const quizzesRoutes: Router = router;
