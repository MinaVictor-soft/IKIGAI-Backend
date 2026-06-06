"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../../config/database"));
const env_1 = require("../../config/env");
const errorHandler_1 = require("../../middleware/errorHandler");
const notifications_service_1 = require("../notifications/notifications.service");
const push_notifications_service_1 = require("../push-notifications/push-notifications.service");
class AdminService {
    // ============ SESSIONS ============
    async createSession(input) {
        const qrToken = (0, uuid_1.v4)();
        return database_1.default.conferenceSession.create({
            data: {
                title: input.title,
                description: input.description,
                speaker: input.speaker,
                location: input.location,
                sessionDate: new Date(input.sessionDate),
                startTime: new Date(input.startTime),
                endTime: new Date(input.endTime),
                qrToken,
                xpReward: input.xpReward,
                maxCapacity: input.maxCapacity,
                attendanceBufferMinutes: input.attendanceBufferMinutes,
            },
        });
    }
    async getSessions(date) {
        return database_1.default.conferenceSession.findMany({
            where: date ? { sessionDate: new Date(date) } : undefined,
            include: { _count: { select: { attendance: true } } },
            orderBy: { startTime: 'asc' },
        });
    }
    async updateSession(sessionId, input) {
        const session = await database_1.default.conferenceSession.findUnique({ where: { id: sessionId } });
        if (!session)
            throw new errorHandler_1.AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
        const data = {};
        if (input.title !== undefined)
            data.title = input.title;
        if (input.description !== undefined)
            data.description = input.description;
        if (input.speaker !== undefined)
            data.speaker = input.speaker;
        if (input.location !== undefined)
            data.location = input.location;
        if (input.sessionDate !== undefined)
            data.sessionDate = new Date(input.sessionDate);
        if (input.startTime !== undefined)
            data.startTime = new Date(input.startTime);
        if (input.endTime !== undefined)
            data.endTime = new Date(input.endTime);
        if (input.xpReward !== undefined)
            data.xpReward = input.xpReward;
        if (input.maxCapacity !== undefined)
            data.maxCapacity = input.maxCapacity;
        return database_1.default.conferenceSession.update({ where: { id: sessionId }, data });
    }
    async updateSessionStatus(sessionId, status) {
        const session = await database_1.default.conferenceSession.findUnique({ where: { id: sessionId } });
        if (!session)
            throw new errorHandler_1.AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
        // Regenerate QR token when activating
        const data = { status };
        if (status === 'ACTIVE') {
            data.qrToken = (0, uuid_1.v4)();
        }
        if (status === 'COMPLETED' || status === 'CANCELLED') {
            data.qrToken = (0, uuid_1.v4)(); // Invalidate QR
        }
        const updatedSession = await database_1.default.conferenceSession.update({
            where: { id: sessionId },
            data,
        });
        // Create notifications when session is activated/published
        if (status === 'ACTIVE' && session.status !== 'ACTIVE') {
            try {
                const users = await database_1.default.user.findMany({
                    where: { status: 'ACTIVE' },
                    select: { id: true },
                });
                const userIds = users.map(u => u.id);
                if (userIds.length > 0) {
                    await notifications_service_1.notificationsService.createBulkNotifications(userIds, 'EVENT_CREATED', '📅 جلسة جديدة!', `${updatedSession.title} • ${new Date(updatedSession.startTime).toLocaleString('ar-EG')}`, {
                        sessionId: updatedSession.id,
                        title: updatedSession.title,
                        startTime: updatedSession.startTime,
                        speaker: updatedSession.speaker,
                    });
                    // Send push notifications
                    await push_notifications_service_1.pushNotificationsService.sendBroadcastNotification('📅 جلسة جديدة!', `${updatedSession.title} • ${new Date(updatedSession.startTime).toLocaleString('ar-EG')}`, {
                        sessionId: updatedSession.id,
                        title: updatedSession.title,
                        startTime: updatedSession.startTime,
                        speaker: updatedSession.speaker,
                        type: 'EVENT_CREATED',
                    });
                }
            }
            catch (error) {
                console.error('Error creating notifications when publishing session:', error);
            }
        }
        return updatedSession;
    }
    async regenerateQrToken(sessionId) {
        const session = await database_1.default.conferenceSession.findUnique({ where: { id: sessionId } });
        if (!session)
            throw new errorHandler_1.AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
        return database_1.default.conferenceSession.update({
            where: { id: sessionId },
            data: { qrToken: (0, uuid_1.v4)() },
        });
    }
    // ============ USERS ============
    async createUser(input) {
        const existing = await database_1.default.user.findFirst({
            where: { email: input.email, deletedAt: null },
        });
        if (existing)
            throw new errorHandler_1.AppError(409, 'EMAIL_EXISTS', 'Email already in use');
        const passwordHash = await bcryptjs_1.default.hash(input.password, env_1.env.BCRYPT_ROUNDS);
        return database_1.default.user.create({
            data: {
                email: input.email,
                passwordHash,
                name: input.name,
                role: input.role,
                church: input.church,
                diocese: input.diocese,
                tribeId: input.tribeId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                church: true,
                diocese: true,
                tribeId: true,
                createdAt: true,
            },
        });
    }
    async resetUserPassword(userId, defaultPassword) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new errorHandler_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
        const newPassword = defaultPassword || 'Ikigai@2026';
        const passwordHash = await bcryptjs_1.default.hash(newPassword, env_1.env.BCRYPT_ROUNDS);
        await database_1.default.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        return { message: `Password reset for ${user.name}`, email: user.email, newPassword };
    }
    async getUsers(role, page = 1, limit = 50) {
        const where = { deletedAt: null };
        if (role)
            where.role = role;
        const [users, total] = await Promise.all([
            database_1.default.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    church: true,
                    diocese: true,
                    totalXp: true,
                    status: true,
                    tribe: { select: { id: true, name: true } },
                    level: { select: { id: true, name: true, color: true } },
                    createdAt: true,
                },
                orderBy: { totalXp: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            database_1.default.user.count({ where }),
        ]);
        // Compute sportsXp for each user
        const userIds = users.map((u) => u.id);
        const sportsXpRows = await database_1.default.xpTransaction.groupBy({
            by: ['userId'],
            where: { userId: { in: userIds }, sourceType: 'SPORTS' },
            _sum: { amount: true },
        });
        const sportsXpMap = {};
        for (const row of sportsXpRows) {
            sportsXpMap[row.userId] = row._sum.amount || 0;
        }
        const usersWithXp = users.map((u) => ({
            ...u,
            sportsXp: sportsXpMap[u.id] || 0,
            conferenceXp: u.totalXp - (sportsXpMap[u.id] || 0),
        }));
        return { users: usersWithXp, total };
    }
    async assignTribe(userId, tribeId) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new errorHandler_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
        // Update tribe member counts
        await database_1.default.$transaction(async (tx) => {
            // Decrement old tribe
            if (user.tribeId) {
                await tx.tribe.update({
                    where: { id: user.tribeId },
                    data: {
                        memberCount: { decrement: 1 },
                        totalXp: { decrement: user.totalXp },
                    },
                });
            }
            // Increment new tribe
            if (tribeId) {
                await tx.tribe.update({
                    where: { id: tribeId },
                    data: {
                        memberCount: { increment: 1 },
                        totalXp: { increment: user.totalXp },
                    },
                });
            }
            await tx.user.update({
                where: { id: userId },
                data: { tribeId },
            });
        });
        return { userId, tribeId };
    }
    async changeUserRole(userId, newRole) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new errorHandler_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
        // Prevent changing SUPER_ADMIN roles
        if (user.role === 'SUPER_ADMIN') {
            throw new errorHandler_1.AppError(403, 'CANNOT_MODIFY_SUPER_ADMIN', 'Cannot change super admin role');
        }
        // Validate new role
        const validRoles = ['ATTENDEE', 'STAFF', 'ADMIN', 'SUPER_ADMIN'];
        if (!validRoles.includes(newRole)) {
            throw new errorHandler_1.AppError(400, 'INVALID_ROLE', 'Invalid role provided');
        }
        const updated = await database_1.default.user.update({
            where: { id: userId },
            data: { role: newRole },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                updatedAt: true,
            },
        });
        return updated;
    }
    // ============ TRIBES ============
    async createTribe(input) {
        return database_1.default.tribe.create({ data: input });
    }
    async getTribes() {
        return database_1.default.tribe.findMany({
            include: { _count: { select: { members: true } } },
            orderBy: { totalXp: 'desc' },
        });
    }
    async updateTribe(tribeId, input) {
        const tribe = await database_1.default.tribe.findUnique({ where: { id: tribeId } });
        if (!tribe)
            throw new errorHandler_1.AppError(404, 'TRIBE_NOT_FOUND', 'Tribe not found');
        return database_1.default.tribe.update({
            where: { id: tribeId },
            data: input,
        });
    }
    // ============ DASHBOARD STATS ============
    async getDashboardStats() {
        const [totalUsers, totalAttendance, totalXpAwarded, activeSessions, activeQuizzes,] = await Promise.all([
            database_1.default.user.count({ where: { deletedAt: null, role: 'ATTENDEE' } }),
            database_1.default.attendance.count(),
            database_1.default.xpTransaction.aggregate({ _sum: { amount: true } }),
            database_1.default.conferenceSession.count({ where: { status: 'ACTIVE' } }),
            database_1.default.quiz.count({ where: { status: 'ACTIVE' } }),
        ]);
        return {
            totalUsers,
            totalAttendance,
            totalXpAwarded: totalXpAwarded._sum.amount || 0,
            activeSessions,
            activeQuizzes,
        };
    }
    // ============ BULK OPERATIONS ============
    async softDeleteAllAttendees() {
        const result = await database_1.default.user.updateMany({
            where: { role: 'ATTENDEE', deletedAt: null },
            data: { deletedAt: new Date(), status: 'SUSPENDED' },
        });
        return { deletedCount: result.count };
    }
    async deleteUser(userId) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new errorHandler_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
        if (user.role === 'SUPER_ADMIN')
            throw new errorHandler_1.AppError(403, 'FORBIDDEN', 'Cannot delete super admin');
        // Soft delete
        await database_1.default.user.update({
            where: { id: userId },
            data: { deletedAt: new Date(), status: 'SUSPENDED' },
        });
        // Decrement tribe member count
        if (user.tribeId) {
            await database_1.default.tribe.update({
                where: { id: user.tribeId },
                data: { memberCount: { decrement: 1 } },
            });
        }
        return { message: `User ${user.name} (${user.email}) deleted` };
    }
    async adjustUserXp(userId, amount, reason, adminId) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new errorHandler_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
        const newTotal = Math.max(0, user.totalXp + amount);
        await database_1.default.xpTransaction.create({
            data: {
                userId,
                amount,
                type: amount >= 0 ? 'REWARD' : 'PENALTY',
                sourceType: 'ADMIN',
                description: reason,
                awardedBy: adminId,
            },
        });
        // Auto-assign level based on new XP
        const level = await database_1.default.level.findFirst({
            where: { minXp: { lte: newTotal } },
            orderBy: { minXp: 'desc' },
        });
        const updated = await database_1.default.user.update({
            where: { id: userId },
            data: { totalXp: newTotal, levelId: level?.id ?? null },
            select: { id: true, name: true, totalXp: true },
        });
        // Update tribe XP
        if (user.tribeId) {
            await database_1.default.tribe.update({
                where: { id: user.tribeId },
                data: { totalXp: { increment: amount } },
            });
        }
        return updated;
    }
    async getUserDetail(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                church: true,
                diocese: true,
                phone: true,
                totalXp: true,
                status: true,
                userQrToken: true,
                languagePreference: true,
                lastLoginAt: true,
                createdAt: true,
                tribe: { select: { id: true, name: true, color: true } },
                level: { select: { id: true, name: true } },
            },
        });
        if (!user)
            throw new errorHandler_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
        // Compute sportsXp
        const sportsXpResult = await database_1.default.xpTransaction.aggregate({
            where: { userId, sourceType: 'SPORTS' },
            _sum: { amount: true },
        });
        const sportsXp = sportsXpResult._sum.amount || 0;
        return {
            ...user,
            sportsXp,
            conferenceXp: user.totalXp - sportsXp,
        };
    }
    async getUserActivity(userId) {
        const [attendance, quizSubmissions, bonusClaims, xpTransactions] = await Promise.all([
            database_1.default.attendance.findMany({
                where: { userId },
                include: { session: { select: { id: true, title: true, speaker: true, sessionDate: true } } },
                orderBy: { scannedAt: 'desc' },
            }),
            database_1.default.quizSubmission.findMany({
                where: { userId },
                include: { quiz: { select: { id: true, title: true } } },
                orderBy: { submittedAt: 'desc' },
            }),
            database_1.default.bonusClaim.findMany({
                where: { userId },
                include: { bonusQr: { select: { id: true, label: true, amount: true } } },
                orderBy: { claimedAt: 'desc' },
            }),
            database_1.default.xpTransaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        // Split XP transactions by source type
        const staffAwards = xpTransactions.filter(t => t.sourceType === 'STAFF_AWARD');
        const sportsTransactions = xpTransactions.filter(t => t.sourceType === 'SPORTS');
        const adminAdjustments = xpTransactions.filter(t => t.sourceType === 'ADMIN');
        return { attendance, quizSubmissions, bonusClaims, staffAwards, sportsTransactions, adminAdjustments, xpTransactions };
    }
    async getBonusQrClaims(bonusQrId) {
        return database_1.default.bonusClaim.findMany({
            where: { bonusQrId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { claimedAt: 'desc' },
        });
    }
    // ============ QUIZZES ============
    async getAllQuizzes() {
        return database_1.default.quiz.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { questions: true, submissions: true } },
            },
        });
    }
    async getQuizDetail(quizId) {
        const quiz = await database_1.default.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: { orderBy: { displayOrder: 'asc' } },
                _count: { select: { submissions: true } },
            },
        });
        if (!quiz)
            throw new errorHandler_1.AppError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
        // Get submission stats
        const submissions = await database_1.default.quizSubmission.findMany({
            where: { quizId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { submittedAt: 'desc' },
        });
        const passed = submissions.filter(s => s.passed).length;
        const failed = submissions.filter(s => !s.passed).length;
        const avgScore = submissions.length > 0
            ? submissions.reduce((sum, s) => sum + Number(s.percentage), 0) / submissions.length
            : 0;
        return {
            ...quiz,
            stats: { total: submissions.length, passed, failed, avgScore: Math.round(avgScore * 10) / 10 },
            submissions,
        };
    }
    async deleteQuizQuestion(quizId, questionId) {
        await database_1.default.quizQuestion.delete({ where: { id: questionId } });
        await database_1.default.quiz.update({
            where: { id: quizId },
            data: { questionCount: { decrement: 1 } },
        });
    }
    // ============ SESSION STATS ============
    async getSessionDetail(sessionId) {
        const session = await database_1.default.conferenceSession.findUnique({
            where: { id: sessionId },
            include: { _count: { select: { attendance: true } } },
        });
        if (!session)
            throw new errorHandler_1.AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
        const attendance = await database_1.default.attendance.findMany({
            where: { sessionId },
            include: { user: { select: { id: true, name: true, email: true, tribe: { select: { name: true, color: true } } } } },
            orderBy: { scannedAt: 'desc' },
        });
        return { ...session, attendance };
    }
    // ============ LEVELS ============
    async getLevels() {
        return database_1.default.level.findMany({
            orderBy: { displayOrder: 'asc' },
            include: { _count: { select: { users: true } } },
        });
    }
    async createLevel(data) {
        return database_1.default.level.create({ data });
    }
    async updateLevel(levelId, data) {
        return database_1.default.level.update({ where: { id: levelId }, data });
    }
    async deleteLevel(levelId) {
        // Unassign users from this level first
        await database_1.default.user.updateMany({ where: { levelId }, data: { levelId: null } });
        return database_1.default.level.delete({ where: { id: levelId } });
    }
    /**
     * Recalculate level for a given user based on their totalXp.
     * Finds the highest level where user's XP >= minXp.
     */
    async recalculateUserLevel(userId) {
        const user = await database_1.default.user.findUnique({ where: { id: userId }, select: { totalXp: true } });
        if (!user)
            return;
        const level = await database_1.default.level.findFirst({
            where: { minXp: { lte: user.totalXp } },
            orderBy: { minXp: 'desc' },
        });
        await database_1.default.user.update({
            where: { id: userId },
            data: { levelId: level?.id ?? null },
        });
    }
    /**
     * Recalculate levels for ALL users
     */
    async recalculateAllLevels() {
        const levels = await database_1.default.level.findMany({ orderBy: { minXp: 'desc' } });
        if (levels.length === 0)
            return { updated: 0 };
        const users = await database_1.default.user.findMany({
            where: { role: 'ATTENDEE', deletedAt: null },
            select: { id: true, totalXp: true },
        });
        let updated = 0;
        for (const user of users) {
            const level = levels.find(l => user.totalXp >= l.minXp);
            const newLevelId = level?.id ?? null;
            await database_1.default.user.update({
                where: { id: user.id },
                data: { levelId: newLevelId },
            });
            updated++;
        }
        return { updated };
    }
    async getSystemConfig() {
        const configs = await database_1.default.systemConfig.findMany({ orderBy: { category: 'asc' } });
        return configs.reduce((acc, c) => {
            acc[c.key] = { value: c.value, description: c.description, category: c.category };
            return acc;
        }, {});
    }
    async updateSystemConfig(key, value, updatedBy) {
        return database_1.default.systemConfig.update({
            where: { key },
            data: { value, updatedBy },
        });
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
//# sourceMappingURL=admin.service.js.map