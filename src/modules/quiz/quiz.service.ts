import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { xpService } from '../xp/xp.service';
import { notificationsService } from '../notifications/notifications.service';
import { pushNotificationsService } from '../push-notifications/push-notifications.service';
import { CreateQuizInput, CreateQuestionInput, SubmitQuizInput } from './quiz.schema';

export class QuizService {
  async createQuiz(input: CreateQuizInput) {
    const quiz = await prisma.quiz.create({ data: input });

    // Create notifications for all active users
    try {
      const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });

      const userIds = users.map(u => u.id);
      if (userIds.length > 0) {
        await notificationsService.createBulkNotifications(
          userIds,
          'QUIZ_CREATED',
          '🎯 مسابقة جديدة!',
          `${quiz.title} • ${quiz.xpReward} XP`,
          {
            quizId: quiz.id,
            title: quiz.title,
            xpReward: quiz.xpReward,
          }
        );

        // Send push notifications
        await pushNotificationsService.sendBroadcastNotification(
          '🎯 مسابقة جديدة!',
          `${quiz.title} • ${quiz.xpReward} XP`,
          {
            quizId: quiz.id,
            title: quiz.title,
            xpReward: quiz.xpReward,
            type: 'QUIZ_CREATED',
          }
        );
      }
    } catch (error) {
      // Log error but don't fail quiz creation
      console.error('Error creating notifications for quiz:', error);
    }

    return quiz;
  }

  async addQuestion(quizId: string, input: CreateQuestionInput) {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new AppError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');

    const question = await prisma.quizQuestion.create({
      data: { quizId, ...input },
    });

    await prisma.quiz.update({
      where: { id: quizId },
      data: { questionCount: { increment: 1 } },
    });

    return question;
  }

  async getQuiz(quizId: string, includeAnswers = false) {
    const quiz = await prisma.quiz.findUnique({
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

    if (!quiz) throw new AppError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
    return quiz;
  }

  async getActiveQuizzes() {
    return prisma.quiz.findMany({
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

  async submitQuiz(userId: string, quizId: string, input: SubmitQuizInput) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) throw new AppError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
    if (quiz.status !== 'ACTIVE') throw new AppError(422, 'QUIZ_NOT_ACTIVE', 'This quiz is not currently active');

    // Check if already submitted
    const existing = await prisma.quizSubmission.findUnique({
      where: { userId_quizId: { userId, quizId } },
    });
    if (existing) throw new AppError(409, 'QUIZ_ALREADY_SUBMITTED', 'You have already submitted this quiz');

    // Server-side timer validation
    if (quiz.timeLimitSeconds && input.startedAt) {
      const startedAt = new Date(input.startedAt);
      const elapsed = (Date.now() - startedAt.getTime()) / 1000;
      const grace = 5; // 5 seconds grace
      if (elapsed > quiz.timeLimitSeconds + grace) {
        throw new AppError(422, 'QUIZ_TIME_EXPIRED', 'Quiz time limit exceeded');
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
    const passingScore = quiz.passingScore ?? 70; // Default to 70% if not specified
    const passed = percentage >= passingScore;
    const xpAwarded = passed ? quiz.xpReward : 0;

    // Calculate time taken
    let timeTakenSeconds: number | undefined;
    if (input.startedAt) {
      timeTakenSeconds = Math.floor((Date.now() - new Date(input.startedAt).getTime()) / 1000);
    }

    // Save submission + award XP in transaction
    const submission = await prisma.$transaction(async (tx) => {
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
        await xpService.awardXp(tx, {
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

  async updateQuizStatus(quizId: string, status: 'DRAFT' | 'ACTIVE' | 'CLOSED') {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new AppError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');

    return prisma.quiz.update({
      where: { id: quizId },
      data: { status },
    });
  }

  async getMySubmissions(userId: string) {
    const submissions = await prisma.quizSubmission.findMany({
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

  async getMySubmission(userId: string, quizId: string) {
    const submission = await prisma.quizSubmission.findUnique({
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

export const quizService = new QuizService();
