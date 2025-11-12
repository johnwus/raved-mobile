/**
 * Comprehensive API Test Script for RAVED Mobile App
 * 
 * This script tests all frontend APIs in a realistic user workflow:
 * - Authentication (register, login, verify)
 * - User profile operations
 * - Posts and interactions
 * - Social connections
 * - Messaging
 * - Events
 * - Store/marketplace
 * - Stories
 * - Analytics
 * - Notifications
 * - Search
 * - Subscriptions
 * 
 * Usage: node test-all-apis.js
 * 
 * Environment variables:
 * - API_BASE_URL: Base URL for the API (default: http://localhost:3000/api/v1)
 * - TEST_DELAY: Delay between API calls in ms (default: 1500)
 */

const axios = require('axios');
let FormDataLib = null;
try { FormDataLib = require('form-data'); } catch (_) { /* optional */ }

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const TEST_DELAY = parseInt(process.env.TEST_DELAY || '1500', 10);

// Test data
const testUsers = {
  user1: {
    email: `testuser1_${Date.now()}@example.com`,
    phone: `+233${Math.floor(Math.random() * 1000000000)}`,
    password: 'TestPassword123!',
    firstName: 'John',
    lastName: 'Doe',
    faculty: 'Engineering',
    username: `john_${Date.now()}`
  },
  user2: {
    email: `testuser2_${Date.now()}@example.com`,
    phone: `+233${Math.floor(Math.random() * 1000000000)}`,
    password: 'TestPassword456!',
    firstName: 'Jane',
    lastName: 'Smith',
    faculty: 'Business',
    username: `jane_${Date.now()}`
  }
};

// Global state
let user1Token = null;
let user2Token = null;
let user1Id = null;
let user2Id = null;
let testPostId = null;
let testCommentId = null;
let testChatId = null;
let testEventId = null;
let testStoreItemId = null;
let testCartItemId = null;
let testStoryId = null;
let testDeviceToken = null;

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = (section, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${section}: ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logError = (section, error) => {
  console.error(`\n❌ [ERROR] ${section}:`, error.response?.data || error.message);
};

const logSuccess = (section, message) => {
  console.log(`✅ ${section}: ${message}`);
};

// Create axios instances
const createApiClient = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers
  });
};

// =============================================================================
// TEST SECTIONS
// =============================================================================

// Tiny 1x1 PNG for multipart testing (avoids external downloads)
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7qkZkAAAAASUVORK5CYII=';
const getTinyPngBuffer = () => Buffer.from(TINY_PNG_BASE64, 'base64');

/**
 * 1. AUTHENTICATION FLOW
 */
async function testAuthentication() {
  log('AUTH', 'Testing authentication endpoints');

  try {
    // Register User 1
    log('AUTH', 'Registering User 1', testUsers.user1);
    const api = createApiClient();
    const registerRes1 = await api.post('/auth/register', testUsers.user1);
    user1Token = registerRes1.data.token || registerRes1.data.accessToken;
    user1Id = registerRes1.data.user?.id || registerRes1.data.userId;
    logSuccess('AUTH', `User 1 registered successfully. ID: ${user1Id}`);
    await delay(TEST_DELAY);

    // Register User 2
    log('AUTH', 'Registering User 2', testUsers.user2);
    const registerRes2 = await api.post('/auth/register', testUsers.user2);
    user2Token = registerRes2.data.token || registerRes2.data.accessToken;
    user2Id = registerRes2.data.user?.id || registerRes2.data.userId;
    logSuccess('AUTH', `User 2 registered successfully. ID: ${user2Id}`);
    await delay(TEST_DELAY);

    // Test login with User 1
    log('AUTH', 'Testing login with User 1');
    const loginRes = await api.post('/auth/login', {
      identifier: testUsers.user1.email,
      password: testUsers.user1.password
    });
    user1Token = loginRes.data.token || loginRes.data.accessToken;
    logSuccess('AUTH', 'Login successful');
    await delay(TEST_DELAY);

    // Send email verification
    const user1Api = createApiClient(user1Token);
    try {
      log('AUTH', 'Sending email verification');
      await user1Api.post('/auth/send-verification-email');
      logSuccess('AUTH', 'Email verification sent');
      await delay(TEST_DELAY);
    } catch (error) {
      logError('AUTH', error);
    }

    // Send SMS verification
    try {
      log('AUTH', 'Sending SMS verification');
      await user1Api.post('/auth/send-sms-verification');
      logSuccess('AUTH', 'SMS verification sent');
      await delay(TEST_DELAY);
    } catch (error) {
      logError('AUTH', error);
    }

    // Test password reset request
    try {
      log('AUTH', 'Requesting password reset');
      await api.post('/auth/forgot-password', { email: testUsers.user1.email });
      logSuccess('AUTH', 'Password reset email sent');
      await delay(TEST_DELAY);
    } catch (error) {
      logError('AUTH', error);
    }

    // Test token refresh
    try {
      log('AUTH', 'Testing token refresh');
      const refreshRes = await api.post('/auth/refresh', { 
        refreshToken: registerRes1.data.refreshToken 
      });
      logSuccess('AUTH', 'Token refreshed');
      await delay(TEST_DELAY);
    } catch (error) {
      logError('AUTH', error);
    }

  } catch (error) {
    logError('AUTH', error);
    throw error;
  }
}

/**
 * 2. USER PROFILE OPERATIONS
 */
async function testUserProfile() {
  log('USER', 'Testing user profile endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Get own profile
    log('USER', 'Getting own profile');
    const profileRes = await user1Api.get('/users/profile');
    logSuccess('USER', 'Profile retrieved');
    await delay(TEST_DELAY);

    // Update profile
    log('USER', 'Updating profile');
    await user1Api.put('/users/profile', {
      bio: 'Fashion enthusiast and tech lover',
      location: 'Accra, Ghana',
      website: 'https://example.com'
    });
    logSuccess('USER', 'Profile updated');
    await delay(TEST_DELAY);

    // Get user stats
    log('USER', 'Getting user stats');
    await user1Api.get('/users/stats');
    logSuccess('USER', 'User stats retrieved');
    await delay(TEST_DELAY);

    // Update avatar
    try {
      log('USER', 'Updating avatar');
      await user1Api.put('/users/avatar', {
        avatarUrl: 'https://example.com/avatar.jpg'
      });
      logSuccess('USER', 'Avatar updated');
      await delay(TEST_DELAY);
    } catch (error) {
      logError('USER', error);
    }

    // Get user settings
    log('USER', 'Getting user settings');
    await user1Api.get('/users/settings');
    logSuccess('USER', 'User settings retrieved');
    await delay(TEST_DELAY);

    // Update user settings
    log('USER', 'Updating user settings');
    await user1Api.put('/users/settings', {
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowMessages: 'everyone',
      language: 'en',
      timezone: 'Africa/Accra'
    });
    logSuccess('USER', 'User settings updated');
    await delay(TEST_DELAY);

    // Update privacy settings
    log('USER', 'Updating privacy settings');
    await user1Api.put('/users/privacy', {
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowMessages: 'everyone'
    });
    logSuccess('USER', 'Privacy settings updated');
    await delay(TEST_DELAY);

    // Update notification settings
    log('USER', 'Updating notification settings');
    await user1Api.put('/users/notifications', {
      emailNotifications: true,
      pushNotifications: true,
      postLikes: true,
      comments: true,
      follows: true,
      messages: true
    });
    logSuccess('USER', 'Notification settings updated');
    await delay(TEST_DELAY);

    // Register device token
    log('USER', 'Registering device token');
    testDeviceToken = `test_device_token_${Date.now()}`;
    await user1Api.post('/device-tokens', {
      token: testDeviceToken,
      platform: 'android'
    });
    logSuccess('USER', 'Device token registered');
    await delay(TEST_DELAY);

    // Search users
    log('USER', 'Searching users');
    await user1Api.get('/users/search', {
      params: { q: 'jane', page: 1, limit: 20 }
    });
    logSuccess('USER', 'Users searched');
    await delay(TEST_DELAY);

  } catch (error) {
    logError('USER', error);
  }
}

/**
 * 3. CONNECTIONS/SOCIAL
 */
async function testConnections() {
  log('CONNECTIONS', 'Testing connections/social endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Follow User 2
    log('CONNECTIONS', 'Following User 2');
    await user1Api.post(`/users/${user2Id}/follow`);
    logSuccess('CONNECTIONS', 'User followed');
    await delay(TEST_DELAY);

    // Get connections
    log('CONNECTIONS', 'Getting connections');
    await user1Api.get('/users/connections', {
      params: { type: 'following', page: 1, limit: 20 }
    });
    logSuccess('CONNECTIONS', 'Connections retrieved');
    await delay(TEST_DELAY);

    // Get followers
    log('CONNECTIONS', 'Getting followers');
    await user1Api.get('/users/connections', {
      params: { type: 'followers', page: 1, limit: 20 }
    });
    logSuccess('CONNECTIONS', 'Followers retrieved');
    await delay(TEST_DELAY);

    // Send follow request (for private accounts)
    try {
      log('CONNECTIONS', 'Sending follow request');
      await user1Api.post(`/connections/request/${user2Id}`);
      logSuccess('CONNECTIONS', 'Follow request sent');
      await delay(TEST_DELAY);
    } catch (error) {
      logError('CONNECTIONS', error);
    }

    // Get pending follow requests
    const user2Api = createApiClient(user2Token);
    try {
      log('CONNECTIONS', 'Getting pending follow requests');
      const requestsRes = await user2Api.get('/connections/requests');
      logSuccess('CONNECTIONS', 'Pending requests retrieved');
      
      // Approve first request
      if (requestsRes.data.requests && requestsRes.data.requests.length > 0) {
        const requestId = requestsRes.data.requests[0].id;
        log('CONNECTIONS', 'Approving follow request');
        await user2Api.post(`/connections/requests/${requestId}/approve`);
        logSuccess('CONNECTIONS', 'Follow request approved');
        await delay(TEST_DELAY);

        // Reject a second pending request if available
        if (requestsRes.data.requests.length > 1) {
          const rejectId = requestsRes.data.requests[1].id;
          log('CONNECTIONS', 'Rejecting another follow request');
          await user2Api.post(`/connections/requests/${rejectId}/reject`);
          logSuccess('CONNECTIONS', 'Follow request rejected');
          await delay(TEST_DELAY);
        }
      }
    } catch (error) {
      logError('CONNECTIONS', error);
    }

    // Block and unblock
    try {
      log('CONNECTIONS', 'Blocking User 2');
      await user1Api.post(`/connections/block/${user2Id}`);
      logSuccess('CONNECTIONS', 'User blocked');
      await delay(TEST_DELAY);

      log('CONNECTIONS', 'Getting blocked users');
      await user1Api.get('/connections/blocked');
      logSuccess('CONNECTIONS', 'Blocked users retrieved');
      await delay(TEST_DELAY);

      log('CONNECTIONS', 'Unblocking User 2');
      await user1Api.delete(`/connections/block/${user2Id}`);
      logSuccess('CONNECTIONS', 'User unblocked');
      await delay(TEST_DELAY);
    } catch (error) {
      logError('CONNECTIONS', error);
    }

  } catch (error) {
    logError('CONNECTIONS', error);
  }
}

/**
 * 4. POSTS AND INTERACTIONS
 */
async function testPosts() {
  log('POSTS', 'Testing posts endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Create a post
    log('POSTS', 'Creating a post');
    const createPostRes = await user1Api.post('/posts', {
      type: 'text',
      caption: 'My first test post! #fashion #style',
      visibility: 'public',
      tags: ['fashion', 'style'],
      location: 'Accra, Ghana'
    });
    testPostId = createPostRes.data.post?.id || createPostRes.data.id;
    logSuccess('POSTS', `Post created with ID: ${testPostId}`);
    await delay(TEST_DELAY);

    // Get feed
    log('POSTS', 'Getting feed');
    await user1Api.get('/posts/feed', {
      params: { page: 1, limit: 20 }
    });
    logSuccess('POSTS', 'Feed retrieved');
    await delay(TEST_DELAY);

    if (testPostId) {
      // Get single post
      log('POSTS', 'Getting single post');
      await user1Api.get(`/posts/${testPostId}`);
      logSuccess('POSTS', 'Single post retrieved');
      await delay(TEST_DELAY);

      // Like post
      log('POSTS', 'Liking post');
      await user1Api.post(`/posts/${testPostId}/like`);
      logSuccess('POSTS', 'Post liked');
      await delay(TEST_DELAY);

      // Comment on post
      log('POSTS', 'Commenting on post');
      const commentRes = await user1Api.post(`/posts/${testPostId}/comments`, {
        text: 'Great post! Love it!'
      });
      testCommentId = commentRes.data.comment?.id || commentRes.data.id;
      logSuccess('POSTS', 'Comment added');
      await delay(TEST_DELAY);

      // Get post comments
      log('POSTS', 'Getting post comments');
      await user1Api.get(`/posts/${testPostId}/comments`, {
        params: { page: 1, limit: 20 }
      });
      logSuccess('POSTS', 'Comments retrieved');
      await delay(TEST_DELAY);

      // Save post
      log('POSTS', 'Saving post');
      await user1Api.post(`/posts/${testPostId}/save`);
      logSuccess('POSTS', 'Post saved');
      await delay(TEST_DELAY);

      // Share post
      log('POSTS', 'Sharing post');
      await user1Api.post(`/posts/${testPostId}/share`);
      logSuccess('POSTS', 'Post shared');
      await delay(TEST_DELAY);

      // Report post
      log('POSTS', 'Reporting post');
      await user1Api.post(`/posts/${testPostId}/report`, { reason: 'Inappropriate content (test)' });
      logSuccess('POSTS', 'Post reported');
      await delay(TEST_DELAY);

      // Update post
      log('POSTS', 'Updating post');
      await user1Api.put(`/posts/${testPostId}`, {
        caption: 'Updated caption with more details!'
      });
      logSuccess('POSTS', 'Post updated');
      await delay(TEST_DELAY);
    }

    // Get trending posts
    log('POSTS', 'Getting trending posts');
    await user1Api.get('/posts/trending', {
      params: { page: 1, limit: 20, timeWindow: '24h' }
    });
    logSuccess('POSTS', 'Trending posts retrieved');
    await delay(TEST_DELAY);

    // Get post suggestions
    log('POSTS', 'Getting post suggestions');
    await user1Api.get('/posts/suggestions', {
      params: { limit: 10 }
    });
    logSuccess('POSTS', 'Post suggestions retrieved');
    await delay(TEST_DELAY);

    // Get user posts
    if (user1Id) {
      log('POSTS', 'Getting user posts');
      await user1Api.get(`/users/${user1Id}/posts`, {
        params: { page: 1, limit: 20 }
      });
      logSuccess('POSTS', 'User posts retrieved');
      await delay(TEST_DELAY);

      // Get user liked posts
      log('POSTS', 'Getting user liked posts');
      await user1Api.get(`/users/${user1Id}/liked-posts`, {
        params: { page: 1, limit: 20 }
      });
      logSuccess('POSTS', 'Liked posts retrieved');
      await delay(TEST_DELAY);

      // Get user saved posts
      log('POSTS', 'Getting user saved posts');
      await user1Api.get(`/users/${user1Id}/saved-posts`, {
        params: { page: 1, limit: 20 }
      });
      logSuccess('POSTS', 'Saved posts retrieved');
      await delay(TEST_DELAY);
    }

  } catch (error) {
    logError('POSTS', error);
  }
}

/**
 * 5. STORIES
 */
async function testStories() {
  log('STORIES', 'Testing stories endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Create story
    log('STORIES', 'Creating story');
    const storyRes = await user1Api.post('/stories', {
      type: 'text',
      text: 'Check out my latest outfit!',
      allowReplies: true,
      addToHighlights: false
    });
    testStoryId = storyRes.data.story?.id || storyRes.data.id;
    logSuccess('STORIES', 'Story created');
    await delay(TEST_DELAY);

    // Get stories feed
    log('STORIES', 'Getting stories feed');
    await user1Api.get('/stories');
    logSuccess('STORIES', 'Stories retrieved');
    await delay(TEST_DELAY);

  } catch (error) {
    logError('STORIES', error);
  }
}

/**
 * 6. CHAT/MESSAGING
 */
async function testChat() {
  log('CHAT', 'Testing chat/messaging endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Get chats
    log('CHAT', 'Getting chats');
    await user1Api.get('/chats');
    logSuccess('CHAT', 'Chats retrieved');
    await delay(TEST_DELAY);

    // Start new chat with User 2
    log('CHAT', 'Starting new chat');
    const chatRes = await user1Api.post('/chats', {
      participantId: user2Id,
      initialMessage: 'Hey! How are you?'
    });
    testChatId = chatRes.data.conversation?.id || chatRes.data.chat?.id;
    logSuccess('CHAT', `Chat created with ID: ${testChatId}`);
    await delay(TEST_DELAY);

    if (testChatId) {
      // Get single chat
      log('CHAT', 'Getting single chat');
      await user1Api.get(`/chats/${testChatId}`);
      logSuccess('CHAT', 'Single chat retrieved');
      await delay(TEST_DELAY);

      // Get messages
      log('CHAT', 'Getting messages');
      await user1Api.get(`/chats/${testChatId}/messages`, {
        params: { page: 1, limit: 50 }
      });
      logSuccess('CHAT', 'Messages retrieved');
      await delay(TEST_DELAY);

      // Send message
      log('CHAT', 'Sending message');
      await user1Api.post(`/chats/${testChatId}/messages`, {
        content: 'This is a test message',
        type: 'text'
      });
      logSuccess('CHAT', 'Message sent');
      await delay(TEST_DELAY);

      // Mark as read
      log('CHAT', 'Marking messages as read');
      await user1Api.patch(`/chats/${testChatId}/read`);
      logSuccess('CHAT', 'Messages marked as read');
      await delay(TEST_DELAY);
    }

  } catch (error) {
    logError('CHAT', error);
  }
}

/**
 * 7. EVENTS
 */
async function testEvents() {
  log('EVENTS', 'Testing events endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Create event
    log('EVENTS', 'Creating event');
    const eventRes = await user1Api.post('/events', {
      title: 'Fashion Week 2024',
      description: 'Annual fashion week showcasing student designs',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '18:00',
      location: 'Campus Auditorium',
      category: 'fashion',
      audience: 'all',
      maxAttendees: 200,
      tags: ['fashion', 'event', 'design']
    });
    testEventId = eventRes.data.event?.id || eventRes.data.id;
    logSuccess('EVENTS', `Event created with ID: ${testEventId}`);
    await delay(TEST_DELAY);

    // Get events
    log('EVENTS', 'Getting events');
    await user1Api.get('/events', {
      params: { page: 1, limit: 20 }
    });
    logSuccess('EVENTS', 'Events retrieved');
    await delay(TEST_DELAY);

    // Get events with filters
    log('EVENTS', 'Getting filtered events');
    await user1Api.get('/events', {
      params: { category: 'fashion', page: 1, limit: 20 }
    });
    logSuccess('EVENTS', 'Filtered events retrieved');
    await delay(TEST_DELAY);

    if (testEventId) {
      // Get single event
      log('EVENTS', 'Getting single event');
      await user1Api.get(`/events/${testEventId}`);
      logSuccess('EVENTS', 'Single event retrieved');
      await delay(TEST_DELAY);

      // Toggle attendance
      log('EVENTS', 'Toggling event attendance');
      await user1Api.post(`/events/${testEventId}/attend`);
      logSuccess('EVENTS', 'Attendance toggled');
      await delay(TEST_DELAY);

      // Get event attendees
      log('EVENTS', 'Getting event attendees');
      await user1Api.get(`/events/${testEventId}/attendees`, {
        params: { page: 1, limit: 20 }
      });
      logSuccess('EVENTS', 'Attendees retrieved');
      await delay(TEST_DELAY);

      // Update event
      log('EVENTS', 'Updating event');
      await user1Api.patch(`/events/${testEventId}`, {
        description: 'Updated description with more details!'
      });
      logSuccess('EVENTS', 'Event updated');
      await delay(TEST_DELAY);
    }

  } catch (error) {
    logError('EVENTS', error);
  }
}

/**
 * 8. STORE/MARKETPLACE
 */
async function testStore() {
  log('STORE', 'Testing store/marketplace endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Create store item
    log('STORE', 'Creating store item');
    const itemRes = await user1Api.post('/store/items', {
      name: 'Vintage Denim Jacket',
      description: 'Classic vintage denim jacket in excellent condition',
      price: 150,
      originalPrice: 200,
      category: 'Outerwear',
      condition: 'excellent',
      size: 'M',
      brand: 'Levis',
      color: 'Blue',
      images: ['https://example.com/jacket.jpg'],
      paymentMethods: ['momo', 'cash'],
      meetupLocation: 'Campus',
      sellerPhone: testUsers.user1.phone,
      negotiable: true
    });
    testStoreItemId = itemRes.data.item?.id || itemRes.data.id;
    logSuccess('STORE', `Store item created with ID: ${testStoreItemId}`);
    await delay(TEST_DELAY);

    // Get store items
    log('STORE', 'Getting store items');
    await user1Api.get('/store/items', {
      params: { page: 1, limit: 20 }
    });
    logSuccess('STORE', 'Store items retrieved');
    await delay(TEST_DELAY);

    // Get store items with filters
    log('STORE', 'Getting filtered store items');
    await user1Api.get('/store/items', {
      params: { 
        category: 'Outerwear', 
        minPrice: 50, 
        maxPrice: 300,
        page: 1, 
        limit: 20 
      }
    });
    logSuccess('STORE', 'Filtered items retrieved');
    await delay(TEST_DELAY);

    if (testStoreItemId) {
      // Get single store item
      log('STORE', 'Getting single store item');
      await user1Api.get(`/store/items/${testStoreItemId}`);
      logSuccess('STORE', 'Single item retrieved');
      await delay(TEST_DELAY);

      // Save/wishlist item
      log('STORE', 'Adding item to wishlist');
      await user1Api.post(`/items/${testStoreItemId}/save`);
      logSuccess('STORE', 'Item added to wishlist');
      await delay(TEST_DELAY);

      // Get wishlist
      log('STORE', 'Getting wishlist');
      await user1Api.get('/wishlist');
      logSuccess('STORE', 'Wishlist retrieved');
      await delay(TEST_DELAY);

      // Remove from wishlist (unsave)
      log('STORE', 'Removing item from wishlist');
      await user1Api.delete(`/items/${testStoreItemId}/save`);
      logSuccess('STORE', 'Item removed from wishlist');
      await delay(TEST_DELAY);

      // Report item
      log('STORE', 'Reporting item');
      await user1Api.post(`/store/items/${testStoreItemId}/report`, { reason: 'Fake item (test)' });
      logSuccess('STORE', 'Item reported');
      await delay(TEST_DELAY);

      // Add to cart
      log('STORE', 'Adding item to cart');
      const cartRes = await user1Api.post('/cart/items', {
        itemId: testStoreItemId,
        quantity: 1
      });
      testCartItemId = cartRes.data.cartItem?.id || cartRes.data.id;
      logSuccess('STORE', 'Item added to cart');
      await delay(TEST_DELAY);

      // Get cart
      log('STORE', 'Getting cart');
      await user1Api.get('/cart');
      logSuccess('STORE', 'Cart retrieved');
      await delay(TEST_DELAY);

      // Initialize payment (mock)
      try {
        log('STORE', 'Initializing payment');
        const initPayRes = await user1Api.post('/payment/initialize-checkout', {
          items: [{ productId: testStoreItemId, quantity: 1 }],
          deliveryMethod: 'campus',
          paymentMethod: 'cash',
          buyerPhone: testUsers.user1.phone
        });
        const reference = initPayRes.data.reference || initPayRes.data.data?.reference;
        logSuccess('STORE', 'Payment initialized');
        await delay(TEST_DELAY);

        if (reference) {
          log('STORE', 'Verifying payment');
          await user1Api.get(`/payment/verify/${reference}`);
          logSuccess('STORE', 'Payment verification attempted');
          await delay(TEST_DELAY);
        }
      } catch (error) {
        logError('STORE', error);
      }

      // Update cart item
      if (testCartItemId) {
        log('STORE', 'Updating cart item');
        await user1Api.patch(`/cart/items/${testCartItemId}`, {
          quantity: 2
        });
        logSuccess('STORE', 'Cart item updated');
        await delay(TEST_DELAY);
      }

      // Update store item
      log('STORE', 'Updating store item');
      await user1Api.put(`/store/items/${testStoreItemId}`, {
        price: 140,
        description: 'Updated description with new price!'
      });
      logSuccess('STORE', 'Store item updated');
      await delay(TEST_DELAY);
    }

  } catch (error) {
    logError('STORE', error);
  }
}

/**
 * 9. NOTIFICATIONS
 */
async function testNotifications() {
  log('NOTIFICATIONS', 'Testing notifications endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Get notifications
    log('NOTIFICATIONS', 'Getting notifications');
    const notifRes = await user1Api.get('/notifications', {
      params: { page: 1, limit: 20 }
    });
    logSuccess('NOTIFICATIONS', 'Notifications retrieved');
    await delay(TEST_DELAY);

    // Mark all as read
    log('NOTIFICATIONS', 'Marking all notifications as read');
    await user1Api.put('/notifications/read-all');
    logSuccess('NOTIFICATIONS', 'All notifications marked as read');
    await delay(TEST_DELAY);

    // Get notification preferences
    log('NOTIFICATIONS', 'Getting notification preferences');
    await user1Api.get('/notifications/preferences');
    logSuccess('NOTIFICATIONS', 'Notification preferences retrieved');
    await delay(TEST_DELAY);

    // Update notification preferences
    log('NOTIFICATIONS', 'Updating notification preferences');
    await user1Api.put('/notifications/preferences', {
      preferences: {
        pushEnabled: true,
        likes: true,
        comments: true,
        follows: true,
        mentions: true,
        messages: true,
        events: true,
        sales: true,
        marketing: false,
        soundEnabled: true,
        vibrationEnabled: true
      }
    });
    logSuccess('NOTIFICATIONS', 'Notification preferences updated');
    await delay(TEST_DELAY);

    // Mark single notification as read (if any exists)
    if (notifRes.data.notifications && notifRes.data.notifications.length > 0) {
      const notifId = notifRes.data.notifications[0].id;
      log('NOTIFICATIONS', 'Marking single notification as read');
      await user1Api.put(`/notifications/${notifId}/read`);
      logSuccess('NOTIFICATIONS', 'Notification marked as read');
      await delay(TEST_DELAY);
    }

  } catch (error) {
    logError('NOTIFICATIONS', error);
  }
}

/**
 * 10. SEARCH
 */
async function testSearch() {
  log('SEARCH', 'Testing search endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Search all
    log('SEARCH', 'Searching all categories');
    await user1Api.get('/search/advanced', {
      params: { 
        q: 'fashion', 
        type: 'all',
        page: 1,
        limit: 20 
      }
    });
    logSuccess('SEARCH', 'All categories searched');
    await delay(TEST_DELAY);

    // Search users
    log('SEARCH', 'Searching users');
    await user1Api.get('/search/advanced', {
      params: { 
        q: 'jane', 
        type: 'users',
        page: 1,
        limit: 20 
      }
    });
    logSuccess('SEARCH', 'Users searched');
    await delay(TEST_DELAY);

    // Search posts
    log('SEARCH', 'Searching posts');
    await user1Api.get('/search/advanced', {
      params: { 
        q: 'style', 
        type: 'posts',
        page: 1,
        limit: 20 
      }
    });
    logSuccess('SEARCH', 'Posts searched');
    await delay(TEST_DELAY);

    // Search items with filters
    log('SEARCH', 'Searching items with filters');
    await user1Api.get('/search/advanced', {
      params: { 
        q: 'jacket', 
        type: 'items',
        minPrice: 50,
        maxPrice: 200,
        condition: 'excellent',
        page: 1,
        limit: 20 
      }
    });
    logSuccess('SEARCH', 'Items searched with filters');
    await delay(TEST_DELAY);

    // Search events
    log('SEARCH', 'Searching events');
    await user1Api.get('/search/advanced', {
      params: { 
        q: 'fashion', 
        type: 'events',
        category: 'fashion',
        page: 1,
        limit: 20 
      }
    });
    logSuccess('SEARCH', 'Events searched');
    await delay(TEST_DELAY);

  } catch (error) {
    logError('SEARCH', error);
  }
}

/**
 * 11. FACULTIES
 */
async function testFaculties() {
  log('FACULTIES', 'Testing faculties endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Get all faculties
    log('FACULTIES', 'Getting all faculties');
    const facultiesRes = await user1Api.get('/faculties');
    logSuccess('FACULTIES', 'Faculties retrieved');
    await delay(TEST_DELAY);

    // Get faculty stats
    if (facultiesRes.data.faculties && facultiesRes.data.faculties.length > 0) {
      const facultyId = facultiesRes.data.faculties[0].id;
      log('FACULTIES', 'Getting faculty stats');
      await user1Api.get(`/faculties/${facultyId}/stats`);
      logSuccess('FACULTIES', 'Faculty stats retrieved');
      await delay(TEST_DELAY);

      // Get faculty posts
      log('FACULTIES', 'Getting faculty posts');
      await user1Api.get(`/posts/faculty/${facultyId}`, {
        params: { page: 1, limit: 20 }
      });
      logSuccess('FACULTIES', 'Faculty posts retrieved');
      await delay(TEST_DELAY);
    }

  } catch (error) {
    logError('FACULTIES', error);
  }
}

/**
 * 12. RANKINGS
 */
async function testRankings() {
  log('RANKINGS', 'Testing rankings endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Get weekly rankings
    log('RANKINGS', 'Getting weekly rankings');
    await user1Api.get('/rankings', {
      params: { period: 'weekly' }
    });
    logSuccess('RANKINGS', 'Weekly rankings retrieved');
    await delay(TEST_DELAY);

    // Get monthly rankings
    log('RANKINGS', 'Getting monthly rankings');
    await user1Api.get('/rankings', {
      params: { period: 'monthly' }
    });
    logSuccess('RANKINGS', 'Monthly rankings retrieved');
    await delay(TEST_DELAY);

    // Get all-time rankings
    log('RANKINGS', 'Getting all-time rankings');
    await user1Api.get('/rankings', {
      params: { period: 'all-time' }
    });
    logSuccess('RANKINGS', 'All-time rankings retrieved');
    await delay(TEST_DELAY);

  } catch (error) {
    logError('RANKINGS', error);
  }
}

/**
 * 13. SUBSCRIPTIONS
 */
async function testSubscriptions() {
  log('SUBSCRIPTIONS', 'Testing subscriptions endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Get subscription plans
    log('SUBSCRIPTIONS', 'Getting subscription plans');
    await user1Api.get('/subscriptions/plans');
    logSuccess('SUBSCRIPTIONS', 'Plans retrieved');
    await delay(TEST_DELAY);

    // Get subscription status
    log('SUBSCRIPTIONS', 'Getting subscription status');
    await user1Api.get('/subscriptions/status');
    logSuccess('SUBSCRIPTIONS', 'Status retrieved');
    await delay(TEST_DELAY);

    // Upgrade to premium
    log('SUBSCRIPTIONS', 'Upgrading to premium');
    await user1Api.post('/subscriptions/upgrade', {
      plan: 'weekly'
    });
    logSuccess('SUBSCRIPTIONS', 'Upgraded to premium');
    await delay(TEST_DELAY);

  } catch (error) {
    logError('SUBSCRIPTIONS', error);
  }
}

/**
 * 14. ANALYTICS
 */
async function testAnalytics() {
  log('ANALYTICS', 'Testing analytics endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Get user analytics
    log('ANALYTICS', 'Getting user analytics');
    await user1Api.get('/analytics/user', {
      params: { period: '30d' }
    });
    logSuccess('ANALYTICS', 'User analytics retrieved');
    await delay(TEST_DELAY);

    // Get store analytics (premium feature)
    try {
      log('ANALYTICS', 'Getting store analytics');
      await user1Api.get('/analytics/store', {
        params: { period: '30d' }
      });
      logSuccess('ANALYTICS', 'Store analytics retrieved');
      await delay(TEST_DELAY);
    } catch (error) {
      logError('ANALYTICS', error);
    }

    // Track analytics event
    log('ANALYTICS', 'Tracking analytics event');
    await user1Api.post('/analytics/track', {
      eventType: 'post_view',
      eventCategory: 'engagement',
      eventAction: 'view',
      eventLabel: 'test_post',
      eventValue: 1,
      metadata: { source: 'test_script' }
    });
    logSuccess('ANALYTICS', 'Analytics event tracked');
    await delay(TEST_DELAY);

  } catch (error) {
    logError('ANALYTICS', error);
  }
}

/**
 * 15. UPLOAD
 */
async function testUpload() {
  log('UPLOAD', 'Testing upload endpoints');
  const user1Api = createApiClient(user1Token);

  try {
    // Get upload URL
    log('UPLOAD', 'Getting upload URL');
    await user1Api.post('/upload/url', {
      fileName: 'test-image.jpg',
      fileType: 'image/jpeg'
    });
    logSuccess('UPLOAD', 'Upload URL retrieved');
    await delay(TEST_DELAY);

    // Multipart uploads (if form-data is available)
    if (FormDataLib) {
      // Upload image
      try {
        log('UPLOAD', 'Uploading image (multipart)');
        const form = new FormDataLib();
        form.append('image', getTinyPngBuffer(), { filename: 'tiny.png', contentType: 'image/png' });
        await axios.post(`${API_BASE_URL}/upload/image`, form, {
          headers: { ...form.getHeaders(), Authorization: `Bearer ${user1Token}` },
          timeout: 15000,
        });
        logSuccess('UPLOAD', 'Image uploaded');
        await delay(TEST_DELAY);
      } catch (error) {
        logError('UPLOAD', error);
      }

      // Upload avatar
      try {
        log('UPLOAD', 'Uploading avatar (multipart)');
        const formA = new FormDataLib();
        formA.append('avatar', getTinyPngBuffer(), { filename: 'avatar.png', contentType: 'image/png' });
        await axios.post(`${API_BASE_URL}/upload/avatar`, formA, {
          headers: { ...formA.getHeaders(), Authorization: `Bearer ${user1Token}` },
          timeout: 15000,
        });
        logSuccess('UPLOAD', 'Avatar uploaded');
        await delay(TEST_DELAY);
      } catch (error) {
        logError('UPLOAD', error);
      }
    } else {
      log('UPLOAD', 'form-data package not installed; skipping multipart upload tests');
    }

  } catch (error) {
    logError('UPLOAD', error);
  }
}

/**
 * 16. CLEANUP - Delete test data
 */
async function testCleanup() {
  log('CLEANUP', 'Cleaning up test data');
  const user1Api = createApiClient(user1Token);

  try {
    // Delete cart item
    if (testCartItemId) {
      log('CLEANUP', 'Deleting cart item');
      await user1Api.delete(`/cart/items/${testCartItemId}`);
      logSuccess('CLEANUP', 'Cart item deleted');
      await delay(TEST_DELAY);
    }

    // Delete store item
    if (testStoreItemId) {
      log('CLEANUP', 'Deleting store item');
      await user1Api.delete(`/store/items/${testStoreItemId}`);
      logSuccess('CLEANUP', 'Store item deleted');
      await delay(TEST_DELAY);
    }

    // Delete event
    if (testEventId) {
      log('CLEANUP', 'Deleting event');
      await user1Api.delete(`/events/${testEventId}`);
      logSuccess('CLEANUP', 'Event deleted');
      await delay(TEST_DELAY);
    }

    // Delete chat
    if (testChatId) {
      log('CLEANUP', 'Deleting chat');
      await user1Api.delete(`/chats/${testChatId}`);
      logSuccess('CLEANUP', 'Chat deleted');
      await delay(TEST_DELAY);
    }

    // Delete post
    if (testPostId) {
      log('CLEANUP', 'Deleting post');
      await user1Api.delete(`/posts/${testPostId}`);
      logSuccess('CLEANUP', 'Post deleted');
      await delay(TEST_DELAY);
    }

    // Unfollow user
    if (user2Id) {
      log('CLEANUP', 'Unfollowing user');
      await user1Api.delete(`/users/${user2Id}/follow`);
      logSuccess('CLEANUP', 'User unfollowed');
      await delay(TEST_DELAY);
    }

    // Unregister device token
    if (testDeviceToken) {
      log('CLEANUP', 'Unregistering device token');
      await user1Api.delete('/device-tokens', { data: { token: testDeviceToken } });
      logSuccess('CLEANUP', 'Device token unregistered');
      await delay(TEST_DELAY);
    }

    // Delete User 2 account
    if (user2Token) {
      const user2Api = createApiClient(user2Token);
      try {
        log('CLEANUP', 'Deleting User 2 account');
        await user2Api.delete('/users/account');
        logSuccess('CLEANUP', 'User 2 account deleted');
        await delay(TEST_DELAY);
      } catch (error) {
        logError('CLEANUP', error);
      }
    }

  } catch (error) {
    logError('CLEANUP', error);
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function runAllTests() {
  console.log('\n'.repeat(2));
  console.log('='.repeat(80));
  console.log('  RAVED MOBILE APP - COMPREHENSIVE API TEST SUITE');
  console.log('='.repeat(80));
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Test Delay: ${TEST_DELAY}ms between calls`);
  console.log('='.repeat(80));
  console.log('\n');

  const startTime = Date.now();

  try {
    // Run all test sections in order
    await testAuthentication();
    await testUserProfile();
    await testConnections();
    await testPosts();
    await testStories();
    await testChat();
    await testEvents();
    await testStore();
    await testNotifications();
    await testSearch();
    await testFaculties();
    await testRankings();
    await testSubscriptions();
    await testAnalytics();
    await testUpload();
    await testCleanup();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n');
    console.log('='.repeat(80));
    console.log('  TEST SUITE COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log(`Total Duration: ${duration} seconds`);
    console.log('='.repeat(80));
    console.log('\n');

  } catch (error) {
    console.error('\n');
    console.error('='.repeat(80));
    console.error('  TEST SUITE FAILED');
    console.error('='.repeat(80));
    console.error(error);
    console.error('='.repeat(80));
    console.error('\n');
    process.exit(1);
  }
}

// Execute tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testAuthentication,
  testUserProfile,
  testConnections,
  testPosts,
  testStories,
  testChat,
  testEvents,
  testStore,
  testNotifications,
  testSearch,
  testFaculties,
  testRankings,
  testSubscriptions,
  testAnalytics,
  testUpload,
  testCleanup
};
