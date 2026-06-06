"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xpService = exports.XpService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
class XpService {
    /**
     * Award XP within a transaction context.
     * Used by other services (attendance, quiz, bonus) to award XP atomically.
     */
    async awardXp(tx, params) {
        // Create transaction record
        const xpTransaction = await tx.xpTransaction.create({
            data: {
                userId: params.userId,
                amount: params.amount,
                type: params.type,
                sourceType: params.sourceType,
                sourceId: params.sourceId,
                description: params.description,
                awardedBy: params.awardedBy,
            },
        });
        // Update user's total XP (atomic increment)
        const updatedUser = await tx.user.update({
            where: { id: params.userId },
            data: { totalXp: { increment: params.amount } },
            select: { totalXp: true },
        });
        // Update tribe XP if user belongs to one
        const user = await tx.user.findUnique({
            where: { id: params.userId },
            select: { tribeId: true },
        });
        if (user?.tribeId) {
            await tx.tribe.update({
                where: { id: user.tribeId },
                data: { totalXp: { increment: params.amount } },
            });
        }
        // Auto-assign level based on new XP
        const level = await tx.level.findFirst({
            where: { minXp: { lte: updatedUser.totalXp } },
            orderBy: { minXp: 'desc' },
        });
        await tx.user.update({
            where: { id: params.userId },
            data: { levelId: level?.id ?? null },
        });
        return xpTransaction;
    }
    /**
     * Admin manual award — with self-award and daily cap checks
     */
    async adminAward(adminId, userId, amount, description) {
        // Self-award prevention
        if (adminId === userId) {
            throw new errorHandler_1.AppError(422, 'CANNOT_REWARD_SELF', 'You cannot award XP to yourself');
        }
        // Check user exists
        const targetUser = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!targetUser || targetUser.deletedAt) {
            throw new errorHandler_1.AppError(404, 'USER_NOT_FOUND', 'Target user not found');
        }
        // Check admin daily cap
        const admin = await database_1.default.user.findUnique({ where: { id: adminId } });
        if (admin?.role === 'ADMIN') {
            // Per-award cap: 100
            if (amount > 100) {
                throw new errorHandler_1.AppError(403, 'AMOUNT_EXCEEDS_LIMIT', 'ADMIN can award maximum 100 XP per award');
            }
            // Daily cap: 500
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayAwards = await database_1.default.xpTransaction.aggregate({
                where: {
                    awardedBy: adminId,
                    sourceType: { in: ['ADMIN', 'STAFF_AWARD'] },
                    createdAt: { gte: todayStart },
                },
                _sum: { amount: true },
            });
            const totalToday = todayAwards._sum.amount || 0;
            if (totalToday + amount > 500) {
                throw new errorHandler_1.AppError(429, 'DAILY_LIMIT_REACHED', `Daily award limit reached. Remaining: ${500 - totalToday} XP`);
            }
        }
        // Award XP
        const result = await database_1.default.$transaction(async (tx) => {
            return this.awardXp(tx, {
                userId,
                amount,
                type: 'MANUAL',
                sourceType: 'ADMIN',
                description: description || 'Manual admin award',
                awardedBy: adminId,
            });
        });
        return result;
    }
    async getUserRank(userId) {
        const user = await database_1.default.user.findUnique({ where: { id: userId }, select: { totalXp: true } });
        if (!user)
            return { rank: 0, total: 0 };
        const rank = await database_1.default.user.count({
            where: { role: 'ATTENDEE', status: 'ACTIVE', deletedAt: null, totalXp: { gt: user.totalXp } },
        });
        const total = await database_1.default.user.count({ where: { role: 'ATTENDEE', status: 'ACTIVE', deletedAt: null } });
        return { rank: rank + 1, total };
    }
    async getLeaderboard(limit = 50) {
        const users = await database_1.default.user.findMany({
            where: { role: 'ATTENDEE', status: 'ACTIVE', deletedAt: null },
            select: {
                id: true,
                name: true,
                avatarUrl: true,
                totalXp: true,
                tribe: { select: { id: true, name: true, color: true } },
                level: { select: { name: true, badgeUrl: true } },
            },
            orderBy: { totalXp: 'desc' },
            take: limit,
        });
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
        return users.map((u) => ({
            ...u,
            sportsXp: sportsXpMap[u.id] || 0,
            conferenceXp: u.totalXp - (sportsXpMap[u.id] || 0),
        }));
    }
    async getTribeLeaderboard() {
        return database_1.default.tribe.findMany({
            select: {
                id: true,
                name: true,
                color: true,
                totalXp: true,
                memberCount: true,
            },
            orderBy: { totalXp: 'desc' },
        });
    }
    async getUserXpHistory(userId, limit = 50) {
        return database_1.default.xpTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}
exports.XpService = XpService;
exports.xpService = new XpService();
//# sourceMappingURL=xp.service.js.map