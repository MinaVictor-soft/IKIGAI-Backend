"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tournamentController = void 0;
const tournament_service_1 = require("./tournament.service");
const asyncHandler_1 = require("../../utils/asyncHandler");
const service = new tournament_service_1.TournamentService();
exports.tournamentController = {
    createTournament: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const input = req.body;
        const tournament = await service.createTournament(input);
        res.status(201).json({
            success: true,
            message: 'Tournament created successfully',
            data: tournament,
        });
    }),
    listTournaments: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const statusQuery = req.query.status;
        const status = Array.isArray(statusQuery) ? statusQuery[0] : statusQuery;
        const tournaments = await service.listTournaments(status);
        res.json({
            success: true,
            data: tournaments,
        });
    }),
    getTournament: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const tournament = await service.getTournament(id);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }
        res.json({
            success: true,
            data: tournament,
        });
    }),
    completeMatch: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const tournamentId = req.params.id;
        const matchId = req.params.matchId;
        const { team1Goals, team2Goals } = req.body;
        if (team1Goals === undefined || team2Goals === undefined) {
            return res.status(400).json({
                success: false,
                message: 'team1Goals and team2Goals are required',
            });
        }
        const match = await service.completeMatch(tournamentId, matchId, team1Goals, team2Goals);
        res.json({
            success: true,
            message: 'Match completed successfully',
            data: match,
        });
    }),
    updateMatch: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const tournamentId = req.params.id;
        const matchId = req.params.matchId;
        const { matchTime, matchPlace } = req.body;
        const match = await service.updateMatch(tournamentId, matchId, { matchTime, matchPlace });
        res.json({
            success: true,
            message: 'Match updated successfully',
            data: match,
        });
    }),
    advanceToKnockout: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = req.params.id;
        const tournament = await service.advanceToKnockout(id);
        res.json({
            success: true,
            message: 'Tournament advanced to knockout stage',
            data: tournament,
        });
    }),
    generateNextKnockoutRound: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = req.params.id;
        const tournament = await service.generateNextKnockoutRound(id);
        res.json({
            success: true,
            message: 'Next knockout round generated',
            data: tournament,
        });
    }),
    getGroupStandings: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const tournamentId = req.params.id;
        const groupId = req.params.groupId;
        const standings = await service.getGroupStandings(tournamentId, groupId);
        res.json({
            success: true,
            data: standings,
        });
    }),
    getTournamentBracket: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = req.params.id;
        const bracket = await service.getTournamentBracket(id);
        res.json({
            success: true,
            data: bracket,
        });
    }),
    deleteAllTournaments: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await service.deleteAllTournaments();
        res.json({
            success: true,
            data: result,
        });
    }),
    getUpcomingTournamentMatches: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const matches = await service.getUpcomingTournamentMatches();
        res.json({
            success: true,
            data: matches,
        });
    }),
};
//# sourceMappingURL=tournament.controller.js.map