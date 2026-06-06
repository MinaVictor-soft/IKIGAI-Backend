"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkAwardSchema = exports.awardXpSchema = void 0;
const zod_1 = require("zod");
exports.awardXpSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID'),
    amount: zod_1.z.number().int().min(1).max(500),
    description: zod_1.z.string().max(500).optional(),
    reason: zod_1.z.string().max(500).optional(),
});
exports.bulkAwardSchema = zod_1.z.object({
    userIds: zod_1.z.array(zod_1.z.string().uuid()).min(1).max(50),
    amount: zod_1.z.number().int().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
});
//# sourceMappingURL=xp.schema.js.map