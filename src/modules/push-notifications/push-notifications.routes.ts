import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { PushNotificationsController } from './push-notifications.controller';

const router = Router();
const controller = new PushNotificationsController();

// Register push token for authenticated user
router.post(
  '/register-token',
  authenticate,
  asyncHandler((req, res) => controller.registerToken(req, res))
);

// Deactivate push token
router.post(
  '/deactivate-token',
  authenticate,
  asyncHandler((req, res) => controller.deactivateToken(req, res))
);

// Broadcast push notification (ADMIN+)
router.post(
  '/broadcast',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  asyncHandler((req, res) => controller.broadcast(req, res))
);

// Register token (alias for easier client usage)
router.post(
  '/register',
  authenticate,
  asyncHandler((req, res) => controller.registerToken(req, res))
);

export default router;
