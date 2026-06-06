"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
const audit_1 = require("../../utils/audit");
class AuthController {
    async register(req, res) {
        const user = await auth_service_1.authService.register(req.body);
        (0, response_1.sendCreated)(res, user);
    }
    async login(req, res) {
        const ip = (0, audit_1.getClientIp)(req);
        const userAgent = req.headers['user-agent'];
        const result = await auth_service_1.authService.login(req.body, ip, userAgent);
        (0, response_1.sendSuccess)(res, result);
    }
    async refresh(req, res) {
        const ip = (0, audit_1.getClientIp)(req);
        const userAgent = req.headers['user-agent'];
        const result = await auth_service_1.authService.refreshAccessToken(req.body.refreshToken, ip, userAgent);
        (0, response_1.sendSuccess)(res, result);
    }
    async logout(req, res) {
        await auth_service_1.authService.logout(req.body.refreshToken);
        (0, response_1.sendSuccess)(res, { message: 'Logged out successfully' });
    }
    async me(req, res) {
        const profile = await auth_service_1.authService.getProfile(req.user.userId);
        (0, response_1.sendSuccess)(res, profile);
    }
    async changePassword(req, res) {
        const result = await auth_service_1.authService.changePassword(req.user.userId, req.body);
        (0, response_1.sendSuccess)(res, result);
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map