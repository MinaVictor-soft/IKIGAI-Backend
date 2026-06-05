import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { getClientIp } from '../../utils/audit';

export class AuthController {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    sendCreated(res, user);
  }

  async login(req: Request, res: Response) {
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    const result = await authService.login(req.body, ip, userAgent);
    sendSuccess(res, result);
  }

  async refresh(req: Request, res: Response) {
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    const result = await authService.refreshAccessToken(req.body.refreshToken, ip, userAgent);
    sendSuccess(res, result);
  }

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, { message: 'Logged out successfully' });
  }

  async me(req: Request, res: Response) {
    const profile = await authService.getProfile(req.user!.userId);
    sendSuccess(res, profile);
  }

  async changePassword(req: Request, res: Response) {
    const result = await authService.changePassword(req.user!.userId, req.body);
    sendSuccess(res, result);
  }
}

export const authController = new AuthController();
