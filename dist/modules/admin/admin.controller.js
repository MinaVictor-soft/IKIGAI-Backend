"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
const response_1 = require("../../utils/response");
const params_1 = require("../../utils/params");
class AdminController {
    // Sessions
    async createSession(req, res) {
        const session = await admin_service_1.adminService.createSession(req.body);
        (0, response_1.sendCreated)(res, session);
    }
    async getSessions(req, res) {
        const sessions = await admin_service_1.adminService.getSessions((0, params_1.getQuery)(req, 'date'));
        (0, response_1.sendSuccess)(res, sessions);
    }
    async updateSession(req, res) {
        const session = await admin_service_1.adminService.updateSession((0, params_1.getParam)(req, 'sessionId'), req.body);
        (0, response_1.sendSuccess)(res, session);
    }
    async updateSessionStatus(req, res) {
        const session = await admin_service_1.adminService.updateSessionStatus((0, params_1.getParam)(req, 'sessionId'), req.body.status);
        (0, response_1.sendSuccess)(res, session);
    }
    async regenerateQr(req, res) {
        const session = await admin_service_1.adminService.regenerateQrToken((0, params_1.getParam)(req, 'sessionId'));
        (0, response_1.sendSuccess)(res, { qrToken: session.qrToken });
    }
    // Users
    async createUser(req, res) {
        const user = await admin_service_1.adminService.createUser(req.body);
        (0, response_1.sendCreated)(res, user);
    }
    async getUsers(req, res) {
        const page = parseInt((0, params_1.getQuery)(req, 'page') || '1', 10);
        const limit = parseInt((0, params_1.getQuery)(req, 'limit') || '50', 10);
        const { users, total } = await admin_service_1.adminService.getUsers((0, params_1.getQuery)(req, 'role'), page, limit);
        (0, response_1.sendPaginated)(res, users, { page, limit, total });
    }
    async assignTribe(req, res) {
        const result = await admin_service_1.adminService.assignTribe((0, params_1.getParam)(req, 'userId'), req.body.tribeId);
        (0, response_1.sendSuccess)(res, result);
    }
    async changeUserRole(req, res) {
        const result = await admin_service_1.adminService.changeUserRole((0, params_1.getParam)(req, 'userId'), req.body.role);
        (0, response_1.sendSuccess)(res, result);
    }
    async resetUserPassword(req, res) {
        const result = await admin_service_1.adminService.resetUserPassword((0, params_1.getParam)(req, 'userId'), req.body?.defaultPassword);
        (0, response_1.sendSuccess)(res, result);
    }
    async deleteUser(req, res) {
        const result = await admin_service_1.adminService.deleteUser((0, params_1.getParam)(req, 'userId'));
        (0, response_1.sendSuccess)(res, result);
    }
    // Tribes
    async createTribe(req, res) {
        const tribe = await admin_service_1.adminService.createTribe(req.body);
        (0, response_1.sendCreated)(res, tribe);
    }
    async getTribes(req, res) {
        const tribes = await admin_service_1.adminService.getTribes();
        (0, response_1.sendSuccess)(res, tribes);
    }
    async updateTribe(req, res) {
        const tribe = await admin_service_1.adminService.updateTribe((0, params_1.getParam)(req, 'tribeId'), req.body);
        (0, response_1.sendSuccess)(res, tribe);
    }
    // Dashboard
    async stats(req, res) {
        const stats = await admin_service_1.adminService.getDashboardStats();
        (0, response_1.sendSuccess)(res, stats);
    }
    async deleteAllAttendees(req, res) {
        const result = await admin_service_1.adminService.softDeleteAllAttendees();
        (0, response_1.sendSuccess)(res, result);
    }
    async adjustXp(req, res) {
        const result = await admin_service_1.adminService.adjustUserXp((0, params_1.getParam)(req, 'userId'), req.body.amount, req.body.reason, req.user.userId);
        (0, response_1.sendSuccess)(res, result);
    }
    async getUserDetail(req, res) {
        const user = await admin_service_1.adminService.getUserDetail((0, params_1.getParam)(req, 'userId'));
        (0, response_1.sendSuccess)(res, user);
    }
    async getUserActivity(req, res) {
        const activity = await admin_service_1.adminService.getUserActivity((0, params_1.getParam)(req, 'userId'));
        (0, response_1.sendSuccess)(res, activity);
    }
    async getBonusQrClaims(req, res) {
        const claims = await admin_service_1.adminService.getBonusQrClaims((0, params_1.getParam)(req, 'bonusQrId'));
        (0, response_1.sendSuccess)(res, claims);
    }
    // Quizzes
    async getAllQuizzes(req, res) {
        const quizzes = await admin_service_1.adminService.getAllQuizzes();
        (0, response_1.sendSuccess)(res, quizzes);
    }
    async getQuizDetail(req, res) {
        const quiz = await admin_service_1.adminService.getQuizDetail((0, params_1.getParam)(req, 'quizId'));
        (0, response_1.sendSuccess)(res, quiz);
    }
    async deleteQuizQuestion(req, res) {
        await admin_service_1.adminService.deleteQuizQuestion((0, params_1.getParam)(req, 'quizId'), (0, params_1.getParam)(req, 'questionId'));
        (0, response_1.sendSuccess)(res, { deleted: true });
    }
    // Session detail
    async getSessionDetail(req, res) {
        const session = await admin_service_1.adminService.getSessionDetail((0, params_1.getParam)(req, 'sessionId'));
        (0, response_1.sendSuccess)(res, session);
    }
    // Levels
    async getLevels(req, res) {
        const levels = await admin_service_1.adminService.getLevels();
        (0, response_1.sendSuccess)(res, levels);
    }
    async createLevel(req, res) {
        const level = await admin_service_1.adminService.createLevel(req.body);
        (0, response_1.sendCreated)(res, level);
    }
    async updateLevel(req, res) {
        const level = await admin_service_1.adminService.updateLevel((0, params_1.getParam)(req, 'levelId'), req.body);
        (0, response_1.sendSuccess)(res, level);
    }
    async deleteLevel(req, res) {
        await admin_service_1.adminService.deleteLevel((0, params_1.getParam)(req, 'levelId'));
        (0, response_1.sendSuccess)(res, { deleted: true });
    }
    async recalculateAllLevels(req, res) {
        const result = await admin_service_1.adminService.recalculateAllLevels();
        (0, response_1.sendSuccess)(res, result);
    }
    // System Config
    async getSystemConfig(req, res) {
        const config = await admin_service_1.adminService.getSystemConfig();
        (0, response_1.sendSuccess)(res, config);
    }
    async updateSystemConfig(req, res) {
        const key = req.params.key;
        const { value } = req.body;
        const userId = req.user.userId;
        const config = await admin_service_1.adminService.updateSystemConfig(key, value, userId);
        (0, response_1.sendSuccess)(res, config);
    }
    // Admin Settings
    async getAdminSettings(req, res) {
        const settings = await admin_service_1.adminService.getAdminSettings();
        (0, response_1.sendSuccess)(res, settings);
    }
    async updateAdminSettings(req, res) {
        const settings = await admin_service_1.adminService.updateAdminSettings(req.body);
        (0, response_1.sendSuccess)(res, settings);
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
//# sourceMappingURL=admin.controller.js.map