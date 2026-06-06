"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const admin_schema_1 = require("./admin.schema");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
// All admin routes require STAFF, ADMIN or SUPER_ADMIN
router.use(auth_1.authenticate, (0, auth_1.authorize)('STAFF', 'ADMIN', 'SUPER_ADMIN'));
// Dashboard
router.get('/stats', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.stats));
// Sessions
router.post('/sessions', (0, validate_1.validate)(admin_schema_1.createSessionSchema), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.createSession));
router.get('/sessions', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.getSessions));
router.patch('/sessions/:sessionId', (0, validate_1.validate)(admin_schema_1.updateSessionSchema), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.updateSession));
router.patch('/sessions/:sessionId/status', (0, validate_1.validate)(admin_schema_1.updateSessionStatusSchema), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.updateSessionStatus));
router.post('/sessions/:sessionId/regenerate-qr', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.regenerateQr));
// Users
router.post('/users', (0, validate_1.validate)(admin_schema_1.createUserSchema), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.createUser));
router.get('/users', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.getUsers));
router.patch('/users/:userId/tribe', (0, validate_1.validate)(admin_schema_1.assignTribeSchema), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.assignTribe));
router.patch('/users/:userId/role', (0, validate_1.validate)(admin_schema_1.changeUserRoleSchema), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.changeUserRole));
router.patch('/users/:userId/xp', (0, validate_1.validate)(admin_schema_1.adjustXpSchema), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.adjustXp));
router.post('/users/:userId/reset-password', (0, validate_1.validate)(admin_schema_1.resetPasswordSchema), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.resetUserPassword));
router.delete('/users/:userId', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.deleteUser));
router.get('/users/:userId', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.getUserDetail));
router.get('/users/:userId/activity', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.getUserActivity));
// Bonus
router.get('/bonus/:bonusQrId/claims', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.getBonusQrClaims));
// Tribes
router.post('/tribes', (0, validate_1.validate)(admin_schema_1.createTribeSchema), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.createTribe));
router.get('/tribes', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.getTribes));
router.patch('/tribes/:tribeId', (0, validate_1.validate)(admin_schema_1.updateTribeSchema), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.updateTribe));
// Quizzes
router.get('/quizzes', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.getAllQuizzes));
router.get('/quizzes/:quizId', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.getQuizDetail));
router.delete('/quizzes/:quizId/questions/:questionId', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.deleteQuizQuestion));
// Session detail
router.get('/sessions/:sessionId', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.getSessionDetail));
// Levels
router.get('/levels', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.getLevels));
router.post('/levels', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.createLevel));
router.patch('/levels/:levelId', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.updateLevel));
router.delete('/levels/:levelId', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.deleteLevel));
router.post('/levels/recalculate', (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.recalculateAllLevels));
// System Config (ADMIN + SUPER_ADMIN only)
router.get('/system-config', (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.getSystemConfig));
router.patch('/system-config/:key', (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.updateSystemConfig));
// Bulk Operations (SUPER_ADMIN only)
router.delete('/users/attendees', (0, auth_1.authorize)('SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminController.deleteAllAttendees));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map