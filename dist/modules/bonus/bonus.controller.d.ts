import { Request, Response } from 'express';
export declare class BonusController {
    createQr(req: Request, res: Response): Promise<void>;
    claim(req: Request, res: Response): Promise<void>;
    staffAward(req: Request, res: Response): Promise<void>;
    myQrs(req: Request, res: Response): Promise<void>;
    deactivate(req: Request, res: Response): Promise<void>;
}
export declare const bonusController: BonusController;
