import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { CreateSessionInput, CreateUserInput, CreateTribeInput } from './admin.schema';

export class AdminService {
  // ============ SESSIONS ============

  async createSession(input: CreateSessionInput) {
    const qrToken = uuidv4();
    return prisma.conferenceSession.create({
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

  async getSessions(date?: string) {
    return prisma.conferenceSession.findMany({
      where: date ? { sessionDate: new Date(date) } : undefined,
      include: { _count: { select: { attendance: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  async updateSession(sessionId: string, input: any) {
    const session = await prisma.conferenceSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');

    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.speaker !== undefined) data.speaker = input.speaker;
    if (input.location !== undefined) data.location = input.location;
    if (input.sessionDate !== undefined) data.sessionDate = new Date(input.sessionDate);
    if (input.startTime !== undefined) data.startTime = new Date(input.startTime);
    if (input.endTime !== undefined) data.endTime = new Date(input.endTime);
    if (input.xpReward !== undefined) data.xpReward = input.xpReward;
    if (input.maxCapacity !== undefined) data.maxCapacity = input.maxCapacity;

    return prisma.conferenceSession.update({ where: { id: sessionId }, data });
  }

  async updateSessionStatus(sessionId: string, status: string) {
    const session = await prisma.conferenceSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');

    // Regenerate QR token when activating
    const data: any = { status };
    if (status === 'ACTIVE') {
      data.qrToken = uuidv4();
    }
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      data.qrToken = uuidv4(); // Invalidate QR
    }

    return prisma.conferenceSession.update({
      where: { id: sessionId },
      data,
    });
  }

  async regenerateQrToken(sessionId: string) {
    const session = await prisma.conferenceSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');

    return prisma.conferenceSession.update({
      where: { id: sessionId },
      data: { qrToken: uuidv4() },
    });
  }

  // ============ USERS ============

  async createUser(input: CreateUserInput) {
    const existing = await prisma.user.findFirst({
      where: { email: input.email, deletedAt: null },
    });
    if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'Email already in use');

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

    return prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role as any,
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

  async resetUserPassword(userId: string, defaultPassword?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    const newPassword = defaultPassword || 'Ikigai@2026';
    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: `Password reset for ${user.name}`, email: user.email, newPassword };
  }

  async getUsers(role?: string, page = 1, limit = 50) {
    const where: any = { deletedAt: null };
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
      prisma.user.count({ where }),
    ]);

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

    const usersWithXp = users.map((u) => ({
      ...u,
      sportsXp: sportsXpMap[u.id] || 0,
      conferenceXp: u.totalXp - (sportsXpMap[u.id] || 0),
    }));

    return { users: usersWithXp, total };
  }

  async assignTribe(userId: string, tribeId: string | null) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    // Update tribe member counts
    await prisma.$transaction(async (tx) => {
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

  async changeUserRole(userId: string, newRole: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    // Prevent changing SUPER_ADMIN roles
    if (user.role === 'SUPER_ADMIN') {
      throw new AppError(403, 'CANNOT_MODIFY_SUPER_ADMIN', 'Cannot change super admin role');
    }

    // Validate new role
    const validRoles = ['ATTENDEE', 'STAFF', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(newRole)) {
      throw new AppError(400, 'INVALID_ROLE', 'Invalid role provided');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
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

  async createTribe(input: CreateTribeInput) {
    return prisma.tribe.create({ data: input });
  }

  async getTribes() {
    return prisma.tribe.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { totalXp: 'desc' },
    });
  }

  async updateTribe(tribeId: string, input: { name?: string; description?: string; color?: string; maxMembers?: number | null }) {
    const tribe = await prisma.tribe.findUnique({ where: { id: tribeId } });
    if (!tribe) throw new AppError(404, 'TRIBE_NOT_FOUND', 'Tribe not found');

    return prisma.tribe.update({
      where: { id: tribeId },
      data: input,
    });
  }

  // ============ DASHBOARD STATS ============

  async getDashboardStats() {
    const [
      totalUsers,
      totalAttendance,
      totalXpAwarded,
      activeSessions,
      activeQuizzes,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null, role: 'ATTENDEE' } }),
      prisma.attendance.count(),
      prisma.xpTransaction.aggregate({ _sum: { amount: true } }),
      prisma.conferenceSession.count({ where: { status: 'ACTIVE' } }),
      prisma.quiz.count({ where: { status: 'ACTIVE' } }),
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
    const result = await prisma.user.updateMany({
      where: { role: 'ATTENDEE', deletedAt: null },
      data: { deletedAt: new Date(), status: 'SUSPENDED' },
    });
    return { deletedCount: result.count };
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    if (user.role === 'SUPER_ADMIN') throw new AppError(403, 'FORBIDDEN', 'Cannot delete super admin');

    // Soft delete
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), status: 'SUSPENDED' },
    });

    // Decrement tribe member count
    if (user.tribeId) {
      await prisma.tribe.update({
        where: { id: user.tribeId },
        data: { memberCount: { decrement: 1 } },
      });
    }

    return { message: `User ${user.name} (${user.email}) deleted` };
  }

  async adjustUserXp(userId: string, amount: number, reason: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    const newTotal = Math.max(0, user.totalXp + amount);

    await prisma.xpTransaction.create({
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
    const level = await prisma.level.findFirst({
      where: { minXp: { lte: newTotal } },
      orderBy: { minXp: 'desc' },
    });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { totalXp: newTotal, levelId: level?.id ?? null },
      select: { id: true, name: true, totalXp: true },
    });

    // Update tribe XP
    if (user.tribeId) {
      await prisma.tribe.update({
        where: { id: user.tribeId },
        data: { totalXp: { increment: amount } },
      });
    }

    return updated;
  }

  async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
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
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    // Compute sportsXp
    const sportsXpResult = await prisma.xpTransaction.aggregate({
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

  async getUserActivity(userId: string) {
    const [attendance, quizSubmissions, bonusClaims, xpTransactions] = await Promise.all([
      prisma.attendance.findMany({
        where: { userId },
        include: { session: { select: { id: true, title: true, speaker: true, sessionDate: true } } },
        orderBy: { scannedAt: 'desc' },
      }),
      prisma.quizSubmission.findMany({
        where: { userId },
        include: { quiz: { select: { id: true, title: true } } },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.bonusClaim.findMany({
        where: { userId },
        include: { bonusQr: { select: { id: true, label: true, amount: true } } },
        orderBy: { claimedAt: 'desc' },
      }),
      prisma.xpTransaction.findMany({
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

  async getBonusQrClaims(bonusQrId: string) {
    return prisma.bonusClaim.findMany({
      where: { bonusQrId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { claimedAt: 'desc' },
    });
  }

  // ============ QUIZZES ============
  async getAllQuizzes() {
    return prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { questions: true, submissions: true } },
      },
    });
  }

  async getQuizDetail(quizId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { displayOrder: 'asc' } },
        _count: { select: { submissions: true } },
      },
    });
    if (!quiz) throw new AppError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');

    // Get submission stats
    const submissions = await prisma.quizSubmission.findMany({
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

  async deleteQuizQuestion(quizId: string, questionId: string) {
    await prisma.quizQuestion.delete({ where: { id: questionId } });
    await prisma.quiz.update({
      where: { id: quizId },
      data: { questionCount: { decrement: 1 } },
    });
  }

  // ============ SESSION STATS ============
  async getSessionDetail(sessionId: string) {
    const session = await prisma.conferenceSession.findUnique({
      where: { id: sessionId },
      include: { _count: { select: { attendance: true } } },
    });
    if (!session) throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');

    const attendance = await prisma.attendance.findMany({
      where: { sessionId },
      include: { user: { select: { id: true, name: true, email: true, tribe: { select: { name: true, color: true } } } } },
      orderBy: { scannedAt: 'desc' },
    });

    return { ...session, attendance };
  }

  // ============ LEVELS ============
  async getLevels() {
    return prisma.level.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { _count: { select: { users: true } } },
    });
  }

  async createLevel(data: { name: string; displayOrder: number; minXp: number; maxXp?: number; badgeUrl?: string; color?: string }) {
    return prisma.level.create({ data });
  }

  async updateLevel(levelId: string, data: { name?: string; displayOrder?: number; minXp?: number; maxXp?: number; badgeUrl?: string; color?: string }) {
    return prisma.level.update({ where: { id: levelId }, data });
  }

  async deleteLevel(levelId: string) {
    // Unassign users from this level first
    await prisma.user.updateMany({ where: { levelId }, data: { levelId: null } });
    return prisma.level.delete({ where: { id: levelId } });
  }

  /**
   * Recalculate level for a given user based on their totalXp.
   * Finds the highest level where user's XP >= minXp.
   */
  async recalculateUserLevel(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { totalXp: true } });
    if (!user) return;

    const level = await prisma.level.findFirst({
      where: { minXp: { lte: user.totalXp } },
      orderBy: { minXp: 'desc' },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { levelId: level?.id ?? null },
    });
  }

  /**
   * Recalculate levels for ALL users
   */
  async recalculateAllLevels() {
    const levels = await prisma.level.findMany({ orderBy: { minXp: 'desc' } });
    if (levels.length === 0) return { updated: 0 };

    const users = await prisma.user.findMany({
      where: { role: 'ATTENDEE', deletedAt: null },
      select: { id: true, totalXp: true },
    });

    let updated = 0;
    for (const user of users) {
      const level = levels.find(l => user.totalXp >= l.minXp);
      const newLevelId = level?.id ?? null;
      await prisma.user.update({
        where: { id: user.id },
        data: { levelId: newLevelId },
      });
      updated++;
    }

    return { updated };
  }

  async getSystemConfig() {
    const configs = await prisma.systemConfig.findMany({ orderBy: { category: 'asc' } });
    return configs.reduce((acc: Record<string, any>, c) => {
      acc[c.key] = { value: c.value, description: c.description, category: c.category };
      return acc;
    }, {});
  }

  async updateSystemConfig(key: string, value: any, updatedBy: string) {
    return prisma.systemConfig.update({
      where: { key },
      data: { value, updatedBy },
    });
  }
}

export const adminService = new AdminService();
