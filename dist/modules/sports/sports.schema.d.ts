import { z } from 'zod';
export declare const createTeamSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
    maxRosterSize: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const addPlayerSchema: z.ZodObject<{
    userId: z.ZodString;
    jerseyNumber: z.ZodOptional<z.ZodNumber>;
    position: z.ZodOptional<z.ZodEnum<{
        GK: "GK";
        DEF: "DEF";
        MID: "MID";
        FWD: "FWD";
    }>>;
}, z.core.$strip>;
export declare const createMatchSchema: z.ZodObject<{
    homeTeamId: z.ZodString;
    awayTeamId: z.ZodString;
    scheduledAt: z.ZodString;
    venue: z.ZodOptional<z.ZodString>;
    round: z.ZodOptional<z.ZodNumber>;
    groupName: z.ZodOptional<z.ZodString>;
    winXp: z.ZodDefault<z.ZodNumber>;
    drawXp: z.ZodDefault<z.ZodNumber>;
    lossXp: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateScoreSchema: z.ZodObject<{
    homeScore: z.ZodNumber;
    awayScore: z.ZodNumber;
}, z.core.$strip>;
export declare const addEventSchema: z.ZodObject<{
    playerId: z.ZodString;
    teamId: z.ZodString;
    eventType: z.ZodEnum<{
        GOAL: "GOAL";
        ASSIST: "ASSIST";
        YELLOW_CARD: "YELLOW_CARD";
        RED_CARD: "RED_CARD";
        SUBSTITUTION: "SUBSTITUTION";
    }>;
    minute: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type AddPlayerInput = z.infer<typeof addPlayerSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;
export type AddEventInput = z.infer<typeof addEventSchema>;
