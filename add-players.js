const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const users = [
    "a15c2b68-42a8-41b5-8a41-89625a899666",
    "a0d5ddf6-7e6d-456b-ba89-664ce88ce79a",
    "7100ef89-96bb-4c42-b9d4-a22586b95999",
    "423bed92-ca30-49e1-bfb6-03dd73500fe3",
    "d2f7d446-d79b-4d1b-81e2-d58dacff0791",
    "f4b11674-ece5-411b-95b5-00b30bd46361",
    "731dd74e-5569-4881-80f4-96757bd833e3",
    "3fbdcce9-d987-45fd-b711-1c5f3181caad"
];

const teamsNeedingPlayers = [
    "5986c812-9e26-4dcf-86dc-064c509a4b78",  // Barcelona
    "66226891-882b-4b76-b64e-f2cb9680e7eb",  // Chelsea
    "da740e9b-5432-489d-b54b-de9f5ad5f8c1",  // Arsenal
    "af6a2a3c-7119-4dd1-9502-5544b38b6dca",  // Manchester City
    "b3314e4e-d56c-4647-834a-869ae743c7e4",  // Tottenham
    "ed33a9ac-a837-45a0-bb4f-fd96f53b5926",  // PSG
    "72646759-ee9c-4e1c-b5e9-20531e206dfb",  // AC Milan
    "d17d595e-fe7c-4574-a501-78a2c3b3a8a1"   // Liverpool
];

async function addPlayers() {
    try {
        let count = 0;
        for (const teamId of teamsNeedingPlayers) {
            for (let i = 0; i < 4; i++) {
                const userId = users[i];
                await prisma.teamPlayer.create({
                    data: {
                        teamId,
                        userId,
                        position: 'Forward'
                    }
                });
                count++;
            }
        }
        console.log(`✅ Added ${count} players to ${teamsNeedingPlayers.length} teams`);
        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await prisma.$disconnect();
        process.exit(1);
    }
}

addPlayers();
