import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { loginLimiter } from '../../middleware/rateLimiter';
import { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema } from './auth.schema';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(authController.refresh));
router.post('/logout', authenticate, validate(refreshTokenSchema), asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.me));
router.post('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(authController.changePassword));
router.post('/verify-password', authenticate, asyncHandler(authController.verifyPassword));

export default router;
