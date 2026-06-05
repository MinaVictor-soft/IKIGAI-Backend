import { Request, Response } from 'express';
import { xpService } from './xp.service';
import { sendSuccess } from '../../utils/response';
import { getParam, getQuery } from '../../utils/params';
import prisma from '../../config/database';

export class XpController {
  async getLevels(req: Request, res: Response) {
    const levels = await prisma.level.findMany({ orderBy: { minXp: 'asc' } });
    sendSuccess(res, levels);
  }
  async award(req: Request, res: Response) {
    const result = await xpService.adminAward(
      req.user!.userId,
      req.body.userId,
      req.body.amount,
      req.body.description
    );
    sendSuccess(res, result);
  }

  async myRank(req: Request, res: Response) {
    const data = await xpService.getUserRank(req.user!.userId);
    sendSuccess(res, data);
  }

  async leaderboard(req: Request, res: Response) {
    const limit = parseInt(getQuery(req, 'limit') || '50', 10);
    const data = await xpService.getLeaderboard(limit);
    sendSuccess(res, data);
  }

  async tribeLeaderboard(req: Request, res: Response) {
    const data = await xpService.getTribeLeaderboard();
    sendSuccess(res, data);
  }

  async myHistory(req: Request, res: Response) {
    const limit = parseInt(getQuery(req, 'limit') || '50', 10);
    const data = await xpService.getUserXpHistory(req.user!.userId, limit);
    sendSuccess(res, data);
  }

  async userHistory(req: Request, res: Response) {
    const limit = parseInt(getQuery(req, 'limit') || '50', 10);
    const data = await xpService.getUserXpHistory(getParam(req, 'userId'), limit);
    sendSuccess(res, data);
  }
}

export const xpController = new XpController();
