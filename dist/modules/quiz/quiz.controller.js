"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizController = exports.QuizController = void 0;
const quiz_service_1 = require("./quiz.service");
const response_1 = require("../../utils/response");
const params_1 = require("../../utils/params");
class QuizController {
    async create(req, res) {
        const quiz = await quiz_service_1.quizService.createQuiz(req.body);
        (0, response_1.sendCreated)(res, quiz);
    }
    async addQuestion(req, res) {
        const question = await quiz_service_1.quizService.addQuestion((0, params_1.getParam)(req, 'quizId'), req.body);
        (0, response_1.sendCreated)(res, question);
    }
    async getQuiz(req, res) {
        const includeAnswers = req.user?.role !== 'ATTENDEE';
        const quiz = await quiz_service_1.quizService.getQuiz((0, params_1.getParam)(req, 'quizId'), includeAnswers);
        (0, response_1.sendSuccess)(res, quiz);
    }
    async getActive(req, res) {
        const quizzes = await quiz_service_1.quizService.getActiveQuizzes();
        (0, response_1.sendSuccess)(res, quizzes);
    }
    async submit(req, res) {
        const result = await quiz_service_1.quizService.submitQuiz(req.user.userId, (0, params_1.getParam)(req, 'quizId'), req.body);
        (0, response_1.sendSuccess)(res, result);
    }
    async updateStatus(req, res) {
        const quiz = await quiz_service_1.quizService.updateQuizStatus((0, params_1.getParam)(req, 'quizId'), req.body.status);
        (0, response_1.sendSuccess)(res, quiz);
    }
    async getMySubmissions(req, res) {
        const submissions = await quiz_service_1.quizService.getMySubmissions(req.user.userId);
        (0, response_1.sendSuccess)(res, submissions);
    }
    async getMySubmission(req, res) {
        const submission = await quiz_service_1.quizService.getMySubmission(req.user.userId, (0, params_1.getParam)(req, 'quizId'));
        (0, response_1.sendSuccess)(res, submission);
    }
}
exports.QuizController = QuizController;
exports.quizController = new QuizController();
//# sourceMappingURL=quiz.controller.js.map