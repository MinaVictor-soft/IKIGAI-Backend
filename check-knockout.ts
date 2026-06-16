import prisma from './src/config/database';

(async () => {
  const tournament = await prisma.tournament.findFirst({
    where: { status: 'KNOCKOUT' },
    include: {
      tournamentMatches: true,
      groups: {
        include: {
          teams: true
        }
      }
    }
  });

  if (!tournament) {
    console.log('No knockout tournament found');
    process.exit(0);
  }

  console.log('Tournament:', tournament.name);
  console.log('teamsAdvancingPerGroup:', tournament.teamsAdvancingPerGroup);
  console.log('numberOfGroups:', tournament.numberOfGroups);
  console.log('teamsPerGroup:', tournament.teamsPerGroup);
  console.log('Total groups:', tournament.groups.length);
  
  let totalTeamsInGroups = 0;
  for (const group of tournament.groups) {
    console.log('Group ' + group.groupName + ': ' + group.teams.length + ' teams');
    totalTeamsInGroups += group.teams.length;
  }
  console.log('Total teams in groups:', totalTeamsInGroups);
  
  console.log('\nTotal matches:', tournament.tournamentMatches.length);
  
  const stages: any = {};
  for (const match of tournament.tournamentMatches) {
    if (!stages[match.stage]) stages[match.stage] = 0;
    stages[match.stage]++;
  }

  for (const stg of Object.keys(stages).sort()) {
    console.log(stg + ': ' + stages[stg] + ' matches');
  }

  process.exit(0);
})();
