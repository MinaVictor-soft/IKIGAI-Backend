import { RegisterInput, LoginInput, ChangePasswordInput } from './auth.schema';
export declare class AuthService {
    register(input: RegisterInput): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        tribeId: string | null;
        church: string | null;
        diocese: string | null;
        languagePreference: string;
        id: string;
        totalXp: number;
        createdAt: Date;
    }>;
    login(input: LoginInput, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string | null;
            church: string | null;
            diocese: string | null;
            totalXp: number;
            languagePreference: string;
            userQrToken: string;
        };
    }>;
    refreshAccessToken(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    getProfile(userId: string): Promise<{
        sportsXp: number;
        conferenceXp: number;
        email: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        userQrToken: string;
        role: import(".prisma/client").$Enums.Role;
        church: string | null;
        diocese: string | null;
        phone: string | null;
        languagePreference: string;
        id: string;
        avatarUrl: string | null;
        totalXp: number;
        lastLoginAt: Date | null;
        createdAt: Date;
        tribe: {
            name: string;
            id: string;
            color: string | null;
        } | null;
        level: {
            name: string;
            displayOrder: number;
            id: string;
            minXp: number;
            maxXp: number | null;
            badgeUrl: string | null;
        } | null;
    }>;
    changePassword(userId: string, input: ChangePasswordInput): Promise<{
        message: string;
    }>;
    private generateAccessToken;
    private generateRefreshToken;
    private hashToken;
    private getRandomAvailableTribeId;
}
export declare const authService: AuthService;
