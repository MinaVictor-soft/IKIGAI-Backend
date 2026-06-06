"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceController = exports.AttendanceController = void 0;
const attendance_service_1 = require("./attendance.service");
const response_1 = require("../../utils/response");
const params_1 = require("../../utils/params");
const database_1 = __importDefault(require("../../config/database"));
class AttendanceController {
    async getActiveSessions(req, res) {
        const sessions = await database_1.default.conferenceSession.findMany({
            where: { status: { in: ['SCHEDULED', 'ACTIVE'] } },
            select: { id: true, title: true, description: true, speaker: true, location: true, sessionDate: true, startTime: true, endTime: true, xpReward: true, status: true },
            orderBy: { startTime: 'asc' },
        });
        (0, response_1.sendSuccess)(res, sessions);
    }
    async scan(req, res) {
        const result = await attendance_service_1.attendanceService.scanQr(req.user.userId, req.body.qrToken);
        (0, response_1.sendSuccess)(res, result);
    }
    async myAttendance(req, res) {
        const attendance = await attendance_service_1.attendanceService.getUserAttendance(req.user.userId);
        (0, response_1.sendSuccess)(res, attendance);
    }
    async sessionAttendance(req, res) {
        const attendance = await attendance_service_1.attendanceService.getSessionAttendance((0, params_1.getParam)(req, 'sessionId'));
        (0, response_1.sendSuccess)(res, attendance);
    }
}
exports.AttendanceController = AttendanceController;
exports.attendanceController = new AttendanceController();
//# sourceMappingURL=attendance.controller.js.map