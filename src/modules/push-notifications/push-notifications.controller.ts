import { Request, Response } from 'express';
import { pushNotificationsService } from './push-notifications.service';

export class PushNotificationsController {
  async registerToken(req: Request, res: Response) {
    try {
      const userId = (req.user as any).userId;
      const { pushToken, deviceId } = req.body;

      if (!pushToken) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'Push token is required' },
        });
      }

      const registered = await pushNotificationsService.registerPushToken(userId, pushToken, deviceId);

      if (!registered) {
        return res.status(500).json({
          success: false,
          error: { code: 'REGISTRATION_FAILED', message: 'Failed to register push token' },
        });
      }

      res.json({
        success: true,
        data: { message: 'Push token registered successfully' },
      });
    } catch (error) {
      console.error('Error registering push token:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to register push token' },
      });
    }
  }

  async deactivateToken(req: Request, res: Response) {
    try {
      const { pushToken } = req.body;

      if (!pushToken) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'Push token is required' },
        });
      }

      await pushNotificationsService.deactivatePushToken(pushToken);

      res.json({
        success: true,
        data: { message: 'Push token deactivated' },
      });
    } catch (error) {
      console.error('Error deactivating push token:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to deactivate push token' },
      });
    }
  }
}

export const pushNotificationsController = new PushNotificationsController();
