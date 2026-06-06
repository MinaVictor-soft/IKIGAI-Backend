"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicationsService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
const notifications_service_1 = require("../notifications/notifications.service");
const push_notifications_service_1 = require("../push-notifications/push-notifications.service");
class PublicationsService {
    async create(input, createdBy) {
        const publication = await database_1.default.publication.create({
            data: {
                ...input,
                publishedAt: input.published ? new Date() : null,
                createdBy,
            },
            include: { category: true, creator: { select: { name: true } } },
        });
        // Create notifications if published
        if (publication.published) {
            try {
                const users = await database_1.default.user.findMany({
                    where: { status: 'ACTIVE' },
                    select: { id: true },
                });
                const userIds = users.map(u => u.id);
                if (userIds.length > 0) {
                    await notifications_service_1.notificationsService.createBulkNotifications(userIds, 'PUBLICATION_CREATED', '📰 منشور جديد!', `${publication.title} بقلم ${publication.creator.name}`, {
                        publicationId: publication.id,
                        title: publication.title,
                        author: publication.creator.name,
                    });
                    // Send push notifications
                    await push_notifications_service_1.pushNotificationsService.sendBroadcastNotification('📰 منشور جديد!', `${publication.title} بقلم ${publication.creator.name}`, {
                        publicationId: publication.id,
                        title: publication.title,
                        author: publication.creator.name,
                        type: 'PUBLICATION_CREATED',
                    });
                }
            }
            catch (error) {
                console.error('Error creating notifications for publication:', error);
            }
        }
        return publication;
    }
    async update(id, input) {
        const existing = await database_1.default.publication.findUnique({
            where: { id },
            include: { creator: { select: { name: true } } }
        });
        if (!existing)
            throw new errorHandler_1.AppError(404, 'NOT_FOUND', 'Publication not found');
        const data = { ...input };
        let shouldNotify = false;
        // Set publishedAt when publishing for the first time
        if (input.published === true && !existing.publishedAt) {
            data.publishedAt = new Date();
            shouldNotify = true;
        }
        const updated = await database_1.default.publication.update({
            where: { id },
            data,
            include: { category: true, creator: { select: { name: true } } }
        });
        // Create notifications if just published
        if (shouldNotify) {
            try {
                const users = await database_1.default.user.findMany({
                    where: { status: 'ACTIVE' },
                    select: { id: true },
                });
                const userIds = users.map(u => u.id);
                if (userIds.length > 0) {
                    await notifications_service_1.notificationsService.createBulkNotifications(userIds, 'PUBLICATION_CREATED', '📰 منشور جديد!', `${updated.title} بقلم ${updated.creator.name}`, {
                        publicationId: updated.id,
                        title: updated.title,
                        author: updated.creator.name,
                    });
                }
            }
            catch (error) {
                console.error('Error creating notifications for publication:', error);
            }
        }
        return updated;
    }
    async delete(id) {
        const existing = await database_1.default.publication.findUnique({ where: { id } });
        if (!existing)
            throw new errorHandler_1.AppError(404, 'NOT_FOUND', 'Publication not found');
        await database_1.default.publication.delete({ where: { id } });
    }
    async getAll(categoryId) {
        const where = {};
        if (categoryId)
            where.categoryId = categoryId;
        return database_1.default.publication.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { creator: { select: { id: true, name: true } }, category: true },
        });
    }
    async getPublished(categoryId) {
        const where = { published: true };
        if (categoryId)
            where.categoryId = categoryId;
        return database_1.default.publication.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
            include: { category: { select: { id: true, name: true, labelEn: true, labelAr: true, color: true } } },
        });
    }
    async getById(id) {
        const publication = await database_1.default.publication.findUnique({
            where: { id },
            include: { creator: { select: { id: true, name: true } }, category: true },
        });
        if (!publication)
            throw new errorHandler_1.AppError(404, 'NOT_FOUND', 'Publication not found');
        return publication;
    }
    // ============ CATEGORIES ============
    async getCategories() {
        return database_1.default.publicationCategory.findMany({ orderBy: { order: 'asc' } });
    }
    async createCategory(input) {
        return database_1.default.publicationCategory.create({ data: input });
    }
    async updateCategory(id, input) {
        const existing = await database_1.default.publicationCategory.findUnique({ where: { id } });
        if (!existing)
            throw new errorHandler_1.AppError(404, 'NOT_FOUND', 'Category not found');
        return database_1.default.publicationCategory.update({ where: { id }, data: input });
    }
    async deleteCategory(id) {
        const existing = await database_1.default.publicationCategory.findUnique({ where: { id } });
        if (!existing)
            throw new errorHandler_1.AppError(404, 'NOT_FOUND', 'Category not found');
        const pubCount = await database_1.default.publication.count({ where: { categoryId: id } });
        if (pubCount > 0)
            throw new errorHandler_1.AppError(400, 'CATEGORY_IN_USE', `Cannot delete category with ${pubCount} publications`);
        await database_1.default.publicationCategory.delete({ where: { id } });
    }
}
exports.publicationsService = new PublicationsService();
//# sourceMappingURL=publications.service.js.map