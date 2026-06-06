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
export declare class XpService {
    /**
     * Award XP within a transaction context.
     * Used by other services (attendance, quiz, bonus) to award XP atomically.
     */
    awardXp(tx: Prisma.TransactionClient, params: AwardXpParams): Promise<{
        userId: string;
        amount: number;
        type: import(".prisma/client").$Enums.XpType;
        id: string;
        createdAt: Date;
        description: string | null;
        sourceType: import(".prisma/client").$Enums.XpSourceType;
        sourceId: string | null;
        awardedBy: string | null;
    }>;
    /**
     * Admin manual award — with self-award and daily cap checks
     */
    adminAward(adminId: string, userId: string, amount: number, description?: string): Promise<{
        userId: string;
        amount: number;
        type: import(".prisma/client").$Enums.XpType;
        id: string;
        createdAt: Date;
        description: string | null;
        sourceType: import(".prisma/client").$Enums.XpSourceType;
        sourceId: string | null;
        awardedBy: string | null;
    }>;
    getUserRank(userId: string): Promise<{
        rank: number;
        total: number;
    }>;
    getLeaderboard(limit?: number): Promise<{
        sportsXp: number;
        conferenceXp: number;
        name: string;
        id: string;
        avatarUrl: string | null;
        totalXp: number;
        tribe: {
            name: string;
            id: string;
            color: string | null;
        } | null;
        level: {
            name: string;
            badgeUrl: string | null;
        } | null;
    }[]>;
    getTribeLeaderboard(): Promise<{
        name: string;
        id: string;
        totalXp: number;
        color: string | null;
        memberCount: number;
    }[]>;
    getUserXpHistory(userId: string, limit?: number): Promise<{
        userId: string;
        amount: number;
        type: import(".prisma/client").$Enums.XpType;
        id: string;
        createdAt: Date;
        description: string | null;
        sourceType: import(".prisma/client").$Enums.XpSourceType;
        sourceId: string | null;
        awardedBy: string | null;
    }[]>;
}
export declare const xpService: XpService;
export {};
