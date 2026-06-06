export interface SendPushNotificationDTO {
    pushTokens: string[];
    title: string;
    body: string;
    data?: Record<string, any>;
}
export declare class PushNotificationsService {
    registerPushToken(userId: string, pushToken: string, deviceName?: string): Promise<boolean>;
    getUserPushTokens(userId: string): Promise<string[]>;
    getAllActivePushTokens(): Promise<string[]>;
    sendPushNotification(dto: SendPushNotificationDTO): Promise<boolean>;
    sendBroadcastNotification(title: string, body: string, data?: Record<string, any>): Promise<number>;
    deactivatePushToken(pushToken: string): Promise<boolean>;
}
export declare const pushNotificationsService: PushNotificationsService;
