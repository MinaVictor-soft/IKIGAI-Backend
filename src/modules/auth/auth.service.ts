import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { JwtPayload } from '../../middleware/auth';
import { RegisterInput, LoginInput, ChangePasswordInput } from './auth.schema';

export class AuthService {
  async register(input: RegisterInput) {
    // Check if email already exists
    const existing = await prisma.user.findFirst({
      where: { email: input.email, deletedAt: null },
    });

    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

    // Auto-assign to a random tribe with available capacity
    const assignedTribeId = await this.getRandomAvailableTribeId();

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        church: input.church,
        diocese: input.diocese,
        phone: input.phone,
        languagePreference: input.languagePreference || 'en',
        tribeId: assignedTribeId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        church: true,
        diocese: true,
        totalXp: true,
        languagePreference: true,
        tribeId: true,
        createdAt: true,
      },
    });

    if (assignedTribeId) {
      await prisma.tribe.update({
        where: { id: assignedTribeId },
        data: { memberCount: { increment: 1 } },
      });
    }

    return user;
  }

  async login(input: LoginInput, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findFirst({
      where: { email: input.email, deletedAt: null },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (user.status === 'SUSPENDED') {
      throw new AppError(403, 'ACCOUNT_SUSPENDED', 'Your account has been suspended');
    }

    if (user.status === 'INACTIVE') {
      throw new AppError(403, 'ACCOUNT_INACTIVE', 'Your account is inactive');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id, ipAddress, userAgent);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        church: user.church,
        diocese: user.diocese,
        totalXp: user.totalXp,
        languagePreference: user.languagePreference,
        userQrToken: user.userQrToken,
      },
    };
  }

  async refreshAccessToken(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      throw new AppError(401, 'TOKEN_REVOKED', 'Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new AppError(401, 'TOKEN_EXPIRED', 'Refresh token has expired');
    }

    if (storedToken.user.status !== 'ACTIVE') {
      throw new AppError(403, 'ACCOUNT_SUSPENDED', 'Your account has been suspended');
    }

    // Rotate: revoke old token, issue new one
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const newAccessToken = this.generateAccessToken(storedToken.user);
    const newRefreshToken = await this.generateRefreshToken(storedToken.userId, ipAddress, userAgent);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        church: true,
        diocese: true,
        phone: true,
        role: true,
        totalXp: true,
        status: true,
        languagePreference: true,
        userQrToken: true,
        lastLoginAt: true,
        createdAt: true,
        tribe: { select: { id: true, name: true, color: true } },
        level: { select: { id: true, name: true, displayOrder: true, badgeUrl: true, minXp: true, maxXp: true } },
      },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Compute sportsXp from transactions
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

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'INVALID_PASSWORD', 'Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  }

  private generateAccessToken(user: { id: string; email: string; role: string }): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as any,
    });
  }

  private async generateRefreshToken(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(token);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        ipAddress,
        deviceInfo: userAgent,
      },
    });

    return token;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async getRandomAvailableTribeId(): Promise<string | null> {
    const tribes = await prisma.tribe.findMany({
      select: { id: true, memberCount: true, maxMembers: true },
    });

    if (tribes.length === 0) return null;

    // Filter tribes that still have capacity
    const available = tribes.filter(t => t.maxMembers === null || t.memberCount < t.maxMembers);
    if (available.length === 0) return null;

    // Pick tribe with fewest members for balanced distribution
    available.sort((a, b) => a.memberCount - b.memberCount);
    const minCount = available[0].memberCount;
    const leastFull = available.filter(t => t.memberCount === minCount);

    // Random among the least-full tribes
    return leastFull[Math.floor(Math.random() * leastFull.length)].id;
  }
}

export const authService = new AuthService();
