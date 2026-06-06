"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushNotificationsService = exports.PushNotificationsService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const axios_1 = __importDefault(require("axios"));
const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';
class PushNotificationsService {
    async registerPushToken(userId, pushToken, deviceName) {
        try {
            await database_1.default.userPushToken.upsert({
                where: {
                    userId_pushToken: {
                        userId,
                        pushToken,
                    },
                },
                update: {
                    isActive: true,
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    pushToken,
                    deviceName,
                    isActive: true,
                },
            });
            return true;
        }
        catch (error) {
            console.error('Error registering push token:', error);
            return false;
        }
    }
    async getUserPushTokens(userId) {
        try {
            const tokens = await database_1.default.userPushToken.findMany({
                where: {
                    userId,
                    isActive: true,
                },
                select: { pushToken: true },
            });
            return tokens.map(t => t.pushToken);
        }
        catch (error) {
            console.error('Error getting push tokens:', error);
            return [];
        }
    }
    async getAllActivePushTokens() {
        try {
            const tokens = await database_1.default.userPushToken.findMany({
                where: { isActive: true },
                select: { pushToken: true },
            });
            return tokens.map(t => t.pushToken);
        }
        catch (error) {
            console.error('Error getting all push tokens:', error);
            return [];
        }
    }
    async sendPushNotification(dto) {
        try {
            // Filter valid tokens (must start with ExponentPushToken)
            const validTokens = dto.pushTokens.filter(token => token.startsWith('ExponentPushToken[') || token.includes('ExponentPushToken'));
            if (validTokens.length === 0) {
                console.warn('No valid Expo push tokens provided');
                return false;
            }
            // Send to Expo Push Notification API
            const messages = validTokens.map(token => ({
                to: token,
                sound: 'default',
                title: dto.title,
                body: dto.body,
                data: dto.data || {},
                badge: 1,
                priority: 'high',
            }));
            // Expo API accepts up to 100 notifications per request
            const chunks = [];
            for (let i = 0; i < messages.length; i += 100) {
                chunks.push(messages.slice(i, i + 100));
            }
            for (const chunk of chunks) {
                try {
                    await axios_1.default.post(EXPO_PUSH_API, chunk, {
                        timeout: 10000,
                    });
                }
                catch (error) {
                    console.error('Error sending batch to Expo API:', error);
                }
            }
            return true;
        }
        catch (error) {
            console.error('Error sending push notification:', error);
            return false;
        }
    }
    async sendBroadcastNotification(title, body, data) {
        try {
            const allTokens = await this.getAllActivePushTokens();
            if (allTokens.length === 0) {
                return 0;
            }
            await this.sendPushNotification({
                pushTokens: allTokens,
                title,
                body,
                data,
            });
            return allTokens.length;
        }
        catch (error) {
            console.error('Error sending broadcast notification:', error);
            return 0;
        }
    }
    async deactivatePushToken(pushToken) {
        try {
            await database_1.default.userPushToken.updateMany({
                where: { pushToken },
                data: { isActive: false },
            });
            return true;
        }
        catch (error) {
            console.error('Error deactivating push token:', error);
            return false;
        }
    }
}
exports.PushNotificationsService = PushNotificationsService;
exports.pushNotificationsService = new PushNotificationsService();
//# sourceMappingURL=push-notifications.service.js.map