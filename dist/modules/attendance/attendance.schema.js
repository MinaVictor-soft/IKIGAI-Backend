"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanQrSchema = void 0;
const zod_1 = require("zod");
exports.scanQrSchema = zod_1.z.object({
    qrToken: zod_1.z.string().min(1, 'QR token is required'),
});
//# sourceMappingURL=attendance.schema.js.map