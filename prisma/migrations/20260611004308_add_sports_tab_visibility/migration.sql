-- AlterTable
ALTER TABLE "admin_settings" ADD COLUMN     "sports_tab_visibility_mobile" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sports_tab_visibility_web" BOOLEAN NOT NULL DEFAULT true;
