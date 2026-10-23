import { z } from 'zod';

export const createSubjectSchema = z.object({
  subject: z.string().min(2, 'Subject name must be at least 2 characters'),
  academicYear: z.string().min(4, 'Academic year is required (e.g. 2026 or 2025-2026)'),
  className: z.string().min(1, 'Class or section name is required (e.g. CSE-A)'),
});

export const updateSubjectSchema = z.object({
  subject: z.string().min(2).optional(),
  academicYear: z.string().min(4).optional(),
  className: z.string().min(1).optional(),
});

export const enrollStudentSchema = z.object({
  studentId: z.string().optional(),
  email: z.string().optional(),
  identifier: z.string().optional(),
}).refine(data => Boolean(data.studentId || data.email || data.identifier), {
  message: 'Either studentId, email, or identifier must be provided to enroll a student',
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;
