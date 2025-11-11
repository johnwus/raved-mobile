"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const store_controller_1 = require("../controllers/store.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/items', auth_middleware_1.authenticate, store_controller_1.getStoreItems);
router.get('/items/:itemId', auth_middleware_1.authenticate, store_controller_1.getStoreItem);
router.post('/items', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('name').trim().notEmpty().isLength({ max: 255 }),
    (0, express_validator_1.body)('price').isFloat({ min: 0.01 }),
    (0, express_validator_1.body)('category').isIn(['clothing', 'shoes', 'accessories', 'bags', 'jewelry']),
    (0, express_validator_1.body)('condition').isIn(['new', 'like-new', 'good', 'fair']),
], store_controller_1.createStoreItem);
exports.default = router;
