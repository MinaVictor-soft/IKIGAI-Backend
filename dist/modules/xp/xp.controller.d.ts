import { Request, Response } from 'express';
export declare class XpController {
    getLevels(req: Request, res: Response): Promise<void>;
    award(req: Request, res: Response): Promise<void>;
    myRank(req: Request, res: Response): Promise<void>;
    leaderboard(req: Request, res: Response): Promise<void>;
    tribeLeaderboard(req: Request, res: Response): Promise<void>;
    myHistory(req: Request, res: Response): Promise<void>;
    userHistory(req: Request, res: Response): Promise<void>;
}
export declare const xpController: XpController;
