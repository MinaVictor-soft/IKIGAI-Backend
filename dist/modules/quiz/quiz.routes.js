"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quiz_controller_1 = require("./quiz.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const quiz_schema_1 = require("./quiz.schema");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
// Public (authenticated)
router.get('/active', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(quiz_controller_1.quizController.getActive));
router.get('/my-submissions', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(quiz_controller_1.quizController.getMySubmissions));
router.get('/:quizId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(quiz_controller_1.quizController.getQuiz));
router.get('/:quizId/my-result', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(quiz_controller_1.quizController.getMySubmission));
router.post('/:quizId/submit', auth_1.authenticate, (0, validate_1.validate)(quiz_schema_1.submitQuizSchema), (0, asyncHandler_1.asyncHandler)(quiz_controller_1.quizController.submit));
// Admin
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(quiz_schema_1.createQuizSchema), (0, asyncHandler_1.asyncHandler)(quiz_controller_1.quizController.create));
router.post('/:quizId/questions', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(quiz_schema_1.createQuestionSchema), (0, asyncHandler_1.asyncHandler)(quiz_controller_1.quizController.addQuestion));
router.patch('/:quizId/status', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(quiz_controller_1.quizController.updateStatus));
exports.default = router;
//# sourceMappingURL=quiz.routes.js.map