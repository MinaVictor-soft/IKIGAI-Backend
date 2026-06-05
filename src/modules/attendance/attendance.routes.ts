import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { scanLimiter } from '../../middleware/rateLimiter';
import { scanQrSchema } from './attendance.schema';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/sessions', authenticate, asyncHandler(attendanceController.getActiveSessions));
router.post('/scan', authenticate, scanLimiter, validate(scanQrSchema), asyncHandler(attendanceController.scan));
router.get('/my', authenticate, asyncHandler(attendanceController.myAttendance));
router.get('/session/:sessionId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(attendanceController.sessionAttendance));

export default router;
