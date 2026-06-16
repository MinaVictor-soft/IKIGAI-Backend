-- CreateTable
CREATE TABLE "admin_settings" (
    "id" UUID NOT NULL,
    "enable_tournament_matches" BOOLEAN NOT NULL DEFAULT true,
    "enable_regular_sport_matches" BOOLEAN NOT NULL DEFAULT true,
    "enable_push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "tournament_visibility_web" BOOLEAN NOT NULL DEFAULT true,
    "tournament_visibility_mobile" BOOLEAN NOT NULL DEFAULT true,
    "regular_matches_visibility_web" BOOLEAN NOT NULL DEFAULT true,
    "regular_matches_visibility_mobile" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);
