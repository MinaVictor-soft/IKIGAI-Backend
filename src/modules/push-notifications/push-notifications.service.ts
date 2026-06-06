import prisma from '../../config/database';
import axios from 'axios';

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

export interface SendPushNotificationDTO {
  pushTokens: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class PushNotificationsService {
  async registerPushToken(userId: string, pushToken: string, deviceName?: string): Promise<boolean> {
    try {
      await prisma.userPushToken.upsert({
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
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }

  async getUserPushTokens(userId: string): Promise<string[]> {
    try {
      const tokens = await prisma.userPushToken.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: { pushToken: true },
      });
      return tokens.map(t => t.pushToken);
    } catch (error) {
      console.error('Error getting push tokens:', error);
      return [];
    }
  }

  async getAllActivePushTokens(): Promise<string[]> {
    try {
      const tokens = await prisma.userPushToken.findMany({
        where: { isActive: true },
        select: { pushToken: true },
      });
      return tokens.map(t => t.pushToken);
    } catch (error) {
      console.error('Error getting all push tokens:', error);
      return [];
    }
  }

  async sendPushNotification(dto: SendPushNotificationDTO): Promise<boolean> {
    try {
      // Filter valid tokens (must start with ExponentPushToken)
      const validTokens = dto.pushTokens.filter(
        token => token.startsWith('ExponentPushToken[') || token.includes('ExponentPushToken')
      );

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
          await axios.post(EXPO_PUSH_API, chunk, {
            timeout: 10000,
          });
        } catch (error) {
          console.error('Error sending batch to Expo API:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  async sendBroadcastNotification(title: string, body: string, data?: Record<string, any>): Promise<number> {
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
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      return 0;
    }
  }

  async deactivatePushToken(pushToken: string): Promise<boolean> {
    try {
      await prisma.userPushToken.updateMany({
        where: { pushToken },
        data: { isActive: false },
      });
      return true;
    } catch (error) {
      console.error('Error deactivating push token:', error);
      return false;
    }
  }
}

export const pushNotificationsService = new PushNotificationsService();
