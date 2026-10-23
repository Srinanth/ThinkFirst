import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = Router();

router.get('/me', requireAuth, authController.getMe);
router.put('/me', requireAuth, authController.updateMe);
router.get('/stats', requireAuth, requireRole(['admin']), authController.getStats);
router.get('/profiles', requireAuth, requireRole(['admin']), authController.listProfiles);
router.post('/users', requireAuth, requireRole(['admin']), authController.createUser);
router.get(
  '/profiles/:id',
  requireAuth,
  requireRole(['admin', 'teacher']),
  authController.getProfileById
);

export const authRoutes: Router = router;
