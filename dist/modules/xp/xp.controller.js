"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xpController = exports.XpController = void 0;
const xp_service_1 = require("./xp.service");
const response_1 = require("../../utils/response");
const params_1 = require("../../utils/params");
const database_1 = __importDefault(require("../../config/database"));
class XpController {
    async getLevels(req, res) {
        const levels = await database_1.default.level.findMany({ orderBy: { minXp: 'asc' } });
        (0, response_1.sendSuccess)(res, levels);
    }
    async award(req, res) {
        const result = await xp_service_1.xpService.adminAward(req.user.userId, req.body.userId, req.body.amount, req.body.description);
        (0, response_1.sendSuccess)(res, result);
    }
    async myRank(req, res) {
        const data = await xp_service_1.xpService.getUserRank(req.user.userId);
        (0, response_1.sendSuccess)(res, data);
    }
    async leaderboard(req, res) {
        const limit = parseInt((0, params_1.getQuery)(req, 'limit') || '50', 10);
        const data = await xp_service_1.xpService.getLeaderboard(limit);
        (0, response_1.sendSuccess)(res, data);
    }
    async tribeLeaderboard(req, res) {
        const data = await xp_service_1.xpService.getTribeLeaderboard();
        (0, response_1.sendSuccess)(res, data);
    }
    async myHistory(req, res) {
        const limit = parseInt((0, params_1.getQuery)(req, 'limit') || '50', 10);
        const data = await xp_service_1.xpService.getUserXpHistory(req.user.userId, limit);
        (0, response_1.sendSuccess)(res, data);
    }
    async userHistory(req, res) {
        const limit = parseInt((0, params_1.getQuery)(req, 'limit') || '50', 10);
        const data = await xp_service_1.xpService.getUserXpHistory((0, params_1.getParam)(req, 'userId'), limit);
        (0, response_1.sendSuccess)(res, data);
    }
}
exports.XpController = XpController;
exports.xpController = new XpController();
//# sourceMappingURL=xp.controller.js.map