import { pgPool } from '../config/database';

export const cartService = {
  addItemToCart: async (userId: string, itemId: string, quantity: number) => {
    const itemResult = await pgPool.query(`
      SELECT id, price, seller_id FROM store_items 
      WHERE id = $1 AND status = 'active' AND deleted_at IS NULL
    `, [itemId]);
    
    if (itemResult.rows.length === 0) {
      throw new Error('Item not available');
    }
    
    const existingCartItem = await pgPool.query(`
      SELECT id, quantity FROM cart_items 
      WHERE user_id = $1 AND item_id = $2
    `, [userId, itemId]);
    
    if (existingCartItem.rows.length > 0) {
      await pgPool.query(`
        UPDATE cart_items 
        SET quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2 AND item_id = $3
      `, [quantity, userId, itemId]);
    } else {
      await pgPool.query(`
        INSERT INTO cart_items (user_id, item_id, quantity)
        VALUES ($1, $2, $3)
      `, [userId, itemId, quantity]);
    }
  },

  getUserCart: async (userId: string) => {
    const result = await pgPool.query(`
      SELECT ci.id as cart_item_id, ci.quantity, ci.created_at,
             si.id, si.name, si.price, si.images, si.condition, si.size,
             si.seller_id, u.username as seller_username
      FROM cart_items ci
      JOIN store_items si ON ci.item_id = si.id
      JOIN users u ON si.seller_id = u.id
      WHERE ci.user_id = $1 AND si.status = 'active'
      ORDER BY ci.created_at DESC
    `, [userId]);
    
    const cartItems = result.rows.map(row => ({
      cartItemId: row.cart_item_id,
      quantity: row.quantity,
      item: {
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
        images: row.images,
        condition: row.condition,
        size: row.size,
        seller: {
          id: row.seller_id,
          username: row.seller_username
        }
      },
      addedAt: row.created_at
    }));
    
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.item.price * item.quantity);
    }, 0);
    
    return {
      cartItems,
      summary: {
        subtotal,
        itemCount: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    };
  },

  updateCartItemQuantity: async (cartItemId: string, userId: string, quantity: number) => {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    
    const result = await pgPool.query(`
      UPDATE cart_items 
      SET quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [quantity, cartItemId, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('Cart item not found');
    }
  },

  removeCartItem: async (cartItemId: string, userId: string) => {
    const result = await pgPool.query(`
      DELETE FROM cart_items 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [cartItemId, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('Cart item not found');
    }
  },

  clearCart: async (userId: string) => {
    await pgPool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
  },

  saveItemToWishlist: async (userId: string, itemId: string) => {
    const itemResult = await pgPool.query(`
      SELECT id FROM store_items 
      WHERE id = $1 AND status = 'active' AND deleted_at IS NULL
    `, [itemId]);
    
    if (itemResult.rows.length === 0) {
      throw new Error('Item not found');
    }
    
    const existing = await pgPool.query(`
      SELECT id FROM saved_items 
      WHERE user_id = $1 AND item_id = $2
    `, [userId, itemId]);
    
    if (existing.rows.length > 0) {
      throw new Error('Item already in wishlist');
    }
    
    await pgPool.query(`
      INSERT INTO saved_items (user_id, item_id)
      VALUES ($1, $2)
    `, [userId, itemId]);
    
    await pgPool.query(`
      UPDATE store_items 
      SET saves_count = saves_count + 1
      WHERE id = $1
    `, [itemId]);
  },

  removeItemFromWishlist: async (userId: string, itemId: string) => {
    const result = await pgPool.query(`
      DELETE FROM saved_items 
      WHERE user_id = $1 AND item_id = $2
      RETURNING *
    `, [userId, itemId]);
    
    if (result.rows.length === 0) {
      throw new Error('Item not found in wishlist');
    }
    
    await pgPool.query(`
      UPDATE store_items 
      SET saves_count = GREATEST(0, saves_count - 1)
      WHERE id = $1
    `, [itemId]);
  },

  getUserWishlist: async (userId: string) => {
    const result = await pgPool.query(`
      SELECT si.id as saved_item_id, si.created_at,
             st.id, st.name, st.price, st.images, st.condition, st.size,
             st.seller_id, u.username as seller_username,
             st.saves_count, st.likes_count
      FROM saved_items si
      JOIN store_items st ON si.item_id = st.id
      JOIN users u ON st.seller_id = u.id
      WHERE si.user_id = $1 AND st.status = 'active'
      ORDER BY si.created_at DESC
    `, [userId]);
    
    return result.rows.map(row => ({
      savedItemId: row.saved_item_id,
      item: {
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
        images: row.images,
        condition: row.condition,
        size: row.size,
        savesCount: row.saves_count,
        likesCount: row.likes_count,
        seller: {
          id: row.seller_id,
          username: row.seller_username
        }
      },
      savedAt: row.created_at
    }));
  }
};
