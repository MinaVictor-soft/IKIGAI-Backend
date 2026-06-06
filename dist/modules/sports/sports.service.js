"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sportsService = exports.SportsService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
const xp_service_1 = require("../xp/xp.service");
class SportsService {
    // ============ TEAMS ============
    async createTeam(input) {
        return database_1.default.sportsTeam.create({ data: input });
    }
    async getTeams() {
        return database_1.default.sportsTeam.findMany({
            include: { _count: { select: { players: true } }, players: { select: { userId: true } } },
            orderBy: [{ points: 'desc' }, { goalDifference: 'desc' }, { goalsFor: 'desc' }],
        });
    }
    async getTeam(teamId) {
        const team = await database_1.default.sportsTeam.findUnique({
            where: { id: teamId },
            include: {
                players: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true, totalXp: true, tribe: { select: { name: true, color: true } } } } },
                    orderBy: { jerseyNumber: 'asc' },
                },
            },
        });
        if (!team)
            throw new errorHandler_1.AppError(404, 'TEAM_NOT_FOUND', 'Team not found');
        // Fetch XP breakdown (sports vs conference) for each player
        const playerIds = team.players.map((p) => p.userId);
        const xpBreakdown = await database_1.default.xpTransaction.groupBy({
            by: ['userId', 'sourceType'],
            where: { userId: { in: playerIds } },
            _sum: { amount: true },
        });
        // Build lookup map: userId -> { sportsXp, conferenceXp }
        const xpMap = {};
        for (const row of xpBreakdown) {
            if (!xpMap[row.userId])
                xpMap[row.userId] = { sportsXp: 0, conferenceXp: 0 };
            if (row.sourceType === 'SPORTS') {
                xpMap[row.userId].sportsXp += row._sum.amount || 0;
            }
            else {
                xpMap[row.userId].conferenceXp += row._sum.amount || 0;
            }
        }
        const playersWithXp = team.players.map((p) => ({
            ...p,
            sportsXp: xpMap[p.userId]?.sportsXp || 0,
            conferenceXp: xpMap[p.userId]?.conferenceXp || 0,
        }));
        return { ...team, players: playersWithXp };
    }
    async getMyTeam(userId) {
        const player = await database_1.default.teamPlayer.findFirst({
            where: { userId },
            include: { team: { select: { id: true, name: true, color: true } } },
        });
        return player?.team || null;
    }
    async addPlayer(teamId, input) {
        const team = await database_1.default.sportsTeam.findUnique({ where: { id: teamId } });
        if (!team)
            throw new errorHandler_1.AppError(404, 'TEAM_NOT_FOUND', 'Team not found');
        // Check roster size
        const playerCount = await database_1.default.teamPlayer.count({ where: { teamId } });
        if (playerCount >= team.maxRosterSize) {
            throw new errorHandler_1.AppError(422, 'ROSTER_FULL', 'Team roster is full');
        }
        // User can only be on one team (enforced by DB UNIQUE but check for better error)
        const existingPlayer = await database_1.default.teamPlayer.findUnique({
            where: { userId: input.userId },
        });
        if (existingPlayer) {
            throw new errorHandler_1.AppError(409, 'PLAYER_ALREADY_ON_TEAM', 'This user is already on a team');
        }
        return database_1.default.teamPlayer.create({
            data: { teamId, ...input },
        });
    }
    async removePlayer(teamId, userId) {
        const player = await database_1.default.teamPlayer.findFirst({
            where: { teamId, userId },
        });
        if (!player)
            throw new errorHandler_1.AppError(404, 'PLAYER_NOT_FOUND', 'Player not found on this team');
        return database_1.default.teamPlayer.delete({ where: { id: player.id } });
    }
    // ============ MATCHES ============
    async createMatch(input) {
        if (input.homeTeamId === input.awayTeamId) {
            throw new errorHandler_1.AppError(400, 'SAME_TEAM', 'A team cannot play against itself');
        }
        return database_1.default.match.create({
            data: {
                homeTeamId: input.homeTeamId,
                awayTeamId: input.awayTeamId,
                scheduledAt: new Date(input.scheduledAt),
                venue: input.venue,
                round: input.round,
                groupName: input.groupName,
                winXp: input.winXp,
                drawXp: input.drawXp,
                lossXp: input.lossXp,
            },
        });
    }
    async getMatches(status) {
        return database_1.default.match.findMany({
            where: status ? { status: status } : undefined,
            include: {
                homeTeam: { select: { id: true, name: true, color: true } },
                awayTeam: { select: { id: true, name: true, color: true } },
            },
            orderBy: { scheduledAt: 'asc' },
        });
    }
    async getMatch(matchId) {
        const match = await database_1.default.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: { select: { id: true, name: true, color: true } },
                awayTeam: { select: { id: true, name: true, color: true } },
                events: {
                    include: { player: { select: { id: true, name: true } } },
                    orderBy: { minute: 'asc' },
                },
            },
        });
        if (!match)
            throw new errorHandler_1.AppError(404, 'MATCH_NOT_FOUND', 'Match not found');
        return match;
    }
    async startMatch(matchId) {
        const match = await database_1.default.match.findUnique({ where: { id: matchId } });
        if (!match)
            throw new errorHandler_1.AppError(404, 'MATCH_NOT_FOUND', 'Match not found');
        if (match.status !== 'SCHEDULED')
            throw new errorHandler_1.AppError(422, 'INVALID_STATUS', 'Match can only be started from SCHEDULED status');
        return database_1.default.match.update({
            where: { id: matchId },
            data: { status: 'LIVE' },
        });
    }
    async completeMatch(matchId, input) {
        const match = await database_1.default.match.findUnique({ where: { id: matchId } });
        if (!match)
            throw new errorHandler_1.AppError(404, 'MATCH_NOT_FOUND', 'Match not found');
        if (match.status !== 'LIVE')
            throw new errorHandler_1.AppError(422, 'INVALID_STATUS', 'Match must be LIVE to complete');
        // Determine result
        const homeWin = input.homeScore > input.awayScore;
        const draw = input.homeScore === input.awayScore;
        // Update match + team stats + award XP in transaction
        const result = await database_1.default.$transaction(async (tx) => {
            // Update match
            const updatedMatch = await tx.match.update({
                where: { id: matchId },
                data: {
                    status: 'COMPLETED',
                    homeScore: input.homeScore,
                    awayScore: input.awayScore,
                    completedAt: new Date(),
                },
            });
            // Update home team stats
            await tx.sportsTeam.update({
                where: { id: match.homeTeamId },
                data: {
                    matchesPlayed: { increment: 1 },
                    wins: { increment: homeWin ? 1 : 0 },
                    draws: { increment: draw ? 1 : 0 },
                    losses: { increment: !homeWin && !draw ? 1 : 0 },
                    goalsFor: { increment: input.homeScore },
                    goalsAgainst: { increment: input.awayScore },
                    goalDifference: { increment: input.homeScore - input.awayScore },
                    points: { increment: homeWin ? 3 : draw ? 1 : 0 },
                },
            });
            // Update away team stats
            await tx.sportsTeam.update({
                where: { id: match.awayTeamId },
                data: {
                    matchesPlayed: { increment: 1 },
                    wins: { increment: !homeWin && !draw ? 1 : 0 },
                    draws: { increment: draw ? 1 : 0 },
                    losses: { increment: homeWin ? 1 : 0 },
                    goalsFor: { increment: input.awayScore },
                    goalsAgainst: { increment: input.homeScore },
                    goalDifference: { increment: input.awayScore - input.homeScore },
                    points: { increment: !homeWin && !draw ? 3 : draw ? 1 : 0 },
                },
            });
            // Award XP to all players on both teams' rosters
            const players = await tx.teamPlayer.findMany({
                where: { teamId: { in: [match.homeTeamId, match.awayTeamId] } },
            });
            for (const player of players) {
                // Check if XP already awarded for this match (idempotent)
                const existingXp = await tx.xpTransaction.findFirst({
                    where: {
                        userId: player.userId,
                        sourceType: 'SPORTS',
                        sourceId: matchId,
                    },
                });
                if (!existingXp) {
                    const isWinner = (player.teamId === match.homeTeamId && homeWin) ||
                        (player.teamId === match.awayTeamId && !homeWin && !draw);
                    const isLoser = (player.teamId === match.homeTeamId && !homeWin && !draw) ||
                        (player.teamId === match.awayTeamId && homeWin);
                    const xpAmount = isWinner ? match.winXp : isLoser ? match.lossXp : match.drawXp;
                    await xp_service_1.xpService.awardXp(tx, {
                        userId: player.userId,
                        amount: xpAmount,
                        type: 'SPORTS',
                        sourceType: 'SPORTS',
                        sourceId: matchId,
                        description: `Match: ${isWinner ? 'Win' : draw ? 'Draw' : 'Loss'}`,
                    });
                }
            }
            return updatedMatch;
        });
        return result;
    }
    async addEvent(matchId, input) {
        const match = await database_1.default.match.findUnique({ where: { id: matchId } });
        if (!match)
            throw new errorHandler_1.AppError(404, 'MATCH_NOT_FOUND', 'Match not found');
        if (match.status !== 'LIVE')
            throw new errorHandler_1.AppError(422, 'INVALID_STATUS', 'Match must be LIVE to add events');
        return database_1.default.matchEvent.create({
            data: { matchId, ...input },
        });
    }
    async getStandings() {
        return database_1.default.sportsTeam.findMany({
            orderBy: [{ points: 'desc' }, { goalDifference: 'desc' }, { goalsFor: 'desc' }],
            select: {
                id: true,
                name: true,
                color: true,
                matchesPlayed: true,
                wins: true,
                draws: true,
                losses: true,
                goalsFor: true,
                goalsAgainst: true,
                goalDifference: true,
                points: true,
            },
        });
    }
    async getTopScorers(limit = 10) {
        return database_1.default.matchEvent.groupBy({
            by: ['playerId'],
            where: { eventType: 'GOAL' },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: limit,
        });
    }
}
exports.SportsService = SportsService;
exports.sportsService = new SportsService();
//# sourceMappingURL=sports.service.js.map