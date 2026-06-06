import { z } from 'zod';
export declare const createQuizSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    xpReward: z.ZodDefault<z.ZodNumber>;
    passingScore: z.ZodOptional<z.ZodNumber>;
    timeLimitSeconds: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const createQuestionSchema: z.ZodObject<{
    questionText: z.ZodString;
    questionType: z.ZodDefault<z.ZodEnum<{
        MULTIPLE_CHOICE: "MULTIPLE_CHOICE";
        TRUE_FALSE: "TRUE_FALSE";
        SHORT_ANSWER: "SHORT_ANSWER";
    }>>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
    }, z.core.$strip>>>;
    correctAnswer: z.ZodString;
    points: z.ZodDefault<z.ZodNumber>;
    displayOrder: z.ZodNumber;
    explanation: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const submitQuizSchema: z.ZodObject<{
    answers: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        answer: z.ZodString;
    }, z.core.$strip>>;
    startedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
