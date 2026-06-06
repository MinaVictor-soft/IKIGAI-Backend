import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as pushNotificationsController from './push-notifications.controller';

const router = Router();

// Register push token for authenticated user
router.post(
  '/register-token',
  authenticate,
  asyncHandler(pushNotificationsController.pushNotificationsController.registerToken)
);

// Deactivate push token
router.post(
  '/deactivate-token',
  authenticate,
  asyncHandler(pushNotificationsController.pushNotificationsController.deactivateToken)
);

export default router;
