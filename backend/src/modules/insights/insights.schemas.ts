import { z } from 'zod';

export const updateInsightStatusSchema = z.object({
  status: z.enum(['active', 'dismissed', 'resolved']),
});

export type UpdateInsightStatusInput = z.infer<typeof updateInsightStatusSchema>;
