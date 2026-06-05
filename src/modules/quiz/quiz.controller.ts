import { Request, Response } from 'express';
import { quizService } from './quiz.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { getParam } from '../../utils/params';

export class QuizController {
  async create(req: Request, res: Response) {
    const quiz = await quizService.createQuiz(req.body);
    sendCreated(res, quiz);
  }

  async addQuestion(req: Request, res: Response) {
    const question = await quizService.addQuestion(getParam(req, 'quizId'), req.body);
    sendCreated(res, question);
  }

  async getQuiz(req: Request, res: Response) {
    const includeAnswers = req.user?.role !== 'ATTENDEE';
    const quiz = await quizService.getQuiz(getParam(req, 'quizId'), includeAnswers);
    sendSuccess(res, quiz);
  }

  async getActive(req: Request, res: Response) {
    const quizzes = await quizService.getActiveQuizzes();
    sendSuccess(res, quizzes);
  }

  async submit(req: Request, res: Response) {
    const result = await quizService.submitQuiz(req.user!.userId, getParam(req, 'quizId'), req.body);
    sendSuccess(res, result);
  }

  async updateStatus(req: Request, res: Response) {
    const quiz = await quizService.updateQuizStatus(getParam(req, 'quizId'), req.body.status);
    sendSuccess(res, quiz);
  }

  async getMySubmissions(req: Request, res: Response) {
    const submissions = await quizService.getMySubmissions(req.user!.userId);
    sendSuccess(res, submissions);
  }

  async getMySubmission(req: Request, res: Response) {
    const submission = await quizService.getMySubmission(req.user!.userId, getParam(req, 'quizId'));
    sendSuccess(res, submission);
  }
}

export const quizController = new QuizController();
