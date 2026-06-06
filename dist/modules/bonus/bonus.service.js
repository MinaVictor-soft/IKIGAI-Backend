"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bonusService = exports.BonusService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
const xp_service_1 = require("../xp/xp.service");
const client_1 = require("@prisma/client");
class BonusService {
    async createBonusQr(adminId, input) {
        // ADMIN cap: 100 per QR
        const admin = await database_1.default.user.findUnique({ where: { id: adminId } });
        if (admin?.role === 'ADMIN' && input.amount > 100) {
            throw new errorHandler_1.AppError(403, 'AMOUNT_EXCEEDS_LIMIT', 'ADMIN can create QR codes with maximum 100 XP');
        }
        return database_1.default.bonusQrCode.create({
            data: {
                amount: input.amount,
                label: input.label,
                maxClaims: input.maxClaims,
                expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
                createdBy: adminId,
            },
        });
    }
    async claimBonus(userId, token) {
        const bonusQr = await database_1.default.bonusQrCode.findUnique({
            where: { token },
        });
        if (!bonusQr) {
            throw new errorHandler_1.AppError(404, 'BONUS_QR_NOT_FOUND', 'Invalid bonus QR code');
        }
        if (!bonusQr.isActive) {
            throw new errorHandler_1.AppError(422, 'BONUS_QR_INACTIVE', 'This bonus QR code has been deactivated');
        }
        if (bonusQr.expiresAt && bonusQr.expiresAt < new Date()) {
            throw new errorHandler_1.AppError(422, 'BONUS_QR_EXPIRED', 'This bonus QR code has expired');
        }
        if (bonusQr.maxClaims && bonusQr.claimsCount >= bonusQr.maxClaims) {
            throw new errorHandler_1.AppError(422, 'BONUS_QR_MAX_CLAIMS', 'This bonus QR code has reached its maximum claims');
        }
        // Claim + award XP in transaction (unique constraint handles race condition)
        try {
            const result = await database_1.default.$transaction(async (tx) => {
                const xpTx = await xp_service_1.xpService.awardXp(tx, {
                    userId,
                    amount: bonusQr.amount,
                    type: 'BONUS',
                    sourceType: 'BONUS_QR',
                    sourceId: bonusQr.id,
                    description: bonusQr.label || 'Bonus QR claim',
                });
                const claim = await tx.bonusClaim.create({
                    data: {
                        bonusQrId: bonusQr.id,
                        userId,
                        xpTransactionId: xpTx.id,
                    },
                });
                await tx.bonusQrCode.update({
                    where: { id: bonusQr.id },
                    data: { claimsCount: { increment: 1 } },
                });
                return { claim, xpAwarded: bonusQr.amount };
            });
            return result;
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new errorHandler_1.AppError(409, 'ALREADY_CLAIMED', 'You have already claimed this bonus');
            }
            throw err;
        }
    }
    async staffAward(adminId, input) {
        // Find target user by ID or QR token
        const targetUser = input.userId
            ? await database_1.default.user.findFirst({ where: { id: input.userId, deletedAt: null } })
            : await database_1.default.user.findFirst({ where: { userQrToken: input.userQrToken, deletedAt: null } });
        if (!targetUser) {
            throw new errorHandler_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
        }
        // Self-award prevention
        if (adminId === targetUser.id) {
            throw new errorHandler_1.AppError(422, 'CANNOT_REWARD_SELF', 'You cannot award XP to yourself');
        }
        // Check admin caps
        const admin = await database_1.default.user.findUnique({ where: { id: adminId } });
        if (admin?.role === 'ADMIN') {
            if (input.amount > 100) {
                throw new errorHandler_1.AppError(403, 'AMOUNT_EXCEEDS_LIMIT', 'ADMIN can award maximum 100 XP per award');
            }
            // Daily cap
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayAwards = await database_1.default.xpTransaction.aggregate({
                where: {
                    awardedBy: adminId,
                    sourceType: 'STAFF_AWARD',
                    createdAt: { gte: todayStart },
                },
                _sum: { amount: true },
            });
            const totalToday = todayAwards._sum.amount || 0;
            if (totalToday + input.amount > 500) {
                throw new errorHandler_1.AppError(429, 'DAILY_LIMIT_REACHED', `Daily award limit reached. Remaining: ${500 - totalToday} XP`);
            }
        }
        // Award XP
        const result = await database_1.default.$transaction(async (tx) => {
            return xp_service_1.xpService.awardXp(tx, {
                userId: targetUser.id,
                amount: input.amount,
                type: 'BONUS',
                sourceType: 'STAFF_AWARD',
                description: input.reason,
                awardedBy: adminId,
            });
        });
        return { xpTransaction: result, user: { id: targetUser.id, name: targetUser.name } };
    }
    async getMyBonusQrs(adminId) {
        return database_1.default.bonusQrCode.findMany({
            where: { createdBy: adminId },
            include: { _count: { select: { claims: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deactivateQr(qrId, adminId) {
        const qr = await database_1.default.bonusQrCode.findUnique({ where: { id: qrId } });
        if (!qr)
            throw new errorHandler_1.AppError(404, 'BONUS_QR_NOT_FOUND', 'Bonus QR not found');
        return database_1.default.bonusQrCode.update({
            where: { id: qrId },
            data: { isActive: false },
        });
    }
}
exports.BonusService = BonusService;
exports.bonusService = new BonusService();
//# sourceMappingURL=bonus.service.js.map