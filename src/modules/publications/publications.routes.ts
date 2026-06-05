import { Router } from 'express';
import { publicationsController } from './publications.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { createPublicationSchema, updatePublicationSchema, createCategorySchema, updateCategorySchema } from './publications.schema';
import { asyncHandler } from '../../utils/asyncHandler';
import { upload } from '../../middleware/upload';

const router = Router();

// ============ CATEGORIES ============
router.get('/categories', authenticate, asyncHandler(publicationsController.getCategories));
router.post('/categories', authenticate, authorize('STAFF', 'ADMIN', 'SUPER_ADMIN'), validate(createCategorySchema), asyncHandler(publicationsController.createCategory));
router.patch('/categories/:id', authenticate, authorize('STAFF', 'ADMIN', 'SUPER_ADMIN'), validate(updateCategorySchema), asyncHandler(publicationsController.updateCategory));
router.delete('/categories/:id', authenticate, authorize('STAFF', 'ADMIN', 'SUPER_ADMIN'), asyncHandler(publicationsController.deleteCategory));

// Admin: get all including unpublished (must be before /:id)
router.get('/admin/all', authenticate, authorize('STAFF', 'ADMIN', 'SUPER_ADMIN'), asyncHandler(publicationsController.getAll));

// Public routes (authenticated users)
router.get('/', authenticate, asyncHandler(publicationsController.getPublished));
router.get('/:id', authenticate, asyncHandler(publicationsController.getById));

// Admin routes
router.post('/', authenticate, authorize('STAFF', 'ADMIN', 'SUPER_ADMIN'), validate(createPublicationSchema), asyncHandler(publicationsController.create));
router.post('/upload', authenticate, authorize('STAFF', 'ADMIN', 'SUPER_ADMIN'), upload.single('file'), asyncHandler(publicationsController.uploadAndCreate));
router.patch('/:id', authenticate, authorize('STAFF', 'ADMIN', 'SUPER_ADMIN'), validate(updatePublicationSchema), asyncHandler(publicationsController.update));
router.delete('/:id', authenticate, authorize('STAFF', 'ADMIN', 'SUPER_ADMIN'), asyncHandler(publicationsController.delete));

export default router;
