"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sportsController = exports.SportsController = void 0;
const sports_service_1 = require("./sports.service");
const response_1 = require("../../utils/response");
const params_1 = require("../../utils/params");
class SportsController {
    async createTeam(req, res) {
        const team = await sports_service_1.sportsService.createTeam(req.body);
        (0, response_1.sendCreated)(res, team);
    }
    async getTeams(req, res) {
        const teams = await sports_service_1.sportsService.getTeams();
        (0, response_1.sendSuccess)(res, teams);
    }
    async getTeam(req, res) {
        const team = await sports_service_1.sportsService.getTeam((0, params_1.getParam)(req, 'teamId'));
        (0, response_1.sendSuccess)(res, team);
    }
    async addPlayer(req, res) {
        const player = await sports_service_1.sportsService.addPlayer((0, params_1.getParam)(req, 'teamId'), req.body);
        (0, response_1.sendCreated)(res, player);
    }
    async removePlayer(req, res) {
        await sports_service_1.sportsService.removePlayer((0, params_1.getParam)(req, 'teamId'), (0, params_1.getParam)(req, 'userId'));
        (0, response_1.sendSuccess)(res, { message: 'Player removed' });
    }
    async createMatch(req, res) {
        const match = await sports_service_1.sportsService.createMatch(req.body);
        (0, response_1.sendCreated)(res, match);
    }
    async getMatches(req, res) {
        const matches = await sports_service_1.sportsService.getMatches((0, params_1.getQuery)(req, 'status'));
        (0, response_1.sendSuccess)(res, matches);
    }
    async getMatch(req, res) {
        const match = await sports_service_1.sportsService.getMatch((0, params_1.getParam)(req, 'matchId'));
        (0, response_1.sendSuccess)(res, match);
    }
    async startMatch(req, res) {
        const match = await sports_service_1.sportsService.startMatch((0, params_1.getParam)(req, 'matchId'));
        (0, response_1.sendSuccess)(res, match);
    }
    async completeMatch(req, res) {
        const match = await sports_service_1.sportsService.completeMatch((0, params_1.getParam)(req, 'matchId'), req.body);
        (0, response_1.sendSuccess)(res, match);
    }
    async addEvent(req, res) {
        const event = await sports_service_1.sportsService.addEvent((0, params_1.getParam)(req, 'matchId'), req.body);
        (0, response_1.sendCreated)(res, event);
    }
    async getStandings(req, res) {
        const standings = await sports_service_1.sportsService.getStandings();
        (0, response_1.sendSuccess)(res, standings);
    }
    async getMyTeam(req, res) {
        const team = await sports_service_1.sportsService.getMyTeam(req.user.userId);
        (0, response_1.sendSuccess)(res, team);
    }
}
exports.SportsController = SportsController;
exports.sportsController = new SportsController();
//# sourceMappingURL=sports.controller.js.map