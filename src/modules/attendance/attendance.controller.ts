import { Request, Response } from 'express';
import { attendanceService } from './attendance.service';
import { sendSuccess } from '../../utils/response';
import { getParam } from '../../utils/params';
import prisma from '../../config/database';

export class AttendanceController {
  async getActiveSessions(req: Request, res: Response) {
    const sessions = await prisma.conferenceSession.findMany({
      where: { status: { in: ['SCHEDULED', 'ACTIVE'] } },
      select: { id: true, title: true, description: true, speaker: true, location: true, sessionDate: true, startTime: true, endTime: true, xpReward: true, status: true },
      orderBy: { startTime: 'asc' },
    });
    sendSuccess(res, sessions);
  }
  async scan(req: Request, res: Response) {
    const result = await attendanceService.scanQr(req.user!.userId, req.body.qrToken);
    sendSuccess(res, result);
  }

  async myAttendance(req: Request, res: Response) {
    const attendance = await attendanceService.getUserAttendance(req.user!.userId);
    sendSuccess(res, attendance);
  }

  async sessionAttendance(req: Request, res: Response) {
    const attendance = await attendanceService.getSessionAttendance(getParam(req, 'sessionId'));
    sendSuccess(res, attendance);
  }
}

export const attendanceController = new AttendanceController();
