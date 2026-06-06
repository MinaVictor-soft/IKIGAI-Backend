import { PrismaClient, Notification, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export class NotificationsService {
  async createNotification(dto: CreateNotificationDTO): Promise<Notification> {
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

  async createBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ): Promise<Notification[]> {
    const notifications = await Promise.all(
      userIds.map(userId =>
        this.createNotification({ userId, type, title, message, data })
      )
    );
    return notifications;
  }

  async getRecentNotifications(
    userId: string,
    limit: number = 20,
    since?: Date
  ): Promise<Notification[]> {
    const where: any = {
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

  async getNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<{ notifications: Notification[]; total: number }> {
    const where: any = { userId };
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

  async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { read: true },
    }).then(() => 
      prisma.notification.findUnique({
        where: { id: notificationId },
      })
    );
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });
    return { count: result.count };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<{ count: number }> {
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

export const notificationsService = new NotificationsService();
