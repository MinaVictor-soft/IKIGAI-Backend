"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
exports.getClientIp = getClientIp;
const database_1 = __importDefault(require("../config/database"));
async function createAuditLog(params) {
    try {
        await database_1.default.auditLog.create({
            data: {
                actorId: params.actorId,
                action: params.action,
                resource: params.resource,
                resourceId: params.resourceId,
                metadata: params.metadata ? params.metadata : undefined,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                status: params.status || 'SUCCESS',
            },
        });
    }
    catch (error) {
        // Audit log failures should never crash the app
        console.error('Failed to create audit log:', error);
    }
}
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')[0].trim();
    }
    return req.ip || 'unknown';
}
//# sourceMappingURL=audit.js.map