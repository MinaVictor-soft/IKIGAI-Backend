"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanLimiter = exports.generalLimiter = exports.loginLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // generous for conference - many devices per person
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many login attempts. Please try again later.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 300, // high limit for conference with many concurrent users
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please wait a moment.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});
exports.scanLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 15,
    // Key by user ID (from JWT) so shared conference WiFi doesn't block everyone
    keyGenerator: (req) => req.user?.userId || 'anonymous',
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many scan attempts. Please wait a moment.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});
//# sourceMappingURL=rateLimiter.js.map