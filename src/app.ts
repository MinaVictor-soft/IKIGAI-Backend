import express from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import xpRoutes from './modules/xp/xp.routes';
import quizRoutes from './modules/quiz/quiz.routes';
import bonusRoutes from './modules/bonus/bonus.routes';
import sportsRoutes from './modules/sports/sports.routes';
import adminRoutes from './modules/admin/admin.routes';
import publicationsRoutes from './modules/publications/publications.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import pushNotificationsRoutes from './modules/push-notifications/push-notifications.routes';

const app = express();

// Global middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(generalLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'IKIGAI Quest API',
}));
app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/xp', xpRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/bonus', bonusRoutes);
app.use('/api/v1/sports', sportsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/publications', publicationsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/push-notifications', pushNotificationsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Serve frontend in production (Replit / deployment)
if (env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../admin-dashboard/dist');
  app.use(express.static(frontendPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`🚀 IKIGAI Quest API running on port ${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
});

export default app;
