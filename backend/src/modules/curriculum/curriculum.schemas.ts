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

export const bulkCurriculumSchema = z.object({
  modules: z.array(
    z.object({
      title: z.string().min(2, 'Module title is required'),
      description: z.string().optional(),
      topics: z.array(
        z.object({
          title: z.string().min(2, 'Topic title is required'),
          description: z.string().optional(),
          subtopics: z.array(
            z.object({
              title: z.string().min(2, 'Subtopic title is required'),
              description: z.string().optional(),
            })
          ).optional(),
        })
      ).optional(),
    })
  ).min(1, 'At least one module is required'),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type BulkCurriculumInput = z.infer<typeof bulkCurriculumSchema>;
