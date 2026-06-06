"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bonusController = exports.BonusController = void 0;
const bonus_service_1 = require("./bonus.service");
const response_1 = require("../../utils/response");
const params_1 = require("../../utils/params");
class BonusController {
    async createQr(req, res) {
        const qr = await bonus_service_1.bonusService.createBonusQr(req.user.userId, req.body);
        (0, response_1.sendCreated)(res, qr);
    }
    async claim(req, res) {
        const result = await bonus_service_1.bonusService.claimBonus(req.user.userId, req.body.token);
        (0, response_1.sendSuccess)(res, result);
    }
    async staffAward(req, res) {
        const result = await bonus_service_1.bonusService.staffAward(req.user.userId, req.body);
        (0, response_1.sendSuccess)(res, result);
    }
    async myQrs(req, res) {
        const qrs = await bonus_service_1.bonusService.getMyBonusQrs(req.user.userId);
        (0, response_1.sendSuccess)(res, qrs);
    }
    async deactivate(req, res) {
        const qr = await bonus_service_1.bonusService.deactivateQr((0, params_1.getParam)(req, 'qrId'), req.user.userId);
        (0, response_1.sendSuccess)(res, qr);
    }
}
exports.BonusController = BonusController;
exports.bonusController = new BonusController();
//# sourceMappingURL=bonus.controller.js.map