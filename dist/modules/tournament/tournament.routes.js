"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tournament_controller_1 = require("./tournament.controller");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const zod_1 = require("zod");
const router = express_1.default.Router();
// Validation schemas
const createTournamentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    nameAr: zod_1.z.string().optional(),
    numberOfGroups: zod_1.z.number().int().min(1).max(16),
    teamsPerGroup: zod_1.z.number().int().min(2).max(8),
    teamsAdvancingPerGroup: zod_1.z.number().int().min(1),
    pointsForWin: zod_1.z.number().int().min(0),
    pointsForDraw: zod_1.z.number().int().min(0),
    pointsForLoss: zod_1.z.number().int().min(0),
    selectedTeamIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'At least one team is required'),
});
const completeMatchSchema = zod_1.z.object({
    team1Goals: zod_1.z.number().int().min(0),
    team2Goals: zod_1.z.number().int().min(0),
});
const updateMatchSchema = zod_1.z.object({
    matchTime: zod_1.z.string().datetime().optional(),
    matchPlace: zod_1.z.string().max(255).optional(),
});
// Routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(createTournamentSchema), tournament_controller_1.tournamentController.createTournament);
router.post('/delete-all', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), tournament_controller_1.tournamentController.deleteAllTournaments);
router.get('/', auth_1.authenticate, tournament_controller_1.tournamentController.listTournaments);
router.get('/upcoming-matches', auth_1.authenticate, tournament_controller_1.tournamentController.getUpcomingTournamentMatches);
router.get('/:id', auth_1.authenticate, tournament_controller_1.tournamentController.getTournament);
router.patch('/:id/match/:matchId', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(updateMatchSchema), tournament_controller_1.tournamentController.updateMatch);
router.post('/:id/match/:matchId/complete', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(completeMatchSchema), tournament_controller_1.tournamentController.completeMatch);
router.post('/:id/advance-knockout', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), tournament_controller_1.tournamentController.advanceToKnockout);
router.post('/:id/generate-next-round', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), tournament_controller_1.tournamentController.generateNextKnockoutRound);
router.get('/:id/groups/:groupId/standings', auth_1.authenticate, tournament_controller_1.tournamentController.getGroupStandings);
router.get('/:id/bracket', auth_1.authenticate, tournament_controller_1.tournamentController.getTournamentBracket);
exports.default = router;
//# sourceMappingURL=tournament.routes.js.map