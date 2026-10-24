import { Router } from 'express';
import { tutorController } from './tutor.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requireSubjectMembership } from '../../middlewares/membership.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { createConversationSchema, sendMessageSchema } from './tutor.schemas.js';

const router = Router();

// Start a new tutoring conversation
router.post(
  '/conversations',
  requireAuth,
  requireRole(['student']),
  validateRequest({ body: createConversationSchema }),
  tutorController.createConversation
);

// Get or create isolated active conversation for student in a specific subject
router.get(
  '/subjects/:subjectId/active',
  requireAuth,
  requireRole(['student']),
  requireSubjectMembership('member'),
  tutorController.getActiveSubjectConversation
);

// Get adaptive diagnostic recommendation based on quiz difficulty & mastery
router.get(
  '/recommendations/:subjectId',
  requireAuth,
  requireRole(['student']),
  requireSubjectMembership('member'),
  tutorController.getRecommendation
);

// List student's conversations for a subject
router.get(
  '/conversations/:subjectId',
  requireAuth,
  requireRole(['student']),
  requireSubjectMembership('member'),
  tutorController.listConversations
);

// Fetch messages for a conversation
router.get(
  '/conversations/:conversationId/messages',
  requireAuth,
  requireSubjectMembership('any'),
  tutorController.getMessages
);

// Send message turn to Socratic Tutor (supports SSE streaming via stream: true or Accept: text/event-stream)
router.post(
  '/conversations/:conversationId/chat',
  requireAuth,
  requireRole(['student']),
  requireSubjectMembership('member'),
  validateRequest({ body: sendMessageSchema }),
  tutorController.sendMessage
);

export const tutorRoutes: Router = router;
