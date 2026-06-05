import { z } from 'zod';

export const createPublicationSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  categoryId: z.string().uuid(),
  contentUrl: z.string().url().max(500),
  coverUrl: z.string().url().max(500).optional(),
  fileSize: z.number().int().positive().optional(),
  published: z.boolean().default(false),
});

export const updatePublicationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  contentUrl: z.string().url().max(500).optional(),
  coverUrl: z.string().url().max(500).nullable().optional(),
  fileSize: z.number().int().positive().optional(),
  published: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  labelEn: z.string().min(1).max(100),
  labelAr: z.string().min(1).max(100),
  color: z.string().max(20).optional(),
  order: z.number().int().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  labelEn: z.string().min(1).max(100).optional(),
  labelAr: z.string().min(1).max(100).optional(),
  color: z.string().max(20).optional(),
  order: z.number().int().optional(),
});

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
