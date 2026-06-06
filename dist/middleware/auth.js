"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errorHandler_1.AppError(401, 'UNAUTHORIZED', 'Access token is required');
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new errorHandler_1.AppError(401, 'TOKEN_EXPIRED', 'Access token has expired');
        }
        throw new errorHandler_1.AppError(401, 'INVALID_TOKEN', 'Invalid access token');
    }
}
function authorize(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'UNAUTHORIZED', 'Authentication required');
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new errorHandler_1.AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action');
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map