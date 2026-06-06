"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../../config/database"));
const env_1 = require("../../config/env");
const errorHandler_1 = require("../../middleware/errorHandler");
class AuthService {
    async register(input) {
        // Check if email already exists
        const existing = await database_1.default.user.findFirst({
            where: { email: input.email, deletedAt: null },
        });
        if (existing) {
            throw new errorHandler_1.AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
        }
        const passwordHash = await bcryptjs_1.default.hash(input.password, env_1.env.BCRYPT_ROUNDS);
        // Auto-assign to a random tribe with available capacity
        const assignedTribeId = await this.getRandomAvailableTribeId();
        const user = await database_1.default.user.create({
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
            await database_1.default.tribe.update({
                where: { id: assignedTribeId },
                data: { memberCount: { increment: 1 } },
            });
        }
        return user;
    }
    async login(input, ipAddress, userAgent) {
        const user = await database_1.default.user.findFirst({
            where: { email: input.email, deletedAt: null },
        });
        if (!user) {
            throw new errorHandler_1.AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        if (user.status === 'SUSPENDED') {
            throw new errorHandler_1.AppError(403, 'ACCOUNT_SUSPENDED', 'Your account has been suspended');
        }
        if (user.status === 'INACTIVE') {
            throw new errorHandler_1.AppError(403, 'ACCOUNT_INACTIVE', 'Your account is inactive');
        }
        const isValid = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!isValid) {
            throw new errorHandler_1.AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user.id, ipAddress, userAgent);
        // Update last login
        await database_1.default.user.update({
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
    async refreshAccessToken(refreshToken, ipAddress, userAgent) {
        const tokenHash = this.hashToken(refreshToken);
        const storedToken = await database_1.default.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!storedToken) {
            throw new errorHandler_1.AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
        }
        if (storedToken.revokedAt) {
            throw new errorHandler_1.AppError(401, 'TOKEN_REVOKED', 'Refresh token has been revoked');
        }
        if (storedToken.expiresAt < new Date()) {
            throw new errorHandler_1.AppError(401, 'TOKEN_EXPIRED', 'Refresh token has expired');
        }
        if (storedToken.user.status !== 'ACTIVE') {
            throw new errorHandler_1.AppError(403, 'ACCOUNT_SUSPENDED', 'Your account has been suspended');
        }
        // Rotate: revoke old token, issue new one
        await database_1.default.refreshToken.update({
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
    async logout(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        await database_1.default.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async getProfile(userId) {
        const user = await database_1.default.user.findUnique({
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
            throw new errorHandler_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
        }
        // Compute sportsXp from transactions
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
    async changePassword(userId, input) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new errorHandler_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
        }
        const isValid = await bcryptjs_1.default.compare(input.currentPassword, user.passwordHash);
        if (!isValid) {
            throw new errorHandler_1.AppError(401, 'INVALID_PASSWORD', 'Current password is incorrect');
        }
        const passwordHash = await bcryptjs_1.default.hash(input.newPassword, env_1.env.BCRYPT_ROUNDS);
        await database_1.default.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        return { message: 'Password changed successfully' };
    }
    generateAccessToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_ACCESS_EXPIRY,
        });
    }
    async generateRefreshToken(userId, ipAddress, userAgent) {
        const token = crypto_1.default.randomBytes(64).toString('hex');
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        await database_1.default.refreshToken.create({
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
    hashToken(token) {
        return crypto_1.default.createHash('sha256').update(token).digest('hex');
    }
    async getRandomAvailableTribeId() {
        const tribes = await database_1.default.tribe.findMany({
            select: { id: true, memberCount: true, maxMembers: true },
        });
        if (tribes.length === 0)
            return null;
        // Filter tribes that still have capacity
        const available = tribes.filter(t => t.maxMembers === null || t.memberCount < t.maxMembers);
        if (available.length === 0)
            return null;
        // Pick tribe with fewest members for balanced distribution
        available.sort((a, b) => a.memberCount - b.memberCount);
        const minCount = available[0].memberCount;
        const leastFull = available.filter(t => t.memberCount === minCount);
        // Random among the least-full tribes
        return leastFull[Math.floor(Math.random() * leastFull.length)].id;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map