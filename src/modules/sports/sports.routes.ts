import { Router } from 'express';
import { sportsController } from './sports.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { createTeamSchema, addPlayerSchema, createMatchSchema, updateScoreSchema, addEventSchema } from './sports.schema';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Public (authenticated)
router.get('/my-team', authenticate, asyncHandler(sportsController.getMyTeam));
router.get('/teams', authenticate, asyncHandler(sportsController.getTeams));
router.get('/teams/:teamId', authenticate, asyncHandler(sportsController.getTeam));
router.get('/matches', authenticate, asyncHandler(sportsController.getMatches));
router.get('/matches/:matchId', authenticate, asyncHandler(sportsController.getMatch));
router.get('/standings', authenticate, asyncHandler(sportsController.getStandings));

// Admin - Specific routes BEFORE parameterized routes
router.post('/teams', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(createTeamSchema), asyncHandler(sportsController.createTeam));
router.post('/teams/delete-all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(sportsController.deleteAllTeams));
router.post('/reset-all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(sportsController.resetAllData));
router.patch('/teams/:teamId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(sportsController.updateTeam));
router.delete('/teams/:teamId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(sportsController.deleteTeam));
router.post('/teams/:teamId/players', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(addPlayerSchema), asyncHandler(sportsController.addPlayer));
router.delete('/teams/:teamId/players/:userId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(sportsController.removePlayer));
router.post('/matches', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(createMatchSchema), asyncHandler(sportsController.createMatch));
router.post('/matches/delete-all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(sportsController.deleteAllMatches));
router.patch('/matches/:matchId/start', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(sportsController.startMatch));
router.patch('/matches/:matchId/complete', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(updateScoreSchema), asyncHandler(sportsController.completeMatch));
router.post('/matches/:matchId/events', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(addEventSchema), asyncHandler(sportsController.addEvent));

export default router;
