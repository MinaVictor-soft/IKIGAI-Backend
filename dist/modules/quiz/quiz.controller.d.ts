import { Request, Response } from 'express';
export declare class QuizController {
    create(req: Request, res: Response): Promise<void>;
    addQuestion(req: Request, res: Response): Promise<void>;
    getQuiz(req: Request, res: Response): Promise<void>;
    getActive(req: Request, res: Response): Promise<void>;
    submit(req: Request, res: Response): Promise<void>;
    updateStatus(req: Request, res: Response): Promise<void>;
    getMySubmissions(req: Request, res: Response): Promise<void>;
    getMySubmission(req: Request, res: Response): Promise<void>;
}
export declare const quizController: QuizController;
