"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const xp_controller_1 = require("./xp.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const xp_schema_1 = require("./xp.schema");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
router.get('/leaderboard', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(xp_controller_1.xpController.leaderboard));
router.get('/rank/me', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(xp_controller_1.xpController.myRank));
router.get('/levels', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(xp_controller_1.xpController.getLevels));
router.get('/tribes', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(xp_controller_1.xpController.tribeLeaderboard));
router.get('/history/me', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(xp_controller_1.xpController.myHistory));
router.get('/history/:userId', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(xp_controller_1.xpController.userHistory));
router.post('/award', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(xp_schema_1.awardXpSchema), (0, asyncHandler_1.asyncHandler)(xp_controller_1.xpController.award));
exports.default = router;
//# sourceMappingURL=xp.routes.js.map