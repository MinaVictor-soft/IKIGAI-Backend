"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsService = exports.NotificationsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationsService {
    async createNotification(dto) {
        return prisma.notification.create({
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
        return prisma.notification.findMany({
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
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.notification.count({ where }),
        ]);
        return { notifications, total };
    }
    async markAsRead(notificationId, userId) {
        return prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId,
            },
            data: { read: true },
        }).then(() => prisma.notification.findUnique({
            where: { id: notificationId },
        }));
    }
    async markAllAsRead(userId) {
        const result = await prisma.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: { read: true },
        });
        return { count: result.count };
    }
    async getUnreadCount(userId) {
        return prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    }
    async deleteOldNotifications(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await prisma.notification.deleteMany({
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