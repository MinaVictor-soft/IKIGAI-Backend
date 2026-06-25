import { Request, Response } from 'express';
import { sportsService } from './sports.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { getParam, getQuery } from '../../utils/params';

export class SportsController {
  async createTeam(req: Request, res: Response) {
    const team = await sportsService.createTeam(req.body);
    sendCreated(res, team);
  }

  async updateTeam(req: Request, res: Response) {
    const team = await sportsService.updateTeam(getParam(req, 'teamId'), req.body);
    sendSuccess(res, team);
  }

  async deleteTeam(req: Request, res: Response) {
    await sportsService.deleteTeam(getParam(req, 'teamId'));
    sendSuccess(res, { message: 'Team deleted' });
  }

  async getTeams(req: Request, res: Response) {
    const teams = await sportsService.getTeams();
    sendSuccess(res, teams);
  }

  async getTeam(req: Request, res: Response) {
    const team = await sportsService.getTeam(getParam(req, 'teamId'));
    sendSuccess(res, team);
  }

  async addPlayer(req: Request, res: Response) {
    const player = await sportsService.addPlayer(getParam(req, 'teamId'), req.body);
    sendCreated(res, player);
  }

  async removePlayer(req: Request, res: Response) {
    await sportsService.removePlayer(getParam(req, 'teamId'), getParam(req, 'userId'));
    sendSuccess(res, { message: 'Player removed' });
  }

  async createMatch(req: Request, res: Response) {
    const match = await sportsService.createMatch(req.body);
    sendCreated(res, match);
  }

  async getMatches(req: Request, res: Response) {
    const matches = await sportsService.getMatches(getQuery(req, 'status'));
    sendSuccess(res, matches);
  }

  async getMatch(req: Request, res: Response) {
    const match = await sportsService.getMatch(getParam(req, 'matchId'));
    sendSuccess(res, match);
  }

  async startMatch(req: Request, res: Response) {
    const match = await sportsService.startMatch(getParam(req, 'matchId'));
    sendSuccess(res, match);
  }

  async completeMatch(req: Request, res: Response) {
    const match = await sportsService.completeMatch(getParam(req, 'matchId'), req.body);
    sendSuccess(res, match);
  }

  async addEvent(req: Request, res: Response) {
    const event = await sportsService.addEvent(getParam(req, 'matchId'), req.body);
    sendCreated(res, event);
  }

  async getStandings(req: Request, res: Response) {
    const standings = await sportsService.getStandings();
    sendSuccess(res, standings);
  }

  async getMyTeam(req: Request, res: Response) {
    const team = await sportsService.getMyTeam(req.user!.userId);
    sendSuccess(res, team);
  }

  async resetAllData(req: Request, res: Response) {
    const result = await sportsService.resetAllData();
    sendSuccess(res, result);
  }

  async deleteAllTeams(req: Request, res: Response) {
    const result = await sportsService.deleteAllTeams();
    sendSuccess(res, result);
  }

  async deleteMatch(req: Request, res: Response) {
    const result = await sportsService.deleteMatch(getParam(req, 'matchId'));
    sendSuccess(res, result);
  }

  async deleteAllMatches(req: Request, res: Response) {
    const result = await sportsService.deleteAllMatches();
    sendSuccess(res, result);
  }

  async deleteAllTournaments(req: Request, res: Response) {
    const result = await sportsService.deleteAllTournaments();
    sendSuccess(res, result);
  }
}

export const sportsController = new SportsController();
