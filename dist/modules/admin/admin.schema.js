"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNavConfigSchema = exports.updateCmsConfigSchema = exports.changeUserRoleSchema = exports.resetPasswordSchema = exports.adjustXpSchema = exports.assignTribeSchema = exports.updateTribeSchema = exports.createTribeSchema = exports.createUserSchema = exports.updateSessionSchema = exports.updateSessionStatusSchema = exports.createSessionSchema = void 0;
const zod_1 = require("zod");
exports.createSessionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    speaker: zod_1.z.string().max(100).optional(),
    location: zod_1.z.string().max(200).optional(),
    sessionDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    xpReward: zod_1.z.number().int().min(0).default(10),
    maxCapacity: zod_1.z.number().int().min(1).optional(),
    attendanceBufferMinutes: zod_1.z.number().int().min(0).default(10),
});
exports.updateSessionStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
});
exports.updateSessionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().optional(),
    speaker: zod_1.z.string().max(100).optional(),
    location: zod_1.z.string().max(200).optional(),
    sessionDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startTime: zod_1.z.string().datetime().optional(),
    endTime: zod_1.z.string().datetime().optional(),
    xpReward: zod_1.z.number().int().min(0).optional(),
    maxCapacity: zod_1.z.number().int().min(1).nullable().optional(),
});
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email().max(255),
    password: zod_1.z.string().min(8).max(100),
    name: zod_1.z.string().min(2).max(100),
    phone: zod_1.z.string().max(20).optional(),
    role: zod_1.z.enum(['ATTENDEE', 'STAFF', 'ADMIN', 'SUPER_ADMIN']).default('ATTENDEE'),
    church: zod_1.z.string().max(200).optional(),
    diocese: zod_1.z.string().max(200).optional(),
    tribeId: zod_1.z.string().uuid().optional(),
});
exports.createTribeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    maxMembers: zod_1.z.number().int().min(1).optional(),
});
exports.updateTribeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().optional(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    maxMembers: zod_1.z.number().int().min(1).nullable().optional(),
});
exports.assignTribeSchema = zod_1.z.object({
    tribeId: zod_1.z.string().uuid().nullable(),
});
exports.adjustXpSchema = zod_1.z.object({
    amount: zod_1.z.number().int(),
    reason: zod_1.z.string().min(1).max(500),
});
exports.resetPasswordSchema = zod_1.z.object({
    defaultPassword: zod_1.z.string().min(8).max(100).optional(),
});
exports.changeUserRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['ATTENDEE', 'STAFF', 'ADMIN', 'SUPER_ADMIN']),
});
exports.updateCmsConfigSchema = zod_1.z.object({
    appName: zod_1.z.string().max(200).optional(),
    appNameAr: zod_1.z.string().max(200).optional(),
    infoPageTitle: zod_1.z.string().max(200).optional(),
    infoPageTitleAr: zod_1.z.string().max(200).optional(),
    infoPageContent: zod_1.z.string().optional(),
    infoPageContentAr: zod_1.z.string().optional(),
});
exports.updateNavConfigSchema = zod_1.z.object({
    web: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        visible: zod_1.z.boolean(),
    })).optional(),
    mobile: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        visible: zod_1.z.boolean(),
    })).optional(),
});
//# sourceMappingURL=admin.schema.js.map