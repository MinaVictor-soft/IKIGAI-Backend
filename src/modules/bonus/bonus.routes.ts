import { Router } from 'express';
import { bonusController } from './bonus.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { createBonusQrSchema, claimBonusSchema, staffAwardSchema } from './bonus.schema';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Attendee
router.post('/claim', authenticate, validate(claimBonusSchema), asyncHandler(bonusController.claim));

// Admin
router.post('/generate', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(createBonusQrSchema), asyncHandler(bonusController.createQr));
router.post('/staff-award', authenticate, authorize('STAFF', 'ADMIN', 'SUPER_ADMIN'), validate(staffAwardSchema), asyncHandler(bonusController.staffAward));
router.get('/my-qrs', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(bonusController.myQrs));
router.patch('/:qrId/deactivate', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(bonusController.deactivate));

export default router;
