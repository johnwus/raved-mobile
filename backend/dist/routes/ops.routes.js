"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ops_controller_1 = require("../controllers/ops.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Health: index status & TTL for stories
router.get('/health/indexes', auth_middleware_1.authenticate, ops_controller_1.opsController.getIndexHealth);
// Metrics: sale posts storeId coverage
router.get('/metrics/sales-link-coverage', auth_middleware_1.authenticate, ops_controller_1.opsController.getSalesLinkCoverage);
exports.default = router;
