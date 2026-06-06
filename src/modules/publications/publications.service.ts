import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { notificationsService } from '../notifications/notifications.service';
import { pushNotificationsService } from '../push-notifications/push-notifications.service';
import { CreatePublicationInput, UpdatePublicationInput, CreateCategoryInput, UpdateCategoryInput } from './publications.schema';

class PublicationsService {
  async create(input: CreatePublicationInput, createdBy: string) {
    const publication = await prisma.publication.create({
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
        const users = await prisma.user.findMany({
          where: { status: 'ACTIVE' },
          select: { id: true },
        });

        const userIds = users.map(u => u.id);
        if (userIds.length > 0) {
          await notificationsService.createBulkNotifications(
            userIds,
            'PUBLICATION_CREATED',
            '📰 منشور جديد!',
            `${publication.title} بقلم ${publication.creator.name}`,
            {
              publicationId: publication.id,
              title: publication.title,
              author: publication.creator.name,
            }
          );

          // Send push notifications
          await pushNotificationsService.sendBroadcastNotification(
            '📰 منشور جديد!',
            `${publication.title} بقلم ${publication.creator.name}`,
            {
              publicationId: publication.id,
              title: publication.title,
              author: publication.creator.name,
              type: 'PUBLICATION_CREATED',
            }
          );
        }
      } catch (error) {
        console.error('Error creating notifications for publication:', error);
      }
    }

    return publication;
  }

  async update(id: string, input: UpdatePublicationInput) {
    const existing = await prisma.publication.findUnique({ 
      where: { id },
      include: { creator: { select: { name: true } } }
    });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Publication not found');

    const data: any = { ...input };
    let shouldNotify = false;

    // Set publishedAt when publishing for the first time
    if (input.published === true && !existing.publishedAt) {
      data.publishedAt = new Date();
      shouldNotify = true;
    }

    const updated = await prisma.publication.update({ 
      where: { id }, 
      data, 
      include: { category: true, creator: { select: { name: true } } } 
    });

    // Create notifications if just published
    if (shouldNotify) {
      try {
        const users = await prisma.user.findMany({
          where: { status: 'ACTIVE' },
          select: { id: true },
        });

        const userIds = users.map(u => u.id);
        if (userIds.length > 0) {
          await notificationsService.createBulkNotifications(
            userIds,
            'PUBLICATION_CREATED',
            '📰 منشور جديد!',
            `${updated.title} بقلم ${updated.creator.name}`,
            {
              publicationId: updated.id,
              title: updated.title,
              author: updated.creator.name,
            }
          );
        }
      } catch (error) {
        console.error('Error creating notifications for publication:', error);
      }
    }

    return updated;
  }

  async delete(id: string) {
    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Publication not found');
    await prisma.publication.delete({ where: { id } });
  }

  async getAll(categoryId?: string) {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;

    return prisma.publication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { id: true, name: true } }, category: true },
    });
  }

  async getPublished(categoryId?: string) {
    const where: any = { published: true };
    if (categoryId) where.categoryId = categoryId;

    return prisma.publication.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      include: { category: { select: { id: true, name: true, labelEn: true, labelAr: true, color: true } } },
    });
  }

  async getById(id: string) {
    const publication = await prisma.publication.findUnique({
      where: { id },
      include: { creator: { select: { id: true, name: true } }, category: true },
    });
    if (!publication) throw new AppError(404, 'NOT_FOUND', 'Publication not found');
    return publication;
  }

  // ============ CATEGORIES ============

  async getCategories() {
    return prisma.publicationCategory.findMany({ orderBy: { order: 'asc' } });
  }

  async createCategory(input: CreateCategoryInput) {
    return prisma.publicationCategory.create({ data: input });
  }

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const existing = await prisma.publicationCategory.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Category not found');
    return prisma.publicationCategory.update({ where: { id }, data: input });
  }

  async deleteCategory(id: string) {
    const existing = await prisma.publicationCategory.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Category not found');
    const pubCount = await prisma.publication.count({ where: { categoryId: id } });
    if (pubCount > 0) throw new AppError(400, 'CATEGORY_IN_USE', `Cannot delete category with ${pubCount} publications`);
    await prisma.publicationCategory.delete({ where: { id } });
  }
}

export const publicationsService = new PublicationsService();
