"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsService = exports.NotificationsService = void 0;
const database_1 = __importDefault(require("../../config/database"));
class NotificationsService {
    async createNotification(dto) {
        return database_1.default.notification.create({
            data: {
                userId: dto.userId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                data: dto.data,
            },
        });
    }
    async createBulkNotifications(userIds, type, title, message, data) {
        const notifications = await Promise.all(userIds.map(userId => this.createNotification({ userId, type, title, message, data })));
        return notifications;
    }
    async getRecentNotifications(userId, limit = 20, since) {
        const where = {
            userId,
        };
        if (since) {
            where.createdAt = { gte: since };
        }
        return database_1.default.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getNotifications(userId, limit = 20, offset = 0, unreadOnly = false) {
        const where = { userId };
        if (unreadOnly) {
            where.read = false;
        }
        const [notifications, total] = await Promise.all([
            database_1.default.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            database_1.default.notification.count({ where }),
        ]);
        return { notifications, total };
    }
    async markAsRead(notificationId, userId) {
        try {
            const result = await database_1.default.notification.updateMany({
                where: { id: notificationId, userId },
                data: { read: true },
            });
            if (result.count === 0)
                return null;
            return database_1.default.notification.findUnique({ where: { id: notificationId } });
        }
        catch {
            return null;
        }
    }
    async markAllAsRead(userId) {
        const result = await database_1.default.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: { read: true },
        });
        return { count: result.count };
    }
    async getUnreadCount(userId) {
        return database_1.default.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    }
    async deleteOldNotifications(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await database_1.default.notification.deleteMany({
            where: {
                read: true,
                createdAt: { lt: cutoffDate },
            },
        });
        return { count: result.count };
    }
}
exports.NotificationsService = NotificationsService;
exports.notificationsService = new NotificationsService();
//# sourceMappingURL=notifications.service.js.map