import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';

export const cartController = {
  addItemToCart: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { itemId, quantity = 1 } = req.body;
      
      await cartService.addItemToCart(userId, itemId, quantity);
      
      res.json({
        success: true,
        message: 'Item added to cart'
      });
    } catch (error: any) {
      console.error('Add to Cart Error:', error);
      res.status(400).json({ error: error.message });
    }
  },

  getUserCart: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const cartData = await cartService.getUserCart(userId);
      
      res.json({
        success: true,
        ...cartData
      });
    } catch (error) {
      console.error('Get Cart Error:', error);
      res.status(500).json({ error: 'Failed to get cart' });
    }
  },

  updateCartItemQuantity: async (req: Request, res: Response) => {
    try {
      const { cartItemId } = req.params;
      const { quantity } = req.body;
      const userId = req.user.id;
      
      await cartService.updateCartItemQuantity(cartItemId, userId, quantity);
      
      res.json({
        success: true,
        message: 'Cart updated successfully'
      });
    } catch (error: any) {
      console.error('Update Cart Error:', error);
      res.status(400).json({ error: error.message });
    }
  },

  removeCartItem: async (req: Request, res: Response) => {
    try {
      const { cartItemId } = req.params;
      const userId = req.user.id;
      
      await cartService.removeCartItem(cartItemId, userId);
      
      res.json({
        success: true,
        message: 'Item removed from cart'
      });
    } catch (error: any) {
      console.error('Remove from Cart Error:', error);
      res.status(404).json({ error: error.message });
    }
  },

  clearCart: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      await cartService.clearCart(userId);
      
      res.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      console.error('Clear Cart Error:', error);
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  },

  saveItemToWishlist: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      
      await cartService.saveItemToWishlist(userId, itemId);
      
      res.json({
        success: true,
        message: 'Item saved to wishlist'
      });
    } catch (error: any) {
      console.error('Save Item Error:', error);
      res.status(400).json({ error: error.message });
    }
  },

  removeItemFromWishlist: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      
      await cartService.removeItemFromWishlist(userId, itemId);
      
      res.json({
        success: true,
        message: 'Item removed from wishlist'
      });
    } catch (error: any) {
      console.error('Unsave Item Error:', error);
      res.status(404).json({ error: error.message });
    }
  },

  getUserWishlist: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const savedItems = await cartService.getUserWishlist(userId);
      
      res.json({
        success: true,
        savedItems,
        count: savedItems.length
      });
    } catch (error) {
      console.error('Get Wishlist Error:', error);
      res.status(500).json({ error: 'Failed to get wishlist' });
    }
  }
};
