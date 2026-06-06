"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendCreated = sendCreated;
exports.sendPaginated = sendPaginated;
function sendSuccess(res, data, statusCode = 200) {
    res.status(statusCode).json({
        success: true,
        data,
    });
}
function sendCreated(res, data) {
    sendSuccess(res, data, 201);
}
function sendPaginated(res, data, pagination) {
    res.status(200).json({
        success: true,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit),
        },
    });
}
//# sourceMappingURL=response.js.map