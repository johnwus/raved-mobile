

// ============================================================================
// THEME MANAGEMENT ENDPOINTS
// ============================================================================

// Get available themes (Premium only)
app.get('/api/themes', authenticate, requirePremium, async (req, res) => {
  try {
    const themes = [
      {
        id: 'default',
        name: 'Raved Classic',
        colors: {
          primary: '#5D5CDE',
          primaryDark: '#4C4BC7',
          accent: '#FF6B6B'
        },
        category: 'classic',
        premium: false
      },
      {
        id: 'rose',
        name: 'Rose Garden',
        colors: {
          primary: '#f43f5e',
          primaryDark: '#e11d48',
          accent: '#fb7185'
        },
        category: 'classic',
        premium: true
      },
      {
        id: 'emerald',
        name: 'Emerald Forest',
        colors: {
          primary: '#10b981',
          primaryDark: '#059669',
          accent: '#34d399'
        },
        category: 'nature',
        premium: true
      },
      {
        id: 'ocean',
        name: 'Ocean Breeze',
        colors: {
          primary: '#3b82f6',
          primaryDark: '#2563eb',
          accent: '#60a5fa'
        },
        category: 'nature',
        premium: true
      },
      {
        id: 'sunset',
        name: 'Sunset Glow',
        colors: {
          primary: '#f97316',
          primaryDark: '#ea580c',
          accent: '#fb923c'
        },
        category: 'vibrant',
        premium: true
      },
      {
        id: 'galaxy',
        name: 'Galaxy Night',
        colors: {
          primary: '#6366f1',
          primaryDark: '#4f46e5',
          accent: '#8b5cf6'
        },
        category: 'vibrant',
        premium: true
      }
    ];

    res.json({
      success: true,
      themes
    });
  } catch (error) {
    console.error('Get Themes Error:', error);
    res.status(500).json({ error: 'Failed to get themes' });
  }
});

// Get user's current theme
app.get('/api/users/theme', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pgPool.query(
      'SELECT theme_preference FROM users WHERE id = $1',
      [userId]
    );
    
    const themeId = result.rows[0]?.theme_preference || 'default';
    
    res.json({
      success: true,
      themeId
    });
  } catch (error) {
    console.error('Get User Theme Error:', error);
    res.status(500).json({ error: 'Failed to get user theme' });
  }
});

// Set user's theme (Premium only for premium themes)
app.post('/api/users/theme', authenticate, async (req, res) => {
  try {
    const { themeId } = req.body;
    const userId = req.user.id;
    
    // Validate theme exists and user has access
    const themes = [
      'default', 'rose', 'emerald', 'ocean', 'sunset', 'galaxy'
    ];
    
    if (!themes.includes(themeId)) {
      return res.status(400).json({ error: 'Invalid theme' });
    }
    
    // Check if premium theme requires subscription
    const premiumThemes = ['rose', 'emerald', 'ocean', 'sunset', 'galaxy'];
    if (premiumThemes.includes(themeId) && req.user.subscription_tier !== 'premium') {
      return res.status(403).json({ 
        error: 'Premium subscription required for this theme' 
      });
    }
    
    await pgPool.query(
      'UPDATE users SET theme_preference = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [themeId, userId]
    );
    
    res.json({
      success: true,
      message: 'Theme updated successfully',
      themeId
    });
  } catch (error) {
    console.error('Set Theme Error:', error);
    res.status(500).json({ error: 'Failed to set theme' });
  }
});


// ============================================================================
// CONNECTION REQUESTS & PRIVACY SYSTEM
// ============================================================================

// Send follow request (for private accounts)
app.post('/api/connections/request/:userId', authenticate, async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;
    
    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    // Check if target user is private
    const targetUser = await pgPool.query(
      'SELECT is_private FROM users WHERE id = $1 AND deleted_at IS NULL',
      [followingId]
    );
    
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isPrivate = targetUser.rows[0].is_private;
    
    // Check if already connected or requested
    const existing = await pgPool.query(
      'SELECT * FROM connections WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Connection already exists or requested' });
    }
    
    if (isPrivate) {
      // Create pending follow request
      await pgPool.query(
        'INSERT INTO connections (follower_id, following_id, status) VALUES ($1, $2, $3)',
        [followerId, followingId, 'pending']
      );
      
      // Create notification
      await Notification.create({
        userId: followingId,
        type: 'follow_request',
        actorId: followerId,
        message: 'sent you a follow request'
      });
      
      res.json({
        success: true,
        message: 'Follow request sent',
        status: 'pending'
      });
    } else {
      // Public account - follow immediately
      await pgPool.query(
        'INSERT INTO connections (follower_id, following_id, status) VALUES ($1, $2, $3)',
        [followerId, followingId, 'following']
      );
      
      // Update counts
      await pgPool.query(
        'UPDATE users SET following_count = following_count + 1 WHERE id = $1',
        [followerId]
      );
      await pgPool.query(
        'UPDATE users SET followers_count = followers_count + 1 WHERE id = $1',
        [followingId]
      );
      
      // Create notification
      await Notification.create({
        userId: followingId,
        type: 'follow',
        actorId: followerId,
        message: 'started following you'
      });
      
      res.json({
        success: true,
        message: 'Successfully followed user',
        status: 'following'
      });
    }
  } catch (error) {
    console.error('Follow Request Error:', error);
    res.status(500).json({ error: 'Failed to send follow request' });
  }
});

// Get pending follow requests
app.get('/api/connections/requests', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pgPool.query(`
      SELECT c.id as request_id, c.created_at, 
             u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty
      FROM connections c
      JOIN users u ON c.follower_id = u.id
      WHERE c.following_id = $1 AND c.status = 'pending'
      ORDER BY c.created_at DESC
    `, [userId]);
    
    const requests = result.rows.map(row => ({
      requestId: row.request_id,
      user: {
        id: row.id,
        username: row.username,
        name: `${row.first_name} ${row.last_name}`,
        avatarUrl: row.avatar_url,
        faculty: row.faculty
      },
      requestedAt: row.created_at,
      timeAgo: getTimeAgo(row.created_at)
    }));
    
    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get Follow Requests Error:', error);
    res.status(500).json({ error: 'Failed to get follow requests' });
  }
});

// Approve follow request
app.post('/api/connections/requests/:requestId/approve', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    
    // Update connection status
    const result = await pgPool.query(`
      UPDATE connections 
      SET status = 'following'
      WHERE id = $1 AND following_id = $2 AND status = 'pending'
      RETURNING follower_id
    `, [requestId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const followerId = result.rows[0].follower_id;
    
    // Update counts
    await pgPool.query(
      'UPDATE users SET followers_count = followers_count + 1 WHERE id = $1',
      [userId]
    );
    await pgPool.query(
      'UPDATE users SET following_count = following_count + 1 WHERE id = $1',
      [followerId]
    );
    
    // Create notification
    await Notification.create({
      userId: followerId,
      type: 'follow_request_approved',
      actorId: userId,
      message: 'approved your follow request'
    });
    
    res.json({
      success: true,
      message: 'Follow request approved'
    });
  } catch (error) {
    console.error('Approve Request Error:', error);
    res.status(500).json({ error: 'Failed to approve follow request' });
  }
});

// Reject follow request
app.post('/api/connections/requests/:requestId/reject', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    
    // Delete the connection request
    const result = await pgPool.query(`
      DELETE FROM connections 
      WHERE id = $1 AND following_id = $2 AND status = 'pending'
      RETURNING follower_id
    `, [requestId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({
      success: true,
      message: 'Follow request rejected'
    });
  } catch (error) {
    console.error('Reject Request Error:', error);
    res.status(500).json({ error: 'Failed to reject follow request' });
  }
});

// Block user
app.post('/api/connections/block/:userId', authenticate, async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { userId: blockedId } = req.params;
    
    if (blockerId === blockedId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }
    
    // Remove any existing connections
    await pgPool.query(`
      DELETE FROM connections 
      WHERE (follower_id = $1 AND following_id = $2) 
         OR (follower_id = $2 AND following_id = $1)
    `, [blockerId, blockedId]);
    
    // Create block record
    await pgPool.query(`
      INSERT INTO blocked_users (blocker_id, blocked_id)
      VALUES ($1, $2)
      ON CONFLICT (blocker_id, blocked_id) DO NOTHING
    `, [blockerId, blockedId]);
    
    // Update counts if needed
    await pgPool.query(`
      UPDATE users 
      SET followers_count = followers_count - 1 
      WHERE id = $1 AND followers_count > 0
    `, [blockerId]);
    
    await pgPool.query(`
      UPDATE users 
      SET following_count = following_count - 1 
      WHERE id = $1 AND following_count > 0
    `, [blockedId]);
    
    res.json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Block User Error:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock user
app.delete('/api/connections/block/:userId', authenticate, async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { userId: blockedId } = req.params;
    
    const result = await pgPool.query(`
      DELETE FROM blocked_users 
      WHERE blocker_id = $1 AND blocked_id = $2
      RETURNING *
    `, [blockerId, blockedId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Block record not found' });
    }
    
    res.json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Unblock User Error:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Get blocked users
app.get('/api/connections/blocked', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pgPool.query(`
      SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url,
             b.created_at as blocked_at
      FROM blocked_users b
      JOIN users u ON b.blocked_id = u.id
      WHERE b.blocker_id = $1
      ORDER BY b.created_at DESC
    `, [userId]);
    
    const blockedUsers = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      name: `${row.first_name} ${row.last_name}`,
      avatarUrl: row.avatar_url,
      blockedAt: row.blocked_at
    }));
    
    res.json({
      success: true,
      blockedUsers,
      count: blockedUsers.length
    });
  } catch (error) {
    console.error('Get Blocked Users Error:', error);
    res.status(500).json({ error: 'Failed to get blocked users' });
  }
});

// ============================================================================
// SHOPPING CART & WISHLIST SYSTEM
// ============================================================================

// Add item to cart
app.post('/api/cart/items', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, quantity = 1 } = req.body;
    
    // Verify item exists and is available
    const itemResult = await pgPool.query(`
      SELECT id, price, seller_id FROM store_items 
      WHERE id = $1 AND status = 'active' AND deleted_at IS NULL
    `, [itemId]);
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not available' });
    }
    
    const item = itemResult.rows[0];
    
    // Check if already in cart
    const existingCartItem = await pgPool.query(`
      SELECT id, quantity FROM cart_items 
      WHERE user_id = $1 AND item_id = $2
    `, [userId, itemId]);
    
    if (existingCartItem.rows.length > 0) {
      // Update quantity
      await pgPool.query(`
        UPDATE cart_items 
        SET quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2 AND item_id = $3
      `, [quantity, userId, itemId]);
    } else {
      // Add to cart
      await pgPool.query(`
        INSERT INTO cart_items (user_id, item_id, quantity)
        VALUES ($1, $2, $3)
      `, [userId, itemId, quantity]);
    }
    
    res.json({
      success: true,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Add to Cart Error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Get user's cart
app.get('/api/cart', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
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
    
    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.item.price * item.quantity);
    }, 0);
    
    res.json({
      success: true,
      cartItems,
      summary: {
        subtotal,
        itemCount: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error('Get Cart Error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
});

// Update cart item quantity
app.patch('/api/cart/items/:cartItemId', authenticate, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;
    
    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }
    
    const result = await pgPool.query(`
      UPDATE cart_items 
      SET quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [quantity, cartItemId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    res.json({
      success: true,
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Update Cart Error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
app.delete('/api/cart/items/:cartItemId', authenticate, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user.id;
    
    const result = await pgPool.query(`
      DELETE FROM cart_items 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [cartItemId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from Cart Error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear entire cart
app.delete('/api/cart', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await pgPool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear Cart Error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Save item to wishlist
app.post('/api/items/:itemId/save', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    // Verify item exists
    const itemResult = await pgPool.query(`
      SELECT id FROM store_items 
      WHERE id = $1 AND status = 'active' AND deleted_at IS NULL
    `, [itemId]);
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if already saved
    const existing = await pgPool.query(`
      SELECT id FROM saved_items 
      WHERE user_id = $1 AND item_id = $2
    `, [userId, itemId]);
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Item already in wishlist' });
    }
    
    // Add to saved items
    await pgPool.query(`
      INSERT INTO saved_items (user_id, item_id)
      VALUES ($1, $2)
    `, [userId, itemId]);
    
    // Update item saves count
    await pgPool.query(`
      UPDATE store_items 
      SET saves_count = saves_count + 1
      WHERE id = $1
    `, [itemId]);
    
    res.json({
      success: true,
      message: 'Item saved to wishlist'
    });
  } catch (error) {
    console.error('Save Item Error:', error);
    res.status(500).json({ error: 'Failed to save item' });
  }
});

// Remove item from wishlist
app.delete('/api/items/:itemId/save', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    const result = await pgPool.query(`
      DELETE FROM saved_items 
      WHERE user_id = $1 AND item_id = $2
      RETURNING *
    `, [userId, itemId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }
    
    // Update item saves count
    await pgPool.query(`
      UPDATE store_items 
      SET saves_count = GREATEST(0, saves_count - 1)
      WHERE id = $1
    `, [itemId]);
    
    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Unsave Item Error:', error);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
});

// Get user's wishlist
app.get('/api/wishlist', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
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
    
    const savedItems = result.rows.map(row => ({
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
    
    res.json({
      success: true,
      savedItems,
      count: savedItems.length
    });
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
});



// ============================================================================
// SUBSCRIPTION WEBHOOKS & PAYMENT MANAGEMENT
// ============================================================================

// Paystack webhook handler
app.post('/api/webhooks/paystack', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const payload = JSON.stringify(req.body);
    
    // Verify webhook signature (implement proper verification)
    // const crypto = require('crypto');
    // const hash = crypto.createHmac('sha512', CONFIG.PAYSTACK_SECRET_KEY).update(payload).digest('hex');
    // if (hash !== signature) {
    //   return res.status(401).send('Invalid signature');
    // }
    
    const event = req.body;
    console.log('Paystack Webhook:', event.event, event.data);
    
    switch (event.event) {
      case 'subscription.create':
        await handleSubscriptionCreate(event.data);
        break;
        
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
        
      case 'subscription.disable':
        await handleSubscriptionDisable(event.data);
        break;
        
      case 'invoice.create':
        await handleInvoiceCreate(event.data);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data);
        break;
    }
    
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

async function handleSubscriptionCreate(data) {
  try {
    const { customer, plan, subscription_code } = data;
    
    // Find user by email (customer email)
    const userResult = await pgPool.query(
      'SELECT id FROM users WHERE email = $1',
      [customer.email]
    );
    
    if (userResult.rows.length === 0) {
      console.error('User not found for subscription:', customer.email);
      return;
    }
    
    const userId = userResult.rows[0].id;
    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    expiresAt.setDate(expiresAt.getDate() + 7); // Weekly subscription
    
    // Create subscription record
    await pgPool.query(`
      INSERT INTO subscriptions (
        user_id, plan_type, amount, payment_method,
        payment_reference, status, starts_at, expires_at,
        subscription_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      userId, 'weekly', plan.amount / 100, 'paystack',
      subscription_code, 'active', startsAt, expiresAt,
      subscription_code
    ]);
    
    // Update user subscription status
    await pgPool.query(`
      UPDATE users 
      SET subscription_tier = 'premium',
          subscription_expires_at = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [expiresAt, userId]);
    
    console.log('Subscription activated for user:', userId);
  } catch (error) {
    console.error('Handle Subscription Create Error:', error);
  }
}

async function handleChargeSuccess(data) {
  try {
    const { customer, amount, reference } = data;
    
    // Find user by email
    const userResult = await pgPool.query(
      'SELECT id FROM users WHERE email = $1',
      [customer.email]
    );
    
    if (userResult.rows.length === 0) return;
    
    const userId = userResult.rows[0].id;
    
    // Update payment status for orders
    await pgPool.query(`
      UPDATE orders 
      SET payment_status = 'paid',
          status = 'confirmed',
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $1
    `, [reference]);
    
    console.log('Payment successful for order:', reference);
  } catch (error) {
    console.error('Handle Charge Success Error:', error);
  }
}

// Initialize payment for subscription
app.post('/api/subscriptions/initialize', authenticate, async (req, res) => {
  try {
    const { plan, paymentMethod } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    const amount = plan === 'weekly' ? CONFIG.PREMIUM_WEEKLY_PRICE * 100 : CONFIG.PREMIUM_WEEKLY_PRICE * 4 * 100; // in kobo
    
    // TODO: Initialize Paystack transaction
    // const paystack = require('paystack')(CONFIG.PAYSTACK_SECRET_KEY);
    // const response = await paystack.transaction.initialize({
    //   email: userEmail,
    //   amount: amount,
    //   metadata: {
    //     userId: userId,
    //     plan: plan
    //   }
    // });
    
    // For demo, return mock response
    const mockResponse = {
      status: true,
      message: 'Authorization URL created',
      data: {
        authorization_url: `https://paystack.com/pay/raved-${Date.now()}`,
        access_code: `access_${Date.now()}`,
        reference: `ref_${Date.now()}`
      }
    };
    
    res.json({
      success: true,
      payment: mockResponse.data
    });
  } catch (error) {
    console.error('Initialize Payment Error:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

// Verify payment
app.get('/api/payments/verify/:reference', authenticate, async (req, res) => {
  try {
    const { reference } = req.params;
    
    // TODO: Verify with Paystack
    // const paystack = require('paystack')(CONFIG.PAYSTACK_SECRET_KEY);
    // const response = await paystack.transaction.verify(reference);
    
    // Mock verification for demo
    const mockVerification = {
      status: true,
      data: {
        status: 'success',
        reference: reference,
        amount: 50000, // 500 GHS in kobo
        customer: {
          email: req.user.email
        }
      }
    };
    
    if (mockVerification.data.status === 'success') {
      // Update user subscription
      const startsAt = new Date();
      const expiresAt = new Date(startsAt);
      expiresAt.setDate(expiresAt.getDate() + 7); // Weekly
      
      await pgPool.query(`
        UPDATE users 
        SET subscription_tier = 'premium',
            subscription_expires_at = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [expiresAt, req.user.id]);
      
      res.json({
        success: true,
        message: 'Payment verified and subscription activated',
        subscription: {
          tier: 'premium',
          expiresAt
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});




// Theme preferences
await client.query(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(50) DEFAULT 'default';
`);

// Blocked users
await client.query(`
  CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
  CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);
`);

// Shopping cart
await client.query(`
  CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES store_items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
`);

// Wishlist/saved items
await client.query(`
  CREATE TABLE IF NOT EXISTS saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES store_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);
`);

// Add subscription code to subscriptions table
await client.query(`
  ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS subscription_code VARCHAR(255);
`);














// ============================================================================
// ADMIN & CONTENT MODERATION SYSTEM
// ============================================================================

// Middleware to check admin privileges
const requireAdmin = async (req, res, next) => {
  try {
    // TODO: Implement proper admin role checking
    // For now, we'll use a simple check - in production, use proper role-based access
    const isAdmin = req.user.email.includes('admin') || req.user.id === 'admin-user-id';
    
    if (!isAdmin) {
      return res.status(403).json({ 
        error: 'Admin privileges required',
        message: 'This action requires administrator access'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin Check Error:', error);
    res.status(500).json({ error: 'Failed to verify admin privileges' });
  }
};

// Get content reports
app.get('/api/admin/reports', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status = 'pending', type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT r.*, 
             u_reporter.username as reporter_username,
             u_reporter.first_name as reporter_first_name,
             u_reporter.last_name as reporter_last_name,
             u_reported.username as reported_username
      FROM content_reports r
      LEFT JOIN users u_reporter ON r.reporter_id = u_reporter.id
      LEFT JOIN users u_reported ON r.reported_user_id = u_reported.id
      WHERE r.status = $1
    `;
    
    const params = [status];
    let paramIndex = 2;
    
    if (type) {
      query += ` AND r.content_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);
    
    const result = await pgPool.query(query, params);
    
    const reports = result.rows.map(row => ({
      id: row.id,
      contentType: row.content_type,
      contentId: row.content_id,
      reason: row.reason,
      description: row.description,
      status: row.status,
      reporter: {
        id: row.reporter_id,
        username: row.reporter_username,
        name: `${row.reporter_first_name} ${row.reporter_last_name}`
      },
      reportedUser: row.reported_user_id ? {
        id: row.reported_user_id,
        username: row.reported_username
      } : null,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at
    }));
    
    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: reports.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get Reports Error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// Report content
app.post('/api/reports', authenticate, [
  body('contentType').isIn(['post', 'comment', 'user', 'item', 'event']),
  body('contentId').notEmpty(),
  body('reason').notEmpty().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const reporterId = req.user.id;
    const { contentType, contentId, reason, description } = req.body;
    
    // Check if already reported by this user
    const existingReport = await pgPool.query(`
      SELECT id FROM content_reports 
      WHERE reporter_id = $1 AND content_type = $2 AND content_id = $3 AND status = 'pending'
    `, [reporterId, contentType, contentId]);
    
    if (existingReport.rows.length > 0) {
      return res.status(400).json({ error: 'Content already reported' });
    }
    
    // Get reported user ID based on content type
    let reportedUserId = null;
    
    switch (contentType) {
      case 'post':
        const post = await Post.findOne({ _id: contentId });
        reportedUserId = post?.userId;
        break;
      case 'comment':
        const comment = await Comment.findOne({ _id: contentId });
        reportedUserId = comment?.userId;
        break;
      case 'user':
        reportedUserId = contentId;
        break;
      case 'item':
        const item = await pgPool.query('SELECT seller_id FROM store_items WHERE id = $1', [contentId]);
        reportedUserId = item.rows[0]?.seller_id;
        break;
      case 'event':
        const event = await pgPool.query('SELECT organizer_id FROM events WHERE id = $1', [contentId]);
        reportedUserId = event.rows[0]?.organizer_id;
        break;
    }
    
    // Create report
    await pgPool.query(`
      INSERT INTO content_reports (
        reporter_id, reported_user_id, content_type, content_id,
        reason, description, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    `, [reporterId, reportedUserId, contentType, contentId, reason, description]);
    
    res.json({
      success: true,
      message: 'Content reported successfully'
    });
  } catch (error) {
    console.error('Report Content Error:', error);
    res.status(500).json({ error: 'Failed to report content' });
  }
});

// Resolve report
app.post('/api/admin/reports/:reportId/resolve', authenticate, requireAdmin, [
  body('action').isIn(['dismiss', 'warn', 'remove_content', 'suspend_user']),
  body('notes').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { reportId } = req.params;
    const { action, notes } = req.body;
    const adminId = req.user.id;
    
    // Get report details
    const reportResult = await pgPool.query(`
      SELECT * FROM content_reports WHERE id = $1
    `, [reportId]);
    
    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const report = reportResult.rows[0];
    
    // Take action based on resolution
    switch (action) {
      case 'remove_content':
        await removeReportedContent(report);
        break;
      case 'suspend_user':
        await suspendUser(report.reported_user_id, 'Content violation', 7); // 7 days suspension
        break;
      case 'warn':
        await sendWarningToUser(report.reported_user_id, report.reason, notes);
        break;
      // 'dismiss' requires no additional action
    }
    
    // Update report status
    await pgPool.query(`
      UPDATE content_reports 
      SET status = 'resolved', 
          resolved_by = $1,
          resolved_at = CURRENT_TIMESTAMP,
          action_taken = $2,
          admin_notes = $3
      WHERE id = $4
    `, [adminId, action, notes, reportId]);
    
    res.json({
      success: true,
      message: `Report resolved with action: ${action}`
    });
  } catch (error) {
    console.error('Resolve Report Error:', error);
    res.status(500).json({ error: 'Failed to resolve report' });
  }
});

// Remove reported content
async function removeReportedContent(report) {
  switch (report.content_type) {
    case 'post':
      await Post.updateOne(
        { _id: report.content_id },
        { $set: { deletedAt: new Date() } }
      );
      break;
    case 'comment':
      await Comment.updateOne(
        { _id: report.content_id },
        { $set: { deletedAt: new Date() } }
      );
      break;
    case 'item':
      await pgPool.query(
        'UPDATE store_items SET status = "removed", deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [report.content_id]
      );
      break;
    case 'event':
      await pgPool.query(
        'UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [report.content_id]
      );
      break;
  }
}

// Suspend user
async function suspendUser(userId, reason, days) {
  const suspensionEnd = new Date();
  suspensionEnd.setDate(suspensionEnd.getDate() + days);
  
  await pgPool.query(`
    UPDATE users 
    SET suspended_until = $1, suspension_reason = $2
    WHERE id = $3
  `, [suspensionEnd, reason, userId]);
  
  // Create notification for user
  await Notification.create({
    userId,
    type: 'system',
    message: `Your account has been suspended until ${suspensionEnd.toDateString()}. Reason: ${reason}`
  });
}

// Send warning to user
async function sendWarningToUser(userId, reason, notes) {
  await Notification.create({
    userId,
    type: 'system',
    message: `You have received a warning: ${reason}. ${notes ? `Additional notes: ${notes}` : ''}`
  });
}

// Get platform statistics (admin only)
app.get('/api/admin/statistics', authenticate, requireAdmin, async (req, res) => {
  try {
    const { period = '7d' } = req.query; // 7d, 30d, 90d, all
    
    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // Get user statistics
    const userStats = await pgPool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= $1 THEN 1 END) as new_users,
        COUNT(CASE WHEN subscription_tier = 'premium' THEN 1 END) as premium_users,
        COUNT(CASE WHEN suspended_until IS NOT NULL AND suspended_until > CURRENT_TIMESTAMP THEN 1 END) as suspended_users
      FROM users
      WHERE deleted_at IS NULL
    `, [startDate]);
    
    // Get content statistics
    const postStats = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          deletedAt: null
        }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
          totalComments: { $sum: '$commentsCount' },
          avgEngagement: { $avg: { $add: ['$likesCount', '$commentsCount'] } }
        }
      }
    ]);
    
    const storeStats = await pgPool.query(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN created_at >= $1 THEN 1 END) as new_items,
        COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_items,
        COALESCE(SUM(CASE WHEN status = 'sold' THEN price END), 0) as total_sales
      FROM store_items
      WHERE deleted_at IS NULL
    `, [startDate]);
    
    const eventStats = await pgPool.query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN created_at >= $1 THEN 1 END) as new_events,
        SUM(current_attendees) as total_attendees
      FROM events
      WHERE deleted_at IS NULL
    `, [startDate]);
    
    res.json({
      success: true,
      period,
      statistics: {
        users: userStats.rows[0],
        posts: postStats[0] || { totalPosts: 0, totalLikes: 0, totalComments: 0, avgEngagement: 0 },
        store: storeStats.rows[0],
        events: eventStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Get Statistics Error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get user management list
app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, username, email, first_name, last_name, avatar_url,
             faculty, subscription_tier, suspended_until,
             followers_count, following_count, posts_count,
             created_at, last_login_at
      FROM users
      WHERE deleted_at IS NULL
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (search) {
      query += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (role && role !== 'all') {
      query += ` AND subscription_tier = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    
    if (status === 'suspended') {
      query += ` AND suspended_until IS NOT NULL AND suspended_until > CURRENT_TIMESTAMP`;
    } else if (status === 'active') {
      query += ` AND (suspended_until IS NULL OR suspended_until <= CURRENT_TIMESTAMP)`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);
    
    const result = await pgPool.query(query, params);
    
    const users = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      email: row.email,
      name: `${row.first_name} ${row.last_name}`,
      avatarUrl: row.avatar_url,
      faculty: row.faculty,
      subscriptionTier: row.subscription_tier,
      isSuspended: row.suspended_until && row.suspended_until > new Date(),
      suspendedUntil: row.suspended_until,
      stats: {
        followers: row.followers_count,
        following: row.following_count,
        posts: row.posts_count
      },
      createdAt: row.created_at,
      lastLogin: row.last_login_at
    }));
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: users.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// ============================================================================
// BACKGROUND JOBS & CRON SYSTEM
// ============================================================================

const cron = require('node-cron');

// Initialize background jobs
function initializeBackgroundJobs() {
  console.log('🕒 Initializing background jobs...');
  
  // Clean up expired stories every hour
  cron.schedule('0 * * * *', cleanupExpiredStories);
  
  // Calculate rankings every Sunday at 2 AM
  cron.schedule('0 2 * * 0', calculateWeeklyRankings);
  
  // Reset monthly rankings on 1st of month at 3 AM
  cron.schedule('0 3 1 * *', resetMonthlyRankings);
  
  // Check and expire subscriptions daily at 4 AM
  cron.schedule('0 4 * * *', checkSubscriptionExpirations);
  
  // Send weekly digest emails every Monday at 9 AM
  cron.schedule('0 9 * * 1', sendWeeklyDigests);
  
  // Clean up old notifications weekly
  cron.schedule('0 5 * * 0', cleanupOldNotifications);
  
  console.log('✅ Background jobs initialized');
}

// Clean up expired stories
async function cleanupExpiredStories() {
  try {
    const result = await Story.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    console.log(`🧹 Cleaned up ${result.deletedCount} expired stories`);
  } catch (error) {
    console.error('Story cleanup error:', error);
  }
}

// Calculate weekly rankings
async function calculateWeeklyRankings() {
  try {
    console.log('🏆 Calculating weekly rankings...');
    
    // Get top users by weekly score
    const topUsers = await pgPool.query(`
      SELECT us.user_id, us.weekly_score, u.username, u.first_name, u.last_name,
             u.avatar_url, u.subscription_tier
      FROM user_scores us
      JOIN users u ON us.user_id = u.id
      WHERE u.subscription_tier = 'premium'
      ORDER BY us.weekly_score DESC
      LIMIT 100
    `);
    
    // Store weekly rankings
    const rankingDate = new Date();
    const rankingPeriod = `weekly-${rankingDate.toISOString().split('T')[0]}`;
    
    for (let i = 0; i < topUsers.rows.length; i++) {
      const user = topUsers.rows[i];
      
      await pgPool.query(`
        INSERT INTO ranking_history (user_id, ranking_period, rank, score, ranking_type)
        VALUES ($1, $2, $3, $4, 'weekly')
        ON CONFLICT (user_id, ranking_period, ranking_type) 
        DO UPDATE SET rank = $3, score = $4
      `, [user.user_id, rankingPeriod, i + 1, user.weekly_score]);
    }
    
    // Reset weekly scores for next period
    await pgPool.query(`
      UPDATE user_scores 
      SET weekly_score = 0,
          last_weekly_reset = CURRENT_TIMESTAMP
    `);
    
    console.log(`✅ Weekly rankings calculated for ${topUsers.rows.length} users`);
    
    // Award prizes to top 3
    if (topUsers.rows.length >= 3) {
      await awardRankingPrizes(topUsers.rows.slice(0, 3), 'weekly');
    }
  } catch (error) {
    console.error('Weekly rankings error:', error);
  }
}

// Reset monthly rankings
async function resetMonthlyRankings() {
  try {
    console.log('📊 Resetting monthly rankings...');
    
    // Store final monthly rankings
    const rankingDate = new Date();
    const previousMonth = new Date(rankingDate.getFullYear(), rankingDate.getMonth() - 1, 1);
    const rankingPeriod = `monthly-${previousMonth.getFullYear()}-${previousMonth.getMonth() + 1}`;
    
    const topUsers = await pgPool.query(`
      SELECT us.user_id, us.monthly_score, u.username
      FROM user_scores us
      JOIN users u ON us.user_id = u.id
      WHERE u.subscription_tier = 'premium'
      ORDER BY us.monthly_score DESC
      LIMIT 50
    `);
    
    for (let i = 0; i < topUsers.rows.length; i++) {
      const user = topUsers.rows[i];
      
      await pgPool.query(`
        INSERT INTO ranking_history (user_id, ranking_period, rank, score, ranking_type)
        VALUES ($1, $2, $3, $4, 'monthly')
      `, [user.user_id, rankingPeriod, i + 1, user.monthly_score]);
    }
    
    // Reset monthly scores
    await pgPool.query(`
      UPDATE user_scores 
      SET monthly_score = 0,
          last_monthly_reset = CURRENT_TIMESTAMP
    `);
    
    console.log(`✅ Monthly rankings reset for ${topUsers.rows.length} users`);
    
    // Award monthly prizes
    if (topUsers.rows.length >= 3) {
      await awardRankingPrizes(topUsers.rows.slice(0, 3), 'monthly');
    }
  } catch (error) {
    console.error('Monthly rankings reset error:', error);
  }
}

// Award ranking prizes
async function awardRankingPrizes(topUsers, period) {
  try {
    const prizes = period === 'weekly' 
      ? [75.00, 45.00, 30.00] // Weekly prizes in GHS
      : [300.00, 180.00, 120.00]; // Monthly prizes
    
    for (let i = 0; i < Math.min(topUsers.length, 3); i++) {
      const user = topUsers[i];
      const prizeAmount = prizes[i];
      
      // Create prize record
      await pgPool.query(`
        INSERT INTO ranking_prizes (user_id, ranking_period, rank, prize_amount, prize_type)
        VALUES ($1, $2, $3, $4, $5)
      `, [user.user_id, `${period}-${new Date().toISOString().split('T')[0]}`, i + 1, prizeAmount, period]);
      
      // Create notification for winner
      await Notification.create({
        userId: user.user_id,
        type: 'ranking_prize',
        message: `Congratulations! You ranked #${i + 1} in the ${period} rankings and won ₵${prizeAmount}`
      });
      
      console.log(`🎉 Awarded ₵${prizeAmount} to ${user.username} for ${period} rank ${i + 1}`);
    }
  } catch (error) {
    console.error('Award prizes error:', error);
  }
}

// Check subscription expirations
async function checkSubscriptionExpirations() {
  try {
    console.log('💰 Checking subscription expirations...');
    
    const expiringUsers = await pgPool.query(`
      SELECT id, username, email, subscription_tier, subscription_expires_at
      FROM users
      WHERE subscription_tier = 'premium'
      AND subscription_expires_at BETWEEN CURRENT_TIMESTAMP AND (CURRENT_TIMESTAMP + INTERVAL '3 days')
      AND deleted_at IS NULL
    `);
    
    for (const user of expiringUsers.rows) {
      // Send expiration reminder
      await Notification.create({
        userId: user.id,
        type: 'subscription_reminder',
        message: `Your premium subscription expires on ${new Date(user.subscription_expires_at).toLocaleDateString()}. Renew to keep your benefits!`
      });
      
      console.log(`📧 Sent subscription reminder to ${user.username}`);
    }
    
    // Downgrade expired subscriptions
    const expiredUsers = await pgPool.query(`
      UPDATE users 
      SET subscription_tier = 'free',
          subscription_expires_at = NULL
      WHERE subscription_tier = 'premium'
      AND subscription_expires_at < CURRENT_TIMESTAMP
      AND deleted_at IS NULL
      RETURNING id, username
    `);
    
    if (expiredUsers.rows.length > 0) {
      console.log(`🔻 Downgraded ${expiredUsers.rows.length} expired subscriptions`);
      
      for (const user of expiredUsers.rows) {
        await Notification.create({
          userId: user.id,
          type: 'subscription_expired',
          message: 'Your premium subscription has expired. Upgrade to regain access to premium features.'
        });
      }
    }
  } catch (error) {
    console.error('Subscription expiration check error:', error);
  }
}

// Send weekly digest emails
async function sendWeeklyDigests() {
  try {
    console.log('📨 Sending weekly digests...');
    
    // Get users who want digest emails (would need email_preferences table)
    const users = await pgPool.query(`
      SELECT id, username, email, first_name
      FROM users
      WHERE deleted_at IS NULL
      AND email IS NOT NULL
      LIMIT 1000 -- Batch processing
    `);
    
    for (const user of users.rows) {
      try {
        // Get user's weekly stats
        const userStats = await getUserWeeklyStats(user.id);
        
        // Send digest email
        await sendEmail(user.email, 'Your Raved Weekly Digest', `
          <h2>Hello ${user.first_name}!</h2>
          <p>Here's your weekly Raved digest:</p>
          <ul>
            <li>New followers: ${userStats.newFollowers}</li>
            <li>Posts liked: ${userStats.postsLiked}</li>
            <li>Comments received: ${userStats.commentsReceived}</li>
            <li>Top trending in your network: ${userStats.trendingPosts} posts</li>
          </ul>
          <p><a href="https://raved.app">View your profile</a></p>
        `);
        
        console.log(`📧 Sent weekly digest to ${user.email}`);
      } catch (error) {
        console.error(`Failed to send digest to ${user.email}:`, error);
      }
    }
  } catch (error) {
    console.error('Weekly digest error:', error);
  }
}

// Clean up old notifications
async function cleanupOldNotifications() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep 30 days
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    });
    
    console.log(`🗑️ Cleaned up ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error('Notification cleanup error:', error);
  }
}

// Get user weekly stats for digest
async function getUserWeeklyStats(userId) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const newFollowers = await pgPool.query(
    'SELECT COUNT(*) FROM connections WHERE following_id = $1 AND created_at >= $2',
    [userId, oneWeekAgo]
  );
  
  const postsLiked = await Like.countDocuments({
    userId,
    targetType: 'post',
    createdAt: { $gte: oneWeekAgo }
  });
  
  const commentsReceived = await Comment.countDocuments({
    userId,
    createdAt: { $gte: oneWeekAgo }
  });
  
  // Simplified trending posts count
  const trendingPosts = await Post.countDocuments({
    createdAt: { $gte: oneWeekAgo },
    likesCount: { $gte: 10 }
  });
  
  return {
    newFollowers: parseInt(newFollowers.rows[0].count),
    postsLiked,
    commentsReceived,
    trendingPosts
  };
}

// Manual job triggers (for testing and admin use)
app.post('/api/admin/jobs/cleanup-stories', authenticate, requireAdmin, async (req, res) => {
  try {
    await cleanupExpiredStories();
    res.json({ success: true, message: 'Story cleanup completed' });
  } catch (error) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

app.post('/api/admin/jobs/calculate-rankings', authenticate, requireAdmin, async (req, res) => {
  try {
    await calculateWeeklyRankings();
    res.json({ success: true, message: 'Rankings calculated' });
  } catch (error) {
    console.error('Manual rankings error:', error);
    res.status(500).json({ error: 'Rankings calculation failed' });
  }
});

// ============================================================================
// ADVANCED SEARCH & DISCOVERY SYSTEM
// ============================================================================

// Advanced search with ranking and filters
app.get('/api/search/advanced', authenticate, async (req, res) => {
  try {
    const { 
      q, 
      type = 'all',
      category,
      faculty,
      minPrice,
      maxPrice,
      condition,
      sortBy = 'relevance',
      page = 1, 
      limit = 20 
    } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query too short' });
    }
    
    const searchTerm = q.trim().toLowerCase();
    const offset = (page - 1) * limit;
    const results = {
      users: [],
      posts: [],
      items: [],
      events: [],
      faculties: []
    };
    
    // Search users with ranking
    if (type === 'all' || type === 'users') {
      const userQuery = `
        SELECT id, username, first_name, last_name, avatar_url, faculty, bio,
               followers_count, posts_count,
               -- Relevance scoring
               CASE 
                 WHEN username ILIKE $1 THEN 100
                 WHEN first_name ILIKE $1 OR last_name ILIKE $1 THEN 80
                 WHEN bio ILIKE $1 THEN 60
                 ELSE 20
               END as relevance_score
        FROM users
        WHERE (
          username ILIKE $2 OR
          first_name ILIKE $2 OR
          last_name ILIKE $2 OR
          bio ILIKE $2 OR
          faculty ILIKE $2
        )
        AND deleted_at IS NULL
        ORDER BY relevance_score DESC, followers_count DESC
        LIMIT $3
      `;
      
      const userResult = await pgPool.query(userQuery, [
        searchTerm, `%${searchTerm}%`, limit
      ]);
      
      results.users = userResult.rows.map(u => ({
        id: u.id,
        username: u.username,
        name: `${u.first_name} ${u.last_name}`,
        avatarUrl: u.avatar_url,
        faculty: u.faculty,
        bio: u.bio,
        stats: {
          followers: u.followers_count,
          posts: u.posts_count
        },
        relevance: u.relevance_score
      }));
    }
    
    // Search posts with engagement ranking
    if (type === 'all' || type === 'posts') {
      const posts = await Post.aggregate([
        {
          $match: {
            $or: [
              { caption: { $regex: searchTerm, $options: 'i' } },
              { tags: { $regex: searchTerm, $options: 'i' } },
              { location: { $regex: searchTerm, $options: 'i' } }
            ],
            deletedAt: null,
            visibility: 'public'
          }
        },
        {
          $addFields: {
            engagementScore: {
              $add: [
                { $multiply: ['$likesCount', 2] },
                { $multiply: ['$commentsCount', 3] },
                { $multiply: ['$sharesCount', 5] }
              ]
            },
            relevanceScore: {
              $cond: {
                if: { $regexMatch: { input: '$caption', regex: searchTerm, options: 'i' } },
                then: 100,
                else: 50
              }
            }
          }
        },
        {
          $sort: { 
            relevanceScore: -1,
            engagementScore: -1,
            createdAt: -1 
          }
        },
        {
          $limit: parseInt(limit)
        }
      ]);
      
      // Get user info for posts
      const userIds = posts.map(p => p.userId);
      const users = await pgPool.query(
        'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)',
        [userIds]
      );
      
      const userMap = {};
      users.rows.forEach(u => {
        userMap[u.id] = {
          username: u.username,
          name: `${u.first_name} ${u.last_name}`,
          avatarUrl: u.avatar_url
        };
      });
      
      results.posts = posts.map(p => ({
        id: p._id,
        caption: p.caption,
        media: p.media,
        user: userMap[p.userId],
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        engagement: p.engagementScore,
        createdAt: p.createdAt
      }));
    }
    
    // Search store items with filters
    if (type === 'all' || type === 'items') {
      let itemQuery = `
        SELECT id, name, description, price, category, condition, size, brand,
               images, seller_id, views_count, likes_count, saves_count,
               -- Relevance scoring
               CASE 
                 WHEN name ILIKE $1 THEN 100
                 WHEN description ILIKE $1 THEN 80
                 WHEN brand ILIKE $1 THEN 60
                 ELSE 30
               END as relevance_score
        FROM store_items
        WHERE (
          name ILIKE $2 OR
          description ILIKE $2 OR
          brand ILIKE $2 OR
          category ILIKE $2
        )
        AND status = 'active'
        AND deleted_at IS NULL
      `;
      
      const params = [searchTerm, `%${searchTerm}%`];
      let paramIndex = 3;
      
      if (category && category !== 'all') {
        itemQuery += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }
      
      if (condition) {
        itemQuery += ` AND condition = $${paramIndex}`;
        params.push(condition);
        paramIndex++;
      }
      
      if (minPrice) {
        itemQuery += ` AND price >= $${paramIndex}`;
        params.push(parseFloat(minPrice));
        paramIndex++;
      }
      
      if (maxPrice) {
        itemQuery += ` AND price <= $${paramIndex}`;
        params.push(parseFloat(maxPrice));
        paramIndex++;
      }
      
      // Sorting
      const sortMap = {
        'relevance': 'relevance_score DESC',
        'price-low': 'price ASC',
        'price-high': 'price DESC',
        'popular': 'likes_count DESC',
        'newest': 'created_at DESC'
      };
      
      itemQuery += ` ORDER BY ${sortMap[sortBy] || 'relevance_score DESC'} LIMIT $${paramIndex}`;
      params.push(parseInt(limit));
      
      const itemResult = await pgPool.query(itemQuery, params);
      
      results.items = itemResult.rows.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category: item.category,
        condition: item.condition,
        size: item.size,
        brand: item.brand,
        images: item.images,
        stats: {
          views: item.views_count,
          likes: item.likes_count,
          saves: item.saves_count
        },
        relevance: item.relevance_score
      }));
    }
    
    // Search events
    if (type === 'all' || type === 'events') {
      let eventQuery = `
        SELECT id, title, description, event_date, event_time, location, 
               category, audience, image_url, current_attendees, max_attendees,
               -- Relevance scoring
               CASE 
                 WHEN title ILIKE $1 THEN 100
                 WHEN description ILIKE $1 THEN 80
                 WHEN location ILIKE $1 THEN 60
                 ELSE 30
               END as relevance_score
        FROM events
        WHERE (
          title ILIKE $2 OR
          description ILIKE $2 OR
          location ILIKE $2 OR
          category ILIKE $2
        )
        AND deleted_at IS NULL
        AND event_date >= CURRENT_DATE
      `;
      
      const params = [searchTerm, `%${searchTerm}%`];
      
      if (category && category !== 'all') {
        eventQuery += ` AND category = $3`;
        params.push(category);
      }
      
      eventQuery += ` ORDER BY relevance_score DESC, event_date ASC LIMIT $${params.length + 1}`;
      params.push(parseInt(limit));
      
      const eventResult = await pgPool.query(eventQuery, params);
      
      results.events = eventResult.rows.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.event_date,
        eventTime: e.event_time,
        location: e.location,
        category: e.category,
        audience: e.audience,
        imageUrl: e.image_url,
        attendance: {
          current: e.current_attendees,
          max: e.max_attendees
        },
        relevance: e.relevance_score
      }));
    }
    
    // Search faculties
    if (type === 'all' || type === 'faculties') {
      const facultyQuery = `
        SELECT DISTINCT faculty,
               COUNT(*) as user_count
        FROM users
        WHERE faculty ILIKE $1
        AND faculty IS NOT NULL
        AND deleted_at IS NULL
        GROUP BY faculty
        ORDER BY user_count DESC
        LIMIT $2
      `;
      
      const facultyResult = await pgPool.query(facultyQuery, [`%${searchTerm}%`, 10]);
      
      results.faculties = facultyResult.rows.map(row => ({
        name: row.faculty,
        userCount: parseInt(row.user_count)
      }));
    }
    
    res.json({
      success: true,
      query: q,
      filters: {
        type,
        category,
        faculty,
        minPrice,
        maxPrice,
        condition,
        sortBy
      },
      results,
      totalResults: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
    });
  } catch (error) {
    console.error('Advanced Search Error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get trending content
app.get('/api/discover/trending', authenticate, async (req, res) => {
  try {
    const { type = 'all', limit = 20 } = req.query;
    
    const trending = {
      posts: [],
      items: [],
      users: [],
      hashtags: []
    };
    
    // Trending posts (based on recent engagement)
    if (type === 'all' || type === 'posts') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const trendingPosts = await Post.aggregate([
        {
          $match: {
            createdAt: { $gte: oneWeekAgo },
            deletedAt: null,
            visibility: 'public'
          }
        },
        {
          $addFields: {
            engagementScore: {
              $add: [
                { $multiply: ['$likesCount', 2] },
                { $multiply: ['$commentsCount', 3] },
                { $multiply: ['$sharesCount', 5] },
                { $multiply: ['$viewsCount', 0.1] }
              ]
            },
            engagementVelocity: {
              $divide: [
                {
                  $add: [
                    { $multiply: ['$likesCount', 2] },
                    { $multiply: ['$commentsCount', 3] },
                    { $multiply: ['$sharesCount', 5] }
                  ]
                },
                {
                  $divide: [
                    { $subtract: [new Date(), '$createdAt'] },
                    1000 * 60 * 60 // Hours since creation
                  ]
                }
              ]
            }
          }
        },
        {
          $sort: { engagementVelocity: -1, engagementScore: -1 }
        },
        {
          $limit: parseInt(limit)
        }
      ]);
      
      // Get user info
      const userIds = trendingPosts.map(p => p.userId);
      const users = await pgPool.query(
        'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)',
        [userIds]
      );
      
      const userMap = {};
      users.rows.forEach(u => {
        userMap[u.id] = {
          username: u.username,
          name: `${u.first_name} ${u.last_name}`,
          avatarUrl: u.avatar_url
        };
      });
      
      trending.posts = trendingPosts.map(p => ({
        id: p._id,
        caption: p.caption,
        media: p.media,
        user: userMap[p.userId],
        engagement: {
          score: p.engagementScore,
          velocity: p.engagementVelocity,
          likes: p.likesCount,
          comments: p.commentsCount
        },
        createdAt: p.createdAt
      }));
    }
    
    // Trending store items
    if (type === 'all' || type === 'items') {
      const trendingItems = await pgPool.query(`
        SELECT id, name, price, images, category, condition,
               views_count, likes_count, saves_count,
               -- Trending score based on recent engagement
               (views_count * 0.1 + likes_count * 2 + saves_count * 3) as trending_score
        FROM store_items
        WHERE status = 'active'
        AND deleted_at IS NULL
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY trending_score DESC
        LIMIT $1
      `, [parseInt(limit)]);
      
      trending.items = trendingItems.rows.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        images: item.images,
        category: item.category,
        condition: item.condition,
        trendingScore: parseFloat(item.trending_score),
        stats: {
          views: item.views_count,
          likes: item.likes_count,
          saves: item.saves_count
        }
      }));
    }
    
    // Trending users (based on recent follower growth)
    if (type === 'all' || type === 'users') {
      const trendingUsers = await pgPool.query(`
        SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty,
               u.followers_count, u.posts_count,
               -- Calculate follower growth rate (simplified)
               u.followers_count as trending_score
        FROM users u
        WHERE u.deleted_at IS NULL
        AND u.created_at >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY trending_score DESC
        LIMIT $1
      `, [parseInt(limit)]);
      
      trending.users = trendingUsers.rows.map(u => ({
        id: u.id,
        username: u.username,
        name: `${u.first_name} ${u.last_name}`,
        avatarUrl: u.avatar_url,
        faculty: u.faculty,
        trendingScore: u.trending_score,
        stats: {
          followers: u.followers_count,
          posts: u.posts_count
        }
      }));
    }
    
    // Trending hashtags
    if (type === 'all' || type === 'hashtags') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const trendingHashtags = await Post.aggregate([
        {
          $match: {
            createdAt: { $gte: oneWeekAgo },
            deletedAt: null,
            tags: { $exists: true, $not: { $size: 0 } }
          }
        },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 },
            totalLikes: { $sum: '$likesCount' },
            totalComments: { $sum: '$commentsCount' }
          }
        },
        {
          $addFields: {
            engagementScore: {
              $add: [
                { $multiply: ['$count', 10] },
                { $multiply: ['$totalLikes', 2] },
                { $multiply: ['$totalComments', 3] }
              ]
            }
          }
        },
        { $sort: { engagementScore: -1 } },
        { $limit: parseInt(limit) }
      ]);
      
      trending.hashtags = trendingHashtags.map(tag => ({
        tag: tag._id,
        count: tag.count,
        engagement: tag.engagementScore
      }));
    }
    
    res.json({
      success: true,
      trending,
      period: '7 days'
    });
  } catch (error) {
    console.error('Get Trending Error:', error);
    res.status(500).json({ error: 'Failed to get trending content' });
  }
});

// Get personalized recommendations
app.get('/api/discover/recommendations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'mixed', limit = 10 } = req.query;
    
    const recommendations = {
      users: [],
      posts: [],
      items: []
    };
    
    // Recommended users (based on faculty and connections)
    if (type === 'mixed' || type === 'users') {
      const recommendedUsers = await pgPool.query(`
        SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty, u.bio,
               u.followers_count, u.posts_count,
               -- Recommendation score based on shared faculty and connection overlap
               CASE 
                 WHEN u.faculty = $1 THEN 50
                 ELSE 10
               END as recommendation_score
        FROM users u
        WHERE u.id != $2
        AND u.deleted_at IS NULL
        AND u.id NOT IN (
          SELECT following_id FROM connections WHERE follower_id = $2
        )
        ORDER BY recommendation_score DESC, u.followers_count DESC
        LIMIT $3
      `, [req.user.faculty, userId, parseInt(limit)]);
      
      recommendations.users = recommendedUsers.rows.map(u => ({
        id: u.id,
        username: u.username,
        name: `${u.first_name} ${u.last_name}`,
        avatarUrl: u.avatar_url,
        faculty: u.faculty,
        bio: u.bio,
        recommendationScore: u.recommendation_score,
        stats: {
          followers: u.followers_count,
          posts: u.posts_count
        }
      }));
    }
    
    // Recommended posts (from users with similar interests)
    if (type === 'mixed' || type === 'posts') {
      const recommendedPosts = await Post.aggregate([
        {
          $match: {
            userId: { $ne: userId },
            deletedAt: null,
            visibility: 'public'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $addFields: {
            recommendationScore: {
              $cond: {
                if: { $eq: ['$user.faculty', req.user.faculty] },
                then: 60,
                else: 20
              }
            }
          }
        },
        {
          $sort: { recommendationScore: -1, likesCount: -1, createdAt: -1 }
        },
        {
          $limit: parseInt(limit)
        }
      ]);
      
      recommendations.posts = recommendedPosts.map(p => ({
        id: p._id,
        caption: p.caption,
        media: p.media,
        user: {
          id: p.user.id,
          username: p.user.username,
          name: `${p.user.first_name} ${p.user.last_name}`,
          avatarUrl: p.user.avatar_url
        },
        recommendationScore: p.recommendationScore,
        engagement: {
          likes: p.likesCount,
          comments: p.commentsCount
        },
        createdAt: p.createdAt
      }));
    }
    
    // Recommended store items (based on viewed/saved categories)
    if (type === 'mixed' || type === 'items') {
      const recommendedItems = await pgPool.query(`
        SELECT si.id, si.name, si.price, si.images, si.category, si.condition,
               si.views_count, si.likes_count, si.saves_count,
               -- Simple recommendation based on category popularity
               si.saves_count * 3 + si.likes_count * 2 + si.views_count * 0.1 as recommendation_score
        FROM store_items si
        WHERE si.status = 'active'
        AND si.deleted_at IS NULL
        AND si.seller_id != $1
        ORDER BY recommendation_score DESC
        LIMIT $2
      `, [userId, parseInt(limit)]);
      
      recommendations.items = recommendedItems.rows.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        images: item.images,
        category: item.category,
        condition: item.condition,
        recommendationScore: parseFloat(item.recommendation_score),
        stats: {
          views: item.views_count,
          likes: item.likes_count,
          saves: item.saves_count
        }
      }));
    }
    
    res.json({
      success: true,
      recommendations,
      basedOn: ['faculty', 'popularity', 'engagement']
    });
  } catch (error) {
    console.error('Get Recommendations Error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Content reports table
await client.query(`
  CREATE TABLE IF NOT EXISTS content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    action_taken VARCHAR(50),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
  CREATE INDEX IF NOT EXISTS idx_content_reports_content ON content_reports(content_type, content_id);
`);

// Ranking history and prizes
await client.query(`
  CREATE TABLE IF NOT EXISTS ranking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ranking_period VARCHAR(100) NOT NULL,
    rank INTEGER NOT NULL,
    score INTEGER NOT NULL,
    ranking_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, ranking_period, ranking_type)
  );
  
  CREATE TABLE IF NOT EXISTS ranking_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ranking_period VARCHAR(100) NOT NULL,
    rank INTEGER NOT NULL,
    prize_amount DECIMAL(10,2) NOT NULL,
    prize_type VARCHAR(20) NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_ranking_history_period ON ranking_history(ranking_period, ranking_type);
  CREATE INDEX IF NOT EXISTS idx_ranking_prizes_user ON ranking_prizes(user_id);
`);

// User suspension support
await client.query(`
  ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
`);


//## 🚀 **PHASE 10: UPDATE SERVER INITIALIZATION**

//Add this to the `startServer()` function:
// Initialize background jobs
initializeBackgroundJobs();
