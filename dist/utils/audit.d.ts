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
export declare function createAuditLog(params: AuditLogParams): Promise<void>;
export declare function getClientIp(req: {
    ip?: string;
    headers: Record<string, string | string[] | undefined>;
}): string;
export {};
