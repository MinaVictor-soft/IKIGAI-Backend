"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffAwardSchema = exports.claimBonusSchema = exports.createBonusQrSchema = void 0;
const zod_1 = require("zod");
exports.createBonusQrSchema = zod_1.z.object({
    amount: zod_1.z.number().int().min(1).max(500),
    label: zod_1.z.string().max(200).optional(),
    maxClaims: zod_1.z.number().int().min(1).optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
});
exports.claimBonusSchema = zod_1.z.object({
    token: zod_1.z.string().uuid('Invalid bonus QR token'),
});
exports.staffAwardSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID').optional(),
    userQrToken: zod_1.z.string().uuid('Invalid user QR token').optional(),
    amount: zod_1.z.number().int().min(1).max(500),
    reason: zod_1.z.string().min(1).max(500),
}).refine((d) => d.userId || d.userQrToken, { message: 'Either userId or userQrToken is required' });
//# sourceMappingURL=bonus.schema.js.map