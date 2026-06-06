import { CreatePublicationInput, UpdatePublicationInput, CreateCategoryInput, UpdateCategoryInput } from './publications.schema';
declare class PublicationsService {
    create(input: CreatePublicationInput, createdBy: string): Promise<{
        creator: {
            name: string;
        };
        category: {
            name: string;
            id: string;
            createdAt: Date;
            color: string;
            labelEn: string;
            labelAr: string;
            order: number;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        createdBy: string;
        categoryId: string;
        contentUrl: string;
        coverUrl: string | null;
        fileSize: number | null;
        published: boolean;
        publishedAt: Date | null;
    }>;
    update(id: string, input: UpdatePublicationInput): Promise<{
        creator: {
            name: string;
        };
        category: {
            name: string;
            id: string;
            createdAt: Date;
            color: string;
            labelEn: string;
            labelAr: string;
            order: number;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        createdBy: string;
        categoryId: string;
        contentUrl: string;
        coverUrl: string | null;
        fileSize: number | null;
        published: boolean;
        publishedAt: Date | null;
    }>;
    delete(id: string): Promise<void>;
    getAll(categoryId?: string): Promise<({
        creator: {
            name: string;
            id: string;
        };
        category: {
            name: string;
            id: string;
            createdAt: Date;
            color: string;
            labelEn: string;
            labelAr: string;
            order: number;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        createdBy: string;
        categoryId: string;
        contentUrl: string;
        coverUrl: string | null;
        fileSize: number | null;
        published: boolean;
        publishedAt: Date | null;
    })[]>;
    getPublished(categoryId?: string): Promise<({
        category: {
            name: string;
            id: string;
            color: string;
            labelEn: string;
            labelAr: string;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        createdBy: string;
        categoryId: string;
        contentUrl: string;
        coverUrl: string | null;
        fileSize: number | null;
        published: boolean;
        publishedAt: Date | null;
    })[]>;
    getById(id: string): Promise<{
        creator: {
            name: string;
            id: string;
        };
        category: {
            name: string;
            id: string;
            createdAt: Date;
            color: string;
            labelEn: string;
            labelAr: string;
            order: number;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        createdBy: string;
        categoryId: string;
        contentUrl: string;
        coverUrl: string | null;
        fileSize: number | null;
        published: boolean;
        publishedAt: Date | null;
    }>;
    getCategories(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        color: string;
        labelEn: string;
        labelAr: string;
        order: number;
    }[]>;
    createCategory(input: CreateCategoryInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        color: string;
        labelEn: string;
        labelAr: string;
        order: number;
    }>;
    updateCategory(id: string, input: UpdateCategoryInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        color: string;
        labelEn: string;
        labelAr: string;
        order: number;
    }>;
    deleteCategory(id: string): Promise<void>;
}
export declare const publicationsService: PublicationsService;
export {};
