"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'IKIGAI Quest API',
            version: '1.0.0',
            description: 'Gamified conference platform API — Attendance, XP, Quizzes, Bonus, Sports',
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Local Development' },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string' },
                                message: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },
    apis: [],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
// Manually define all paths since we're not using JSDoc annotations
exports.swaggerSpec.paths = {
    // ==================== AUTH ====================
    '/api/v1/auth/register': {
        post: {
            tags: ['Auth'],
            summary: 'Register a new user',
            security: [],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['email', 'password', 'name'],
                            properties: {
                                email: { type: 'string', format: 'email', example: 'user@example.com' },
                                password: { type: 'string', minLength: 8, example: 'Pass1234' },
                                name: { type: 'string', example: 'John Doe' },
                                church: { type: 'string', example: 'St. Mark' },
                                diocese: { type: 'string', example: 'Cairo' },
                                phone: { type: 'string', example: '+201234567890' },
                                languagePreference: { type: 'string', enum: ['en', 'ar'], default: 'en' },
                            },
                        },
                    },
                },
            },
            responses: {
                201: { description: 'User registered successfully' },
                409: { description: 'Email already exists' },
            },
        },
    },
    '/api/v1/auth/login': {
        post: {
            tags: ['Auth'],
            summary: 'Login and get tokens',
            security: [],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['email', 'password'],
                            properties: {
                                email: { type: 'string', example: 'admin@ikigai.quest' },
                                password: { type: 'string', example: 'Admin@2026' },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: 'Login successful — returns accessToken, refreshToken, user' },
                401: { description: 'Invalid credentials' },
                403: { description: 'Account suspended' },
                429: { description: 'Rate limit exceeded' },
            },
        },
    },
    '/api/v1/auth/refresh': {
        post: {
            tags: ['Auth'],
            summary: 'Refresh access token',
            security: [],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['refreshToken'],
                            properties: {
                                refreshToken: { type: 'string', example: '<refresh_token_from_login>' },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: 'New access + refresh tokens' },
                401: { description: 'Invalid or expired refresh token' },
            },
        },
    },
    '/api/v1/auth/logout': {
        post: {
            tags: ['Auth'],
            summary: 'Logout (revoke refresh token)',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['refreshToken'],
                            properties: {
                                refreshToken: { type: 'string' },
                            },
                        },
                    },
                },
            },
            responses: { 200: { description: 'Logged out' } },
        },
    },
    '/api/v1/auth/me': {
        get: {
            tags: ['Auth'],
            summary: 'Get current user profile',
            responses: { 200: { description: 'User profile with tribe and level' } },
        },
    },
    // ==================== ATTENDANCE ====================
    '/api/v1/attendance/scan': {
        post: {
            tags: ['Attendance'],
            summary: 'Scan QR code for attendance',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['qrToken'],
                            properties: {
                                qrToken: { type: 'string', format: 'uuid', example: '<session_qr_token>' },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: 'Attendance recorded (or already recorded)' },
                422: { description: 'Invalid QR / session not active / outside window' },
                429: { description: 'Too many scan attempts' },
            },
        },
    },
    '/api/v1/attendance/my': {
        get: {
            tags: ['Attendance'],
            summary: 'Get my attendance history',
            responses: { 200: { description: 'List of attended sessions' } },
        },
    },
    '/api/v1/attendance/session/{sessionId}': {
        get: {
            tags: ['Attendance'],
            summary: 'Get attendance list for a session (Admin)',
            parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            responses: { 200: { description: 'List of attendees' } },
        },
    },
    // ==================== XP ====================
    '/api/v1/xp/leaderboard': {
        get: {
            tags: ['XP'],
            summary: 'Get XP leaderboard',
            parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } }],
            responses: { 200: { description: 'Ranked list of users by XP' } },
        },
    },
    '/api/v1/xp/tribes': {
        get: {
            tags: ['XP'],
            summary: 'Get tribe leaderboard',
            responses: { 200: { description: 'Tribes ranked by total XP' } },
        },
    },
    '/api/v1/xp/history/me': {
        get: {
            tags: ['XP'],
            summary: 'Get my XP transaction history',
            parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } }],
            responses: { 200: { description: 'XP transaction history' } },
        },
    },
    '/api/v1/xp/history/{userId}': {
        get: {
            tags: ['XP'],
            summary: 'Get XP history for a user (Admin)',
            parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            responses: { 200: { description: 'User XP history' } },
        },
    },
    '/api/v1/xp/award': {
        post: {
            tags: ['XP'],
            summary: 'Award XP to a user (Admin)',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['userId', 'amount'],
                            properties: {
                                userId: { type: 'string', format: 'uuid' },
                                amount: { type: 'integer', minimum: 1, maximum: 500, example: 50 },
                                description: { type: 'string', example: 'Great participation' },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: 'XP awarded' },
                422: { description: 'Cannot award self' },
                403: { description: 'Amount exceeds limit' },
                429: { description: 'Daily limit reached' },
            },
        },
    },
    // ==================== QUIZZES ====================
    '/api/v1/quizzes/active': {
        get: {
            tags: ['Quizzes'],
            summary: 'Get all active quizzes',
            responses: { 200: { description: 'List of active quizzes' } },
        },
    },
    '/api/v1/quizzes/{quizId}': {
        get: {
            tags: ['Quizzes'],
            summary: 'Get quiz details (answers hidden for attendees)',
            parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            responses: { 200: { description: 'Quiz with questions' } },
        },
    },
    '/api/v1/quizzes/{quizId}/submit': {
        post: {
            tags: ['Quizzes'],
            summary: 'Submit quiz answers',
            parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['answers'],
                            properties: {
                                answers: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            questionId: { type: 'string', format: 'uuid' },
                                            answer: { type: 'string' },
                                        },
                                    },
                                },
                                startedAt: { type: 'string', format: 'date-time' },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: 'Quiz graded — score, pass/fail, XP' },
                409: { description: 'Already submitted' },
                422: { description: 'Quiz not active / time expired' },
            },
        },
    },
    '/api/v1/quizzes': {
        post: {
            tags: ['Quizzes'],
            summary: 'Create a quiz (Admin)',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['title'],
                            properties: {
                                title: { type: 'string', example: 'Session 1 Quiz' },
                                description: { type: 'string' },
                                sessionId: { type: 'string', format: 'uuid' },
                                xpReward: { type: 'integer', default: 0, example: 20 },
                                passingScore: { type: 'integer', example: 70 },
                                timeLimitSeconds: { type: 'integer', example: 120 },
                            },
                        },
                    },
                },
            },
            responses: { 201: { description: 'Quiz created' } },
        },
    },
    '/api/v1/quizzes/{quizId}/questions': {
        post: {
            tags: ['Quizzes'],
            summary: 'Add question to quiz (Admin)',
            parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['questionText', 'correctAnswer', 'displayOrder'],
                            properties: {
                                questionText: { type: 'string', example: 'What is the capital of Egypt?' },
                                questionType: { type: 'string', enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'], default: 'MULTIPLE_CHOICE' },
                                options: {
                                    type: 'array',
                                    items: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' } } },
                                    example: [{ id: 'a', text: 'Cairo' }, { id: 'b', text: 'Alex' }, { id: 'c', text: 'Giza' }],
                                },
                                correctAnswer: { type: 'string', example: 'a' },
                                points: { type: 'integer', default: 1 },
                                displayOrder: { type: 'integer', example: 1 },
                                explanation: { type: 'string' },
                            },
                        },
                    },
                },
            },
            responses: { 201: { description: 'Question added' } },
        },
    },
    '/api/v1/quizzes/{quizId}/status': {
        patch: {
            tags: ['Quizzes'],
            summary: 'Update quiz status (Admin)',
            parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['status'],
                            properties: {
                                status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'CLOSED'] },
                            },
                        },
                    },
                },
            },
            responses: { 200: { description: 'Status updated' } },
        },
    },
    // ==================== BONUS ====================
    '/api/v1/bonus/claim': {
        post: {
            tags: ['Bonus'],
            summary: 'Claim a bonus QR code',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['token'],
                            properties: {
                                token: { type: 'string', format: 'uuid', example: '<bonus_qr_token>' },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: 'Bonus claimed, XP awarded' },
                404: { description: 'Invalid QR' },
                409: { description: 'Already claimed' },
                422: { description: 'QR expired/inactive/max claims' },
            },
        },
    },
    '/api/v1/bonus/generate': {
        post: {
            tags: ['Bonus'],
            summary: 'Generate a bonus QR code (Admin)',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['amount'],
                            properties: {
                                amount: { type: 'integer', minimum: 1, maximum: 500, example: 25 },
                                label: { type: 'string', example: 'Workshop bonus' },
                                maxClaims: { type: 'integer', example: 50 },
                                expiresAt: { type: 'string', format: 'date-time' },
                            },
                        },
                    },
                },
            },
            responses: { 201: { description: 'Bonus QR created with token' } },
        },
    },
    '/api/v1/bonus/staff-award': {
        post: {
            tags: ['Bonus'],
            summary: 'Award XP via user QR scan (Admin/Staff)',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['userQrToken', 'amount', 'reason'],
                            properties: {
                                userQrToken: { type: 'string', format: 'uuid', example: '<user_qr_token>' },
                                amount: { type: 'integer', minimum: 1, maximum: 500, example: 30 },
                                reason: { type: 'string', example: 'Active participation in workshop' },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: 'XP awarded to user' },
                404: { description: 'User not found' },
                422: { description: 'Cannot award self' },
                429: { description: 'Daily limit reached' },
            },
        },
    },
    '/api/v1/bonus/my-qrs': {
        get: {
            tags: ['Bonus'],
            summary: 'Get my generated bonus QR codes (Admin)',
            responses: { 200: { description: 'List of QR codes with claim counts' } },
        },
    },
    '/api/v1/bonus/{qrId}/deactivate': {
        patch: {
            tags: ['Bonus'],
            summary: 'Deactivate a bonus QR (Admin)',
            parameters: [{ name: 'qrId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            responses: { 200: { description: 'QR deactivated' } },
        },
    },
    // ==================== SPORTS ====================
    '/api/v1/sports/teams': {
        get: {
            tags: ['Sports'],
            summary: 'Get all teams with standings',
            responses: { 200: { description: 'Teams list' } },
        },
        post: {
            tags: ['Sports'],
            summary: 'Create a team (Admin)',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['name'],
                            properties: {
                                name: { type: 'string', example: 'Eagles' },
                                color: { type: 'string', example: '#FF0000' },
                                maxRosterSize: { type: 'integer', default: 15 },
                            },
                        },
                    },
                },
            },
            responses: { 201: { description: 'Team created' } },
        },
    },
    '/api/v1/sports/teams/{teamId}': {
        get: {
            tags: ['Sports'],
            summary: 'Get team with roster',
            parameters: [{ name: 'teamId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            responses: { 200: { description: 'Team details with players' } },
        },
    },
    '/api/v1/sports/teams/{teamId}/players': {
        post: {
            tags: ['Sports'],
            summary: 'Add player to team (Admin)',
            parameters: [{ name: 'teamId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['userId'],
                            properties: {
                                userId: { type: 'string', format: 'uuid' },
                                jerseyNumber: { type: 'integer', example: 10 },
                                position: { type: 'string', enum: ['GK', 'DEF', 'MID', 'FWD'] },
                            },
                        },
                    },
                },
            },
            responses: {
                201: { description: 'Player added' },
                409: { description: 'Player already on a team' },
                422: { description: 'Roster full' },
            },
        },
    },
    '/api/v1/sports/teams/{teamId}/players/{userId}': {
        delete: {
            tags: ['Sports'],
            summary: 'Remove player from team (Admin)',
            parameters: [
                { name: 'teamId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                { name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            ],
            responses: { 200: { description: 'Player removed' } },
        },
    },
    '/api/v1/sports/matches': {
        get: {
            tags: ['Sports'],
            summary: 'Get all matches',
            parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'] } }],
            responses: { 200: { description: 'Matches list' } },
        },
        post: {
            tags: ['Sports'],
            summary: 'Schedule a match (Admin)',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['homeTeamId', 'awayTeamId', 'scheduledAt'],
                            properties: {
                                homeTeamId: { type: 'string', format: 'uuid' },
                                awayTeamId: { type: 'string', format: 'uuid' },
                                scheduledAt: { type: 'string', format: 'date-time' },
                                venue: { type: 'string', example: 'Main Field' },
                                round: { type: 'integer', example: 1 },
                                groupName: { type: 'string', example: 'Group A' },
                            },
                        },
                    },
                },
            },
            responses: { 201: { description: 'Match scheduled' } },
        },
    },
    '/api/v1/sports/matches/{matchId}': {
        get: {
            tags: ['Sports'],
            summary: 'Get match details with events',
            parameters: [{ name: 'matchId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            responses: { 200: { description: 'Match with events' } },
        },
    },
    '/api/v1/sports/matches/{matchId}/start': {
        patch: {
            tags: ['Sports'],
            summary: 'Start a match (Admin)',
            parameters: [{ name: 'matchId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            responses: { 200: { description: 'Match started' } },
        },
    },
    '/api/v1/sports/matches/{matchId}/complete': {
        patch: {
            tags: ['Sports'],
            summary: 'Complete a match with score (Admin)',
            parameters: [{ name: 'matchId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['homeScore', 'awayScore'],
                            properties: {
                                homeScore: { type: 'integer', example: 2 },
                                awayScore: { type: 'integer', example: 1 },
                            },
                        },
                    },
                },
            },
            responses: { 200: { description: 'Match completed, stats updated, XP awarded' } },
        },
    },
    '/api/v1/sports/matches/{matchId}/events': {
        post: {
            tags: ['Sports'],
            summary: 'Add match event (Admin)',
            parameters: [{ name: 'matchId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['playerId', 'teamId', 'eventType', 'minute'],
                            properties: {
                                playerId: { type: 'string', format: 'uuid' },
                                teamId: { type: 'string', format: 'uuid' },
                                eventType: { type: 'string', enum: ['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION'] },
                                minute: { type: 'integer', example: 45 },
                                notes: { type: 'string' },
                            },
                        },
                    },
                },
            },
            responses: { 201: { description: 'Event recorded' } },
        },
    },
    '/api/v1/sports/standings': {
        get: {
            tags: ['Sports'],
            summary: 'Get tournament standings',
            responses: { 200: { description: 'Teams sorted by points' } },
        },
    },
    // ==================== ADMIN ====================
    '/api/v1/admin/stats': {
        get: {
            tags: ['Admin'],
            summary: 'Get dashboard statistics',
            responses: { 200: { description: 'Total users, attendance, XP, active sessions' } },
        },
    },
    '/api/v1/admin/sessions': {
        get: {
            tags: ['Admin'],
            summary: 'Get all conference sessions',
            parameters: [{ name: 'date', in: 'query', schema: { type: 'string', format: 'date', example: '2026-06-10' } }],
            responses: { 200: { description: 'Sessions list with attendance counts' } },
        },
        post: {
            tags: ['Admin'],
            summary: 'Create a conference session',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['title', 'sessionDate', 'startTime', 'endTime'],
                            properties: {
                                title: { type: 'string', example: 'Opening Ceremony' },
                                description: { type: 'string' },
                                speaker: { type: 'string', example: 'Fr. John' },
                                location: { type: 'string', example: 'Main Hall' },
                                sessionDate: { type: 'string', format: 'date', example: '2026-06-10' },
                                startTime: { type: 'string', format: 'date-time', example: '2026-06-10T09:00:00Z' },
                                endTime: { type: 'string', format: 'date-time', example: '2026-06-10T10:30:00Z' },
                                xpReward: { type: 'integer', default: 10, example: 15 },
                                maxCapacity: { type: 'integer', example: 200 },
                                attendanceBufferMinutes: { type: 'integer', default: 10 },
                            },
                        },
                    },
                },
            },
            responses: { 201: { description: 'Session created with QR token' } },
        },
    },
    '/api/v1/admin/sessions/{sessionId}/status': {
        patch: {
            tags: ['Admin'],
            summary: 'Update session status',
            parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['status'],
                            properties: {
                                status: { type: 'string', enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'] },
                            },
                        },
                    },
                },
            },
            responses: { 200: { description: 'Status updated (QR regenerated on ACTIVE)' } },
        },
    },
    '/api/v1/admin/sessions/{sessionId}/regenerate-qr': {
        post: {
            tags: ['Admin'],
            summary: 'Regenerate QR token for session',
            parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            responses: { 200: { description: 'New QR token' } },
        },
    },
    '/api/v1/admin/users': {
        get: {
            tags: ['Admin'],
            summary: 'List all users (paginated)',
            parameters: [
                { name: 'role', in: 'query', schema: { type: 'string', enum: ['ATTENDEE', 'ADMIN', 'SUPER_ADMIN'] } },
                { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
            ],
            responses: { 200: { description: 'Paginated user list' } },
        },
        post: {
            tags: ['Admin'],
            summary: 'Create a user (Admin)',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['email', 'password', 'name'],
                            properties: {
                                email: { type: 'string', format: 'email', example: 'attendee1@test.com' },
                                password: { type: 'string', example: 'Pass1234' },
                                name: { type: 'string', example: 'Test Attendee' },
                                role: { type: 'string', enum: ['ATTENDEE', 'ADMIN', 'SUPER_ADMIN'], default: 'ATTENDEE' },
                                church: { type: 'string' },
                                diocese: { type: 'string' },
                                tribeId: { type: 'string', format: 'uuid' },
                            },
                        },
                    },
                },
            },
            responses: { 201: { description: 'User created' } },
        },
    },
    '/api/v1/admin/users/{userId}/tribe': {
        patch: {
            tags: ['Admin'],
            summary: 'Assign user to a tribe',
            parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['tribeId'],
                            properties: {
                                tribeId: { type: 'string', format: 'uuid', nullable: true },
                            },
                        },
                    },
                },
            },
            responses: { 200: { description: 'Tribe assigned' } },
        },
    },
    '/api/v1/admin/tribes': {
        get: {
            tags: ['Admin'],
            summary: 'Get all tribes',
            responses: { 200: { description: 'Tribes list' } },
        },
        post: {
            tags: ['Admin'],
            summary: 'Create a tribe',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['name'],
                            properties: {
                                name: { type: 'string', example: 'Faith' },
                                description: { type: 'string' },
                                color: { type: 'string', example: '#FF6B35' },
                            },
                        },
                    },
                },
            },
            responses: { 201: { description: 'Tribe created' } },
        },
    },
};
//# sourceMappingURL=swagger.js.map