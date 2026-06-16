-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MatchStageType" ADD VALUE 'ROUND_OF_32';
ALTER TYPE "MatchStageType" ADD VALUE 'ROUND_OF_24';
ALTER TYPE "MatchStageType" ADD VALUE 'ROUND_OF_16';
ALTER TYPE "MatchStageType" ADD VALUE 'ROUND_OF_12';
ALTER TYPE "MatchStageType" ADD VALUE 'ROUND_OF_8';

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "knockout_xp_config" JSONB DEFAULT '{}';
