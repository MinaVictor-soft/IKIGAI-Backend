"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = exports.updatePublicationSchema = exports.createPublicationSchema = void 0;
const zod_1 = require("zod");
exports.createPublicationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().uuid(),
    contentUrl: zod_1.z.string().url().max(500),
    coverUrl: zod_1.z.string().url().max(500).optional(),
    fileSize: zod_1.z.number().int().positive().optional(),
    published: zod_1.z.boolean().default(false),
});
exports.updatePublicationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    contentUrl: zod_1.z.string().url().max(500).optional(),
    coverUrl: zod_1.z.string().url().max(500).nullable().optional(),
    fileSize: zod_1.z.number().int().positive().optional(),
    published: zod_1.z.boolean().optional(),
});
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50),
    labelEn: zod_1.z.string().min(1).max(100),
    labelAr: zod_1.z.string().min(1).max(100),
    color: zod_1.z.string().max(20).optional(),
    order: zod_1.z.number().int().optional(),
});
exports.updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50).optional(),
    labelEn: zod_1.z.string().min(1).max(100).optional(),
    labelAr: zod_1.z.string().min(1).max(100).optional(),
    color: zod_1.z.string().max(20).optional(),
    order: zod_1.z.number().int().optional(),
});
//# sourceMappingURL=publications.schema.js.map