"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushNotificationsController = exports.PushNotificationsController = void 0;
const push_notifications_service_1 = require("./push-notifications.service");
class PushNotificationsController {
    async registerToken(req, res) {
        try {
            const userId = req.user.userId;
            const { pushToken, deviceId } = req.body;
            if (!pushToken) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_REQUEST', message: 'Push token is required' },
                });
            }
            const registered = await push_notifications_service_1.pushNotificationsService.registerPushToken(userId, pushToken, deviceId);
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
        }
        catch (error) {
            console.error('Error registering push token:', error);
            res.status(500).json({
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Failed to register push token' },
            });
        }
    }
    async deactivateToken(req, res) {
        try {
            const { pushToken } = req.body;
            if (!pushToken) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_REQUEST', message: 'Push token is required' },
                });
            }
            await push_notifications_service_1.pushNotificationsService.deactivatePushToken(pushToken);
            res.json({
                success: true,
                data: { message: 'Push token deactivated' },
            });
        }
        catch (error) {
            console.error('Error deactivating push token:', error);
            res.status(500).json({
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Failed to deactivate push token' },
            });
        }
    }
}
exports.PushNotificationsController = PushNotificationsController;
exports.pushNotificationsController = new PushNotificationsController();
//# sourceMappingURL=push-notifications.controller.js.map