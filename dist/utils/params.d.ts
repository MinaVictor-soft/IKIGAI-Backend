import { Request } from 'express';
/** Safely get a route parameter as a string */
export declare function getParam(req: Request, name: string): string;
/** Safely get a query parameter as a string or undefined */
export declare function getQuery(req: Request, name: string): string | undefined;
