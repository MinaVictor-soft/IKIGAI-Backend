"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentNotifications = getRecentNotifications;
exports.getNotifications = getNotifications;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
const notifications_service_1 = require("./notifications.service");
async function getRecentNotifications(req, res) {
    const userId = req.user.userId;
    const since = req.query.since ? new Date(req.query.since) : undefined;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const notifications = await notifications_service_1.notificationsService.getRecentNotifications(userId, limit, since);
    const unreadCount = await notifications_service_1.notificationsService.getUnreadCount(userId);
    res.json({
        success: true,
        data: notifications,
        unreadCount,
    });
}
async function getNotifications(req, res) {
    const userId = req.user.userId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const unreadOnly = req.query.unreadOnly === 'true';
    const { notifications, total } = await notifications_service_1.notificationsService.getNotifications(userId, limit, offset, unreadOnly);
    res.json({
        success: true,
        data: {
            notifications,
            total,
            hasMore: offset + limit < total,
        },
    });
}
async function markAsRead(req, res) {
    const userId = req.user.userId;
    const notificationId = req.params.notificationId;
    const notification = await notifications_service_1.notificationsService.markAsRead(notificationId, userId);
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
async function markAllAsRead(req, res) {
    const userId = req.user.userId;
    const result = await notifications_service_1.notificationsService.markAllAsRead(userId);
    res.json({
        success: true,
        data: result,
    });
}
//# sourceMappingURL=notifications.controller.js.map