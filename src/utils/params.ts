import { Request } from 'express';

/** Safely get a route parameter as a string */
export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0]! : value!;
}

/** Safely get a query parameter as a string or undefined */
export function getQuery(req: Request, name: string): string | undefined {
  const value = req.query[name];
  if (!value) return undefined;
  return Array.isArray(value) ? String(value[0]) : String(value);
}
