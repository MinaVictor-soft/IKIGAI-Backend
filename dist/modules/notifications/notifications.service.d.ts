import { Notification, NotificationType } from '@prisma/client';
export interface CreateNotificationDTO {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
}
export declare class NotificationsService {
    createNotification(dto: CreateNotificationDTO): Promise<Notification>;
    createBulkNotifications(userIds: string[], type: NotificationType, title: string, message: string, data?: any): Promise<Notification[]>;
    getRecentNotifications(userId: string, limit?: number, since?: Date): Promise<Notification[]>;
    getNotifications(userId: string, limit?: number, offset?: number, unreadOnly?: boolean): Promise<{
        notifications: Notification[];
        total: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<Notification | null>;
    markAllAsRead(userId: string): Promise<{
        count: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    deleteOldNotifications(daysOld?: number): Promise<{
        count: number;
    }>;
}
export declare const notificationsService: NotificationsService;
