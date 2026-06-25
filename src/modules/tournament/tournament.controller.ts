import { Request, Response } from 'express';
import { TournamentService, CreateTournamentInput } from './tournament.service';
import { asyncHandler } from '../../utils/asyncHandler';

const service = new TournamentService();

export const tournamentController = {
  createTournament: asyncHandler(async (req: Request, res: Response) => {
    const input: CreateTournamentInput = req.body;
    const tournament = await service.createTournament(input);
    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      data: tournament,
    });
  }),

  listTournaments: asyncHandler(async (req: Request, res: Response) => {
    const statusQuery = req.query.status;
    const status = Array.isArray(statusQuery) ? statusQuery[0] : statusQuery;
    const tournaments = await service.listTournaments(status as string | undefined);
    res.json({
      success: true,
      data: tournaments,
    });
  }),

  getTournament: asyncHandler(async (req: Request, res: Response) => {
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

  completeMatch: asyncHandler(async (req: Request, res: Response) => {
    const tournamentId = (req.params.id as string);
    const matchId = (req.params.matchId as string);
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

  updateMatch: asyncHandler(async (req: Request, res: Response) => {
    const tournamentId = (req.params.id as string);
    const matchId = (req.params.matchId as string);
    const { matchTime, matchPlace } = req.body;

    const match = await service.updateMatch(tournamentId, matchId, { matchTime, matchPlace });
    res.json({
      success: true,
      message: 'Match updated successfully',
      data: match,
    });
  }),

  advanceToKnockout: asyncHandler(async (req: Request, res: Response) => {
    const id = (req.params.id as string);
    const tournament = await service.advanceToKnockout(id);
    res.json({
      success: true,
      message: 'Tournament advanced to knockout stage',
      data: tournament,
    });
  }),

  generateNextKnockoutRound: asyncHandler(async (req: Request, res: Response) => {
    const id = (req.params.id as string);
    const tournament = await service.generateNextKnockoutRound(id);
    res.json({
      success: true,
      message: 'Next knockout round generated',
      data: tournament,
    });
  }),

  getGroupStandings: asyncHandler(async (req: Request, res: Response) => {
    const tournamentId = (req.params.id as string);
    const groupId = (req.params.groupId as string);
    const standings = await service.getGroupStandings(tournamentId, groupId);
    res.json({
      success: true,
      data: standings,
    });
  }),

  getTournamentBracket: asyncHandler(async (req: Request, res: Response) => {
    const id = (req.params.id as string);
    const bracket = await service.getTournamentBracket(id);
    res.json({
      success: true,
      data: bracket,
    });
  }),

  deleteTournament: asyncHandler(async (req: Request, res: Response) => {
    const result = await service.deleteTournament(req.params.id);
    res.json({ success: true, data: result });
  }),

  deleteAllTournaments: asyncHandler(async (req: Request, res: Response) => {
    const result = await service.deleteAllTournaments();
    res.json({
      success: true,
      data: result,
    });
  }),

  getUpcomingTournamentMatches: asyncHandler(async (req: Request, res: Response) => {
    const matches = await service.getUpcomingTournamentMatches();
    res.json({
      success: true,
      data: matches,
    });
  }),
};
