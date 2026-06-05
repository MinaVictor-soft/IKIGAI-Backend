import { z } from 'zod';

export const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  sessionId: z.string().uuid().optional(),
  xpReward: z.number().int().min(0).default(0),
  passingScore: z.number().int().min(0).max(100).optional(),
  timeLimitSeconds: z.number().int().min(10).optional(),
});

export const createQuestionSchema = z.object({
  questionText: z.string().min(1),
  questionType: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']).default('MULTIPLE_CHOICE'),
  options: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
  correctAnswer: z.string().min(1),
  points: z.number().int().min(1).default(1),
  displayOrder: z.number().int().min(1),
  explanation: z.string().optional(),
});

export const submitQuizSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    answer: z.string(),
  })),
  startedAt: z.string().datetime().optional(),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
