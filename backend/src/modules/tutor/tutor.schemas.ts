import { z } from 'zod';

export const createConversationSchema = z.object({
  teacherSubjectId: z.string().uuid('Valid teacherSubjectId is required'),
  title: z.string().optional(),
  sessionType: z.enum(['ai_tutor', 'revision', 'practice']).default('ai_tutor'),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  curriculumTopicId: z.string().uuid().optional(),
  stream: z.boolean().default(false),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
