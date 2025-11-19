"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const support_controller_1 = require("../controllers/support.controller");
const router = (0, express_1.Router)();
// Contact support
router.post('/contact', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('subject').trim().notEmpty().isLength({ min: 3, max: 200 }),
    (0, express_validator_1.body)('message').trim().notEmpty().isLength({ min: 10, max: 2000 }),
], support_controller_1.supportController.contactSupport);
exports.default = router;
