import prisma from '../../config/database';
import { xpService } from '../xp/xp.service';
import { notificationsService } from '../notifications/notifications.service';
import { pushNotificationsService } from '../push-notifications/push-notifications.service';

export interface CreateTournamentInput {
  name: string;
  nameAr?: string;
  numberOfGroups: number;
  teamsPerGroup: number;
  teamsAdvancingPerGroup: number;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  selectedTeamIds: string[];
}

export class TournamentService {
  async createTournament(input: CreateTournamentInput) {
    const { selectedTeamIds, numberOfGroups, teamsPerGroup, ...tournamentData } = input;

    // Validate team count
    const expectedTeamCount = numberOfGroups * teamsPerGroup;
    if (selectedTeamIds.length !== expectedTeamCount) {
      throw new Error(
        `Expected ${expectedTeamCount} teams (${numberOfGroups} groups × ${teamsPerGroup} per group), ` +
        `got ${selectedTeamIds.length}`
      );
    }

    // Create tournament
    const tournament = await prisma.tournament.create({
      data: {
        ...tournamentData,
        numberOfGroups,
        teamsPerGroup,
        status: 'PLANNING',
      },
    });

    // Shuffle teams randomly
    const shuffledTeams = this.shuffleArray([...selectedTeamIds]);

    // Create groups and assign teams
    const groups: { name: string; teams: string[] }[] = [];
    for (let i = 0; i < numberOfGroups; i++) {
      const groupTeams = shuffledTeams.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup);
      groups.push({
        name: String.fromCharCode(65 + i), // A, B, C, D...
        teams: groupTeams,
      });
    }

    // Create tournament groups and teams
    for (const group of groups) {
      const createdGroup = await prisma.tournamentGroup.create({
        data: {
          tournamentId: tournament.id,
          groupName: `Group ${group.name}`,
        },
      });

      for (const teamId of group.teams) {
        await prisma.tournamentTeam.create({
          data: {
            tournamentId: tournament.id,
            teamId,
            groupId: createdGroup.id,
          },
        });
      }
    }

    // Generate group stage matches (round-robin)
    await this.generateGroupMatches(tournament.id);

    // Update tournament status to GROUP_STAGE
    const updatedTournament = await prisma.tournament.update({
      where: { id: tournament.id },
      data: { status: 'GROUP_STAGE' },
      include: {
        groups: {
          include: {
            teams: { include: { team: true } },
          },
        },
        tournamentMatches: true,
      },
    });

    // Send notifications to all users about the new tournament
    try {
      await this.notifyTournamentCreated(updatedTournament);
    } catch (error) {
      console.error('Error sending tournament notifications:', error);
      // Don't fail the tournament creation if notifications fail
    }

    return updatedTournament;
  }

  private async notifyTournamentCreated(tournament: any) {
    try {
      // Get all users
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true, email: true },
      });

      if (users.length === 0) return;

      const userIds = users.map(u => u.id);
      const tournamentTitle = tournament.name || tournament.nameAr || 'Tournament';

      // Create database notifications for all users
      await notificationsService.createBulkNotifications(
        userIds,
        'TOURNAMENT_CREATED',
        '🏆 New Tournament',
        `A new tournament "${tournamentTitle}" has been created with ${tournament.numberOfGroups} groups!`,
        {
          tournamentId: tournament.id,
          tournamentName: tournamentTitle,
          numberOfGroups: tournament.numberOfGroups,
        }
      );

      // Send push notifications to all users with active tokens
      const allPushTokens = await pushNotificationsService.getAllActivePushTokens();
      if (allPushTokens.length > 0) {
        await pushNotificationsService.sendPushNotification({
          pushTokens: allPushTokens,
          title: '⚽ New Tournament Started',
          body: `${tournamentTitle} is now open! ${tournament.numberOfGroups} groups are ready.`,
          data: {
            tournamentId: tournament.id,
            tournamentName: tournamentTitle,
            type: 'TOURNAMENT_CREATED',
          },
        });
      }
    } catch (error) {
      console.error('Error notifying about tournament creation:', error);
      throw error;
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private async generateGroupMatches(tournamentId: string) {
    const groups = await prisma.tournamentGroup.findMany({
      where: { tournamentId },
      include: {
        teams: { include: { team: true } },
      },
    });

    for (const group of groups) {
      const teamIds = group.teams.map((t: any) => t.teamId);

      // Generate all combinations (round-robin)
      for (let i = 0; i < teamIds.length; i++) {
        for (let j = i + 1; j < teamIds.length; j++) {
          await prisma.tournamentMatch.create({
            data: {
              tournamentId,
              stage: 'GROUP_STAGE',
              team1Id: teamIds[i],
              team2Id: teamIds[j],
              status: 'SCHEDULED',
            },
          });
        }
      }
    }
  }

  async getTournament(id: string) {
    return prisma.tournament.findUnique({
      where: { id },
      include: {
        groups: {
          include: {
            teams: {
              include: { team: true },
              orderBy: [
                { points: 'desc' },
                { goalsFor: 'desc' },
              ],
            },
          },
        },
        tournamentTeams: { include: { team: true } },
        tournamentMatches: {
          include: {
            team1: true,
            team2: true,
            winner: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        winner: true,
      },
    });
  }

  async listTournaments(status?: string | null) {
    return prisma.tournament.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        groups: {
          include: {
            teams: {
              include: { team: true },
              orderBy: [
                { points: 'desc' },
                { goalsFor: 'desc' },
              ],
            },
          },
        },
        tournamentMatches: {
          include: {
            team1: true,
            team2: true,
            winner: true,
          },
        },
        tournamentTeams: true,
        winner: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async completeMatch(tournamentId: string, matchId: string, team1Goals: number, team2Goals: number) {
    const match = await prisma.tournamentMatch.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        team1: true,
        team2: true,
      },
    });

    if (!match) throw new Error('Match not found');
    if (match.tournamentId !== tournamentId) throw new Error('Match does not belong to this tournament');

    const { pointsForWin, pointsForDraw, pointsForLoss } = match.tournament;

    let team1Points = 0;
    let team2Points = 0;
    let winnerId: string | null = null;

    if (team1Goals > team2Goals) {
      team1Points = pointsForWin;
      team2Points = pointsForLoss;
      winnerId = match.team1Id;
    } else if (team2Goals > team1Goals) {
      team1Points = pointsForLoss;
      team2Points = pointsForWin;
      winnerId = match.team2Id;
    } else {
      team1Points = pointsForDraw;
      team2Points = pointsForDraw;
    }

    const updatedMatch = await prisma.$transaction(async (tx) => {
      // Update match
      const matchUpdate = await tx.tournamentMatch.update({
        where: { id: matchId },
        data: {
          team1Goals,
          team2Goals,
          winnerId,
          status: 'COMPLETED',
        },
        include: {
          team1: true,
          team2: true,
          winner: true,
        },
      });

      // Update team stats
      await tx.tournamentTeam.update({
        where: {
          tournamentId_teamId: {
            tournamentId,
            teamId: match.team1Id,
          },
        },
        data: {
          points: { increment: team1Points },
          played: { increment: 1 },
          won: { increment: team1Goals > team2Goals ? 1 : 0 },
          drawn: { increment: team1Goals === team2Goals ? 1 : 0 },
          lost: { increment: team1Goals < team2Goals ? 1 : 0 },
          goalsFor: { increment: team1Goals },
          goalsAgainst: { increment: team2Goals },
        },
      });

      await tx.tournamentTeam.update({
        where: {
          tournamentId_teamId: {
            tournamentId,
            teamId: match.team2Id,
          },
        },
        data: {
          points: { increment: team2Points },
          played: { increment: 1 },
          won: { increment: team2Goals > team1Goals ? 1 : 0 },
          drawn: { increment: team2Goals === team1Goals ? 1 : 0 },
          lost: { increment: team2Goals < team1Goals ? 1 : 0 },
          goalsFor: { increment: team2Goals },
          goalsAgainst: { increment: team1Goals },
        },
      });

      // Distribute XP to players and tribes
      const xpMultiplier = 10;
      let winnerTeamId: string | null = null;
      let winnerXP = 0;

      if (team1Goals > team2Goals) {
        winnerTeamId = match.team1Id;
        winnerXP = team1Points * xpMultiplier;
      } else if (team2Goals > team1Goals) {
        winnerTeamId = match.team2Id;
        winnerXP = team2Points * xpMultiplier;
      }

      // If there's a winner, distribute XP to team players
      if (winnerTeamId && winnerXP > 0) {
        const teamPlayers = await tx.teamPlayer.findMany({
          where: { teamId: winnerTeamId },
          include: { user: { include: { tribe: true } } },
        });

        for (const player of teamPlayers) {
          // Award XP to player
          await xpService.awardXp(tx, {
            userId: player.userId,
            amount: winnerXP,
            type: 'SPORTS',
            sourceType: 'SPORTS',
            sourceId: matchId,
            description: `Tournament match victory`,
          });
        }
      }

      return matchUpdate;
    });

    // Send match result notification after transaction completes
    try {
      await this.notifyMatchResultApplied(tournamentId, updatedMatch);
    } catch (error) {
      console.error('Error sending match result notification:', error);
    }

    // Check if tournament is complete
    await this.checkAndNotifyTournamentComplete(tournamentId);

    return updatedMatch;
  }

  private async notifyMatchResultApplied(tournamentId: string, match: any) {
    try {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
      });

      if (!tournament) return;

      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true },
      });

      if (users.length === 0) return;

      const userIds = users.map(u => u.id);
      const team1Name = match.team1?.name || 'Team 1';
      const team2Name = match.team2?.name || 'Team 2';
      const winnerName = match.winner?.name || 'Draw';

      // Create database notifications
      await notificationsService.createBulkNotifications(
        userIds,
        'MATCH_RESULT_APPLIED',
        '⚽ Match Result',
        `${team1Name} ${match.team1Goals} - ${match.team2Goals} ${team2Name}`,
        {
          tournamentId,
          matchId: match.id,
          team1Goals: match.team1Goals,
          team2Goals: match.team2Goals,
          winner: winnerName,
        }
      );

      // Send push notifications
      const allPushTokens = await pushNotificationsService.getAllActivePushTokens();
      if (allPushTokens.length > 0) {
        await pushNotificationsService.sendPushNotification({
          pushTokens: allPushTokens,
          title: '📊 Match Completed',
          body: `${team1Name} ${match.team1Goals} - ${match.team2Goals} ${team2Name}`,
          data: {
            tournamentId,
            matchId: match.id,
            type: 'MATCH_RESULT_APPLIED',
          },
        });
      }
    } catch (error) {
      console.error('Error notifying match result:', error);
    }
  }

  private async checkAndNotifyTournamentComplete(tournamentId: string) {
    try {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          tournamentMatches: true,
          winner: true,
        },
      });

      if (!tournament) return;

      // Check if all knockout matches are completed
      if (tournament.status === 'KNOCKOUT') {
        const allMatches = tournament.tournamentMatches;
        const allCompleted = allMatches.every((m: any) => m.status === 'COMPLETED');

        if (allCompleted && tournament.winner) {
          // Mark tournament as completed
          await prisma.tournament.update({
            where: { id: tournamentId },
            data: { status: 'COMPLETED' },
          });

          // Notify all users about tournament completion
          await this.notifyTournamentComplete(tournament);
        }
      }
    } catch (error) {
      console.error('Error checking tournament completion:', error);
    }
  }

  private async notifyTournamentComplete(tournament: any) {
    try {
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true },
      });

      if (users.length === 0) return;

      const userIds = users.map(u => u.id);
      const tournamentName = tournament.name || tournament.nameAr || 'Tournament';
      const championName = tournament.winner?.name || 'Unknown';

      // Create database notifications
      await notificationsService.createBulkNotifications(
        userIds,
        'TOURNAMENT_COMPLETED',
        '🏆 Tournament Complete',
        `${tournamentName} has ended! Champion: ${championName}`,
        {
          tournamentId: tournament.id,
          championId: tournament.winner?.id,
          championName,
        }
      );

      // Send push notifications
      const allPushTokens = await pushNotificationsService.getAllActivePushTokens();
      if (allPushTokens.length > 0) {
        await pushNotificationsService.sendPushNotification({
          pushTokens: allPushTokens,
          title: '🎉 Tournament Complete!',
          body: `${tournamentName} - Champion: ${championName}`,
          data: {
            tournamentId: tournament.id,
            championId: tournament.winner?.id,
            type: 'TOURNAMENT_COMPLETED',
          },
        });
      }
    } catch (error) {
      console.error('Error notifying tournament completion:', error);
    }
  }

  private async notifyMatchCreated(tournamentId: string, match: any) {
    try {
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true },
      });

      if (users.length === 0) return;

      const userIds = users.map(u => u.id);
      const team1Name = match.team1?.name || 'Team 1';
      const team2Name = match.team2?.name || 'Team 2';

      // Create database notifications
      await notificationsService.createBulkNotifications(
        userIds,
        'MATCH_CREATED',
        '⚽ New Match Scheduled',
        `${team1Name} vs ${team2Name} - Get ready!`,
        {
          tournamentId,
          matchId: match.id,
          team1Id: match.team1Id,
          team2Id: match.team2Id,
          stage: match.stage,
        }
      );

      // Send push notifications
      const allPushTokens = await pushNotificationsService.getAllActivePushTokens();
      if (allPushTokens.length > 0) {
        await pushNotificationsService.sendPushNotification({
          pushTokens: allPushTokens,
          title: '🎯 New Match Created',
          body: `${team1Name} vs ${team2Name}`,
          data: {
            tournamentId,
            matchId: match.id,
            type: 'MATCH_CREATED',
          },
        });
      }
    } catch (error) {
      console.error('Error notifying about match creation:', error);
    }
  }

  async advanceToKnockout(tournamentId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        groups: {
          include: {
            teams: {
              include: { team: true },
              orderBy: [
                { points: 'desc' },
                { goalsFor: 'desc' },
              ],
            },
          },
        },
      },
    });

    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status !== 'GROUP_STAGE') {
      throw new Error('Tournament must be in GROUP_STAGE to advance to knockout');
    }

    // Collect qualified teams
    const qualifiedTeams: { teamId: string; rank: number }[] = [];
    let rank = 1;

    // First, collect all winners (1st place from each group)
    for (const group of tournament.groups) {
      if (group.teams.length >= 1) {
        qualifiedTeams.push({ teamId: group.teams[0].teamId, rank: rank++ });
      }
    }

    // Then, collect runners-up (2nd place from each group) if teamsAdvancingPerGroup > 1
    if (tournament.teamsAdvancingPerGroup >= 2) {
      for (const group of tournament.groups) {
        if (group.teams.length >= 2) {
          qualifiedTeams.push({ teamId: group.teams[1].teamId, rank: rank++ });
        }
      }
    }

    if (qualifiedTeams.length < 2) {
      throw new Error('Not enough qualified teams for knockout');
    }

    // Generate knockout matches
    const knockoutStages = this.calculateKnockoutStages(qualifiedTeams.length);
    
    if (knockoutStages.length === 0) {
      throw new Error('Cannot determine knockout stages');
    }

    // Generate first knockout round matches
    const firstStage = knockoutStages[0];
    await this.generateKnockoutMatches(tournamentId, qualifiedTeams, firstStage);

    // Update tournament status
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'KNOCKOUT' },
    });

    return this.getTournament(tournamentId);
  }

  private calculateKnockoutStages(teamCount: number): string[] {
    const stages: string[] = [];

    // Dynamically determine knockout stages based on team count
    if (teamCount === 2) {
      stages.push('FINAL');
    } else if (teamCount <= 4) {
      stages.push('SEMI_FINAL', 'FINAL');
    } else if (teamCount <= 8) {
      stages.push('QUARTER_FINAL', 'SEMI_FINAL', 'FINAL');
    } else if (teamCount <= 16) {
      stages.push('ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL');
    } else {
      // For more than 16 teams, add preliminary rounds
      const stages: string[] = [];
      let teamsRemaining = teamCount;
      
      // Work backwards from the final
      while (teamsRemaining > 2) {
        if (teamsRemaining > 16) {
          stages.unshift('ROUND_OF_32');
          teamsRemaining = 16;
        } else if (teamsRemaining > 8) {
          stages.unshift('ROUND_OF_16');
          teamsRemaining = 8;
        } else if (teamsRemaining > 4) {
          stages.unshift('QUARTER_FINAL');
          teamsRemaining = 4;
        } else if (teamsRemaining > 2) {
          stages.unshift('SEMI_FINAL');
          teamsRemaining = 2;
        }
      }
      stages.push('FINAL');
    }

    return stages;
  }

  private async generateKnockoutMatches(
    tournamentId: string,
    qualifiedTeams: { teamId: string; rank: number }[],
    stage: string
  ) {
    // Pair teams: 1 vs last, 2 vs second-to-last, etc.
    const matches = [];
    const n = qualifiedTeams.length;

    for (let i = 0; i < n / 2; i++) {
      matches.push({
        team1Id: qualifiedTeams[i].teamId,
        team2Id: qualifiedTeams[n - 1 - i].teamId,
      });
    }

    // Create match records
    for (const match of matches) {
      const createdMatch = await prisma.tournamentMatch.create({
        data: {
          tournamentId,
          stage: stage as any,
          team1Id: match.team1Id,
          team2Id: match.team2Id,
          status: 'SCHEDULED',
        },
        include: {
          team1: true,
          team2: true,
        },
      });

      // Send match created notification
      try {
        await this.notifyMatchCreated(tournamentId, createdMatch);
      } catch (error) {
        console.error('Error notifying about match creation:', error);
      }
    }
  }

  async generateNextKnockoutRound(tournamentId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        tournamentMatches: true,
      },
    });

    if (!tournament) throw new Error('Tournament not found');

    // All possible knockout stages in order
    const allStages = ['ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
    
    // Only get knockout stage matches (filter out GROUP_STAGE)
    const knockoutMatches = tournament.tournamentMatches.filter(m => allStages.includes(m.stage));
    
    if (knockoutMatches.length === 0) {
      throw new Error('No knockout matches found');
    }
    
    // Find the latest stage that has matches
    let currentStage = null;
    let currentStageIndex = -1;
    
    for (let i = allStages.length - 1; i >= 0; i--) {
      const stageMatches = knockoutMatches.filter(m => m.stage === allStages[i]);
      if (stageMatches.length > 0) {
        currentStage = allStages[i];
        currentStageIndex = i;
        break;
      }
    }

    if (currentStageIndex === -1) {
      throw new Error('Invalid stage - no valid knockout stage found');
    }

    // Check if all matches in current stage are completed
    const currentStageMatches = knockoutMatches.filter(m => m.stage === currentStage);
    const allCompleted = currentStageMatches.every(m => m.status === 'COMPLETED');

    if (!allCompleted) {
      throw new Error('Not all matches in current stage are completed');
    }

    // If final is completed, tournament is done
    if (currentStageIndex === allStages.length - 1) {
      const winner = currentStageMatches[0]?.winnerId;
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          status: 'COMPLETED',
          winnerId: winner || undefined,
        },
      });
      return this.getTournament(tournamentId);
    }

    // Get next stage
    const nextStage = allStages[currentStageIndex + 1];

    // Collect winners from current stage
    const winners = currentStageMatches.map((m: any) => ({
      teamId: m.winnerId!,
      rank: 0,
    }));

    if (winners.length === 0) {
      throw new Error('No winners found in current stage');
    }

    // Generate next round matches
    await this.generateKnockoutMatches(tournamentId, winners, nextStage);

    return this.getTournament(tournamentId);
  }

  async getGroupStandings(tournamentId: string, groupId: string) {
    return prisma.tournamentTeam.findMany({
      where: {
        tournamentId,
        groupId,
      },
      include: { team: true },
      orderBy: [
        { points: 'desc' },
        { goalsFor: 'desc' },
      ],
    });
  }

  async updateMatch(tournamentId: string, matchId: string, updates: { matchTime?: string; matchPlace?: string }) {
    const match = await prisma.tournamentMatch.findUnique({
      where: { id: matchId },
      include: { tournament: true },
    });

    if (!match) throw new Error('Match not found');
    if (match.tournamentId !== tournamentId) throw new Error('Match does not belong to this tournament');
    
    // Only allow editing if match is SCHEDULED
    if (match.status !== 'SCHEDULED') {
      throw new Error('Can only edit matches that are scheduled');
    }

    return prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        matchTime: updates.matchTime ? new Date(updates.matchTime) : undefined,
        matchPlace: updates.matchPlace,
      },
      include: {
        team1: true,
        team2: true,
        winner: true,
      },
    });
  }

  async getTournamentBracket(tournamentId: string) {
    const matches = await prisma.tournamentMatch.findMany({
      where: { tournamentId },
      include: {
        team1: true,
        team2: true,
        winner: true,
      },
      orderBy: [
        { stage: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    const bracket: Record<string, any[]> = {};
    for (const match of matches) {
      if (!bracket[match.stage]) {
        bracket[match.stage] = [];
      }
      bracket[match.stage].push(match);
    }

    return bracket;
  }

  async deleteAllTournaments() {
    // Delete in order to respect foreign key constraints
    await prisma.matchEvent.deleteMany({});
    await prisma.tournamentMatch.deleteMany({});
    await prisma.tournament.deleteMany({});
    return { message: 'All tournaments deleted' };
  }

  async getUpcomingTournamentMatches() {
    const now = new Date();
    const matches = await prisma.tournamentMatch.findMany({
      where: {
        AND: [
          { status: { in: ['SCHEDULED', 'LIVE'] } },
          // Optional: can add matchTime filter here if needed
        ],
      },
      include: {
        tournament: { select: { id: true, name: true } },
        team1: { select: { id: true, name: true } },
        team2: { select: { id: true, name: true } },
      },
      orderBy: [{ matchTime: 'asc' }, { createdAt: 'asc' }],
      take: 50,
    });
    return matches;
  }
}
