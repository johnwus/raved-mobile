"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartController = void 0;
const cart_service_1 = require("../services/cart.service");
exports.cartController = {
    addItemToCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const { itemId, quantity = 1 } = req.body;
            await cart_service_1.cartService.addItemToCart(userId, itemId, quantity);
            res.json({
                success: true,
                message: 'Item added to cart'
            });
        }
        catch (error) {
            console.error('Add to Cart Error:', error);
            res.status(400).json({ error: error.message });
        }
    },
    getUserCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const cartData = await cart_service_1.cartService.getUserCart(userId);
            res.json({
                success: true,
                ...cartData
            });
        }
        catch (error) {
            console.error('Get Cart Error:', error);
            res.status(500).json({ error: 'Failed to get cart' });
        }
    },
    updateCartItemQuantity: async (req, res) => {
        try {
            const { cartItemId } = req.params;
            const { quantity } = req.body;
            const userId = req.user.id;
            await cart_service_1.cartService.updateCartItemQuantity(cartItemId, userId, quantity);
            res.json({
                success: true,
                message: 'Cart updated successfully'
            });
        }
        catch (error) {
            console.error('Update Cart Error:', error);
            res.status(400).json({ error: error.message });
        }
    },
    removeCartItem: async (req, res) => {
        try {
            const { cartItemId } = req.params;
            const userId = req.user.id;
            await cart_service_1.cartService.removeCartItem(cartItemId, userId);
            res.json({
                success: true,
                message: 'Item removed from cart'
            });
        }
        catch (error) {
            console.error('Remove from Cart Error:', error);
            res.status(404).json({ error: error.message });
        }
    },
    clearCart: async (req, res) => {
        try {
            const userId = req.user.id;
            await cart_service_1.cartService.clearCart(userId);
            res.json({
                success: true,
                message: 'Cart cleared successfully'
            });
        }
        catch (error) {
            console.error('Clear Cart Error:', error);
            res.status(500).json({ error: 'Failed to clear cart' });
        }
    },
    saveItemToWishlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const { itemId } = req.params;
            await cart_service_1.cartService.saveItemToWishlist(userId, itemId);
            res.json({
                success: true,
                message: 'Item saved to wishlist'
            });
        }
        catch (error) {
            console.error('Save Item Error:', error);
            res.status(400).json({ error: error.message });
        }
    },
    removeItemFromWishlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const { itemId } = req.params;
            await cart_service_1.cartService.removeItemFromWishlist(userId, itemId);
            res.json({
                success: true,
                message: 'Item removed from wishlist'
            });
        }
        catch (error) {
            console.error('Unsave Item Error:', error);
            res.status(404).json({ error: error.message });
        }
    },
    getUserWishlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const savedItems = await cart_service_1.cartService.getUserWishlist(userId);
            res.json({
                success: true,
                savedItems,
                count: savedItems.length
            });
        }
        catch (error) {
            console.error('Get Wishlist Error:', error);
            res.status(500).json({ error: 'Failed to get wishlist' });
        }
    }
};
