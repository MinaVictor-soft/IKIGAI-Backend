import { Request, Response } from 'express';
declare class PublicationsController {
    create(req: Request, res: Response): Promise<void>;
    uploadAndCreate(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    getAll(req: Request, res: Response): Promise<void>;
    getPublished(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    getCategories(req: Request, res: Response): Promise<void>;
    createCategory(req: Request, res: Response): Promise<void>;
    updateCategory(req: Request, res: Response): Promise<void>;
    deleteCategory(req: Request, res: Response): Promise<void>;
}
export declare const publicationsController: PublicationsController;
export {};
