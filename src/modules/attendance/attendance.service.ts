import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { xpService } from '../xp/xp.service';
import { Prisma } from '@prisma/client';

export class AttendanceService {
  async scanQr(userId: string, qrToken: string) {
    // Find session by QR token
    const session = await prisma.conferenceSession.findUnique({
      where: { qrToken },
    });

    if (!session) {
      throw new AppError(422, 'INVALID_QR_TOKEN', 'This QR code is invalid or has expired. Please scan the current one.');
    }

    if (session.status !== 'ACTIVE') {
      throw new AppError(422, 'SESSION_NOT_ACTIVE', 'This session is not currently accepting attendance.');
    }

    // QR is valid as long as session is ACTIVE (until session ends)
    const now = new Date();
    if (now > session.endTime) {
      throw new AppError(422, 'OUTSIDE_ATTENDANCE_WINDOW', 'Attendance window has closed for this session.');
    }

    // Determine if late
    const isLate = now > session.endTime;

    // Get XP reward (could be different for late attendance)
    const xpAmount = isLate ? Math.floor(session.xpReward * 0.5) : session.xpReward;

    // Check if user already scanned this session
    const existingAttendance = await prisma.attendance.findUnique({
      where: { userId_sessionId: { userId, sessionId: session.id } },
    });
    if (existingAttendance) {
      throw new AppError(409, 'ALREADY_SCANNED', 'You have already scanned this QR code. Attendance can only be recorded once per session.');
    }

    // Use upsert-style approach to handle concurrent scans safely
    try {
      const result = await prisma.$transaction(async (tx) => {
        const attendance = await tx.attendance.create({
          data: {
            userId,
            sessionId: session.id,
            xpAwarded: xpAmount,
            isLate,
          },
        });

        // Award XP
        await xpService.awardXp(tx, {
          userId,
          amount: xpAmount,
          type: 'ATTENDANCE',
          sourceType: 'SESSION',
          sourceId: session.id,
          description: `Attendance: ${session.title}${isLate ? ' (late)' : ''}`,
        });

        return attendance;
      });

      return {
        alreadyRecorded: false,
        attendance: result,
        session: { id: session.id, title: session.title },
        xpAwarded: xpAmount,
        isLate,
      };
    } catch (err) {
      // Handle unique constraint violation (concurrent duplicate scan)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError(409, 'ALREADY_SCANNED', 'You have already scanned this QR code. Attendance can only be recorded once per session.');
      }
      throw err;
    }
  }

  async getUserAttendance(userId: string) {
    return prisma.attendance.findMany({
      where: { userId },
      include: {
        session: {
          select: { id: true, title: true, speaker: true, sessionDate: true, startTime: true },
        },
      },
      orderBy: { scannedAt: 'desc' },
    });
  }

  async getSessionAttendance(sessionId: string) {
    return prisma.attendance.findMany({
      where: { sessionId },
      include: {
        user: { select: { id: true, name: true, email: true, church: true } },
      },
      orderBy: { scannedAt: 'asc' },
    });
  }
}

export const attendanceService = new AttendanceService();
