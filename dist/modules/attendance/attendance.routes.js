"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("./attendance.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const rateLimiter_1 = require("../../middleware/rateLimiter");
const attendance_schema_1 = require("./attendance.schema");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
router.get('/sessions', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(attendance_controller_1.attendanceController.getActiveSessions));
router.post('/scan', auth_1.authenticate, rateLimiter_1.scanLimiter, (0, validate_1.validate)(attendance_schema_1.scanQrSchema), (0, asyncHandler_1.asyncHandler)(attendance_controller_1.attendanceController.scan));
router.get('/my', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(attendance_controller_1.attendanceController.myAttendance));
router.get('/session/:sessionId', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(attendance_controller_1.attendanceController.sessionAttendance));
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map