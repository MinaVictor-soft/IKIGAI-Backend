import { CreateQuizInput, CreateQuestionInput, SubmitQuizInput } from './quiz.schema';
export declare class QuizService {
    createQuiz(input: CreateQuizInput): Promise<{
        sessionId: string | null;
        title: string;
        status: import(".prisma/client").$Enums.QuizStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        xpReward: number;
        passingScore: number | null;
        timeLimitSeconds: number | null;
        questionCount: number;
    }>;
    addQuestion(quizId: string, input: CreateQuestionInput): Promise<{
        quizId: string;
        questionText: string;
        correctAnswer: string;
        displayOrder: number;
        id: string;
        createdAt: Date;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        questionType: import(".prisma/client").$Enums.QuestionType;
        points: number;
        explanation: string | null;
    }>;
    getQuiz(quizId: string, includeAnswers?: boolean): Promise<{
        questions: {
            questionText: string;
            correctAnswer: string;
            displayOrder: number;
            id: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            questionType: import(".prisma/client").$Enums.QuestionType;
            points: number;
            explanation: string | null;
        }[];
    } & {
        sessionId: string | null;
        title: string;
        status: import(".prisma/client").$Enums.QuizStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        xpReward: number;
        passingScore: number | null;
        timeLimitSeconds: number | null;
        questionCount: number;
    }>;
    getActiveQuizzes(): Promise<{
        title: string;
        id: string;
        description: string | null;
        xpReward: number;
        passingScore: number | null;
        timeLimitSeconds: number | null;
        questionCount: number;
    }[]>;
    submitQuiz(userId: string, quizId: string, input: SubmitQuizInput): Promise<{
        correctAnswers: {
            questionId: string;
            correctAnswer: string;
            explanation: string | null;
        }[];
        userId: string;
        quizId: string;
        answers: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        createdAt: Date;
        xpAwarded: number;
        startedAt: Date | null;
        score: number;
        maxScore: number;
        percentage: import("@prisma/client-runtime-utils").Decimal;
        passed: boolean;
        submittedAt: Date;
        timeTakenSeconds: number | null;
    }>;
    updateQuizStatus(quizId: string, status: 'DRAFT' | 'ACTIVE' | 'CLOSED'): Promise<{
        sessionId: string | null;
        title: string;
        status: import(".prisma/client").$Enums.QuizStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        xpReward: number;
        passingScore: number | null;
        timeLimitSeconds: number | null;
        questionCount: number;
    }>;
    getMySubmissions(userId: string): Promise<({
        quiz: {
            title: string;
            id: string;
            xpReward: number;
            questionCount: number;
        };
    } & {
        userId: string;
        quizId: string;
        answers: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        createdAt: Date;
        xpAwarded: number;
        startedAt: Date | null;
        score: number;
        maxScore: number;
        percentage: import("@prisma/client-runtime-utils").Decimal;
        passed: boolean;
        submittedAt: Date;
        timeTakenSeconds: number | null;
    })[]>;
    getMySubmission(userId: string, quizId: string): Promise<({
        quiz: {
            questions: {
                questionText: string;
                correctAnswer: string;
                id: string;
                options: import("@prisma/client/runtime/client").JsonValue;
                points: number;
                explanation: string | null;
            }[];
        } & {
            sessionId: string | null;
            title: string;
            status: import(".prisma/client").$Enums.QuizStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            xpReward: number;
            passingScore: number | null;
            timeLimitSeconds: number | null;
            questionCount: number;
        };
    } & {
        userId: string;
        quizId: string;
        answers: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        createdAt: Date;
        xpAwarded: number;
        startedAt: Date | null;
        score: number;
        maxScore: number;
        percentage: import("@prisma/client-runtime-utils").Decimal;
        passed: boolean;
        submittedAt: Date;
        timeTakenSeconds: number | null;
    }) | null>;
}
export declare const quizService: QuizService;
