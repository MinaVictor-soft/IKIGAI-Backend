import prisma from '../config/database';
import { Role } from '@prisma/client';

interface AuditLogParams {
  actorId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'FAILURE';
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        metadata: params.metadata ? (params.metadata as any) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        status: params.status || 'SUCCESS',
      },
    });
  } catch (error) {
    // Audit log failures should never crash the app
    console.error('Failed to create audit log:', error);
  }
}

export function getClientIp(req: { ip?: string; headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')[0].trim();
  }
  return req.ip || 'unknown';
}
