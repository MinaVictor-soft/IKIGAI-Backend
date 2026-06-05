import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { XpType, XpSourceType, Prisma } from '@prisma/client';

interface AwardXpParams {
  userId: string;
  amount: number;
  type: XpType;
  sourceType: XpSourceType;
  sourceId?: string;
  description?: string;
  awardedBy?: string;
}

export class XpService {
  /**
   * Award XP within a transaction context.
   * Used by other services (attendance, quiz, bonus) to award XP atomically.
   */
  async awardXp(tx: Prisma.TransactionClient, params: AwardXpParams) {
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
  async adminAward(adminId: string, userId: string, amount: number, description?: string) {
    // Self-award prevention
    if (adminId === userId) {
      throw new AppError(422, 'CANNOT_REWARD_SELF', 'You cannot award XP to yourself');
    }

    // Check user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser || targetUser.deletedAt) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Target user not found');
    }

    // Check admin daily cap
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (admin?.role === 'ADMIN') {
      // Per-award cap: 100
      if (amount > 100) {
        throw new AppError(403, 'AMOUNT_EXCEEDS_LIMIT', 'ADMIN can award maximum 100 XP per award');
      }

      // Daily cap: 500
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayAwards = await prisma.xpTransaction.aggregate({
        where: {
          awardedBy: adminId,
          sourceType: { in: ['ADMIN', 'STAFF_AWARD'] },
          createdAt: { gte: todayStart },
        },
        _sum: { amount: true },
      });

      const totalToday = todayAwards._sum.amount || 0;
      if (totalToday + amount > 500) {
        throw new AppError(429, 'DAILY_LIMIT_REACHED', `Daily award limit reached. Remaining: ${500 - totalToday} XP`);
      }
    }

    // Award XP
    const result = await prisma.$transaction(async (tx) => {
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

  async getUserRank(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { totalXp: true } });
    if (!user) return { rank: 0, total: 0 };
    const rank = await prisma.user.count({
      where: { role: 'ATTENDEE', status: 'ACTIVE', deletedAt: null, totalXp: { gt: user.totalXp } },
    });
    const total = await prisma.user.count({ where: { role: 'ATTENDEE', status: 'ACTIVE', deletedAt: null } });
    return { rank: rank + 1, total };
  }

  async getLeaderboard(limit = 50) {
    const users = await prisma.user.findMany({
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
    const sportsXpRows = await prisma.xpTransaction.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, sourceType: 'SPORTS' },
      _sum: { amount: true },
    });
    const sportsXpMap: Record<string, number> = {};
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
    return prisma.tribe.findMany({
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

  async getUserXpHistory(userId: string, limit = 50) {
    return prisma.xpTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const xpService = new XpService();
