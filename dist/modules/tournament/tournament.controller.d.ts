import { Request, Response } from 'express';
export declare const tournamentController: {
    createTournament: (req: Request, res: Response, next: import("express").NextFunction) => void;
    listTournaments: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTournament: (req: Request, res: Response, next: import("express").NextFunction) => void;
    completeMatch: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateMatch: (req: Request, res: Response, next: import("express").NextFunction) => void;
    advanceToKnockout: (req: Request, res: Response, next: import("express").NextFunction) => void;
    generateNextKnockoutRound: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getGroupStandings: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTournamentBracket: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteAllTournaments: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getUpcomingTournamentMatches: (req: Request, res: Response, next: import("express").NextFunction) => void;
};
