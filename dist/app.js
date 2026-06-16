"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./config/env");
const swagger_1 = require("./config/swagger");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Route imports
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const attendance_routes_1 = __importDefault(require("./modules/attendance/attendance.routes"));
const xp_routes_1 = __importDefault(require("./modules/xp/xp.routes"));
const quiz_routes_1 = __importDefault(require("./modules/quiz/quiz.routes"));
const bonus_routes_1 = __importDefault(require("./modules/bonus/bonus.routes"));
const sports_routes_1 = __importDefault(require("./modules/sports/sports.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const publications_routes_1 = __importDefault(require("./modules/publications/publications.routes"));
const notifications_routes_1 = __importDefault(require("./modules/notifications/notifications.routes"));
const push_notifications_routes_1 = __importDefault(require("./modules/push-notifications/push-notifications.routes"));
const tournament_routes_1 = __importDefault(require("./modules/tournament/tournament.routes"));
const app = (0, express_1.default)();
// Global middleware
app.use((0, compression_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.use(rateLimiter_1.generalLimiter);
// Serve uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Swagger UI
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    explorer: true,
    customSiteTitle: 'IKIGAI Quest API',
}));
app.get('/api-docs.json', (_req, res) => {
    res.json(swagger_1.swaggerSpec);
});
// API routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/attendance', attendance_routes_1.default);
app.use('/api/v1/xp', xp_routes_1.default);
app.use('/api/v1/quizzes', quiz_routes_1.default);
app.use('/api/v1/bonus', bonus_routes_1.default);
app.use('/api/v1/sports', sports_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/publications', publications_routes_1.default);
app.use('/api/v1/notifications', notifications_routes_1.default);
app.use('/api/v1/push-notifications', push_notifications_routes_1.default);
app.use('/api/v1/tournaments', tournament_routes_1.default);
// Error handling
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Serve frontend in production (Replit / deployment)
if (env_1.env.NODE_ENV === 'production') {
    const frontendPath = path_1.default.join(__dirname, '../../admin-dashboard/dist');
    app.use(express_1.default.static(frontendPath));
    app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(frontendPath, 'index.html'));
    });
}
app.listen(env_1.env.PORT, '0.0.0.0', () => {
    console.log(`🚀 IKIGAI Quest API running on port ${env_1.env.PORT}`);
    console.log(`   Environment: ${env_1.env.NODE_ENV}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map