import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  maxRosterSize: z.number().int().min(5).max(30).default(15),
});

export const addPlayerSchema = z.object({
  userId: z.string().uuid(),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  position: z.enum(['GK', 'DEF', 'MID', 'FWD']).optional(),
});

export const createMatchSchema = z.object({
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  venue: z.string().max(200).optional(),
  round: z.number().int().min(1).optional(),
  groupName: z.string().max(50).optional(),
  winXp: z.number().int().min(0).max(500).default(20),
  drawXp: z.number().int().min(0).max(500).default(10),
  lossXp: z.number().int().min(0).max(500).default(5),
});

export const updateScoreSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export const addEventSchema = z.object({
  playerId: z.string().uuid(),
  teamId: z.string().uuid(),
  eventType: z.enum(['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION']),
  minute: z.number().int().min(0).max(150),
  notes: z.string().max(500).optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type AddPlayerInput = z.infer<typeof addPlayerSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;
export type AddEventInput = z.infer<typeof addEventSchema>;
