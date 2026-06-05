import { z } from 'zod';

export const createBonusQrSchema = z.object({
  amount: z.number().int().min(1).max(500),
  label: z.string().max(200).optional(),
  maxClaims: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
});

export const claimBonusSchema = z.object({
  token: z.string().uuid('Invalid bonus QR token'),
});

export const staffAwardSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  userQrToken: z.string().uuid('Invalid user QR token').optional(),
  amount: z.number().int().min(1).max(500),
  reason: z.string().min(1).max(500),
}).refine((d) => d.userId || d.userQrToken, { message: 'Either userId or userQrToken is required' });

export type CreateBonusQrInput = z.infer<typeof createBonusQrSchema>;
export type ClaimBonusInput = z.infer<typeof claimBonusSchema>;
export type StaffAwardInput = z.infer<typeof staffAwardSchema>;
