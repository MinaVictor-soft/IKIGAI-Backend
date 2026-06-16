-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('QUIZ_CREATED', 'EVENT_CREATED', 'MATCH_CREATED', 'MATCH_LIVE', 'PUBLICATION_CREATED', 'ACHIEVEMENT_EARNED', 'LEVEL_UP', 'XP_AWARDED', 'ATTENDANCE_REMINDER');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ATTENDEE', 'STAFF', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "XpType" AS ENUM ('ATTENDANCE', 'PARTICIPATION', 'QUIZ', 'CHALLENGE', 'BONUS', 'SPORTS', 'MANUAL', 'PENALTY', 'REWARD');

-- CreateEnum
CREATE TYPE "XpSourceType" AS ENUM ('SESSION', 'QUIZ', 'CHALLENGE', 'ADMIN', 'BONUS_QR', 'STAFF_AWARD', 'SPORTS');

-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');

-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('GK', 'DEF', 'MID', 'FWD');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('PLANNING', 'GROUP_STAGE', 'KNOCKOUT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchStageType" AS ENUM ('GROUP_STAGE', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "avatar_url" VARCHAR(500),
    "church" VARCHAR(200),
    "diocese" VARCHAR(200),
    "phone" VARCHAR(20),
    "role" "Role" NOT NULL DEFAULT 'ATTENDEE',
    "tribe_id" UUID,
    "level_id" UUID,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "language_preference" VARCHAR(5) NOT NULL DEFAULT 'en',
    "user_qr_token" UUID NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tribes" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "icon_url" VARCHAR(500),
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "max_members" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tribes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conference_sessions" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "speaker" VARCHAR(100),
    "location" VARCHAR(200),
    "session_date" DATE NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "qr_token" VARCHAR(100) NOT NULL,
    "qr_expires_at" TIMESTAMP(3),
    "xp_reward" INTEGER NOT NULL DEFAULT 10,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "max_capacity" INTEGER,
    "attendance_buffer_minutes" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conference_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xp_awarded" INTEGER NOT NULL,
    "is_late" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "XpType" NOT NULL,
    "source_type" "XpSourceType" NOT NULL,
    "source_id" UUID,
    "description" VARCHAR(500),
    "awarded_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "display_order" INTEGER NOT NULL,
    "min_xp" INTEGER NOT NULL,
    "max_xp" INTEGER,
    "badge_url" VARCHAR(500),
    "color" VARCHAR(7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "session_id" UUID,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "passing_score" INTEGER,
    "time_limit_seconds" INTEGER,
    "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "question_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "options" JSONB,
    "correct_answer" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "display_order" INTEGER NOT NULL,
    "explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_submissions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "xp_awarded" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time_taken_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonus_qr_codes" (
    "id" UUID NOT NULL,
    "token" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "label" VARCHAR(200),
    "max_claims" INTEGER,
    "claims_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "batch_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bonus_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonus_claims" (
    "id" UUID NOT NULL,
    "bonus_qr_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "xp_transaction_id" UUID NOT NULL,
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bonus_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sports_teams" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "logo_url" VARCHAR(500),
    "color" VARCHAR(7),
    "captain_id" UUID,
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goals_for" INTEGER NOT NULL DEFAULT 0,
    "goals_against" INTEGER NOT NULL DEFAULT 0,
    "goal_difference" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "max_roster_size" INTEGER NOT NULL DEFAULT 15,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_players" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "jersey_number" INTEGER,
    "position" "PlayerPosition",
    "is_captain" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL,
    "home_team_id" UUID NOT NULL,
    "away_team_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "venue" VARCHAR(200),
    "round" INTEGER,
    "group_name" VARCHAR(50),
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "home_score" INTEGER,
    "away_score" INTEGER,
    "win_xp" INTEGER NOT NULL DEFAULT 20,
    "draw_xp" INTEGER NOT NULL DEFAULT 10,
    "loss_xp" INTEGER NOT NULL DEFAULT 5,
    "notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_events" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "event_type" "EventType" NOT NULL,
    "minute" INTEGER NOT NULL,
    "notes" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_stats" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellow_cards" INTEGER NOT NULL DEFAULT 0,
    "red_cards" INTEGER NOT NULL DEFAULT 0,
    "minutes_played" INTEGER NOT NULL DEFAULT 0,
    "clean_sheets" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "name_ar" VARCHAR(200),
    "description" TEXT,
    "description_ar" TEXT,
    "status" "TournamentStatus" NOT NULL DEFAULT 'PLANNING',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "number_of_groups" INTEGER NOT NULL DEFAULT 4,
    "teams_per_group" INTEGER NOT NULL DEFAULT 4,
    "teams_advancing_per_group" INTEGER NOT NULL DEFAULT 2,
    "points_for_win" INTEGER NOT NULL DEFAULT 3,
    "points_for_draw" INTEGER NOT NULL DEFAULT 1,
    "points_for_loss" INTEGER NOT NULL DEFAULT 0,
    "group_stage_win_xp" INTEGER NOT NULL DEFAULT 20,
    "group_stage_draw_xp" INTEGER NOT NULL DEFAULT 10,
    "group_stage_loss_xp" INTEGER NOT NULL DEFAULT 5,
    "quarter_final_win_xp" INTEGER NOT NULL DEFAULT 30,
    "quarter_final_loss_xp" INTEGER NOT NULL DEFAULT 15,
    "semi_final_win_xp" INTEGER NOT NULL DEFAULT 40,
    "semi_final_loss_xp" INTEGER NOT NULL DEFAULT 20,
    "final_winner_xp" INTEGER NOT NULL DEFAULT 100,
    "final_runner_up_xp" INTEGER NOT NULL DEFAULT 50,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_groups" (
    "id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "groupName" VARCHAR(10) NOT NULL,
    "display_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_group_teams" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goals_for" INTEGER NOT NULL DEFAULT 0,
    "goals_against" INTEGER NOT NULL DEFAULT 0,
    "goal_difference" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "qualified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tournament_group_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_matches" (
    "id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "group_id" UUID,
    "stage_type" "MatchStageType" NOT NULL,
    "home_team_id" UUID NOT NULL,
    "away_team_id" UUID NOT NULL,
    "home_score" INTEGER,
    "away_score" INTEGER,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "venue" VARCHAR(200),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knockout_brackets" (
    "id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "stage_type" "MatchStageType" NOT NULL,
    "match_id" UUID NOT NULL,
    "winner_team_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knockout_brackets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "device_info" VARCHAR(500),
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" VARCHAR(50) NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "resource_id" UUID,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "description" VARCHAR(500),
    "category" VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "label_en" VARCHAR(100) NOT NULL,
    "label_ar" VARCHAR(100) NOT NULL,
    "color" VARCHAR(20) NOT NULL DEFAULT '#6366F1',
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category_id" UUID NOT NULL,
    "content_url" VARCHAR(500) NOT NULL,
    "cover_url" VARCHAR(500),
    "file_size" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_push_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "push_token" TEXT NOT NULL,
    "device_name" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_users_tribe" ON "users"("tribe_id");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_users_qr_token" ON "users"("user_qr_token");

-- CreateIndex
CREATE INDEX "idx_users_total_xp" ON "users"("total_xp" DESC);

-- CreateIndex
CREATE INDEX "idx_users_status" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_users_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tribes_name_key" ON "tribes"("name");

-- CreateIndex
CREATE INDEX "idx_tribes_total_xp" ON "tribes"("total_xp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "conference_sessions_qr_token_key" ON "conference_sessions"("qr_token");

-- CreateIndex
CREATE INDEX "idx_sessions_date" ON "conference_sessions"("session_date");

-- CreateIndex
CREATE INDEX "idx_sessions_status" ON "conference_sessions"("status");

-- CreateIndex
CREATE INDEX "idx_sessions_start_time" ON "conference_sessions"("start_time");

-- CreateIndex
CREATE INDEX "idx_attendance_session" ON "attendance"("session_id");

-- CreateIndex
CREATE INDEX "idx_attendance_user" ON "attendance"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_attendance_user_session" ON "attendance"("user_id", "session_id");

-- CreateIndex
CREATE INDEX "idx_xp_user" ON "xp_transactions"("user_id");

-- CreateIndex
CREATE INDEX "idx_xp_user_created" ON "xp_transactions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_xp_type" ON "xp_transactions"("type");

-- CreateIndex
CREATE INDEX "idx_xp_source" ON "xp_transactions"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "idx_xp_created_at" ON "xp_transactions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_xp_awarded_by" ON "xp_transactions"("awarded_by");

-- CreateIndex
CREATE UNIQUE INDEX "levels_name_key" ON "levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "levels_display_order_key" ON "levels"("display_order");

-- CreateIndex
CREATE INDEX "idx_levels_min_xp" ON "levels"("min_xp");

-- CreateIndex
CREATE INDEX "idx_quizzes_status" ON "quizzes"("status");

-- CreateIndex
CREATE INDEX "idx_quizzes_session" ON "quizzes"("session_id");

-- CreateIndex
CREATE INDEX "idx_questions_quiz" ON "quiz_questions"("quiz_id");

-- CreateIndex
CREATE INDEX "idx_questions_order" ON "quiz_questions"("quiz_id", "display_order");

-- CreateIndex
CREATE INDEX "idx_submissions_quiz" ON "quiz_submissions"("quiz_id");

-- CreateIndex
CREATE INDEX "idx_submissions_user" ON "quiz_submissions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_quiz_submission_user_quiz" ON "quiz_submissions"("user_id", "quiz_id");

-- CreateIndex
CREATE UNIQUE INDEX "bonus_qr_codes_token_key" ON "bonus_qr_codes"("token");

-- CreateIndex
CREATE INDEX "idx_bonus_qr_active" ON "bonus_qr_codes"("is_active", "expires_at");

-- CreateIndex
CREATE INDEX "idx_bonus_qr_batch" ON "bonus_qr_codes"("batch_id");

-- CreateIndex
CREATE INDEX "idx_bonus_qr_created_by" ON "bonus_qr_codes"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "bonus_claims_xp_transaction_id_key" ON "bonus_claims"("xp_transaction_id");

-- CreateIndex
CREATE INDEX "idx_bonus_claims_user" ON "bonus_claims"("user_id");

-- CreateIndex
CREATE INDEX "idx_bonus_claims_qr" ON "bonus_claims"("bonus_qr_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_bonus_claim_user" ON "bonus_claims"("bonus_qr_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sports_teams_name_key" ON "sports_teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sports_teams_captain_id_key" ON "sports_teams"("captain_id");

-- CreateIndex
CREATE INDEX "idx_teams_points" ON "sports_teams"("points" DESC, "goal_difference" DESC, "goals_for" DESC);

-- CreateIndex
CREATE INDEX "idx_teams_captain" ON "sports_teams"("captain_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_players_user_id_key" ON "team_players"("user_id");

-- CreateIndex
CREATE INDEX "idx_players_team" ON "team_players"("team_id");

-- CreateIndex
CREATE INDEX "idx_matches_home_team" ON "matches"("home_team_id");

-- CreateIndex
CREATE INDEX "idx_matches_away_team" ON "matches"("away_team_id");

-- CreateIndex
CREATE INDEX "idx_matches_status" ON "matches"("status");

-- CreateIndex
CREATE INDEX "idx_matches_scheduled" ON "matches"("scheduled_at");

-- CreateIndex
CREATE INDEX "idx_events_match" ON "match_events"("match_id");

-- CreateIndex
CREATE INDEX "idx_events_player" ON "match_events"("player_id");

-- CreateIndex
CREATE INDEX "idx_events_match_minute" ON "match_events"("match_id", "minute");

-- CreateIndex
CREATE UNIQUE INDEX "player_stats_user_id_key" ON "player_stats"("user_id");

-- CreateIndex
CREATE INDEX "idx_stats_goals" ON "player_stats"("goals" DESC);

-- CreateIndex
CREATE INDEX "idx_stats_team" ON "player_stats"("team_id");

-- CreateIndex
CREATE INDEX "idx_tournament_status" ON "tournaments"("status");

-- CreateIndex
CREATE INDEX "idx_tournament_start_date" ON "tournaments"("start_date");

-- CreateIndex
CREATE INDEX "idx_group_tournament" ON "tournament_groups"("tournament_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tournament_group" ON "tournament_groups"("tournament_id", "groupName");

-- CreateIndex
CREATE INDEX "idx_group_team_group" ON "tournament_group_teams"("group_id");

-- CreateIndex
CREATE INDEX "idx_group_team_team" ON "tournament_group_teams"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_group_team" ON "tournament_group_teams"("group_id", "team_id");

-- CreateIndex
CREATE INDEX "idx_tmatch_tournament" ON "tournament_matches"("tournament_id");

-- CreateIndex
CREATE INDEX "idx_tmatch_group" ON "tournament_matches"("group_id");

-- CreateIndex
CREATE INDEX "idx_tmatch_status" ON "tournament_matches"("status");

-- CreateIndex
CREATE INDEX "idx_tmatch_stage" ON "tournament_matches"("stage_type");

-- CreateIndex
CREATE UNIQUE INDEX "knockout_brackets_match_id_key" ON "knockout_brackets"("match_id");

-- CreateIndex
CREATE INDEX "idx_bracket_tournament" ON "knockout_brackets"("tournament_id");

-- CreateIndex
CREATE INDEX "idx_bracket_stage" ON "knockout_brackets"("stage_type");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_refresh_user" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_refresh_expires" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "idx_audit_actor" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "idx_audit_action" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "idx_audit_resource" ON "audit_logs"("resource", "resource_id");

-- CreateIndex
CREATE INDEX "idx_audit_created" ON "audit_logs"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE INDEX "idx_config_category" ON "system_config"("category");

-- CreateIndex
CREATE UNIQUE INDEX "publication_categories_name_key" ON "publication_categories"("name");

-- CreateIndex
CREATE INDEX "idx_publications_category" ON "publications"("category_id");

-- CreateIndex
CREATE INDEX "idx_publications_published" ON "publications"("published", "published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_unread" ON "notifications"("user_id", "read", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_push_tokens_user" ON "user_push_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_push_tokens_active" ON "user_push_tokens"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_push_token" ON "user_push_tokens"("user_id", "push_token");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tribe_id_fkey" FOREIGN KEY ("tribe_id") REFERENCES "tribes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "conference_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_awarded_by_fkey" FOREIGN KEY ("awarded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "conference_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_qr_codes" ADD CONSTRAINT "bonus_qr_codes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_claims" ADD CONSTRAINT "bonus_claims_bonus_qr_id_fkey" FOREIGN KEY ("bonus_qr_id") REFERENCES "bonus_qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_claims" ADD CONSTRAINT "bonus_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_claims" ADD CONSTRAINT "bonus_claims_xp_transaction_id_fkey" FOREIGN KEY ("xp_transaction_id") REFERENCES "xp_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sports_teams" ADD CONSTRAINT "sports_teams_captain_id_fkey" FOREIGN KEY ("captain_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "sports_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "sports_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "sports_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "sports_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "sports_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_groups" ADD CONSTRAINT "tournament_groups_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_group_teams" ADD CONSTRAINT "tournament_group_teams_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "tournament_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_group_teams" ADD CONSTRAINT "tournament_group_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "sports_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "tournament_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "sports_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "sports_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knockout_brackets" ADD CONSTRAINT "knockout_brackets_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knockout_brackets" ADD CONSTRAINT "knockout_brackets_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "tournament_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_config" ADD CONSTRAINT "system_config_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "publication_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_push_tokens" ADD CONSTRAINT "user_push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
