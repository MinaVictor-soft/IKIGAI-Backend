"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bonus_controller_1 = require("./bonus.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const bonus_schema_1 = require("./bonus.schema");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
// Attendee
router.post('/claim', auth_1.authenticate, (0, validate_1.validate)(bonus_schema_1.claimBonusSchema), (0, asyncHandler_1.asyncHandler)(bonus_controller_1.bonusController.claim));
// Admin
router.post('/generate', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(bonus_schema_1.createBonusQrSchema), (0, asyncHandler_1.asyncHandler)(bonus_controller_1.bonusController.createQr));
router.post('/staff-award', auth_1.authenticate, (0, auth_1.authorize)('STAFF', 'ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(bonus_schema_1.staffAwardSchema), (0, asyncHandler_1.asyncHandler)(bonus_controller_1.bonusController.staffAward));
router.get('/my-qrs', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(bonus_controller_1.bonusController.myQrs));
router.patch('/:qrId/deactivate', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(bonus_controller_1.bonusController.deactivate));
exports.default = router;
//# sourceMappingURL=bonus.routes.js.map