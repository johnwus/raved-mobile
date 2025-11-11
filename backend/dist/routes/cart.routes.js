"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const cart_controller_1 = require("../controllers/cart.controller");
const router = (0, express_1.Router)();
// Add item to cart
router.post('/cart/items', auth_middleware_1.authenticate, cart_controller_1.cartController.addItemToCart);
// Get user's cart
router.get('/cart', auth_middleware_1.authenticate, cart_controller_1.cartController.getUserCart);
// Update cart item quantity
router.patch('/cart/items/:cartItemId', auth_middleware_1.authenticate, cart_controller_1.cartController.updateCartItemQuantity);
// Remove item from cart
router.delete('/cart/items/:cartItemId', auth_middleware_1.authenticate, cart_controller_1.cartController.removeCartItem);
// Clear entire cart
router.delete('/cart', auth_middleware_1.authenticate, cart_controller_1.cartController.clearCart);
// Save item to wishlist
router.post('/items/:itemId/save', auth_middleware_1.authenticate, cart_controller_1.cartController.saveItemToWishlist);
// Remove item from wishlist
router.delete('/items/:itemId/save', auth_middleware_1.authenticate, cart_controller_1.cartController.removeItemFromWishlist);
// Get user's wishlist
router.get('/wishlist', auth_middleware_1.authenticate, cart_controller_1.cartController.getUserWishlist);
exports.default = router;
