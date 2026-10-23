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
} from './quizzes.schemas.js';

const router = Router();

// Create quiz manually
router.post(
  '/:subjectId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: createQuizSchema }),
  quizzesController.create
);

// List quizzes in subject
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
  quizzesController.getById
);

// Add question to quiz
router.post(
  '/detail/:quizId/questions',
  requireAuth,
  requireRole(['teacher', 'admin']),
  validateRequest({ body: createQuestionSchema }),
  quizzesController.addQuestion
);

// Quiz Agent: generate diagnostic quiz from topic & materials
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
  quizzesController.startAttempt
);

// Student: submit attempt (evaluated by AI Evaluator Agent & updates Mastery Engine)
router.post(
  '/attempts/:attemptId/submit',
  requireAuth,
  requireRole(['student']),
  validateRequest({ body: submitAttemptSchema }),
  quizzesController.submitAttempt
);

// Get results and rubric feedback
router.get(
  '/attempts/:attemptId/results',
  requireAuth,
  quizzesController.getResults
);

export const quizzesRoutes: Router = router;
