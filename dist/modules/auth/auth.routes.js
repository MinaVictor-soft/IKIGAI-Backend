"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const rateLimiter_1 = require("../../middleware/rateLimiter");
const auth_schema_1 = require("./auth.schema");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
router.post('/register', (0, validate_1.validate)(auth_schema_1.registerSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.authController.register));
router.post('/login', rateLimiter_1.loginLimiter, (0, validate_1.validate)(auth_schema_1.loginSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.authController.login));
router.post('/refresh', (0, validate_1.validate)(auth_schema_1.refreshTokenSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.authController.refresh));
router.post('/logout', auth_1.authenticate, (0, validate_1.validate)(auth_schema_1.refreshTokenSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.authController.logout));
router.get('/me', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(auth_controller_1.authController.me));
router.post('/change-password', auth_1.authenticate, (0, validate_1.validate)(auth_schema_1.changePasswordSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.authController.changePassword));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map