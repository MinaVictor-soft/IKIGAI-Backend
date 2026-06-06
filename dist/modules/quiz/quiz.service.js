"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizService = exports.QuizService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
const xp_service_1 = require("../xp/xp.service");
class QuizService {
    async createQuiz(input) {
        return database_1.default.quiz.create({ data: input });
    }
    async addQuestion(quizId, input) {
        const quiz = await database_1.default.quiz.findUnique({ where: { id: quizId } });
        if (!quiz)
            throw new errorHandler_1.AppError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
        const question = await database_1.default.quizQuestion.create({
            data: { quizId, ...input },
        });
        await database_1.default.quiz.update({
            where: { id: quizId },
            data: { questionCount: { increment: 1 } },
        });
        return question;
    }
    async getQuiz(quizId, includeAnswers = false) {
        const quiz = await database_1.default.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { displayOrder: 'asc' },
                    select: {
                        id: true,
                        questionText: true,
                        questionType: true,
                        options: true,
                        points: true,
                        displayOrder: true,
                        explanation: includeAnswers ? true : false,
                        correctAnswer: includeAnswers ? true : false,
                    },
                },
            },
        });
        if (!quiz)
            throw new errorHandler_1.AppError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
        return quiz;
    }
    async getActiveQuizzes() {
        return database_1.default.quiz.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                title: true,
                description: true,
                xpReward: true,
                timeLimitSeconds: true,
                questionCount: true,
                passingScore: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async submitQuiz(userId, quizId, input) {
        const quiz = await database_1.default.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true },
        });
        if (!quiz)
            throw new errorHandler_1.AppError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
        if (quiz.status !== 'ACTIVE')
            throw new errorHandler_1.AppError(422, 'QUIZ_NOT_ACTIVE', 'This quiz is not currently active');
        // Check if already submitted
        const existing = await database_1.default.quizSubmission.findUnique({
            where: { userId_quizId: { userId, quizId } },
        });
        if (existing)
            throw new errorHandler_1.AppError(409, 'QUIZ_ALREADY_SUBMITTED', 'You have already submitted this quiz');
        // Server-side timer validation
        if (quiz.timeLimitSeconds && input.startedAt) {
            const startedAt = new Date(input.startedAt);
            const elapsed = (Date.now() - startedAt.getTime()) / 1000;
            const grace = 5; // 5 seconds grace
            if (elapsed > quiz.timeLimitSeconds + grace) {
                throw new errorHandler_1.AppError(422, 'QUIZ_TIME_EXPIRED', 'Quiz time limit exceeded');
            }
        }
        // Grade the quiz
        let score = 0;
        let maxScore = 0;
        for (const question of quiz.questions) {
            maxScore += question.points;
            const userAnswer = input.answers.find(a => a.questionId === question.id);
            if (userAnswer && userAnswer.answer === question.correctAnswer) {
                score += question.points;
            }
        }
        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        const passed = quiz.passingScore ? percentage >= quiz.passingScore : true;
        const xpAwarded = passed ? quiz.xpReward : 0;
        // Calculate time taken
        let timeTakenSeconds;
        if (input.startedAt) {
            timeTakenSeconds = Math.floor((Date.now() - new Date(input.startedAt).getTime()) / 1000);
        }
        // Save submission + award XP in transaction
        const submission = await database_1.default.$transaction(async (tx) => {
            const sub = await tx.quizSubmission.create({
                data: {
                    userId,
                    quizId,
                    answers: input.answers,
                    score,
                    maxScore,
                    percentage,
                    passed,
                    xpAwarded,
                    startedAt: input.startedAt ? new Date(input.startedAt) : null,
                    timeTakenSeconds,
                },
            });
            if (xpAwarded > 0) {
                await xp_service_1.xpService.awardXp(tx, {
                    userId,
                    amount: xpAwarded,
                    type: 'QUIZ',
                    sourceType: 'QUIZ',
                    sourceId: quizId,
                    description: `Quiz: ${quiz.title} (${score}/${maxScore})`,
                });
            }
            return sub;
        });
        return {
            ...submission,
            correctAnswers: quiz.questions.map(q => ({
                questionId: q.id,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
            })),
        };
    }
    async updateQuizStatus(quizId, status) {
        const quiz = await database_1.default.quiz.findUnique({ where: { id: quizId } });
        if (!quiz)
            throw new errorHandler_1.AppError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
        return database_1.default.quiz.update({
            where: { id: quizId },
            data: { status },
        });
    }
    async getMySubmissions(userId) {
        const submissions = await database_1.default.quizSubmission.findMany({
            where: { userId },
            include: {
                quiz: {
                    select: { id: true, title: true, questionCount: true, xpReward: true },
                },
            },
            orderBy: { submittedAt: 'desc' },
        });
        return submissions;
    }
    async getMySubmission(userId, quizId) {
        const submission = await database_1.default.quizSubmission.findUnique({
            where: { userId_quizId: { userId, quizId } },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: { displayOrder: 'asc' },
                            select: {
                                id: true,
                                questionText: true,
                                options: true,
                                correctAnswer: true,
                                explanation: true,
                                points: true,
                            },
                        },
                    },
                },
            },
        });
        return submission;
    }
}
exports.QuizService = QuizService;
exports.quizService = new QuizService();
//# sourceMappingURL=quiz.service.js.map