"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuizSchema = exports.createQuestionSchema = exports.createQuizSchema = void 0;
const zod_1 = require("zod");
exports.createQuizSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().uuid().optional(),
    xpReward: zod_1.z.number().int().min(0).default(0),
    passingScore: zod_1.z.number().int().min(0).max(100).optional(),
    timeLimitSeconds: zod_1.z.number().int().min(10).optional(),
});
exports.createQuestionSchema = zod_1.z.object({
    questionText: zod_1.z.string().min(1),
    questionType: zod_1.z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']).default('MULTIPLE_CHOICE'),
    options: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), text: zod_1.z.string() })).optional(),
    correctAnswer: zod_1.z.string().min(1),
    points: zod_1.z.number().int().min(1).default(1),
    displayOrder: zod_1.z.number().int().min(1),
    explanation: zod_1.z.string().optional(),
});
exports.submitQuizSchema = zod_1.z.object({
    answers: zod_1.z.array(zod_1.z.object({
        questionId: zod_1.z.string().uuid(),
        answer: zod_1.z.string(),
    })),
    startedAt: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=quiz.schema.js.map