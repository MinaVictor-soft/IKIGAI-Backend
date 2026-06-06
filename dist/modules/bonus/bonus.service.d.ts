import { CreateBonusQrInput, StaffAwardInput } from './bonus.schema';
export declare class BonusService {
    createBonusQr(adminId: string, input: CreateBonusQrInput): Promise<{
        amount: number;
        token: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        label: string | null;
        maxClaims: number | null;
        claimsCount: number;
        isActive: boolean;
        batchId: string | null;
        createdBy: string;
    }>;
    claimBonus(userId: string, token: string): Promise<{
        claim: {
            userId: string;
            id: string;
            claimedAt: Date;
            bonusQrId: string;
            xpTransactionId: string;
        };
        xpAwarded: number;
    }>;
    staffAward(adminId: string, input: StaffAwardInput): Promise<{
        xpTransaction: {
            userId: string;
            amount: number;
            type: import(".prisma/client").$Enums.XpType;
            id: string;
            createdAt: Date;
            description: string | null;
            sourceType: import(".prisma/client").$Enums.XpSourceType;
            sourceId: string | null;
            awardedBy: string | null;
        };
        user: {
            id: string;
            name: string;
        };
    }>;
    getMyBonusQrs(adminId: string): Promise<({
        _count: {
            claims: number;
        };
    } & {
        amount: number;
        token: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        label: string | null;
        maxClaims: number | null;
        claimsCount: number;
        isActive: boolean;
        batchId: string | null;
        createdBy: string;
    })[]>;
    deactivateQr(qrId: string, adminId: string): Promise<{
        amount: number;
        token: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        label: string | null;
        maxClaims: number | null;
        claimsCount: number;
        isActive: boolean;
        batchId: string | null;
        createdBy: string;
    }>;
}
export declare const bonusService: BonusService;
