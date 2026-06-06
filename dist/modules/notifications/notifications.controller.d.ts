import { Request, Response } from 'express';
export declare function getRecentNotifications(req: Request, res: Response): Promise<void>;
export declare function getNotifications(req: Request, res: Response): Promise<void>;
export declare function markAsRead(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function markAllAsRead(req: Request, res: Response): Promise<void>;
