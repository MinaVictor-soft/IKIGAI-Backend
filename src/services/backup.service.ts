// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ZipArchive } = require('archiver') as { ZipArchive: new (opts?: object) => any };
import unzipper from 'unzipper';
import { Readable } from 'stream';
import prisma from '../config/database';
import { uploadBufferToKey, listStorageFiles, downloadFromStorage } from './storage.service';

// ─── helpers ────────────────────────────────────────────────────────────────

function dateKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function nowLabel(): string {
  return new Date().toISOString().replace(/[:.]/g, '-'); // for unique names
}

// ─── DB dump ────────────────────────────────────────────────────────────────

async function dumpDatabase(): Promise<Record<string, unknown[]>> {
  const [
    users, tribes, conferenceSessions, attendance, xpTransactions, levels,
    quizzes, quizQuestions, quizSubmissions,
    bonusQrCodes, bonusClaims,
    sportsTeams, teamPlayers, matches, matchEvents, playerStats,
    refreshTokens, auditLogs, systemConfigs, adminSettings,
    publicationCategories, publications,
    notifications, userPushTokens,
    tournaments, tournamentGroups, tournamentTeams, tournamentMatches,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.tribe.findMany(),
    prisma.conferenceSession.findMany(),
    prisma.attendance.findMany(),
    prisma.xpTransaction.findMany(),
    prisma.level.findMany(),
    prisma.quiz.findMany(),
    prisma.quizQuestion.findMany(),
    prisma.quizSubmission.findMany(),
    prisma.bonusQrCode.findMany(),
    prisma.bonusClaim.findMany(),
    prisma.sportsTeam.findMany(),
    prisma.teamPlayer.findMany(),
    prisma.match.findMany(),
    prisma.matchEvent.findMany(),
    prisma.playerStats.findMany(),
    prisma.refreshToken.findMany(),
    prisma.auditLog.findMany(),
    prisma.systemConfig.findMany(),
    prisma.adminSettings.findMany(),
    prisma.publicationCategory.findMany(),
    prisma.publication.findMany(),
    prisma.notification.findMany(),
    prisma.userPushToken.findMany(),
    prisma.tournament.findMany(),
    prisma.tournamentGroup.findMany(),
    prisma.tournamentTeam.findMany(),
    prisma.tournamentMatch.findMany(),
  ]);

  return {
    users, tribes, conferenceSessions, attendance, xpTransactions, levels,
    quizzes, quizQuestions, quizSubmissions,
    bonusQrCodes, bonusClaims,
    sportsTeams, teamPlayers, matches, matchEvents, playerStats,
    refreshTokens, auditLogs, systemConfigs, adminSettings,
    publicationCategories, publications,
    notifications, userPushTokens,
    tournaments, tournamentGroups, tournamentTeams, tournamentMatches,
  };
}

// ─── build ZIP ──────────────────────────────────────────────────────────────

async function buildBackupZip(dbDump: Record<string, unknown[]>, label: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const archive = new ZipArchive({ zlib: { level: 6 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    // metadata file
    archive.append(JSON.stringify({ label, exportedAt: new Date().toISOString(), version: 1 }, null, 2), { name: 'meta.json' });

    // DB JSON files (one per model)
    for (const [model, records] of Object.entries(dbDump)) {
      archive.append(JSON.stringify(records, null, 2), { name: `db/${model}.json` });
    }

    // App Storage files (public/*)
    try {
      const keys = await listStorageFiles('public/');
      for (const key of keys) {
        try {
          const buf = await downloadFromStorage(key);
          archive.append(buf, { name: `files/${key}` });
        } catch {
          console.warn(`[backup] Skipping storage file: ${key}`);
        }
      }
    } catch {
      console.warn('[backup] Could not list App Storage files');
    }

    archive.finalize();
  });
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Run a full backup and upload to App Storage.
 * @param label  'morning' | 'evening' | 'manual' — appended to the filename
 */
export async function runBackup(label: 'morning' | 'evening' | 'manual' = 'manual'): Promise<{ key: string; sizeKb: number }> {
  const date = dateKey();
  const key = `.private/backups/backup-${date}-${label}.zip`;

  console.log(`[backup] Starting ${label} backup for ${date}…`);
  const dbDump = await dumpDatabase();
  console.log('[backup] Database dumped, building ZIP…');

  const zipBuffer = await buildBackupZip(dbDump, label);
  const sizeKb = Math.round(zipBuffer.length / 1024);
  console.log(`[backup] ZIP built (${sizeKb} KB), uploading to App Storage…`);

  await uploadBufferToKey(zipBuffer, key, 'application/zip');
  console.log(`[backup] ✅ ${label} backup saved: ${key}`);

  return { key, sizeKb };
}

/**
 * List all backup ZIPs stored in App Storage with metadata.
 */
export async function listBackups(): Promise<{ filename: string; key: string; date: string; label: string }[]> {
  const keys = await listStorageFiles('.private/backups/');
  return keys
    .filter((k) => k.endsWith('.zip'))
    .map((key) => {
      const filename = key.split('/').pop()!;
      const match = filename.match(/backup-(\d{4}-\d{2}-\d{2})-(morning|evening|manual)\.zip/);
      return {
        filename,
        key,
        date: match?.[1] ?? 'unknown',
        label: match?.[2] ?? 'manual',
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first
}

/**
 * Download a specific backup ZIP as a Buffer (for streaming to client).
 */
export async function getBackupBuffer(filename: string): Promise<Buffer> {
  const key = `.private/backups/${filename}`;
  return downloadFromStorage(key);
}

/**
 * Restore the database from a specific backup ZIP stored in App Storage.
 * This WIPES all current data and reimports from the backup.
 * Returns a summary of how many records were restored per model.
 */
export async function restoreBackup(filename: string): Promise<Record<string, number>> {
  const key = `.private/backups/${filename}`;
  console.log(`[restore] Downloading backup: ${key}`);

  const zipBuffer = await downloadFromStorage(key);

  // ── Extract all db/*.json files from the ZIP ──────────────────────────────
  const dbData: Record<string, unknown[]> = {};
  const zip = await unzipper.Open.buffer(zipBuffer);
  for (const file of zip.files) {
    if (file.path.startsWith('db/') && file.path.endsWith('.json')) {
      const model = file.path.slice(3, -5); // db/<model>.json → <model>
      const content = await file.buffer();
      try {
        dbData[model] = JSON.parse(content.toString('utf8'));
      } catch {
        console.warn(`[restore] Could not parse ${file.path}`);
      }
    }
  }
  console.log(`[restore] Extracted models: ${Object.keys(dbData).join(', ')}`);

  // ── Wipe all tables (CASCADE handles FK order automatically) ──────────────
  console.log('[restore] Wiping all tables…');
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      tournament_matches, tournament_teams, tournament_groups, tournaments,
      user_push_tokens, notifications,
      publications, publication_categories,
      admin_settings, system_config,
      audit_logs, refresh_tokens,
      player_stats, match_events, matches,
      team_players, sports_teams,
      bonus_claims, bonus_qr_codes,
      quiz_submissions, quiz_questions, quizzes,
      levels,
      xp_transactions, attendance,
      conference_sessions,
      tribes,
      users
    RESTART IDENTITY CASCADE
  `);
  console.log('[restore] Tables wiped');

  // ── Insert records in strict parent-before-child FK order ────────────────
  const summary: Record<string, number> = {};

  async function restore(model: string, fn: (data: any[]) => Promise<any>) {
    const records = (dbData[model] ?? []) as any[];
    if (records.length === 0) { summary[model] = 0; return; }
    await fn(records);
    summary[model] = records.length;
    console.log(`[restore]  ✓ ${model}: ${records.length}`);
  }

  // 1. Standalone root tables (no FK deps)
  await restore('tribes',             (d) => prisma.tribe.createMany({ data: d, skipDuplicates: true }));
  await restore('levels',             (d) => prisma.level.createMany({ data: d, skipDuplicates: true }));
  await restore('conferenceSessions', (d) => prisma.conferenceSession.createMany({ data: d, skipDuplicates: true }));
  await restore('publicationCategories', (d) => prisma.publicationCategory.createMany({ data: d, skipDuplicates: true }));
  await restore('adminSettings',      (d) => prisma.adminSettings.createMany({ data: d, skipDuplicates: true }));

  // 2. Users depend on tribes + levels
  await restore('users',              (d) => prisma.user.createMany({ data: d, skipDuplicates: true }));

  // 3. Tables that depend on users only (or users + root tables)
  await restore('sportsTeams',        (d) => prisma.sportsTeam.createMany({ data: d, skipDuplicates: true }));
  await restore('systemConfigs',      (d) => prisma.systemConfig.createMany({ data: d, skipDuplicates: true }));
  await restore('attendance',         (d) => prisma.attendance.createMany({ data: d, skipDuplicates: true }));
  await restore('xpTransactions',     (d) => prisma.xpTransaction.createMany({ data: d, skipDuplicates: true }));
  await restore('refreshTokens',      (d) => prisma.refreshToken.createMany({ data: d, skipDuplicates: true }));
  await restore('auditLogs',          (d) => prisma.auditLog.createMany({ data: d, skipDuplicates: true }));
  await restore('notifications',      (d) => prisma.notification.createMany({ data: d, skipDuplicates: true }));
  await restore('userPushTokens',     (d) => prisma.userPushToken.createMany({ data: d, skipDuplicates: true }));
  await restore('publications',       (d) => prisma.publication.createMany({ data: d, skipDuplicates: true }));

  // 4. Quizzes (quiz → user + optional conference_session)
  await restore('quizzes',            (d) => prisma.quiz.createMany({ data: d, skipDuplicates: true }));
  await restore('quizQuestions',      (d) => prisma.quizQuestion.createMany({ data: d, skipDuplicates: true }));
  await restore('quizSubmissions',    (d) => prisma.quizSubmission.createMany({ data: d, skipDuplicates: true }));

  // 5. Bonus (bonusQrCode → user; bonusClaim → bonusQrCode + user + xpTransaction)
  await restore('bonusQrCodes',       (d) => prisma.bonusQrCode.createMany({ data: d, skipDuplicates: true }));
  await restore('bonusClaims',        (d) => prisma.bonusClaim.createMany({ data: d, skipDuplicates: true }));

  // 6. Sports children (teamPlayer → sportsTeam + user; match → sportsTeam)
  await restore('teamPlayers',        (d) => prisma.teamPlayer.createMany({ data: d, skipDuplicates: true }));
  await restore('matches',            (d) => prisma.match.createMany({ data: d, skipDuplicates: true }));
  await restore('matchEvents',        (d) => prisma.matchEvent.createMany({ data: d, skipDuplicates: true }));
  await restore('playerStats',        (d) => prisma.playerStats.createMany({ data: d, skipDuplicates: true }));

  // 7. Tournaments (tournament → sportsTeam for winner)
  await restore('tournaments',        (d) => prisma.tournament.createMany({ data: d, skipDuplicates: true }));
  await restore('tournamentGroups',   (d) => prisma.tournamentGroup.createMany({ data: d, skipDuplicates: true }));
  await restore('tournamentTeams',    (d) => prisma.tournamentTeam.createMany({ data: d, skipDuplicates: true }));
  await restore('tournamentMatches',  (d) => prisma.tournamentMatch.createMany({ data: d, skipDuplicates: true }));

  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  console.log(`[restore] ✅ Done — ${total} total records restored from ${filename}`);
  return summary;
}
