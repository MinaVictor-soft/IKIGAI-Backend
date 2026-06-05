import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { xpService } from '../xp/xp.service';
import { CreateBonusQrInput, StaffAwardInput } from './bonus.schema';
import { Prisma } from '@prisma/client';

export class BonusService {
  async createBonusQr(adminId: string, input: CreateBonusQrInput) {
    // ADMIN cap: 100 per QR
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (admin?.role === 'ADMIN' && input.amount > 100) {
      throw new AppError(403, 'AMOUNT_EXCEEDS_LIMIT', 'ADMIN can create QR codes with maximum 100 XP');
    }

    return prisma.bonusQrCode.create({
      data: {
        amount: input.amount,
        label: input.label,
        maxClaims: input.maxClaims,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        createdBy: adminId,
      },
    });
  }

  async claimBonus(userId: string, token: string) {
    const bonusQr = await prisma.bonusQrCode.findUnique({
      where: { token },
    });

    if (!bonusQr) {
      throw new AppError(404, 'BONUS_QR_NOT_FOUND', 'Invalid bonus QR code');
    }

    if (!bonusQr.isActive) {
      throw new AppError(422, 'BONUS_QR_INACTIVE', 'This bonus QR code has been deactivated');
    }

    if (bonusQr.expiresAt && bonusQr.expiresAt < new Date()) {
      throw new AppError(422, 'BONUS_QR_EXPIRED', 'This bonus QR code has expired');
    }

    if (bonusQr.maxClaims && bonusQr.claimsCount >= bonusQr.maxClaims) {
      throw new AppError(422, 'BONUS_QR_MAX_CLAIMS', 'This bonus QR code has reached its maximum claims');
    }

    // Claim + award XP in transaction (unique constraint handles race condition)
    try {
      const result = await prisma.$transaction(async (tx) => {
        const xpTx = await xpService.awardXp(tx, {
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
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError(409, 'ALREADY_CLAIMED', 'You have already claimed this bonus');
      }
      throw err;
    }
  }

  async staffAward(adminId: string, input: StaffAwardInput) {
    // Find target user by ID or QR token
    const targetUser = input.userId
      ? await prisma.user.findFirst({ where: { id: input.userId, deletedAt: null } })
      : await prisma.user.findFirst({ where: { userQrToken: input.userQrToken!, deletedAt: null } });

    if (!targetUser) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Self-award prevention
    if (adminId === targetUser.id) {
      throw new AppError(422, 'CANNOT_REWARD_SELF', 'You cannot award XP to yourself');
    }

    // Check admin caps
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (admin?.role === 'ADMIN') {
      if (input.amount > 100) {
        throw new AppError(403, 'AMOUNT_EXCEEDS_LIMIT', 'ADMIN can award maximum 100 XP per award');
      }

      // Daily cap
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayAwards = await prisma.xpTransaction.aggregate({
        where: {
          awardedBy: adminId,
          sourceType: 'STAFF_AWARD',
          createdAt: { gte: todayStart },
        },
        _sum: { amount: true },
      });

      const totalToday = todayAwards._sum.amount || 0;
      if (totalToday + input.amount > 500) {
        throw new AppError(429, 'DAILY_LIMIT_REACHED', `Daily award limit reached. Remaining: ${500 - totalToday} XP`);
      }
    }

    // Award XP
    const result = await prisma.$transaction(async (tx) => {
      return xpService.awardXp(tx, {
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

  async getMyBonusQrs(adminId: string) {
    return prisma.bonusQrCode.findMany({
      where: { createdBy: adminId },
      include: { _count: { select: { claims: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivateQr(qrId: string, adminId: string) {
    const qr = await prisma.bonusQrCode.findUnique({ where: { id: qrId } });
    if (!qr) throw new AppError(404, 'BONUS_QR_NOT_FOUND', 'Bonus QR not found');

    return prisma.bonusQrCode.update({
      where: { id: qrId },
      data: { isActive: false },
    });
  }
}

export const bonusService = new BonusService();
