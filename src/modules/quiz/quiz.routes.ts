import { Router } from 'express';
import { quizController } from './quiz.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { createQuizSchema, createQuestionSchema, submitQuizSchema } from './quiz.schema';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Public (authenticated)
router.get('/active', authenticate, asyncHandler(quizController.getActive));
router.get('/my-submissions', authenticate, asyncHandler(quizController.getMySubmissions));
router.get('/:quizId', authenticate, asyncHandler(quizController.getQuiz));
router.get('/:quizId/my-result', authenticate, asyncHandler(quizController.getMySubmission));
router.post('/:quizId/submit', authenticate, validate(submitQuizSchema), asyncHandler(quizController.submit));

// Admin
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(createQuizSchema), asyncHandler(quizController.create));
router.post('/:quizId/questions', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(createQuestionSchema), asyncHandler(quizController.addQuestion));
router.patch('/:quizId/status', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(quizController.updateStatus));

export default router;
