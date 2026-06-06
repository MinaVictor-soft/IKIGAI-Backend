import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
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

export default router;
