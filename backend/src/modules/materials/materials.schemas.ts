import { z } from 'zod';

export const createMaterialSchema = z.object({
  title: z.string().min(2, 'Material title must be at least 2 characters'),
  filePath: z.string().min(1, 'File path or storage URL is required'),
  fileType: z.string().min(1, 'File extension/type is required (e.g. pdf, txt, docx)'),
  curriculumTopicId: z.string().uuid().optional(),
  materialType: z.string().optional(),
});

export const ingestMaterialTextSchema = z.object({
  rawText: z.string().min(10, 'Raw text content must be at least 10 characters'),
});

export const uploadMaterialSchema = z.object({
  title: z.string().min(2, 'Material title must be at least 2 characters'),
  curriculumTopicId: z.string().uuid().optional(),
  materialType: z.string().default('lecture_notes'),
  rawText: z.string().optional(),
});

export const searchMaterialsSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
  curriculumTopicId: z.string().uuid().optional(),
  matchCount: z.number().int().min(1).max(20).default(5),
  matchThreshold: z.number().min(0).max(1).default(0.5),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type IngestMaterialTextInput = z.infer<typeof ingestMaterialTextSchema>;
export type UploadMaterialInput = z.infer<typeof uploadMaterialSchema>;
export type SearchMaterialsInput = z.infer<typeof searchMaterialsSchema>;
