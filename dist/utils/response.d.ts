import { Response } from 'express';
export declare function sendSuccess(res: Response, data: unknown, statusCode?: number): void;
export declare function sendCreated(res: Response, data: unknown): void;
export declare function sendPaginated(res: Response, data: unknown[], pagination: {
    page: number;
    limit: number;
    total: number;
}): void;
