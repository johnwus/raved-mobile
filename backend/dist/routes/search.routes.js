"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const search_controller_1 = require("../controllers/search.controller");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// Advanced search with ranking and filters
router.get('/search/advanced', auth_middleware_1.authenticate, rate_limit_middleware_1.searchRateLimit, search_controller_1.searchController.advancedSearch);
exports.default = router;
