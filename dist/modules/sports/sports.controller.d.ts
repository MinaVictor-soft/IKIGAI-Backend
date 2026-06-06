import { Request, Response } from 'express';
export declare class SportsController {
    createTeam(req: Request, res: Response): Promise<void>;
    getTeams(req: Request, res: Response): Promise<void>;
    getTeam(req: Request, res: Response): Promise<void>;
    addPlayer(req: Request, res: Response): Promise<void>;
    removePlayer(req: Request, res: Response): Promise<void>;
    createMatch(req: Request, res: Response): Promise<void>;
    getMatches(req: Request, res: Response): Promise<void>;
    getMatch(req: Request, res: Response): Promise<void>;
    startMatch(req: Request, res: Response): Promise<void>;
    completeMatch(req: Request, res: Response): Promise<void>;
    addEvent(req: Request, res: Response): Promise<void>;
    getStandings(req: Request, res: Response): Promise<void>;
    getMyTeam(req: Request, res: Response): Promise<void>;
}
export declare const sportsController: SportsController;
