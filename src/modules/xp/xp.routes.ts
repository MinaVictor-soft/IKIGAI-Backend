import { Router } from 'express';
import { xpController } from './xp.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { awardXpSchema } from './xp.schema';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/leaderboard', authenticate, asyncHandler(xpController.leaderboard));
router.get('/rank/me', authenticate, asyncHandler(xpController.myRank));
router.get('/levels', authenticate, asyncHandler(xpController.getLevels));
router.get('/tribes', authenticate, asyncHandler(xpController.tribeLeaderboard));
router.get('/history/me', authenticate, asyncHandler(xpController.myHistory));
router.get('/history/:userId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(xpController.userHistory));
router.post('/award', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(awardXpSchema), asyncHandler(xpController.award));

export default router;
