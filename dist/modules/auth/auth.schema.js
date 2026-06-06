"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').max(255),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters').max(100),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
    church: zod_1.z.string().min(2, 'Church is required').max(200),
    diocese: zod_1.z.string().min(2, 'Diocese is required').max(200),
    phone: zod_1.z.string().max(20).optional(),
    languagePreference: zod_1.z.enum(['en', 'ar']).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters').max(100),
});
//# sourceMappingURL=auth.schema.js.map