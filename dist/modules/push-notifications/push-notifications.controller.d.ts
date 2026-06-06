import { Request, Response } from 'express';
export declare class PushNotificationsController {
    registerToken(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deactivateToken(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const pushNotificationsController: PushNotificationsController;
