import { Request, Response } from 'express';
export declare class AttendanceController {
    getActiveSessions(req: Request, res: Response): Promise<void>;
    scan(req: Request, res: Response): Promise<void>;
    myAttendance(req: Request, res: Response): Promise<void>;
    sessionAttendance(req: Request, res: Response): Promise<void>;
}
export declare const attendanceController: AttendanceController;
