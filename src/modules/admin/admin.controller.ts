import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { getParam, getQuery } from '../../utils/params';
import path from 'path';
import fs from 'fs';
import prisma from '../../config/database';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ZipArchive } = require('archiver') as { ZipArchive: new (opts?: object) => any };

export class AdminController {
  // Sessions
  async createSession(req: Request, res: Response) {
    const session = await adminService.createSession(req.body);
    sendCreated(res, session);
  }

  async getSessions(req: Request, res: Response) {
    const sessions = await adminService.getSessions(getQuery(req, 'date'));
    sendSuccess(res, sessions);
  }

  async updateSession(req: Request, res: Response) {
    const session = await adminService.updateSession(getParam(req, 'sessionId'), req.body);
    sendSuccess(res, session);
  }

  async deleteSession(req: Request, res: Response) {
    const result = await adminService.deleteSession(getParam(req, 'sessionId'));
    sendSuccess(res, result);
  }

  async updateSessionStatus(req: Request, res: Response) {
    const session = await adminService.updateSessionStatus(getParam(req, 'sessionId'), req.body.status);
    sendSuccess(res, session);
  }

  async regenerateQr(req: Request, res: Response) {
    const session = await adminService.regenerateQrToken(getParam(req, 'sessionId'));
    sendSuccess(res, { qrToken: session.qrToken });
  }

  // Users
  async createUser(req: Request, res: Response) {
    const user = await adminService.createUser(req.body);
    sendCreated(res, user);
  }

  async getUsers(req: Request, res: Response) {
    const page = parseInt(getQuery(req, 'page') || '1', 10);
    const limit = parseInt(getQuery(req, 'limit') || '50', 10);
    const { users, total } = await adminService.getUsers(getQuery(req, 'role'), page, limit);
    sendPaginated(res, users, { page, limit, total });
  }

  async assignTribe(req: Request, res: Response) {
    const result = await adminService.assignTribe(getParam(req, 'userId'), req.body.tribeId);
    sendSuccess(res, result);
  }

  async changeUserRole(req: Request, res: Response) {
    const result = await adminService.changeUserRole(getParam(req, 'userId'), req.body.role);
    sendSuccess(res, result);
  }

  async resetUserPassword(req: Request, res: Response) {
    const result = await adminService.resetUserPassword(getParam(req, 'userId'), req.body?.defaultPassword);
    sendSuccess(res, result);
  }

  async deleteUser(req: Request, res: Response) {
    const result = await adminService.deleteUser(getParam(req, 'userId'));
    sendSuccess(res, result);
  }

  // Tribes
  async createTribe(req: Request, res: Response) {
    const tribe = await adminService.createTribe(req.body);
    sendCreated(res, tribe);
  }

  async getTribes(req: Request, res: Response) {
    const tribes = await adminService.getTribes();
    sendSuccess(res, tribes);
  }

  async updateTribe(req: Request, res: Response) {
    const tribe = await adminService.updateTribe(getParam(req, 'tribeId'), req.body);
    sendSuccess(res, tribe);
  }

  async deleteTribe(req: Request, res: Response) {
    const result = await adminService.deleteTribe(getParam(req, 'tribeId'));
    sendSuccess(res, result);
  }

  // Dashboard
  async stats(req: Request, res: Response) {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, stats);
  }

  async deleteAllAttendees(req: Request, res: Response) {
    const result = await adminService.softDeleteAllAttendees();
    sendSuccess(res, result);
  }

  async downloadBackup(req: Request, res: Response) {
    // First do all DB queries (before touching the response stream)
    const [
      users, tribes, sessions, attendance, xpTransactions, levels,
      quizzes, quizQuestions, quizSubmissions, bonusQrCodes, bonusClaims,
      sportsTeams, teamPlayers, matches, matchEvents, playerStats,
      auditLogs, systemConfig, adminSettings, publicationCategories,
      publications, notifications, tournaments, tournamentGroups,
      tournamentTeams, tournamentMatches,
    ] = await Promise.all([
      prisma.user.findMany({ select: { id: true, email: true, name: true, phone: true, role: true, church: true, diocese: true, totalXp: true, status: true, createdAt: true } }),
      prisma.tribe.findMany(),
      prisma.conferenceSession.findMany(),
      prisma.attendance.findMany(),
      prisma.xpTransaction.findMany(),
      prisma.level.findMany(),
      prisma.quiz.findMany(),
      prisma.quizQuestion.findMany(),
      prisma.quizSubmission.findMany(),
      prisma.bonusQrCode.findMany(),
      prisma.bonusClaim.findMany(),
      prisma.sportsTeam.findMany(),
      prisma.teamPlayer.findMany(),
      prisma.match.findMany(),
      prisma.matchEvent.findMany(),
      prisma.playerStats.findMany(),
      prisma.auditLog.findMany(),
      prisma.systemConfig.findMany(),
      prisma.adminSettings.findMany(),
      prisma.publicationCategory.findMany(),
      prisma.publication.findMany(),
      prisma.notification.findMany(),
      prisma.tournament.findMany(),
      prisma.tournamentGroup.findMany(),
      prisma.tournamentTeam.findMany(),
      prisma.tournamentMatch.findMany(),
    ]);

    const dbData = {
      exportedAt: new Date().toISOString(),
      users, tribes, sessions, attendance, xpTransactions, levels,
      quizzes, quizQuestions, quizSubmissions, bonusQrCodes, bonusClaims,
      sportsTeams, teamPlayers, matches, matchEvents, playerStats,
      auditLogs, systemConfig, adminSettings, publicationCategories,
      publications, notifications, tournaments, tournamentGroups,
      tournamentTeams, tournamentMatches,
    };

    // Now stream the ZIP
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ikigai-backup-${timestamp}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const archive = new ZipArchive({ zlib: { level: 6 } });
    archive.pipe(res);

    archive.append(JSON.stringify(dbData, null, 2), { name: 'database.json' });

    const uploadsDir = path.join(__dirname, '../../../uploads');
    if (fs.existsSync(uploadsDir)) {
      archive.directory(uploadsDir, 'uploads');
    }

    await new Promise<void>((resolve, reject) => {
      archive.on('error', reject);
      res.on('error', reject);
      res.on('finish', resolve);
      archive.finalize();
    });
  }

  async adjustXp(req: Request, res: Response) {
    const result = await adminService.adjustUserXp(getParam(req, 'userId'), req.body.amount, req.body.reason, (req as any).user.userId);
    sendSuccess(res, result);
  }

  async getUserDetail(req: Request, res: Response) {
    const user = await adminService.getUserDetail(getParam(req, 'userId'));
    sendSuccess(res, user);
  }

  async getUserActivity(req: Request, res: Response) {
    const activity = await adminService.getUserActivity(getParam(req, 'userId'));
    sendSuccess(res, activity);
  }

  async getBonusQrClaims(req: Request, res: Response) {
    const claims = await adminService.getBonusQrClaims(getParam(req, 'bonusQrId'));
    sendSuccess(res, claims);
  }

  // Quizzes
  async getAllQuizzes(req: Request, res: Response) {
    const quizzes = await adminService.getAllQuizzes();
    sendSuccess(res, quizzes);
  }

  async getQuizDetail(req: Request, res: Response) {
    const quiz = await adminService.getQuizDetail(getParam(req, 'quizId'));
    sendSuccess(res, quiz);
  }

  async deleteQuizQuestion(req: Request, res: Response) {
    await adminService.deleteQuizQuestion(getParam(req, 'quizId'), getParam(req, 'questionId'));
    sendSuccess(res, { deleted: true });
  }

  // Session detail
  async getSessionDetail(req: Request, res: Response) {
    const session = await adminService.getSessionDetail(getParam(req, 'sessionId'));
    sendSuccess(res, session);
  }

  // Levels
  async getLevels(req: Request, res: Response) {
    const levels = await adminService.getLevels();
    sendSuccess(res, levels);
  }

  async createLevel(req: Request, res: Response) {
    const level = await adminService.createLevel(req.body);
    sendCreated(res, level);
  }

  async updateLevel(req: Request, res: Response) {
    const level = await adminService.updateLevel(getParam(req, 'levelId'), req.body);
    sendSuccess(res, level);
  }

  async deleteLevel(req: Request, res: Response) {
    await adminService.deleteLevel(getParam(req, 'levelId'));
    sendSuccess(res, { deleted: true });
  }

  async recalculateAllLevels(req: Request, res: Response) {
    const result = await adminService.recalculateAllLevels();
    sendSuccess(res, result);
  }

  // System Config
  async getSystemConfig(req: Request, res: Response) {
    const config = await adminService.getSystemConfig();
    sendSuccess(res, config);
  }

  async updateSystemConfig(req: Request, res: Response) {
    const key = req.params.key as string;
    const { value } = req.body;
    const userId = (req.user as any).userId;
    const config = await adminService.updateSystemConfig(key, value, userId);
    sendSuccess(res, config);
  }

  // Admin Settings
  async getAdminSettings(req: Request, res: Response) {
    const settings = await adminService.getAdminSettings();
    sendSuccess(res, settings);
  }

  async updateAdminSettings(req: Request, res: Response) {
    const settings = await adminService.updateAdminSettings(req.body);
    sendSuccess(res, settings);
  }
}

export const adminController = new AdminController();
