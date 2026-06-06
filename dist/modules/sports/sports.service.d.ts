import { CreateTeamInput, AddPlayerInput, CreateMatchInput, UpdateScoreInput, AddEventInput } from './sports.schema';
export declare class SportsService {
    createTeam(input: CreateTeamInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        points: number;
        maxRosterSize: number;
        logoUrl: string | null;
        matchesPlayed: number;
        wins: number;
        draws: number;
        losses: number;
        goalsFor: number;
        goalsAgainst: number;
        goalDifference: number;
        rank: number | null;
        captainId: string | null;
    }>;
    getTeams(): Promise<({
        _count: {
            players: number;
        };
        players: {
            userId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        points: number;
        maxRosterSize: number;
        logoUrl: string | null;
        matchesPlayed: number;
        wins: number;
        draws: number;
        losses: number;
        goalsFor: number;
        goalsAgainst: number;
        goalDifference: number;
        rank: number | null;
        captainId: string | null;
    })[]>;
    getTeam(teamId: string): Promise<{
        players: {
            sportsXp: number;
            conferenceXp: number;
            user: {
                name: string;
                id: string;
                avatarUrl: string | null;
                totalXp: number;
                tribe: {
                    name: string;
                    color: string | null;
                } | null;
            };
            userId: string;
            teamId: string;
            id: string;
            createdAt: Date;
            jerseyNumber: number | null;
            position: import(".prisma/client").$Enums.PlayerPosition | null;
            isCaptain: boolean;
            joinedAt: Date;
        }[];
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        points: number;
        maxRosterSize: number;
        logoUrl: string | null;
        matchesPlayed: number;
        wins: number;
        draws: number;
        losses: number;
        goalsFor: number;
        goalsAgainst: number;
        goalDifference: number;
        rank: number | null;
        captainId: string | null;
    }>;
    getMyTeam(userId: string): Promise<{
        name: string;
        id: string;
        color: string | null;
    } | null>;
    addPlayer(teamId: string, input: AddPlayerInput): Promise<{
        userId: string;
        teamId: string;
        id: string;
        createdAt: Date;
        jerseyNumber: number | null;
        position: import(".prisma/client").$Enums.PlayerPosition | null;
        isCaptain: boolean;
        joinedAt: Date;
    }>;
    removePlayer(teamId: string, userId: string): Promise<{
        userId: string;
        teamId: string;
        id: string;
        createdAt: Date;
        jerseyNumber: number | null;
        position: import(".prisma/client").$Enums.PlayerPosition | null;
        isCaptain: boolean;
        joinedAt: Date;
    }>;
    createMatch(input: CreateMatchInput): Promise<{
        status: import(".prisma/client").$Enums.MatchStatus;
        homeTeamId: string;
        awayTeamId: string;
        scheduledAt: Date;
        homeScore: number | null;
        awayScore: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venue: string | null;
        round: number | null;
        groupName: string | null;
        winXp: number;
        drawXp: number;
        lossXp: number;
        notes: string | null;
        completedAt: Date | null;
    }>;
    getMatches(status?: string): Promise<({
        homeTeam: {
            name: string;
            id: string;
            color: string | null;
        };
        awayTeam: {
            name: string;
            id: string;
            color: string | null;
        };
    } & {
        status: import(".prisma/client").$Enums.MatchStatus;
        homeTeamId: string;
        awayTeamId: string;
        scheduledAt: Date;
        homeScore: number | null;
        awayScore: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venue: string | null;
        round: number | null;
        groupName: string | null;
        winXp: number;
        drawXp: number;
        lossXp: number;
        notes: string | null;
        completedAt: Date | null;
    })[]>;
    getMatch(matchId: string): Promise<{
        homeTeam: {
            name: string;
            id: string;
            color: string | null;
        };
        awayTeam: {
            name: string;
            id: string;
            color: string | null;
        };
        events: ({
            player: {
                name: string;
                id: string;
            };
        } & {
            teamId: string;
            matchId: string;
            playerId: string;
            eventType: import(".prisma/client").$Enums.EventType;
            minute: number;
            id: string;
            createdAt: Date;
            notes: string | null;
        })[];
    } & {
        status: import(".prisma/client").$Enums.MatchStatus;
        homeTeamId: string;
        awayTeamId: string;
        scheduledAt: Date;
        homeScore: number | null;
        awayScore: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venue: string | null;
        round: number | null;
        groupName: string | null;
        winXp: number;
        drawXp: number;
        lossXp: number;
        notes: string | null;
        completedAt: Date | null;
    }>;
    startMatch(matchId: string): Promise<{
        status: import(".prisma/client").$Enums.MatchStatus;
        homeTeamId: string;
        awayTeamId: string;
        scheduledAt: Date;
        homeScore: number | null;
        awayScore: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venue: string | null;
        round: number | null;
        groupName: string | null;
        winXp: number;
        drawXp: number;
        lossXp: number;
        notes: string | null;
        completedAt: Date | null;
    }>;
    completeMatch(matchId: string, input: UpdateScoreInput): Promise<{
        status: import(".prisma/client").$Enums.MatchStatus;
        homeTeamId: string;
        awayTeamId: string;
        scheduledAt: Date;
        homeScore: number | null;
        awayScore: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venue: string | null;
        round: number | null;
        groupName: string | null;
        winXp: number;
        drawXp: number;
        lossXp: number;
        notes: string | null;
        completedAt: Date | null;
    }>;
    addEvent(matchId: string, input: AddEventInput): Promise<{
        teamId: string;
        matchId: string;
        playerId: string;
        eventType: import(".prisma/client").$Enums.EventType;
        minute: number;
        id: string;
        createdAt: Date;
        notes: string | null;
    }>;
    getStandings(): Promise<{
        name: string;
        id: string;
        color: string | null;
        points: number;
        matchesPlayed: number;
        wins: number;
        draws: number;
        losses: number;
        goalsFor: number;
        goalsAgainst: number;
        goalDifference: number;
    }[]>;
    getTopScorers(limit?: number): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.MatchEventGroupByOutputType, "playerId"[]> & {
        _count: {
            id: number;
        };
    })[]>;
}
export declare const sportsService: SportsService;
