"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const asyncHandler_1 = require("../../utils/asyncHandler");
const push_notifications_controller_1 = require("./push-notifications.controller");
const router = (0, express_1.Router)();
const controller = new push_notifications_controller_1.PushNotificationsController();
// Register push token for authenticated user
router.post('/register-token', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)((req, res) => controller.registerToken(req, res)));
// Deactivate push token
router.post('/deactivate-token', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)((req, res) => controller.deactivateToken(req, res)));
exports.default = router;
//# sourceMappingURL=push-notifications.routes.js.map