import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
export declare function authorize(...allowedRoles: Role[]): (req: Request, _res: Response, next: NextFunction) => void;
