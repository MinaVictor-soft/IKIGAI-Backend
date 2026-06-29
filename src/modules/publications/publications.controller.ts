import { Request, Response } from 'express';
import { publicationsService } from './publications.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { getParam, getQuery } from '../../utils/params';
import { AppError } from '../../middleware/errorHandler';
import { uploadToStorage } from '../../services/storage.service';

class PublicationsController {
  // Admin: create publication (with URL)
  async create(req: Request, res: Response) {
    const result = await publicationsService.create(req.body, req.user!.userId);
    sendCreated(res, result);
  }

  // Admin: upload file and create publication (stored in Replit App Storage)
  async uploadAndCreate(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError(400, 'NO_FILE', 'File is required');
    }

    const { title, description, categoryId, published } = req.body;
    if (!title || !categoryId) {
      throw new AppError(400, 'MISSING_FIELDS', 'title and categoryId are required');
    }

    const { url: contentUrl } = await uploadToStorage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'publications'
    );

    const result = await publicationsService.create({
      title,
      description: description || undefined,
      categoryId,
      contentUrl,
      fileSize: req.file.size,
      published: published === 'true' || published === true,
    }, req.user!.userId);

    sendCreated(res, result);
  }

  // Admin: update publication
  async update(req: Request, res: Response) {
    const id = getParam(req, 'id');
    const result = await publicationsService.update(id, req.body);
    sendSuccess(res, result);
  }

  // Admin: delete publication
  async delete(req: Request, res: Response) {
    const id = getParam(req, 'id');
    await publicationsService.delete(id);
    sendSuccess(res, { message: 'Publication deleted' });
  }

  // Admin: get all (including unpublished)
  async getAll(req: Request, res: Response) {
    const categoryId = getQuery(req, 'categoryId');
    const result = await publicationsService.getAll(categoryId);
    sendSuccess(res, result);
  }

  // Public (authenticated): get published only
  async getPublished(req: Request, res: Response) {
    const categoryId = getQuery(req, 'categoryId');
    const result = await publicationsService.getPublished(categoryId);
    sendSuccess(res, result);
  }

  // Public (authenticated): get single
  async getById(req: Request, res: Response) {
    const id = getParam(req, 'id');
    const result = await publicationsService.getById(id);
    sendSuccess(res, result);
  }

  // ============ CATEGORIES ============

  async getCategories(req: Request, res: Response) {
    const result = await publicationsService.getCategories();
    sendSuccess(res, result);
  }

  async createCategory(req: Request, res: Response) {
    const result = await publicationsService.createCategory(req.body);
    sendCreated(res, result);
  }

  async updateCategory(req: Request, res: Response) {
    const id = getParam(req, 'id');
    const result = await publicationsService.updateCategory(id, req.body);
    sendSuccess(res, result);
  }

  async deleteCategory(req: Request, res: Response) {
    const id = getParam(req, 'id');
    await publicationsService.deleteCategory(id);
    sendSuccess(res, { message: 'Category deleted' });
  }
}

export const publicationsController = new PublicationsController();
