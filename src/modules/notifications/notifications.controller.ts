import { Request, Response } from 'express';
import { notificationsService } from './notifications.service';

export async function getRecentNotifications(req: Request, res: Response) {
  const userId = (req.user as any).userId;
  const since = req.query.since ? new Date(req.query.since as string) : undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

  const notifications = await notificationsService.getRecentNotifications(userId, limit, since);
  const unreadCount = await notificationsService.getUnreadCount(userId);

  res.json({
    success: true,
    data: notifications,
    unreadCount,
  });
}

export async function getNotifications(req: Request, res: Response) {
  const userId = (req.user as any).userId;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;
  const unreadOnly = req.query.unreadOnly === 'true';

  const { notifications, total } = await notificationsService.getNotifications(
    userId,
    limit,
    offset,
    unreadOnly
  );

  res.json({
    success: true,
    data: {
      notifications,
      total,
      hasMore: offset + limit < total,
    },
  });
}

export async function markAsRead(req: Request, res: Response) {
  const userId = (req.user as any).userId;
  const notificationId = req.params.notificationId as string;

  const notification = await notificationsService.markAsRead(notificationId as string, userId);

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Notification not found' },
    });
  }

  res.json({
    success: true,
    data: notification,
  });
}

export async function markAllAsRead(req: Request, res: Response) {
  const userId = (req.user as any).userId;

  const result = await notificationsService.markAllAsRead(userId);

  res.json({
    success: true,
    data: result,
  });
}
