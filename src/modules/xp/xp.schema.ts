import { z } from 'zod';

export const awardXpSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  amount: z.number().int().min(1).max(500),
  description: z.string().max(500).optional(),
  reason: z.string().max(500).optional(),
});

export const bulkAwardSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(50),
  amount: z.number().int().min(1).max(100),
  description: z.string().max(500).optional(),
});

export type AwardXpInput = z.infer<typeof awardXpSchema>;
export type BulkAwardInput = z.infer<typeof bulkAwardSchema>;
