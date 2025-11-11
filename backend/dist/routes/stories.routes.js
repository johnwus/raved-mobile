"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const stories_controller_1 = require("../controllers/stories.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const moderation_middleware_1 = require("../middleware/moderation.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticate, moderation_middleware_1.moderateStory, [
    (0, express_validator_1.body)('type').isIn(['image', 'video', 'template', 'text']),
    (0, express_validator_1.body)('content').notEmpty(),
], stories_controller_1.createStory);
router.get('/', auth_middleware_1.authenticate, stories_controller_1.getStories);
exports.default = router;
