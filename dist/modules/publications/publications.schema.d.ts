import { z } from 'zod';
export declare const createPublicationSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodString;
    contentUrl: z.ZodString;
    coverUrl: z.ZodOptional<z.ZodString>;
    fileSize: z.ZodOptional<z.ZodNumber>;
    published: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updatePublicationSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    contentUrl: z.ZodOptional<z.ZodString>;
    coverUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fileSize: z.ZodOptional<z.ZodNumber>;
    published: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    labelEn: z.ZodString;
    labelAr: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    labelEn: z.ZodOptional<z.ZodString>;
    labelAr: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
