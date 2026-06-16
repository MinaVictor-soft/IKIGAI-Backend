import express, { Router } from 'express';
import { tournamentController } from './tournament.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router: Router = express.Router();

// Validation schemas
const createTournamentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().optional(),
  numberOfGroups: z.number().int().min(1).max(16),
  teamsPerGroup: z.number().int().min(2).max(8),
  teamsAdvancingPerGroup: z.number().int().min(1),
  pointsForWin: z.number().int().min(0),
  pointsForDraw: z.number().int().min(0),
  pointsForLoss: z.number().int().min(0),
  selectedTeamIds: z.array(z.string().uuid()).min(1, 'At least one team is required'),
});

const completeMatchSchema = z.object({
  team1Goals: z.number().int().min(0),
  team2Goals: z.number().int().min(0),
});

const updateMatchSchema = z.object({
  matchTime: z.string().datetime().optional(),
  matchPlace: z.string().max(255).optional(),
});

// Routes
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(createTournamentSchema), tournamentController.createTournament);
router.post('/delete-all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), tournamentController.deleteAllTournaments);
router.get('/', authenticate, tournamentController.listTournaments);
router.get('/upcoming-matches', authenticate, tournamentController.getUpcomingTournamentMatches);
router.get('/:id', authenticate, tournamentController.getTournament);
router.patch('/:id/match/:matchId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(updateMatchSchema), tournamentController.updateMatch);
router.post('/:id/match/:matchId/complete', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(completeMatchSchema), tournamentController.completeMatch);
router.post('/:id/advance-knockout', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), tournamentController.advanceToKnockout);
router.post('/:id/generate-next-round', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), tournamentController.generateNextKnockoutRound);
router.get('/:id/groups/:groupId/standings', authenticate, tournamentController.getGroupStandings);
router.get('/:id/bracket', authenticate, tournamentController.getTournamentBracket);

export default router;
