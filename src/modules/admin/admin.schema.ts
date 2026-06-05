import { z } from 'zod';

export const createSessionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  speaker: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  xpReward: z.number().int().min(0).default(10),
  maxCapacity: z.number().int().min(1).optional(),
  attendanceBufferMinutes: z.number().int().min(0).default(10),
});

export const updateSessionStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
});

export const updateSessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  speaker: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  xpReward: z.number().int().min(0).optional(),
  maxCapacity: z.number().int().min(1).nullable().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  role: z.enum(['ATTENDEE', 'STAFF', 'ADMIN', 'SUPER_ADMIN']).default('ATTENDEE'),
  church: z.string().max(200).optional(),
  diocese: z.string().max(200).optional(),
  tribeId: z.string().uuid().optional(),
});

export const createTribeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  maxMembers: z.number().int().min(1).optional(),
});

export const updateTribeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  maxMembers: z.number().int().min(1).nullable().optional(),
});

export const assignTribeSchema = z.object({
  tribeId: z.string().uuid().nullable(),
});

export const adjustXpSchema = z.object({
  amount: z.number().int(),
  reason: z.string().min(1).max(500),
});

export const resetPasswordSchema = z.object({
  defaultPassword: z.string().min(8).max(100).optional(),
});

export const changeUserRoleSchema = z.object({
  role: z.enum(['ATTENDEE', 'STAFF', 'ADMIN', 'SUPER_ADMIN']),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateTribeInput = z.infer<typeof createTribeSchema>;
export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>;
