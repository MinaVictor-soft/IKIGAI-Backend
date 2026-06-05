import { Request, Response } from 'express';
import { bonusService } from './bonus.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { getParam } from '../../utils/params';

export class BonusController {
  async createQr(req: Request, res: Response) {
    const qr = await bonusService.createBonusQr(req.user!.userId, req.body);
    sendCreated(res, qr);
  }

  async claim(req: Request, res: Response) {
    const result = await bonusService.claimBonus(req.user!.userId, req.body.token);
    sendSuccess(res, result);
  }

  async staffAward(req: Request, res: Response) {
    const result = await bonusService.staffAward(req.user!.userId, req.body);
    sendSuccess(res, result);
  }

  async myQrs(req: Request, res: Response) {
    const qrs = await bonusService.getMyBonusQrs(req.user!.userId);
    sendSuccess(res, qrs);
  }

  async deactivate(req: Request, res: Response) {
    const qr = await bonusService.deactivateQr(getParam(req, 'qrId'), req.user!.userId);
    sendSuccess(res, qr);
  }
}

export const bonusController = new BonusController();
