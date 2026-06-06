"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sports_controller_1 = require("./sports.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const sports_schema_1 = require("./sports.schema");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
// Public (authenticated)
router.get('/my-team', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.getMyTeam));
router.get('/teams', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.getTeams));
router.get('/teams/:teamId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.getTeam));
router.get('/matches', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.getMatches));
router.get('/matches/:matchId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.getMatch));
router.get('/standings', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.getStandings));
// Admin
router.post('/teams', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(sports_schema_1.createTeamSchema), (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.createTeam));
router.post('/teams/:teamId/players', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(sports_schema_1.addPlayerSchema), (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.addPlayer));
router.delete('/teams/:teamId/players/:userId', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.removePlayer));
router.post('/matches', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(sports_schema_1.createMatchSchema), (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.createMatch));
router.patch('/matches/:matchId/start', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.startMatch));
router.patch('/matches/:matchId/complete', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(sports_schema_1.updateScoreSchema), (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.completeMatch));
router.post('/matches/:matchId/events', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), (0, validate_1.validate)(sports_schema_1.addEventSchema), (0, asyncHandler_1.asyncHandler)(sports_controller_1.sportsController.addEvent));
exports.default = router;
//# sourceMappingURL=sports.routes.js.map