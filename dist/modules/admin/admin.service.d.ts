import { CreateSessionInput, CreateUserInput, CreateTribeInput } from './admin.schema';
export declare class AdminService {
    createSession(input: CreateSessionInput): Promise<{
        qrToken: string;
        title: string;
        status: import(".prisma/client").$Enums.SessionStatus;
        sessionDate: Date;
        startTime: Date;
        endTime: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        speaker: string | null;
        location: string | null;
        qrExpiresAt: Date | null;
        xpReward: number;
        maxCapacity: number | null;
        attendanceBufferMinutes: number;
    }>;
    getSessions(date?: string): Promise<({
        _count: {
            attendance: number;
        };
    } & {
        qrToken: string;
        title: string;
        status: import(".prisma/client").$Enums.SessionStatus;
        sessionDate: Date;
        startTime: Date;
        endTime: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        speaker: string | null;
        location: string | null;
        qrExpiresAt: Date | null;
        xpReward: number;
        maxCapacity: number | null;
        attendanceBufferMinutes: number;
    })[]>;
    updateSession(sessionId: string, input: any): Promise<{
        qrToken: string;
        title: string;
        status: import(".prisma/client").$Enums.SessionStatus;
        sessionDate: Date;
        startTime: Date;
        endTime: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        speaker: string | null;
        location: string | null;
        qrExpiresAt: Date | null;
        xpReward: number;
        maxCapacity: number | null;
        attendanceBufferMinutes: number;
    }>;
    updateSessionStatus(sessionId: string, status: string): Promise<{
        qrToken: string;
        title: string;
        status: import(".prisma/client").$Enums.SessionStatus;
        sessionDate: Date;
        startTime: Date;
        endTime: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        speaker: string | null;
        location: string | null;
        qrExpiresAt: Date | null;
        xpReward: number;
        maxCapacity: number | null;
        attendanceBufferMinutes: number;
    }>;
    regenerateQrToken(sessionId: string): Promise<{
        qrToken: string;
        title: string;
        status: import(".prisma/client").$Enums.SessionStatus;
        sessionDate: Date;
        startTime: Date;
        endTime: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        speaker: string | null;
        location: string | null;
        qrExpiresAt: Date | null;
        xpReward: number;
        maxCapacity: number | null;
        attendanceBufferMinutes: number;
    }>;
    createUser(input: CreateUserInput): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        tribeId: string | null;
        church: string | null;
        diocese: string | null;
        id: string;
        createdAt: Date;
    }>;
    resetUserPassword(userId: string, defaultPassword?: string): Promise<{
        message: string;
        email: string;
        newPassword: string;
    }>;
    getUsers(role?: string, page?: number, limit?: number): Promise<{
        users: {
            sportsXp: number;
            conferenceXp: number;
            email: string;
            name: string;
            status: import(".prisma/client").$Enums.UserStatus;
            role: import(".prisma/client").$Enums.Role;
            church: string | null;
            diocese: string | null;
            id: string;
            totalXp: number;
            createdAt: Date;
            tribe: {
                name: string;
                id: string;
            } | null;
            level: {
                name: string;
                id: string;
                color: string | null;
            } | null;
        }[];
        total: number;
    }>;
    assignTribe(userId: string, tribeId: string | null): Promise<{
        userId: string;
        tribeId: string | null;
    }>;
    changeUserRole(userId: string, newRole: string): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        updatedAt: Date;
    }>;
    createTribe(input: CreateTribeInput): Promise<{
        name: string;
        id: string;
        totalXp: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        iconUrl: string | null;
        memberCount: number;
        maxMembers: number | null;
    }>;
    getTribes(): Promise<({
        _count: {
            members: number;
        };
    } & {
        name: string;
        id: string;
        totalXp: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        iconUrl: string | null;
        memberCount: number;
        maxMembers: number | null;
    })[]>;
    updateTribe(tribeId: string, input: {
        name?: string;
        description?: string;
        color?: string;
        maxMembers?: number | null;
    }): Promise<{
        name: string;
        id: string;
        totalXp: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        iconUrl: string | null;
        memberCount: number;
        maxMembers: number | null;
    }>;
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalAttendance: number;
        totalXpAwarded: number;
        activeSessions: number;
        activeQuizzes: number;
    }>;
    softDeleteAllAttendees(): Promise<{
        deletedCount: number;
    }>;
    deleteUser(userId: string): Promise<{
        message: string;
    }>;
    adjustUserXp(userId: string, amount: number, reason: string, adminId: string): Promise<{
        name: string;
        id: string;
        totalXp: number;
    }>;
    getUserDetail(userId: string): Promise<{
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
            id: string;
        } | null;
    }>;
    getUserActivity(userId: string): Promise<{
        attendance: ({
            session: {
                title: string;
                sessionDate: Date;
                id: string;
                speaker: string | null;
            };
        } & {
            sessionId: string;
            userId: string;
            id: string;
            createdAt: Date;
            xpAwarded: number;
            scannedAt: Date;
            isLate: boolean;
        })[];
        quizSubmissions: ({
            quiz: {
                title: string;
                id: string;
            };
        } & {
            userId: string;
            quizId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            id: string;
            createdAt: Date;
            xpAwarded: number;
            startedAt: Date | null;
            score: number;
            maxScore: number;
            percentage: import("@prisma/client-runtime-utils").Decimal;
            passed: boolean;
            submittedAt: Date;
            timeTakenSeconds: number | null;
        })[];
        bonusClaims: ({
            bonusQr: {
                amount: number;
                id: string;
                label: string | null;
            };
        } & {
            userId: string;
            id: string;
            claimedAt: Date;
            bonusQrId: string;
            xpTransactionId: string;
        })[];
        staffAwards: {
            userId: string;
            amount: number;
            type: import(".prisma/client").$Enums.XpType;
            id: string;
            createdAt: Date;
            description: string | null;
            sourceType: import(".prisma/client").$Enums.XpSourceType;
            sourceId: string | null;
            awardedBy: string | null;
        }[];
        sportsTransactions: {
            userId: string;
            amount: number;
            type: import(".prisma/client").$Enums.XpType;
            id: string;
            createdAt: Date;
            description: string | null;
            sourceType: import(".prisma/client").$Enums.XpSourceType;
            sourceId: string | null;
            awardedBy: string | null;
        }[];
        adminAdjustments: {
            userId: string;
            amount: number;
            type: import(".prisma/client").$Enums.XpType;
            id: string;
            createdAt: Date;
            description: string | null;
            sourceType: import(".prisma/client").$Enums.XpSourceType;
            sourceId: string | null;
            awardedBy: string | null;
        }[];
        xpTransactions: {
            userId: string;
            amount: number;
            type: import(".prisma/client").$Enums.XpType;
            id: string;
            createdAt: Date;
            description: string | null;
            sourceType: import(".prisma/client").$Enums.XpSourceType;
            sourceId: string | null;
            awardedBy: string | null;
        }[];
    }>;
    getBonusQrClaims(bonusQrId: string): Promise<({
        user: {
            email: string;
            name: string;
            id: string;
        };
    } & {
        userId: string;
        id: string;
        claimedAt: Date;
        bonusQrId: string;
        xpTransactionId: string;
    })[]>;
    getAllQuizzes(): Promise<({
        _count: {
            questions: number;
            submissions: number;
        };
    } & {
        sessionId: string | null;
        title: string;
        status: import(".prisma/client").$Enums.QuizStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        xpReward: number;
        passingScore: number | null;
        timeLimitSeconds: number | null;
        questionCount: number;
    })[]>;
    getQuizDetail(quizId: string): Promise<{
        stats: {
            total: number;
            passed: number;
            failed: number;
            avgScore: number;
        };
        submissions: ({
            user: {
                email: string;
                name: string;
                id: string;
            };
        } & {
            userId: string;
            quizId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            id: string;
            createdAt: Date;
            xpAwarded: number;
            startedAt: Date | null;
            score: number;
            maxScore: number;
            percentage: import("@prisma/client-runtime-utils").Decimal;
            passed: boolean;
            submittedAt: Date;
            timeTakenSeconds: number | null;
        })[];
        _count: {
            submissions: number;
        };
        questions: {
            quizId: string;
            questionText: string;
            correctAnswer: string;
            displayOrder: number;
            id: string;
            createdAt: Date;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            questionType: import(".prisma/client").$Enums.QuestionType;
            points: number;
            explanation: string | null;
        }[];
        sessionId: string | null;
        title: string;
        status: import(".prisma/client").$Enums.QuizStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        xpReward: number;
        passingScore: number | null;
        timeLimitSeconds: number | null;
        questionCount: number;
    }>;
    deleteQuizQuestion(quizId: string, questionId: string): Promise<void>;
    getSessionDetail(sessionId: string): Promise<{
        attendance: ({
            user: {
                email: string;
                name: string;
                id: string;
                tribe: {
                    name: string;
                    color: string | null;
                } | null;
            };
        } & {
            sessionId: string;
            userId: string;
            id: string;
            createdAt: Date;
            xpAwarded: number;
            scannedAt: Date;
            isLate: boolean;
        })[];
        _count: {
            attendance: number;
        };
        qrToken: string;
        title: string;
        status: import(".prisma/client").$Enums.SessionStatus;
        sessionDate: Date;
        startTime: Date;
        endTime: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        speaker: string | null;
        location: string | null;
        qrExpiresAt: Date | null;
        xpReward: number;
        maxCapacity: number | null;
        attendanceBufferMinutes: number;
    }>;
    getLevels(): Promise<({
        _count: {
            users: number;
        };
    } & {
        name: string;
        displayOrder: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        minXp: number;
        maxXp: number | null;
        badgeUrl: string | null;
    })[]>;
    createLevel(data: {
        name: string;
        displayOrder: number;
        minXp: number;
        maxXp?: number;
        badgeUrl?: string;
        color?: string;
    }): Promise<{
        name: string;
        displayOrder: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        minXp: number;
        maxXp: number | null;
        badgeUrl: string | null;
    }>;
    updateLevel(levelId: string, data: {
        name?: string;
        displayOrder?: number;
        minXp?: number;
        maxXp?: number;
        badgeUrl?: string;
        color?: string;
    }): Promise<{
        name: string;
        displayOrder: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        minXp: number;
        maxXp: number | null;
        badgeUrl: string | null;
    }>;
    deleteLevel(levelId: string): Promise<{
        name: string;
        displayOrder: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        minXp: number;
        maxXp: number | null;
        badgeUrl: string | null;
    }>;
    /**
     * Recalculate level for a given user based on their totalXp.
     * Finds the highest level where user's XP >= minXp.
     */
    recalculateUserLevel(userId: string): Promise<void>;
    /**
     * Recalculate levels for ALL users
     */
    recalculateAllLevels(): Promise<{
        updated: number;
    }>;
}
export declare const adminService: AdminService;
