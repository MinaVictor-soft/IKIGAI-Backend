import { Request, Response, NextFunction } from 'express';
type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare function asyncHandler(fn: AsyncFn): (req: Request, res: Response, next: NextFunction) => void;
export {};
