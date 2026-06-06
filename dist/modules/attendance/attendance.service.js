"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceService = exports.AttendanceService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
const xp_service_1 = require("../xp/xp.service");
const client_1 = require("@prisma/client");
class AttendanceService {
    async scanQr(userId, qrToken) {
        // Find session by QR token
        const session = await database_1.default.conferenceSession.findUnique({
            where: { qrToken },
        });
        if (!session) {
            throw new errorHandler_1.AppError(422, 'INVALID_QR_TOKEN', 'This QR code is invalid or has expired. Please scan the current one.');
        }
        if (session.status !== 'ACTIVE') {
            throw new errorHandler_1.AppError(422, 'SESSION_NOT_ACTIVE', 'This session is not currently accepting attendance.');
        }
        // QR is valid as long as session is ACTIVE (until session ends)
        const now = new Date();
        if (now > session.endTime) {
            throw new errorHandler_1.AppError(422, 'OUTSIDE_ATTENDANCE_WINDOW', 'Attendance window has closed for this session.');
        }
        // Determine if late
        const isLate = now > session.endTime;
        // Get XP reward (could be different for late attendance)
        const xpAmount = isLate ? Math.floor(session.xpReward * 0.5) : session.xpReward;
        // Use upsert-style approach to handle concurrent scans safely
        try {
            const result = await database_1.default.$transaction(async (tx) => {
                const attendance = await tx.attendance.create({
                    data: {
                        userId,
                        sessionId: session.id,
                        xpAwarded: xpAmount,
                        isLate,
                    },
                });
                // Award XP
                await xp_service_1.xpService.awardXp(tx, {
                    userId,
                    amount: xpAmount,
                    type: 'ATTENDANCE',
                    sourceType: 'SESSION',
                    sourceId: session.id,
                    description: `Attendance: ${session.title}${isLate ? ' (late)' : ''}`,
                });
                return attendance;
            });
            return {
                alreadyRecorded: false,
                attendance: result,
                session: { id: session.id, title: session.title },
                xpAwarded: xpAmount,
                isLate,
            };
        }
        catch (err) {
            // Handle unique constraint violation (concurrent duplicate scan)
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                const existing = await database_1.default.attendance.findUnique({
                    where: { userId_sessionId: { userId, sessionId: session.id } },
                });
                return {
                    alreadyRecorded: true,
                    attendance: existing,
                    session: { id: session.id, title: session.title },
                };
            }
            throw err;
        }
    }
    async getUserAttendance(userId) {
        return database_1.default.attendance.findMany({
            where: { userId },
            include: {
                session: {
                    select: { id: true, title: true, speaker: true, sessionDate: true, startTime: true },
                },
            },
            orderBy: { scannedAt: 'desc' },
        });
    }
    async getSessionAttendance(sessionId) {
        return database_1.default.attendance.findMany({
            where: { sessionId },
            include: {
                user: { select: { id: true, name: true, email: true, church: true } },
            },
            orderBy: { scannedAt: 'asc' },
        });
    }
}
exports.AttendanceService = AttendanceService;
exports.attendanceService = new AttendanceService();
//# sourceMappingURL=attendance.service.js.map