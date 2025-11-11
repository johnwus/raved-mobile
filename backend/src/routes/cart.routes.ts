import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { cartController } from '../controllers/cart.controller';

const router = Router();

// Add item to cart
router.post('/cart/items', authenticate, cartController.addItemToCart);

// Get user's cart
router.get('/cart', authenticate, cartController.getUserCart);

// Update cart item quantity
router.patch('/cart/items/:cartItemId', authenticate, cartController.updateCartItemQuantity);

// Remove item from cart
router.delete('/cart/items/:cartItemId', authenticate, cartController.removeCartItem);

// Clear entire cart
router.delete('/cart', authenticate, cartController.clearCart);

// Save item to wishlist
router.post('/items/:itemId/save', authenticate, cartController.saveItemToWishlist);

// Remove item from wishlist
router.delete('/items/:itemId/save', authenticate, cartController.removeItemFromWishlist);

// Get user's wishlist
router.get('/wishlist', authenticate, cartController.getUserWishlist);

export default router;
