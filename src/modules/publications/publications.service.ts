import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { CreatePublicationInput, UpdatePublicationInput, CreateCategoryInput, UpdateCategoryInput } from './publications.schema';

class PublicationsService {
  async create(input: CreatePublicationInput, createdBy: string) {
    const publication = await prisma.publication.create({
      data: {
        ...input,
        publishedAt: input.published ? new Date() : null,
        createdBy,
      },
      include: { category: true },
    });
    return publication;
  }

  async update(id: string, input: UpdatePublicationInput) {
    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Publication not found');

    const data: any = { ...input };

    // Set publishedAt when publishing for the first time
    if (input.published === true && !existing.publishedAt) {
      data.publishedAt = new Date();
    }

    return prisma.publication.update({ where: { id }, data, include: { category: true } });
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
