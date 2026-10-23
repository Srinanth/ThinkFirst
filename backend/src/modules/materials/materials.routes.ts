import { Router } from 'express';
import multer from 'multer';
import { materialsController } from './materials.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requireSubjectMembership } from '../../middlewares/membership.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { createMaterialSchema, ingestMaterialTextSchema, searchMaterialsSchema } from './materials.schemas.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
  },
});

const router = Router();

// Unified OCR / Direct File Upload & Ingestion (PDF, Images, TXT, MD, or raw text)
router.post(
  '/:subjectId/upload',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  upload.single('file'),
  materialsController.upload
);

// Upload / register material metadata
router.post(
  '/:subjectId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: createMaterialSchema }),
  materialsController.create
);

// List materials for a subject
router.get(
  '/:subjectId',
  requireAuth,
  requireSubjectMembership('any'),
  materialsController.list
);

// Get single material details
router.get(
  '/detail/:materialId',
  requireAuth,
  requireSubjectMembership('any'),
  materialsController.getById
);

// Delete material
router.delete(
  '/detail/:materialId',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  materialsController.delete
);

// Ingest text content into vector embeddings
router.post(
  '/detail/:materialId/ingest',
  requireAuth,
  requireRole(['teacher', 'admin']),
  requireSubjectMembership('teacher'),
  validateRequest({ body: ingestMaterialTextSchema }),
  materialsController.ingestText
);

// Semantic similarity search over subject materials
router.post(
  '/:subjectId/search',
  requireAuth,
  requireSubjectMembership('any'),
  validateRequest({ body: searchMaterialsSchema }),
  materialsController.search
);

export const materialsRoutes: Router = router;
