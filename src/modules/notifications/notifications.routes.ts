import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as notificationsController from './notifications.controller';

const router = Router();

// Get recent notifications for authenticated user
router.get('/recent', authenticate, asyncHandler(notificationsController.getRecentNotifications));

// Get all notifications for authenticated user with pagination
router.get('/', authenticate, asyncHandler(notificationsController.getNotifications));

// Mark notification as read
router.patch('/:notificationId/read', authenticate, asyncHandler(notificationsController.markAsRead));

// Mark all notifications as read
router.patch('/read-all', authenticate, asyncHandler(notificationsController.markAllAsRead));

export default router;
