/*
  Warnings:

  - The values [CANCELLED] on the enum `TournamentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `display_order` on the `tournament_groups` table. All the data in the column will be lost.
  - You are about to drop the column `groupName` on the `tournament_groups` table. All the data in the column will be lost.
  - You are about to drop the column `away_score` on the `tournament_matches` table. All the data in the column will be lost.
  - You are about to drop the column `away_team_id` on the `tournament_matches` table. All the data in the column will be lost.
  - You are about to drop the column `completed_at` on the `tournament_matches` table. All the data in the column will be lost.
  - You are about to drop the column `group_id` on the `tournament_matches` table. All the data in the column will be lost.
  - You are about to drop the column `home_score` on the `tournament_matches` table. All the data in the column will be lost.
  - You are about to drop the column `home_team_id` on the `tournament_matches` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `tournament_matches` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_at` on the `tournament_matches` table. All the data in the column will be lost.
  - You are about to drop the column `stage_type` on the `tournament_matches` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `tournament_matches` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `description_ar` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `final_runner_up_xp` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `final_winner_xp` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `group_stage_draw_xp` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `group_stage_loss_xp` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `group_stage_win_xp` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `member_restriction_type` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `quarter_final_loss_xp` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `quarter_final_win_xp` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `restriction_value` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `semi_final_loss_xp` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `semi_final_win_xp` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the `knockout_brackets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tournament_group_teams` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tournament_id,group_name]` on the table `tournament_groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `group_name` to the `tournament_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team1_id` to the `tournament_matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team2_id` to the `tournament_matches` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TournamentStage" AS ENUM ('GROUP_STAGE', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL');

-- AlterEnum
BEGIN;
CREATE TYPE "TournamentStatus_new" AS ENUM ('PLANNING', 'GROUP_STAGE', 'KNOCKOUT', 'COMPLETED');
ALTER TABLE "public"."tournaments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tournaments" ALTER COLUMN "status" TYPE "TournamentStatus_new" USING ("status"::text::"TournamentStatus_new");
ALTER TYPE "TournamentStatus" RENAME TO "TournamentStatus_old";
ALTER TYPE "TournamentStatus_new" RENAME TO "TournamentStatus";
DROP TYPE "public"."TournamentStatus_old";
ALTER TABLE "tournaments" ALTER COLUMN "status" SET DEFAULT 'PLANNING';
COMMIT;

-- DropForeignKey
ALTER TABLE "knockout_brackets" DROP CONSTRAINT "knockout_brackets_match_id_fkey";

-- DropForeignKey
ALTER TABLE "knockout_brackets" DROP CONSTRAINT "knockout_brackets_tournament_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_group_teams" DROP CONSTRAINT "tournament_group_teams_group_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_group_teams" DROP CONSTRAINT "tournament_group_teams_team_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_matches" DROP CONSTRAINT "tournament_matches_away_team_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_matches" DROP CONSTRAINT "tournament_matches_group_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_matches" DROP CONSTRAINT "tournament_matches_home_team_id_fkey";

-- DropIndex
DROP INDEX "uq_tournament_group";

-- DropIndex
DROP INDEX "idx_tmatch_group";

-- DropIndex
DROP INDEX "idx_tmatch_stage";

-- DropIndex
DROP INDEX "idx_tournament_start_date";

-- AlterTable
ALTER TABLE "tournament_groups" DROP COLUMN "display_order",
DROP COLUMN "groupName",
ADD COLUMN     "group_name" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "tournament_matches" DROP COLUMN "away_score",
DROP COLUMN "away_team_id",
DROP COLUMN "completed_at",
DROP COLUMN "group_id",
DROP COLUMN "home_score",
DROP COLUMN "home_team_id",
DROP COLUMN "notes",
DROP COLUMN "scheduled_at",
DROP COLUMN "stage_type",
DROP COLUMN "venue",
ADD COLUMN     "stage" "TournamentStage" NOT NULL DEFAULT 'GROUP_STAGE',
ADD COLUMN     "team1_goals" INTEGER,
ADD COLUMN     "team1_id" UUID NOT NULL,
ADD COLUMN     "team2_goals" INTEGER,
ADD COLUMN     "team2_id" UUID NOT NULL,
ADD COLUMN     "winner_id" UUID;

-- AlterTable
ALTER TABLE "tournaments" DROP COLUMN "created_by",
DROP COLUMN "description",
DROP COLUMN "description_ar",
DROP COLUMN "end_date",
DROP COLUMN "final_runner_up_xp",
DROP COLUMN "final_winner_xp",
DROP COLUMN "group_stage_draw_xp",
DROP COLUMN "group_stage_loss_xp",
DROP COLUMN "group_stage_win_xp",
DROP COLUMN "member_restriction_type",
DROP COLUMN "quarter_final_loss_xp",
DROP COLUMN "quarter_final_win_xp",
DROP COLUMN "restriction_value",
DROP COLUMN "semi_final_loss_xp",
DROP COLUMN "semi_final_win_xp",
DROP COLUMN "start_date",
ADD COLUMN     "winner_id" UUID,
ALTER COLUMN "number_of_groups" DROP DEFAULT,
ALTER COLUMN "teams_per_group" DROP DEFAULT,
ALTER COLUMN "teams_advancing_per_group" DROP DEFAULT,
ALTER COLUMN "points_for_win" DROP DEFAULT,
ALTER COLUMN "points_for_draw" DROP DEFAULT,
ALTER COLUMN "points_for_loss" DROP DEFAULT;

-- DropTable
DROP TABLE "knockout_brackets";

-- DropTable
DROP TABLE "tournament_group_teams";

-- DropEnum
DROP TYPE "MatchStageType";

-- CreateTable
CREATE TABLE "tournament_teams" (
    "id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "group_id" UUID,
    "points" INTEGER NOT NULL DEFAULT 0,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "goals_for" INTEGER NOT NULL DEFAULT 0,
    "goals_against" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_tournament_team_tournament" ON "tournament_teams"("tournament_id");

-- CreateIndex
CREATE INDEX "idx_tournament_team_team" ON "tournament_teams"("team_id");

-- CreateIndex
CREATE INDEX "idx_tournament_team_group" ON "tournament_teams"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tournament_team" ON "tournament_teams"("tournament_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tournament_group_name" ON "tournament_groups"("tournament_id", "group_name");

-- CreateIndex
CREATE INDEX "idx_tournament_match_stage" ON "tournament_matches"("stage");

-- CreateIndex
CREATE INDEX "idx_tournament_match_team1" ON "tournament_matches"("team1_id");

-- CreateIndex
CREATE INDEX "idx_tournament_match_team2" ON "tournament_matches"("team2_id");

-- CreateIndex
CREATE INDEX "idx_tournament_created" ON "tournaments"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "sports_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "sports_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "tournament_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "sports_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "sports_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "sports_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_tmatch_status" RENAME TO "idx_tournament_match_status";

-- RenameIndex
ALTER INDEX "idx_tmatch_tournament" RENAME TO "idx_tournament_match_tournament";
