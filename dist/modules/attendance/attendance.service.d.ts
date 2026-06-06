export declare class AttendanceService {
    scanQr(userId: string, qrToken: string): Promise<{
        alreadyRecorded: boolean;
        attendance: {
            sessionId: string;
            userId: string;
            id: string;
            createdAt: Date;
            xpAwarded: number;
            scannedAt: Date;
            isLate: boolean;
        };
        session: {
            id: string;
            title: string;
        };
        xpAwarded: number;
        isLate: boolean;
    } | {
        alreadyRecorded: boolean;
        attendance: {
            sessionId: string;
            userId: string;
            id: string;
            createdAt: Date;
            xpAwarded: number;
            scannedAt: Date;
            isLate: boolean;
        } | null;
        session: {
            id: string;
            title: string;
        };
        xpAwarded?: undefined;
        isLate?: undefined;
    }>;
    getUserAttendance(userId: string): Promise<({
        session: {
            title: string;
            sessionDate: Date;
            startTime: Date;
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
    })[]>;
    getSessionAttendance(sessionId: string): Promise<({
        user: {
            email: string;
            name: string;
            church: string | null;
            id: string;
        };
    } & {
        sessionId: string;
        userId: string;
        id: string;
        createdAt: Date;
        xpAwarded: number;
        scannedAt: Date;
        isLate: boolean;
    })[]>;
}
export declare const attendanceService: AttendanceService;
