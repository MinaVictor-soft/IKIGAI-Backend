"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publications_controller_1 = require("./publications.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const publications_schema_1 = require("./publications.schema");
const asyncHandler_1 = require("../../utils/asyncHandler");
const upload_1 = require("../../middleware/upload");
const router = (0, express_1.Router)();
// ============ CATEGORIES ============
router.get('/categories', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(publications_controller_1.publicationsController.getCategories));
router.post('/categories', auth_1.authenticate, (0, auth_1.authorize)('STAFF', 'ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(publications_schema_1.createCategorySchema), (0, asyncHandler_1.asyncHandler)(publications_controller_1.publicationsController.createCategory));
router.patch('/categories/:id', auth_1.authenticate, (0, auth_1.authorize)('STAFF', 'ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(publications_schema_1.updateCategorySchema), (0, asyncHandler_1.asyncHandler)(publications_controller_1.publicationsController.updateCategory));
router.delete('/categories/:id', auth_1.authenticate, (0, auth_1.authorize)('STAFF', 'ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(publications_controller_1.publicationsController.deleteCategory));
// Admin: get all including unpublished (must be before /:id)
router.get('/admin/all', auth_1.authenticate, (0, auth_1.authorize)('STAFF', 'ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(publications_controller_1.publicationsController.getAll));
// Public routes (authenticated users)
router.get('/', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(publications_controller_1.publicationsController.getPublished));
router.get('/:id', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(publications_controller_1.publicationsController.getById));
// Admin routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('STAFF', 'ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(publications_schema_1.createPublicationSchema), (0, asyncHandler_1.asyncHandler)(publications_controller_1.publicationsController.create));
router.post('/upload', auth_1.authenticate, (0, auth_1.authorize)('STAFF', 'ADMIN', 'SUPER_ADMIN'), upload_1.upload.single('file'), (0, asyncHandler_1.asyncHandler)(publications_controller_1.publicationsController.uploadAndCreate));
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)('STAFF', 'ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(publications_schema_1.updatePublicationSchema), (0, asyncHandler_1.asyncHandler)(publications_controller_1.publicationsController.update));
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('STAFF', 'ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(publications_controller_1.publicationsController.delete));
exports.default = router;
//# sourceMappingURL=publications.routes.js.map