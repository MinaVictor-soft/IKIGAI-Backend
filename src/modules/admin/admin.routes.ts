import { Router } from 'express';
import { adminController } from './admin.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { createSessionSchema, updateSessionSchema, updateSessionStatusSchema, createUserSchema, createTribeSchema, updateTribeSchema, assignTribeSchema, adjustXpSchema, resetPasswordSchema, changeUserRoleSchema } from './admin.schema';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Public settings - anyone can read (no auth required)
router.get('/settings', asyncHandler(adminController.getAdminSettings));

// All admin routes require STAFF, ADMIN or SUPER_ADMIN
router.use(authenticate, authorize('STAFF', 'ADMIN', 'SUPER_ADMIN'));

// Dashboard
router.get('/stats', asyncHandler(adminController.stats));

// Sessions
router.post('/sessions', validate(createSessionSchema), asyncHandler(adminController.createSession));
router.get('/sessions', asyncHandler(adminController.getSessions));
router.patch('/sessions/:sessionId', validate(updateSessionSchema), asyncHandler(adminController.updateSession));
router.patch('/sessions/:sessionId/status', validate(updateSessionStatusSchema), asyncHandler(adminController.updateSessionStatus));
router.post('/sessions/:sessionId/regenerate-qr', asyncHandler(adminController.regenerateQr));

// Users
router.post('/users', validate(createUserSchema), asyncHandler(adminController.createUser));
router.get('/users', asyncHandler(adminController.getUsers));
router.patch('/users/:userId/tribe', validate(assignTribeSchema), asyncHandler(adminController.assignTribe));
router.patch('/users/:userId/role', validate(changeUserRoleSchema), asyncHandler(adminController.changeUserRole));
router.patch('/users/:userId/xp', validate(adjustXpSchema), asyncHandler(adminController.adjustXp));
router.post('/users/:userId/reset-password', validate(resetPasswordSchema), asyncHandler(adminController.resetUserPassword));
router.delete('/users/:userId', asyncHandler(adminController.deleteUser));
router.get('/users/:userId', asyncHandler(adminController.getUserDetail));
router.get('/users/:userId/activity', asyncHandler(adminController.getUserActivity));

// Bonus
router.get('/bonus/:bonusQrId/claims', asyncHandler(adminController.getBonusQrClaims));

// Tribes
router.post('/tribes', validate(createTribeSchema), asyncHandler(adminController.createTribe));
router.get('/tribes', asyncHandler(adminController.getTribes));
router.patch('/tribes/:tribeId', validate(updateTribeSchema), asyncHandler(adminController.updateTribe));

// Quizzes
router.get('/quizzes', asyncHandler(adminController.getAllQuizzes));
router.get('/quizzes/:quizId', asyncHandler(adminController.getQuizDetail));
router.delete('/quizzes/:quizId/questions/:questionId', asyncHandler(adminController.deleteQuizQuestion));

// Session detail
router.get('/sessions/:sessionId', asyncHandler(adminController.getSessionDetail));

// Levels
router.get('/levels', asyncHandler(adminController.getLevels));
router.post('/levels', asyncHandler(adminController.createLevel));
router.patch('/levels/:levelId', asyncHandler(adminController.updateLevel));
router.delete('/levels/:levelId', asyncHandler(adminController.deleteLevel));
router.post('/levels/recalculate', asyncHandler(adminController.recalculateAllLevels));

// System Config (ADMIN + SUPER_ADMIN only)
router.get('/system-config', authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(adminController.getSystemConfig));
router.patch('/system-config/:key', authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(adminController.updateSystemConfig));

// Admin Settings - PATCH only (requires ADMIN)
router.patch('/settings', authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(adminController.updateAdminSettings));

// Bulk Operations (SUPER_ADMIN only)
router.delete('/users/attendees', authorize('SUPER_ADMIN'), asyncHandler(adminController.deleteAllAttendees));

// Backup (SUPER_ADMIN only)
router.get('/backup', authorize('SUPER_ADMIN'), asyncHandler(adminController.downloadBackup));

export default router;
