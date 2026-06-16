/*
  Warnings:

  - The values [ROUND_OF_32,ROUND_OF_24,ROUND_OF_16,ROUND_OF_12,ROUND_OF_8] on the enum `MatchStageType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `knockout_xp_config` on the `tournaments` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MatchStageType_new" AS ENUM ('GROUP_STAGE', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL');
ALTER TABLE "tournament_matches" ALTER COLUMN "stage_type" TYPE "MatchStageType_new" USING ("stage_type"::text::"MatchStageType_new");
ALTER TABLE "knockout_brackets" ALTER COLUMN "stage_type" TYPE "MatchStageType_new" USING ("stage_type"::text::"MatchStageType_new");
ALTER TYPE "MatchStageType" RENAME TO "MatchStageType_old";
ALTER TYPE "MatchStageType_new" RENAME TO "MatchStageType";
DROP TYPE "public"."MatchStageType_old";
COMMIT;

-- AlterTable
ALTER TABLE "tournaments" DROP COLUMN "knockout_xp_config",
ADD COLUMN     "member_restriction_type" VARCHAR(50),
ADD COLUMN     "restriction_value" VARCHAR(200);
