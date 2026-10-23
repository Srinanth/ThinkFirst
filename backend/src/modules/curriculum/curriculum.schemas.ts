import { z } from 'zod';

export const createTopicSchema = z.object({
  title: z.string().min(2, 'Topic title must be at least 2 characters'),
  description: z.string().optional(),
  parentTopicId: z.string().uuid().optional(),
  nodeType: z.enum(['module', 'topic', 'subtopic']).default('topic'),
});

export const updateTopicSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  nodeType: z.enum(['module', 'topic', 'subtopic']).optional(),
});

export const parseSyllabusSchema = z.object({
  syllabusText: z.string().min(20, 'Syllabus text must be at least 20 characters for parsing'),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type ParseSyllabusInput = z.infer<typeof parseSyllabusSchema>;
