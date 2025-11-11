"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const device_token_controller_1 = require("../controllers/device-token.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Register device token
router.post('/register', device_token_controller_1.deviceTokenController.registerToken);
// Unregister device token
router.post('/unregister', device_token_controller_1.deviceTokenController.unregisterToken);
// Get user's device tokens
router.get('/', device_token_controller_1.deviceTokenController.getUserTokens);
// Get token statistics
router.get('/stats', device_token_controller_1.deviceTokenController.getTokenStats);
// Deactivate all user tokens
router.post('/deactivate-all', device_token_controller_1.deviceTokenController.deactivateAllTokens);
exports.default = router;
