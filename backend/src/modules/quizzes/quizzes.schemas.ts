import { z } from 'zod';

export const createQuizSchema = z.object({
  title: z.string().min(2, 'Quiz title must be at least 2 characters'),
  description: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  examDuration: z.number().int().min(1).default(30),
  curriculumTopicId: z.string().optional(),
  topicTitle: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const updateQuizStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
});

export const updateQuizSchema = z.object({
  title: z.string().min(2, 'Quiz title must be at least 2 characters').optional(),
  description: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  examDuration: z.number().int().min(1).optional(),
  curriculumTopicId: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const createQuestionSchema = z.object({
  questionText: z.string().min(3, 'Question text is required'),
  questionType: z.enum(['multiple_choice', 'short_answer', 'long_answer']).default('multiple_choice'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.any(),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  marks: z.number().min(0.5).default(1),
  curriculumTopicId: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

export const generateQuizSchema = z.object({
  title: z.string().min(2, 'Quiz title is required'),
  curriculumTopicId: z.string().optional(),
  topicTitle: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  questionCount: z.number().int().min(1).max(20).default(5),
  examDuration: z.number().int().min(1).default(30),
});

export const submitAttemptSchema = z.object({
  responses: z.array(
    z.object({
      questionId: z.string().uuid(),
      studentAnswer: z.any(),
    })
  ).min(1, 'At least one response is required'),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizStatusInput = z.infer<typeof updateQuizStatusSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
