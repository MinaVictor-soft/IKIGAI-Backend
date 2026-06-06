"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEventSchema = exports.updateScoreSchema = exports.createMatchSchema = exports.addPlayerSchema = exports.createTeamSchema = void 0;
const zod_1 = require("zod");
exports.createTeamSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    maxRosterSize: zod_1.z.number().int().min(5).max(30).default(15),
});
exports.addPlayerSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    jerseyNumber: zod_1.z.number().int().min(1).max(99).optional(),
    position: zod_1.z.enum(['GK', 'DEF', 'MID', 'FWD']).optional(),
});
exports.createMatchSchema = zod_1.z.object({
    homeTeamId: zod_1.z.string().uuid(),
    awayTeamId: zod_1.z.string().uuid(),
    scheduledAt: zod_1.z.string().datetime(),
    venue: zod_1.z.string().max(200).optional(),
    round: zod_1.z.number().int().min(1).optional(),
    groupName: zod_1.z.string().max(50).optional(),
    winXp: zod_1.z.number().int().min(0).max(500).default(20),
    drawXp: zod_1.z.number().int().min(0).max(500).default(10),
    lossXp: zod_1.z.number().int().min(0).max(500).default(5),
});
exports.updateScoreSchema = zod_1.z.object({
    homeScore: zod_1.z.number().int().min(0),
    awayScore: zod_1.z.number().int().min(0),
});
exports.addEventSchema = zod_1.z.object({
    playerId: zod_1.z.string().uuid(),
    teamId: zod_1.z.string().uuid(),
    eventType: zod_1.z.enum(['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION']),
    minute: zod_1.z.number().int().min(0).max(150),
    notes: zod_1.z.string().max(500).optional(),
});
//# sourceMappingURL=sports.schema.js.map