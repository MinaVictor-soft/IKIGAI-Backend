"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicationsController = void 0;
const publications_service_1 = require("./publications.service");
const response_1 = require("../../utils/response");
const params_1 = require("../../utils/params");
const errorHandler_1 = require("../../middleware/errorHandler");
class PublicationsController {
    // Admin: create publication (with URL)
    async create(req, res) {
        const result = await publications_service_1.publicationsService.create(req.body, req.user.userId);
        (0, response_1.sendCreated)(res, result);
    }
    // Admin: upload file and create publication
    async uploadAndCreate(req, res) {
        if (!req.file) {
            throw new errorHandler_1.AppError(400, 'NO_FILE', 'File is required');
        }
        const { title, description, categoryId, published } = req.body;
        if (!title || !categoryId) {
            throw new errorHandler_1.AppError(400, 'MISSING_FIELDS', 'title and categoryId are required');
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const contentUrl = `${baseUrl}/uploads/${req.file.filename}`;
        const result = await publications_service_1.publicationsService.create({
            title,
            description: description || undefined,
            categoryId,
            contentUrl,
            fileSize: req.file.size,
            published: published === 'true' || published === true,
        }, req.user.userId);
        (0, response_1.sendCreated)(res, result);
    }
    // Admin: update publication
    async update(req, res) {
        const id = (0, params_1.getParam)(req, 'id');
        const result = await publications_service_1.publicationsService.update(id, req.body);
        (0, response_1.sendSuccess)(res, result);
    }
    // Admin: delete publication
    async delete(req, res) {
        const id = (0, params_1.getParam)(req, 'id');
        await publications_service_1.publicationsService.delete(id);
        (0, response_1.sendSuccess)(res, { message: 'Publication deleted' });
    }
    // Admin: get all (including unpublished)
    async getAll(req, res) {
        const categoryId = (0, params_1.getQuery)(req, 'categoryId');
        const result = await publications_service_1.publicationsService.getAll(categoryId);
        (0, response_1.sendSuccess)(res, result);
    }
    // Public (authenticated): get published only
    async getPublished(req, res) {
        const categoryId = (0, params_1.getQuery)(req, 'categoryId');
        const result = await publications_service_1.publicationsService.getPublished(categoryId);
        (0, response_1.sendSuccess)(res, result);
    }
    // Public (authenticated): get single
    async getById(req, res) {
        const id = (0, params_1.getParam)(req, 'id');
        const result = await publications_service_1.publicationsService.getById(id);
        (0, response_1.sendSuccess)(res, result);
    }
    // ============ CATEGORIES ============
    async getCategories(req, res) {
        const result = await publications_service_1.publicationsService.getCategories();
        (0, response_1.sendSuccess)(res, result);
    }
    async createCategory(req, res) {
        const result = await publications_service_1.publicationsService.createCategory(req.body);
        (0, response_1.sendCreated)(res, result);
    }
    async updateCategory(req, res) {
        const id = (0, params_1.getParam)(req, 'id');
        const result = await publications_service_1.publicationsService.updateCategory(id, req.body);
        (0, response_1.sendSuccess)(res, result);
    }
    async deleteCategory(req, res) {
        const id = (0, params_1.getParam)(req, 'id');
        await publications_service_1.publicationsService.deleteCategory(id);
        (0, response_1.sendSuccess)(res, { message: 'Category deleted' });
    }
}
exports.publicationsController = new PublicationsController();
//# sourceMappingURL=publications.controller.js.map