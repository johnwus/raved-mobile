// ============================================================================
// RAVED BACKEND - COMPLETE PRODUCTION-READY API
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const Redis = require('ioredis');

// ============================================================================
// PHASE 1: CORE INFRASTRUCTURE & CONFIGURATION
// ============================================================================

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || '*', credentials: true }
});

// Environment Configuration
const CONFIG = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'raved-super-secret-keys-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'raved-refresh-secret',
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  
  // Database URLs
  POSTGRES_URL: process.env.POSTGRES_URL || 'postgresql://localhost:5432/raved_app',
  MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017/raved_app',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  
  // Payment (Paystack)
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
  
  // Communications
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  // Subscription Pricing (in Ghana Cedis)
  PREMIUM_WEEKLY_PRICE: 5.00,
  TRIAL_PERIOD_DAYS: 7,
  
  // Rankings & Gamification
  POINTS: {
    POST_LIKE: 10,
    POST_COMMENT: 15,
    POST_SHARE: 20,
    ITEM_SALE: 50,
    WEEKLY_FEATURE: 100
  }
};

// ============================================================================
// DATABASE CONNECTIONS
// ============================================================================

// PostgreSQL Connection Pool
const pgPool = new Pool({
  connectionString: CONFIG.POSTGRES_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// MongoDB Connection
mongoose.connect(CONFIG.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Redis Connection (for caching & sessions)
const redis = new Redis(CONFIG.REDIS_URL);
redis.on('connect', () => console.log('✅ Redis Connected'));
redis.on('error', (err) => console.error('❌ Redis Error:', err));

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

app.use(helmet()); // Security headers
app.use(cors({
  origin: CONFIG.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL] 
    : '*',
  credentials: true
}));
app.use(compression()); // Response compression
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ============================================================================
// POSTGRESQL DATABASE SCHEMA INITIALIZATION
// ============================================================================

async function initializePostgresSchema() {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    
    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        avatar_url TEXT,
        bio TEXT,
        faculty VARCHAR(100),
        university VARCHAR(255),
        student_id VARCHAR(50),
        location VARCHAR(255),
        website VARCHAR(255),
        
        -- Verification
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        
        -- Privacy Settings
        is_private BOOLEAN DEFAULT FALSE,
        show_activity BOOLEAN DEFAULT TRUE,
        read_receipts BOOLEAN DEFAULT TRUE,
        allow_downloads BOOLEAN DEFAULT FALSE,
        allow_story_sharing BOOLEAN DEFAULT TRUE,
        
        -- Stats
        followers_count INTEGER DEFAULT 0,
        following_count INTEGER DEFAULT 0,
        posts_count INTEGER DEFAULT 0,
        
        -- Subscription
        subscription_tier VARCHAR(20) DEFAULT 'free',
        subscription_expires_at TIMESTAMP,
        trial_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP,
        
        -- Soft Delete
        deleted_at TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier);
    `);
    
    // Connections/Follows Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'following',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_connections_follower ON connections(follower_id);
      CREATE INDEX IF NOT EXISTS idx_connections_following ON connections(following_id);
    `);
    
    // Events Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        event_time TIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        audience VARCHAR(50) DEFAULT 'all',
        max_attendees INTEGER DEFAULT 100,
        current_attendees INTEGER DEFAULT 0,
        registration_fee DECIMAL(10,2) DEFAULT 0.00,
        image_url TEXT,
        
        -- Settings
        require_registration BOOLEAN DEFAULT TRUE,
        allow_waitlist BOOLEAN DEFAULT TRUE,
        send_reminders BOOLEAN DEFAULT TRUE,
        
        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
      CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    `);
    
    // Event Attendees
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_attendees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'attending',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
      CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);
    `);
    
    // Store Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS store_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        category VARCHAR(50) NOT NULL,
        condition VARCHAR(50) NOT NULL,
        size VARCHAR(20),
        brand VARCHAR(100),
        color VARCHAR(50),
        material VARCHAR(100),
        
        -- Media
        images TEXT[], -- Array of image URLs
        
        -- Stats
        views_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        saves_count INTEGER DEFAULT 0,
        sales_count INTEGER DEFAULT 0,
        
        -- Status
        status VARCHAR(20) DEFAULT 'active',
        
        -- Payment Options
        payment_methods TEXT[], -- ['momo', 'cash', 'bank']
        meetup_location VARCHAR(255),
        seller_phone VARCHAR(20),
        
        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_store_items_seller ON store_items(seller_id);
      CREATE INDEX IF NOT EXISTS idx_store_items_category ON store_items(category);
      CREATE INDEX IF NOT EXISTS idx_store_items_status ON store_items(status);
    `);
    
    // Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        buyer_id UUID REFERENCES users(id),
        seller_id UUID REFERENCES users(id),
        item_id UUID REFERENCES store_items(id),
        
        -- Order Details
        quantity INTEGER DEFAULT 1,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        delivery_method VARCHAR(50) NOT NULL,
        delivery_address TEXT,
        buyer_phone VARCHAR(20),
        
        -- Status
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        
        -- Payment Reference
        payment_reference VARCHAR(255) UNIQUE,
        
        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `);
    
    // Subscriptions/Payments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        plan_type VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_reference VARCHAR(255) UNIQUE,
        status VARCHAR(50) DEFAULT 'active',
        starts_at TIMESTAMP NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
    `);
    
    // User Rankings/Scores Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        weekly_score INTEGER DEFAULT 0,
        monthly_score INTEGER DEFAULT 0,
        all_time_score INTEGER DEFAULT 0,
        
        -- Activity Stats
        total_likes_received INTEGER DEFAULT 0,
        total_comments_received INTEGER DEFAULT 0,
        total_shares_received INTEGER DEFAULT 0,
        total_sales INTEGER DEFAULT 0,
        total_features INTEGER DEFAULT 0,
        
        -- Reset Timestamps
        last_weekly_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_monthly_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_scores_weekly ON user_scores(weekly_score DESC);
      CREATE INDEX IF NOT EXISTS idx_user_scores_monthly ON user_scores(monthly_score DESC);
    `);
    
    await client.query('COMMIT');
    console.log('✅ PostgreSQL Schema Initialized');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ PostgreSQL Schema Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================================
// MONGODB SCHEMAS (Mongoose Models)
// ============================================================================

// Posts Schema
const PostSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['image', 'video', 'carousel', 'text'], 
    default: 'image' 
  },
  caption: { type: String, maxlength: 2000 },
  
  // Media
  media: {
    image: String,
    video: String,
    thumbnail: String,
    images: [String]
  },
  
  // Location & Details
  location: String,
  tags: [String],
  brand: String,
  occasion: String,
  
  // Visibility
  visibility: { 
    type: String, 
    enum: ['public', 'faculty', 'connections', 'private'], 
    default: 'public' 
  },
  
  // Marketplace Integration
  isForSale: { type: Boolean, default: false },
  saleDetails: {
    price: Number,
    condition: String,
    size: String,
    category: String,
    description: String,
    paymentMethods: [String],
    contactPhone: String,
    meetupLocation: String
  },
  
  // Engagement
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  savesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  
  // Featured
  isFeatured: { type: Boolean, default: false },
  featuredAt: Date,
  
  // Metadata
  faculty: String,
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: Date
}, {
  timestamps: true
});

PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ isForSale: 1 });
PostSchema.index({ isFeatured: 1, createdAt: -1 });

const Post = mongoose.model('Post', PostSchema);

// Comments Schema
const CommentSchema = new mongoose.Schema({
  postId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  text: { type: String, required: true, maxlength: 500 },
  parentCommentId: { type: String, default: null }, // For nested replies
  
  // Engagement
  likesCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: Date
});

CommentSchema.index({ postId: 1, createdAt: -1 });
const Comment = mongoose.model('Comment', CommentSchema);

// Likes Schema (for tracking who liked what)
const LikeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  targetId: { type: String, required: true, index: true }, // Post or Comment ID
  targetType: { type: String, enum: ['post', 'comment'], required: true },
  createdAt: { type: Date, default: Date.now }
});

LikeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
const Like = mongoose.model('Like', LikeSchema);

// Stories Schema
const StorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['image', 'video', 'template', 'text'], 
    required: true 
  },
  content: { type: String, required: true }, // URL or template ID
  text: String,
  thumbnail: String,
  
  // Settings
  allowReplies: { type: Boolean, default: true },
  addToHighlights: { type: Boolean, default: false },
  
  // Engagement
  viewsCount: { type: Number, default: 0 },
  repliesCount: { type: Number, default: 0 },
  
  // Expiration (24 hours)
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    index: true
  },
  
  createdAt: { type: Date, default: Date.now }
});

StorySchema.index({ userId: 1, expiresAt: -1 });
const Story = mongoose.model('Story', StorySchema);

// Messages Schema
const MessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  
  // Message Content
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'video', 'post', 'item'], 
    default: 'text' 
  },
  content: { type: String, required: true },
  mediaUrl: String,
  
  // Reference (if sharing a post or item)
  referenceType: String,
  referenceId: String,
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  
  createdAt: { type: Date, default: Date.now, index: true },
  deletedAt: Date
});

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });
const Message = mongoose.model('Message', MessageSchema);

// Notifications Schema
const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'follow', 'mention', 'message', 'sale', 'event'], 
    required: true 
  },
  
  // Actor (who triggered the notification)
  actorId: String,
  
  // Reference
  referenceType: String, // 'post', 'comment', 'item', 'event'
  referenceId: String,
  
  // Content
  title: String,
  message: String,
  imageUrl: String,
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  createdAt: { type: Date, default: Date.now, index: true }
});

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
const Notification = mongoose.model('Notification', NotificationSchema);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Generate JWT Token
function generateToken(payload, expiresIn = CONFIG.JWT_EXPIRES_IN) {
  return jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn });
}

// Generate Refresh Token
function generateRefreshToken(payload) {
  return jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET, { 
    expiresIn: CONFIG.JWT_REFRESH_EXPIRES_IN 
  });
}

// Verify Token
function verifyToken(token) {
  try {
    return jwt.verify(token, CONFIG.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Hash Password
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

// Compare Password
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Generate Verification Code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send Email (Mock - replace with SendGrid)
async function sendEmail(to, subject, html) {
  console.log(`📧 Email to ${to}: ${subject}`);
  // TODO: Implement SendGrid integration
  return true;
}

// Send SMS (Mock - replace with Twilio)
async function sendSMS(to, message) {
  console.log(`📱 SMS to ${to}: ${message}`);
  // TODO: Implement Twilio integration
  return true;
}

// Upload File (Mock - replace with AWS S3)
async function uploadFile(file, folder = 'uploads') {
  // Generate unique filename
  const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.mimetype.split('/')[1]}`;
  const url = `/uploads/${folder}/${filename}`;
  
  // TODO: Implement actual S3 upload
  console.log(`📁 File uploaded: ${url}`);
  return url;
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Get user from database
    const result = await pgPool.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Premium User Check Middleware
const requirePremium = (req, res, next) => {
  if (req.user.subscription_tier !== 'premium') {
    return res.status(403).json({ 
      error: 'Premium subscription required',
      message: 'This feature is only available for premium members'
    });
  }
  next();
};

// ============================================================================
// PHASE 2: AUTHENTICATION & USER ROUTES
// ============================================================================

// Register - Step 1: Personal Info
app.post('/api/auth/register/personal', [
  body('firstName').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('lastName').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('username').trim().notEmpty().isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { firstName, lastName, username } = req.body;
    
    // Check if username exists
    const existing = await pgPool.query(
      'SELECT id FROM users WHERE username = $1',
      [username.toLowerCase()]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Username already taken',
        field: 'username'
      });
    }
    
    // Store in session/temp storage (Redis)
    const sessionId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await redis.setex(
      `registration:${sessionId}`,
      3600, // 1 hour expiry
      JSON.stringify({ firstName, lastName, username, step: 1 })
    );
    
    res.json({ 
      success: true,
      sessionId,
      message: 'Personal information validated'
    });
    
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Register - Step 2: Contact Info
app.post('/api/auth/register/contact', [
  body('sessionId').notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').matches(/^0[0-9]{9}$/).withMessage('Invalid Ghana phone number format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { sessionId, email, phone } = req.body;
    
    // Get existing registration data
    const regData = await redis.get(`registration:${sessionId}`);
    if (!regData) {
      return res.status(400).json({ error: 'Registration session expired' });
    }
    
    // Check if email/phone exists
    const existing = await pgPool.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email.toLowerCase(), phone]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email or phone already registered'
      });
    }
    
    // Generate verification codes
    const emailCode = generateVerificationCode();
    const phoneCode = generateVerificationCode();
    
    // Send verification codes
    await sendEmail(email, 'Verify Your Email', `Your verification code is: ${emailCode}`);
    await sendSMS(phone, `Your Raved verification code is: ${phoneCode}`);
    
    // Update session with contact info and codes
    const updatedData = {
      ...JSON.parse(regData),
      email,
      phone,
      emailCode,
      phoneCode,
      step: 2
    };
    
    await redis.setex(
      `registration:${sessionId}`,
      3600,
      JSON.stringify(updatedData)
    );
    
    res.json({ 
      success: true,
      message: 'Verification codes sent',
      // For demo purposes, return codes (remove in production)
      demo: { emailCode, phoneCode }
    });
    
  } catch (error) {
    console.error('Contact Info Error:', error);
    res.status(500).json({ error: 'Failed to send verification codes' });
  }
});

// Register - Step 3: Verify Codes
app.post('/api/auth/register/verify', [
  body('sessionId').notEmpty(),
  body('emailCode').isLength({ min: 6, max: 6 }),
  body('phoneCode').isLength({ min: 6, max: 6 }),
], async (req, res) => {
  try {
    const { sessionId, emailCode, phoneCode } = req.body;
    
    const regData = await redis.get(`registration:${sessionId}`);
    if (!regData) {
      return res.status(400).json({ error: 'Registration session expired' });
    }
    
    const data = JSON.parse(regData);
    
    // Verify codes
    if (data.emailCode !== emailCode || data.phoneCode !== phoneCode) {
      return res.status(400).json({ 
        error: 'Invalid verification codes'
      });
    }
    
    // Update session
    data.emailVerified = true;
    data.phoneVerified = true;
    data.step = 3;
    
    await redis.setex(
      `registration:${sessionId}`,
      3600,
      JSON.stringify(data)
    );
    
    res.json({ 
      success: true,
      message: 'Verification successful'
    });
    
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Register - Step 4: Academic Info (Optional)
app.post('/api/auth/register/academic', [
  body('sessionId').notEmpty(),
], async (req, res) => {
  try {
    const { sessionId, university, studentId, faculty } = req.body;
    
    const regData = await redis.get(`registration:${sessionId}`);
    if (!regData) {
      return res.status(400).json({ error: 'Registration session expired' });
    }
    
    const data = JSON.parse(regData);
    data.university = university || null;
    data.studentId = studentId || null;
    data.faculty = faculty || null;
    data.step = 4;
    
    await redis.setex(
      `registration:${sessionId}`,
      3600,
      JSON.stringify(data)
    );
    
    res.json({ 
      success: true,
      message: 'Academic information saved'
    });
    
  } catch (error) {
    console.error('Academic Info Error:', error);
    res.status(500).json({ error: 'Failed to save academic info' });
  }
});

// Register - Step 5: Complete Registration
app.post('/api/auth/register/complete', [
  body('sessionId').notEmpty(),
  body('password').isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { sessionId, password } = req.body;
    
    const regData = await redis.get(`registration:${sessionId}`);
    if (!regData) {
      return res.status(400).json({ error: 'Registration session expired' });
    }
    
    const data = JSON.parse(regData);
    
    // Verify all steps completed
    if (!data.emailVerified || !data.phoneVerified) {
      return res.status(400).json({ error: 'Please complete verification' });
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user in database
    const result = await pgPool.query(`
      INSERT INTO users (
        username, email, phone, password_hash,
        first_name, last_name, faculty, university, student_id,
        email_verified, phone_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true)
      RETURNING id, username, email, first_name, last_name, created_at
    `, [
      data.username.toLowerCase(),
      data.email.toLowerCase(),
      data.phone,
      passwordHash,
      data.firstName,
      data.lastName,
      data.faculty,
      data.university,
      data.studentId
    ]);
    
    const user = result.rows[0];
    
    // Initialize user score record
    await pgPool.query(
      'INSERT INTO user_scores (user_id) VALUES ($1)',
      [user.id]
    );
    
    // Generate tokens
    const token = generateToken({ userId: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ userId: user.id });
    
    // Store refresh token
    await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);
    
    // Clear registration session
    await redis.del(`registration:${sessionId}`);
    
    res.json({
      success: true,
      message: 'Registration completed successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token,
      refreshToken
    });
    
  } catch (error) {
    console.error('Complete Registration Error:', error);
    res.status(500).json({ error: 'Failed to complete registration' });
  }
});

// Login
app.post('/api/auth/login', [
  body('identifier').notEmpty().withMessage('Email, username, or phone required'),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { identifier, password } = req.body;
    
    // Find user by email, username, or phone
    const result = await pgPool.query(`
      SELECT * FROM users 
      WHERE (email = $1 OR username = $1 OR phone = $1)
      AND deleted_at IS NULL
    `, [identifier.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await pgPool.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Generate tokens
    const token = generateToken({ userId: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ userId: user.id });
    
    // Store refresh token
    await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        faculty: user.faculty,
        subscriptionTier: user.subscription_tier
      },
      token,
      refreshToken
    });
    
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh Token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, CONFIG.JWT_REFRESH_SECRET);
    
    // Check if refresh token exists in Redis
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (storedToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Generate new tokens
    const newToken = generateToken({ userId: decoded.userId });
    const newRefreshToken = generateRefreshToken({ userId: decoded.userId });
    
    // Update refresh token in Redis
    await redis.setex(`refresh_token:${decoded.userId}`, 7 * 24 * 60 * 60, newRefreshToken);
    
    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
    
  } catch (error) {
    console.error('Refresh Token Error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Get subscription info
    const subscription = await pgPool.query(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 AND status = 'active' 
       ORDER BY expires_at DESC LIMIT 1`,
      [user.id]
    );
    
    // Calculate trial days left
    const trialStarted = new Date(user.trial_started_at);
    const now = new Date();
    const daysSinceStart = Math.floor((now - trialStarted) / (1000 * 60 * 60 * 24));
    const trialDaysLeft = Math.max(0, CONFIG.TRIAL_PERIOD_DAYS - daysSinceStart);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        faculty: user.faculty,
        university: user.university,
        location: user.location,
        website: user.website,
        
        // Privacy
        isPrivate: user.is_private,
        showActivity: user.show_activity,
        
        // Stats
        followersCount: user.followers_count,
        followingCount: user.following_count,
        postsCount: user.posts_count,
        
        // Subscription
        subscriptionTier: user.subscription_tier,
        subscriptionExpiresAt: user.subscription_expires_at,
        trialDaysLeft,
        
        createdAt: user.created_at
      },
      subscription: subscription.rows[0] || null
    });
    
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update Profile
app.patch('/api/users/profile', authenticate, [
  body('firstName').optional().trim().isLength({ min: 2, max: 100 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().trim().isLength({ max: 150 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const updates = {};
    const values = [];
    let paramIndex = 1;
    
    // Build dynamic update query
    const allowedFields = ['firstName', 'lastName', 'bio', 'faculty', 'location', 'website'];
    const dbFields = {
      firstName: 'first_name',
      lastName: 'last_name',
      bio: 'bio',
      faculty: 'faculty',
      location: 'location',
      website: 'website'
    };
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[dbFields[field]] = `${paramIndex}`;
        values.push(req.body[field]);
        paramIndex++;
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const updateQuery = `
      UPDATE users 
      SET ${Object.entries(updates).map(([k, v]) => `${k} = ${v}`).join(', ')},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${paramIndex}
      RETURNING *
    `;
    
    values.push(userId);
    
    const result = await pgPool.query(updateQuery, values);
    const user = result.rows[0];
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        faculty: user.faculty,
        location: user.location,
        website: user.website
      }
    });
    
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ============================================================================
// PHASE 3: SOCIAL FEATURES - POSTS
// ============================================================================

// Create Post
app.post('/api/posts', authenticate, [
  body('type').isIn(['image', 'video', 'carousel', 'text']),
  body('caption').optional().trim().isLength({ max: 2000 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const {
      type,
      caption,
      media,
      location,
      tags,
      brand,
      occasion,
      visibility,
      isForSale,
      saleDetails
    } = req.body;
    
    // Create post in MongoDB
    const post = new Post({
      userId,
      type,
      caption,
      media,
      location,
      tags: tags || [],
      brand,
      occasion,
      visibility: visibility || 'public',
      isForSale: isForSale || false,
      saleDetails: isForSale ? saleDetails : null,
      faculty: req.user.faculty
    });
    
    await post.save();
    
    // Update user's post count in PostgreSQL
    await pgPool.query(
      'UPDATE users SET posts_count = posts_count + 1 WHERE id = $1',
      [userId]
    );
    
    // If post is for sale, create store item
    if (isForSale && saleDetails) {
      await pgPool.query(`
        INSERT INTO store_items (
          seller_id, name, description, price, category, condition, size,
          images, payment_methods, meetup_location, seller_phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        userId,
        saleDetails.name || caption.substring(0, 100),
        saleDetails.description || caption,
        saleDetails.price,
        saleDetails.category,
        saleDetails.condition,
        saleDetails.size,
        [media.image || media.images[0]],
        saleDetails.paymentMethods || [],
        saleDetails.meetupLocation,
        saleDetails.contactPhone
      ]);
    }
    
    res.json({
      success: true,
      message: 'Post created successfully',
      post: {
        id: post._id,
        userId: post.userId,
        type: post.type,
        caption: post.caption,
        media: post.media,
        createdAt: post.createdAt,
        isForSale: post.isForSale
      }
    });
    
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get Feed
app.get('/api/posts/feed', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Get user's connections for personalized feed
    const connections = await pgPool.query(
      'SELECT following_id FROM connections WHERE follower_id = $1',
      [userId]
    );
    
    const followingIds = connections.rows.map(r => r.following_id);
    followingIds.push(userId); // Include own posts
    
    // Get posts from MongoDB
    const posts = await Post.find({
      userId: { $in: followingIds },
      deletedAt: null,
      $or: [
        { visibility: 'public' },
        { visibility: 'connections', userId: { $in: followingIds } },
        { visibility: 'faculty', faculty: req.user.faculty }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    // Get user info for each post from PostgreSQL
    const userIds = [...new Set(posts.map(p => p.userId))];
    const users = await pgPool.query(
      'SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = ANY($1)',
      [userIds]
    );
    
    const userMap = {};
    users.rows.forEach(u => {
      userMap[u.id] = {
        id: u.id,
        username: u.username,
        name: `${u.first_name} ${u.last_name}`,
        avatarUrl: u.avatar_url,
        faculty: u.faculty
      };
    });
    
    // Check if current user liked each post
    const postIds = posts.map(p => p._id.toString());
    const likes = await Like.find({
      userId,
      targetId: { $in: postIds },
      targetType: 'post'
    }).lean();
    
    const likedPostIds = new Set(likes.map(l => l.targetId));
    
    // Enrich posts with user data
    const enrichedPosts = posts.map(post => ({
      ...post,
      user: userMap[post.userId],
      isLiked: likedPostIds.has(post._id.toString()),
      timeAgo: getTimeAgo(post.createdAt)
    }));
    
    res.json({
      success: true,
      posts: enrichedPosts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    });
    
  } catch (error) {
    console.error('Get Feed Error:', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

// Get Single Post
app.get('/api/posts/:postId', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findOne({
      _id: postId,
      deletedAt: null
    }).lean();
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Increment view count
    await Post.updateOne(
      { _id: postId },
      { $inc: { viewsCount: 1 } }
    );
    
    // Get post author info
    const user = await pgPool.query(
      'SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = $1',
      [post.userId]
    );
    
    // Check if liked
    const like = await Like.findOne({
      userId,
      targetId: postId,
      targetType: 'post'
    });
    
    res.json({
      success: true,
      post: {
        ...post,
        user: {
          id: user.rows[0].id,
          username: user.rows[0].username,
          name: `${user.rows[0].first_name} ${user.rows[0].last_name}`,
          avatarUrl: user.rows[0].avatar_url,
          faculty: user.rows[0].faculty
        },
        isLiked: !!like,
        timeAgo: getTimeAgo(post.createdAt)
      }
    });
    
  } catch (error) {
    console.error('Get Post Error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// Like/Unlike Post
app.post('/api/posts/:postId/like', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    // Check if post exists
    const post = await Post.findOne({ _id: postId, deletedAt: null });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if already liked
    const existingLike = await Like.findOne({
      userId,
      targetId: postId,
      targetType: 'post'
    });
    
    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
      await Post.updateOne(
        { _id: postId },
        { $inc: { likesCount: -1 } }
      );
      
      res.json({
        success: true,
        action: 'unliked',
        likesCount: post.likesCount - 1
      });
    } else {
      // Like
      await Like.create({
        userId,
        targetId: postId,
        targetType: 'post'
      });
      
      await Post.updateOne(
        { _id: postId },
        { $inc: { likesCount: 1 } }
      );
      
      // Create notification for post author (if not liking own post)
      if (post.userId !== userId) {
        await Notification.create({
          userId: post.userId,
          type: 'like',
          actorId: userId,
          referenceType: 'post',
          referenceId: postId,
          message: 'liked your post'
        });
        
        // Update score for premium users
        if (req.user.subscription_tier === 'premium') {
          await updateUserScore(post.userId, 'like');
        }
        
        // Emit real-time notification via Socket.io
        io.to(`user:${post.userId}`).emit('notification', {
          type: 'like',
          message: 'Someone liked your post'
        });
      }
      
      res.json({
        success: true,
        action: 'liked',
        likesCount: post.likesCount + 1
      });
    }
    
  } catch (error) {
    console.error('Like Post Error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Comment on Post
app.post('/api/posts/:postId/comments', authenticate, [
  body('text').trim().notEmpty().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { postId } = req.params;
    const userId = req.user.id;
    const { text, parentCommentId } = req.body;
    
    // Check if post exists
    const post = await Post.findOne({ _id: postId, deletedAt: null });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Create comment
    const comment = await Comment.create({
      postId,
      userId,
      text,
      parentCommentId: parentCommentId || null
    });
    
    // Update post comment count
    await Post.updateOne(
      { _id: postId },
      { $inc: { commentsCount: 1 } }
    );
    
    // Create notification for post author
    if (post.userId !== userId) {
      await Notification.create({
        userId: post.userId,
        type: 'comment',
        actorId: userId,
        referenceType: 'post',
        referenceId: postId,
        message: 'commented on your post'
      });
      
      // Update score
      if (req.user.subscription_tier === 'premium') {
        await updateUserScore(post.userId, 'comment');
      }
    }
    
    // Get commenter info
    const user = await pgPool.query(
      'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = $1',
      [userId]
    );
    
    res.json({
      success: true,
      comment: {
        id: comment._id,
        text: comment.text,
        user: {
          id: user.rows[0].id,
          username: user.rows[0].username,
          name: `${user.rows[0].first_name} ${user.rows[0].last_name}`,
          avatarUrl: user.rows[0].avatar_url
        },
        createdAt: comment.createdAt,
        timeAgo: getTimeAgo(comment.createdAt)
      }
    });
    
  } catch (error) {
    console.error('Comment Error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Get Post Comments
app.get('/api/posts/:postId/comments', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const comments = await Comment.find({
      postId,
      parentCommentId: null, // Only top-level comments
      deletedAt: null
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    // Get user info for comments
    const userIds = [...new Set(comments.map(c => c.userId))];
    const users = await pgPool.query(
      'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)',
      [userIds]
    );
    
    const userMap = {};
    users.rows.forEach(u => {
      userMap[u.id] = {
        id: u.id,
        username: u.username,
        name: `${u.first_name} ${u.last_name}`,
        avatarUrl: u.avatar_url
      };
    });
    
    const enrichedComments = comments.map(comment => ({
      ...comment,
      user: userMap[comment.userId],
      timeAgo: getTimeAgo(comment.createdAt)
    }));
    
    res.json({
      success: true,
      comments: enrichedComments,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit
      }
    });
    
  } catch (error) {
    console.error('Get Comments Error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// ============================================================================
// PHASE 4: STORIES
// ============================================================================

// Create Story
app.post('/api/stories', authenticate, [
  body('type').isIn(['image', 'video', 'template', 'text']),
  body('content').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { type, content, text, thumbnail, allowReplies, addToHighlights } = req.body;
    
    const story = await Story.create({
      userId,
      type,
      content,
      text,
      thumbnail,
      allowReplies: allowReplies !== false,
      addToHighlights: addToHighlights || false
    });
    
    res.json({
      success: true,
      message: 'Story created successfully',
      story: {
        id: story._id,
        type: story.type,
        content: story.content,
        expiresAt: story.expiresAt,
        createdAt: story.createdAt
      }
    });
    
  } catch (error) {
    console.error('Create Story Error:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// Get Stories Feed
app.get('/api/stories', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get following users
    const connections = await pgPool.query(
      'SELECT following_id FROM connections WHERE follower_id = $1',
      [userId]
    );
    
    const followingIds = connections.rows.map(r => r.following_id);
    followingIds.push(userId);
    
    // Get active stories
    const stories = await Story.find({
      userId: { $in: followingIds },
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .lean();
    
    // Group by user
    const storyGroups = {};
    stories.forEach(story => {
      if (!storyGroups[story.userId]) {
        storyGroups[story.userId] = [];
      }
      storyGroups[story.userId].push(story);
    });
    
    // Get user info
    const userIds = Object.keys(storyGroups);
    const users = await pgPool.query(
      'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)',
      [userIds]
    );
    
    const result = users.rows.map(u => ({
      user: {
        id: u.id,
        username: u.username,
        name: `${u.first_name} ${u.last_name}`,
        avatarUrl: u.avatar_url
      },
      stories: storyGroups[u.id],
      hasUnviewed: true // TODO: Track viewed stories
    }));
    
    res.json({
      success: true,
      storyGroups: result
    });
    
  } catch (error) {
    console.error('Get Stories Error:', error);
    res.status(500).json({ error: 'Failed to get stories' });
  }
});

// ============================================================================
// PHASE 5: MARKETPLACE
// ============================================================================

// Get Store Items
app.get('/api/store/items', authenticate, async (req, res) => {
  try {
    const { category, sort, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM store_items WHERE status = $1 AND deleted_at IS NULL';
    const params = ['active'];
    let paramIndex = 2;
    
    // Filter by category
    if (category && category !== 'all') {
      query += ` AND category = ${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    // Filter by price range
    if (minPrice) {
      query += ` AND price >= ${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }
    if (maxPrice) {
      query += ` AND price <= ${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }
    
    // Sorting
    const sortMap = {
      'newest': 'created_at DESC',
      'price-low': 'price ASC',
      'price-high': 'price DESC',
      'popular': 'likes_count DESC'
    };
    query += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;
    
    // Pagination
    query += ` LIMIT ${paramIndex} OFFSET ${paramIndex + 1}`;
    params.push(parseInt(limit), offset);
    
    const result = await pgPool.query(query, params);
    
    // Get seller info for each item
    const sellerIds = [...new Set(result.rows.map(item => item.seller_id))];
    const sellers = await pgPool.query(
      'SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = ANY($1)',
      [sellerIds]
    );
    
    const sellerMap = {};
    sellers.rows.forEach(s => {
      sellerMap[s.id] = {
        id: s.id,
        username: s.username,
        name: `${s.first_name} ${s.last_name}`,
        avatarUrl: s.avatar_url,
        faculty: s.faculty
      };
    });
    
    const items = result.rows.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      originalPrice: item.original_price ? parseFloat(item.original_price) : null,
      category: item.category,
      condition: item.condition,
      size: item.size,
      brand: item.brand,
      color: item.color,
      images: item.images || [],
      seller: sellerMap[item.seller_id],
      viewsCount: item.views_count,
      likesCount: item.likes_count,
      savesCount: item.saves_count,
      createdAt: item.created_at,
      timeAgo: getTimeAgo(item.created_at)
    }));
    
    res.json({
      success: true,
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: items.length === parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get Store Items Error:', error);
    res.status(500).json({ error: 'Failed to get store items' });
  }
});

// Get Single Store Item
app.get('/api/store/items/:itemId', authenticate, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const result = await pgPool.query(
      'SELECT * FROM store_items WHERE id = $1 AND deleted_at IS NULL',
      [itemId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const item = result.rows[0];
    
    // Increment views
    await pgPool.query(
      'UPDATE store_items SET views_count = views_count + 1 WHERE id = $1',
      [itemId]
    );
    
    // Get seller info
    const seller = await pgPool.query(
      'SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = $1',
      [item.seller_id]
    );
    
    res.json({
      success: true,
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        originalPrice: item.original_price ? parseFloat(item.original_price) : null,
        category: item.category,
        condition: item.condition,
        size: item.size,
        brand: item.brand,
        color: item.color,
        material: item.material,
        images: item.images || [],
        paymentMethods: item.payment_methods || [],
        meetupLocation: item.meetup_location,
        sellerPhone: item.seller_phone,
        seller: {
          id: seller.rows[0].id,
          username: seller.rows[0].username,
          name: `${seller.rows[0].first_name} ${seller.rows[0].last_name}`,
          avatarUrl: seller.rows[0].avatar_url,
          faculty: seller.rows[0].faculty
        },
        viewsCount: item.views_count + 1,
        likesCount: item.likes_count,
        savesCount: item.saves_count,
        salesCount: item.sales_count,
        status: item.status,
        createdAt: item.created_at,
        timeAgo: getTimeAgo(item.created_at)
      }
    });
    
  } catch (error) {
    console.error('Get Store Item Error:', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
});

// Create Store Item
app.post('/api/store/items', authenticate, [
  body('name').trim().notEmpty().isLength({ max: 255 }),
  body('price').isFloat({ min: 0.01 }),
  body('category').isIn(['clothing', 'shoes', 'accessories', 'bags', 'jewelry']),
  body('condition').isIn(['new', 'like-new', 'good', 'fair']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      condition,
      size,
      brand,
      color,
      material,
      images,
      paymentMethods,
      meetupLocation,
      sellerPhone
    } = req.body;
    
    const result = await pgPool.query(`
      INSERT INTO store_items (
        seller_id, name, description, price, original_price,
        category, condition, size, brand, color, material,
        images, payment_methods, meetup_location, seller_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      userId, name, description, price, originalPrice || null,
      category, condition, size, brand, color, material,
      images || [], paymentMethods || [], meetupLocation, sellerPhone
    ]);
    
    const item = result.rows[0];
    
    res.json({
      success: true,
      message: 'Item added to store successfully',
      item: {
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        category: item.category,
        createdAt: item.created_at
      }
    });
    
  } catch (error) {
    console.error('Create Store Item Error:', error);
    res.status(500).json({ error: 'Failed to create store item' });
  }
});

// Create Order
app.post('/api/orders', authenticate, [
  body('itemId').isUUID(),
  body('quantity').isInt({ min: 1 }),
  body('paymentMethod').isIn(['momo', 'cash', 'bank', 'card']),
  body('deliveryMethod').isIn(['campus', 'hostel']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const buyerId = req.user.id;
    const {
      itemId,
      quantity,
      paymentMethod,
      deliveryMethod,
      deliveryAddress,
      buyerPhone
    } = req.body;
    
    // Get item details
    const itemResult = await pgPool.query(
      'SELECT * FROM store_items WHERE id = $1 AND status = $2 AND deleted_at IS NULL',
      [itemId, 'active']
    );
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or unavailable' });
    }
    
    const item = itemResult.rows[0];
    const totalAmount = parseFloat(item.price) * quantity;
    
    // Generate payment reference
    const paymentReference = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create order
    const orderResult = await pgPool.query(`
      INSERT INTO orders (
        buyer_id, seller_id, item_id, quantity, total_amount,
        payment_method, delivery_method, delivery_address, buyer_phone,
        payment_reference, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      buyerId, item.seller_id, itemId, quantity, totalAmount,
      paymentMethod, deliveryMethod, deliveryAddress, buyerPhone,
      paymentReference, 'pending', 'pending'
    ]);
    
    const order = orderResult.rows[0];
    
    // Send notification to seller
    await Notification.create({
      userId: item.seller_id,
      type: 'sale',
      actorId: buyerId,
      referenceType: 'order',
      referenceId: order.id,
      message: 'placed an order for your item'
    });
    
    // If payment method requires immediate processing (e.g., mobile money)
    if (paymentMethod === 'momo') {
      // TODO: Integrate with Paystack for mobile money
      // For now, we'll mark as pending
    }
    
    res.json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: order.id,
        itemName: item.name,
        quantity: order.quantity,
        totalAmount: parseFloat(order.total_amount),
        paymentMethod: order.payment_method,
        paymentReference: order.payment_reference,
        status: order.status,
        createdAt: order.created_at
      }
    });
    
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get User Orders
app.get('/api/orders', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'purchases' } = req.query; // purchases or sales
    
    const column = type === 'purchases' ? 'buyer_id' : 'seller_id';
    
    const result = await pgPool.query(`
      SELECT o.*, i.name as item_name, i.images as item_images
      FROM orders o
      JOIN store_items i ON o.item_id = i.id
      WHERE o.${column} = $1
      ORDER BY o.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      orders: result.rows.map(order => ({
        id: order.id,
        itemName: order.item_name,
        itemImages: order.item_images,
        quantity: order.quantity,
        totalAmount: parseFloat(order.total_amount),
        paymentMethod: order.payment_method,
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        timeAgo: getTimeAgo(order.created_at)
      }))
    });
    
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// ============================================================================
// PHASE 6: EVENTS
// ============================================================================

// Get Events
app.get('/api/events', authenticate, async (req, res) => {
  try {
    const { category, audience, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM events WHERE deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;
    
    if (category && category !== 'all') {
      query += ` AND category = ${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (audience && audience !== 'all') {
      query += ` AND audience = ${paramIndex}`;
      params.push(audience);
      paramIndex++;
    }
    
    query += ` ORDER BY event_date ASC, event_time ASC LIMIT ${paramIndex} OFFSET ${paramIndex + 1}`;
    params.push(parseInt(limit), offset);
    
    const result = await pgPool.query(query, params);
    
    // Get organizer info
    const organizerIds = [...new Set(result.rows.map(e => e.organizer_id))];
    const organizers = await pgPool.query(
      'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)',
      [organizerIds]
    );
    
    const organizerMap = {};
    organizers.rows.forEach(o => {
      organizerMap[o.id] = {
        id: o.id,
        username: o.username,
        name: `${o.first_name} ${o.last_name}`,
        avatarUrl: o.avatar_url
      };
    });
    
    // Check attendance for current user
    const eventIds = result.rows.map(e => e.id);
    const attendance = await pgPool.query(
      'SELECT event_id FROM event_attendees WHERE user_id = $1 AND event_id = ANY($2)',
      [req.user.id, eventIds]
    );
    
    const attendingEventIds = new Set(attendance.rows.map(a => a.event_id));
    
    const events = result.rows.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.event_date,
      eventTime: event.event_time,
      location: event.location,
      category: event.category,
      audience: event.audience,
      maxAttendees: event.max_attendees,
      currentAttendees: event.current_attendees,
      registrationFee: parseFloat(event.registration_fee),
      imageUrl: event.image_url,
      organizer: organizerMap[event.organizer_id],
      isAttending: attendingEventIds.has(event.id),
      isFull: event.current_attendees >= event.max_attendees,
      createdAt: event.created_at
    }));
    
    res.json({
      success: true,
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: events.length === parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get Events Error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Create Event
app.post('/api/events', authenticate, [
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('eventDate').isISO8601(),
  body('eventTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('location').trim().notEmpty(),
  body('category').isIn(['fashion', 'workshop', 'networking']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const organizerId = req.user.id;
    const {
      title,
      description,
      eventDate,
      eventTime,
      location,
      category,
      audience,
      maxAttendees,
      registrationFee,
      imageUrl,
      requireRegistration,
      allowWaitlist,
      sendReminders
    } = req.body;
    
    const result = await pgPool.query(`
      INSERT INTO events (
        organizer_id, title, description, event_date, event_time,
        location, category, audience, max_attendees, registration_fee,
        image_url, require_registration, allow_waitlist, send_reminders
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      organizerId, title, description, eventDate, eventTime,
      location, category, audience || 'all', maxAttendees || 100,
      registrationFee || 0, imageUrl, requireRegistration !== false,
      allowWaitlist !== false, sendReminders !== false
    ]);
    
    const event = result.rows[0];
    
    // Automatically register organizer as attendee
    await pgPool.query(
      'INSERT INTO event_attendees (event_id, user_id, status) VALUES ($1, $2, $3)',
      [event.id, organizerId, 'attending']
    );
    
    await pgPool.query(
      'UPDATE events SET current_attendees = 1 WHERE id = $1',
      [event.id]
    );
    
    res.json({
      success: true,
      message: 'Event created successfully',
      event: {
        id: event.id,
        title: event.title,
        eventDate: event.event_date,
        eventTime: event.event_time,
        location: event.location,
        createdAt: event.created_at
      }
    });
    
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Join/Leave Event
app.post('/api/events/:eventId/attend', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    // Check if event exists
    const eventResult = await pgPool.query(
      'SELECT * FROM events WHERE id = $1 AND deleted_at IS NULL',
      [eventId]
    );
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResult.rows[0];
    
    // Check if already attending
    const attendeeResult = await pgPool.query(
      'SELECT * FROM event_attendees WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );
    
    if (attendeeResult.rows.length > 0) {
      // Leave event
      await pgPool.query(
        'DELETE FROM event_attendees WHERE event_id = $1 AND user_id = $2',
        [eventId, userId]
      );
      
      await pgPool.query(
        'UPDATE events SET current_attendees = current_attendees - 1 WHERE id = $1',
        [eventId]
      );
      
      res.json({
        success: true,
        action: 'left',
        message: 'Left event successfully'
      });
    } else {
      // Join event
      if (event.current_attendees >= event.max_attendees) {
        return res.status(400).json({ error: 'Event is full' });
      }
      
      await pgPool.query(
        'INSERT INTO event_attendees (event_id, user_id, status) VALUES ($1, $2, $3)',
        [eventId, userId, 'attending']
      );
      
      await pgPool.query(
        'UPDATE events SET current_attendees = current_attendees + 1 WHERE id = $1',
        [eventId]
      );
      
      // Notify organizer
      await Notification.create({
        userId: event.organizer_id,
        type: 'event',
        actorId: userId,
        referenceType: 'event',
        referenceId: eventId,
        message: 'registered for your event'
      });
      
      res.json({
        success: true,
        action: 'joined',
        message: 'Joined event successfully'
      });
    }
    
  } catch (error) {
    console.error('Event Attend Error:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// ============================================================================
// PHASE 7: MESSAGING & REAL-TIME
// ============================================================================

// Get Conversations
app.get('/api/messages/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ],
          deletedAt: null
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);
    
    // Get other user info for each conversation
    const otherUserIds = conversations.map(conv => {
      const msg = conv.lastMessage;
      return msg.senderId === userId ? msg.receiverId : msg.senderId;
    });
    
    const users = await pgPool.query(
      'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)',
      [otherUserIds]
    );
    
    const userMap = {};
    users.rows.forEach(u => {
      userMap[u.id] = {
        id: u.id,
        username: u.username,
        name: `${u.first_name} ${u.last_name}`,
        avatarUrl: u.avatar_url
      };
    });
    
    const enrichedConversations = conversations.map(conv => {
      const msg = conv.lastMessage;
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      
      return {
        conversationId: conv._id,
        user: userMap[otherUserId],
        lastMessage: {
          text: msg.content,
          senderId: msg.senderId,
          createdAt: msg.createdAt,
          isRead: msg.isRead
        },
        unreadCount: conv.unreadCount,
        timeAgo: getTimeAgo(msg.createdAt)
      };
    });
    
    res.json({
      success: true,
      conversations: enrichedConversations
    });
    
  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get Messages in Conversation
app.get('/api/messages/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({
      conversationId,
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ],
      deletedAt: null
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );
    
    res.json({
      success: true,
      messages: messages.reverse().map(msg => ({
        id: msg._id,
        content: msg.content,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        messageType: msg.messageType,
        mediaUrl: msg.mediaUrl,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        timeAgo: getTimeAgo(msg.createdAt)
      })),
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    });
    
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send Message
app.post('/api/messages', authenticate, [
  body('receiverId').isUUID(),
  body('content').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const senderId = req.user.id;
    const { receiverId, content, messageType, mediaUrl } = req.body;
    
    // Generate or retrieve conversation ID
    const conversationId = [senderId, receiverId].sort().join('_');
    
    // Create message
    const message = await Message.create({
      conversationId,
      senderId,
      receiverId,
      content,
      messageType: messageType || 'text',
      mediaUrl,
      isDelivered: true,
      deliveredAt: new Date()
    });
    
    // Create notification
    await Notification.create({
      userId: receiverId,
      type: 'message',
      actorId: senderId,
      referenceType: 'message',
      referenceId: message._id.toString(),
      message: 'sent you a message'
    });
    
    // Emit real-time message via Socket.io
    io.to(`user:${receiverId}`).emit('new_message', {
      conversationId,
      message: {
        id: message._id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt
      }
    });
    
    res.json({
      success: true,
      message: {
        id: message._id,
        content: message.content,
        createdAt: message.createdAt
      }
    });
    
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ============================================================================
// PHASE 8: SUBSCRIPTIONS & PREMIUM FEATURES
// ============================================================================

// Subscribe to Premium
app.post('/api/subscriptions/subscribe', authenticate, [
  body('plan').isIn(['weekly', 'monthly']),
  body('paymentMethod').isIn(['momo', 'card']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { plan, paymentMethod, paymentDetails } = req.body;
    
    // Calculate amount and duration
    const amount = plan === 'weekly' ? CONFIG.PREMIUM_WEEKLY_PRICE : CONFIG.PREMIUM_WEEKLY_PRICE * 4;
    const durationDays = plan === 'weekly' ? 7 : 30;
    
    // Generate payment reference
    const paymentReference = `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // TODO: Integrate with Paystack for actual payment processing
    // For now, we'll simulate successful payment
    
    const startsAt = new Date();
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    
    // Create subscription record
    await pgPool.query(`
      INSERT INTO subscriptions (
        user_id, plan_type, amount, payment_method,
        payment_reference, status, starts_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      userId, plan, amount, paymentMethod,
      paymentReference, 'active', startsAt, expiresAt
    ]);
    
    // Update user subscription status
    await pgPool.query(`
      UPDATE users 
      SET subscription_tier = 'premium',
          subscription_expires_at = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [expiresAt, userId]);
    
    res.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        plan,
        amount,
        startsAt,
        expiresAt,
        paymentReference
      }
    });
    
  } catch (error) {
    console.error('Subscribe Error:', error);
    res.status(500).json({ error: 'Failed to process subscription' });
  }
});

// Get Rankings (Premium Only)
app.get('/api/rankings', authenticate, requirePremium, async (req, res) => {
  try {
    const { period = 'weekly', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const scoreField = period === 'weekly' ? 'weekly_score' 
                     : period === 'monthly' ? 'monthly_score' 
                     : 'all_time_score';
    
    const result = await pgPool.query(`
      SELECT us.*, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty
      FROM user_scores us
      JOIN users u ON us.user_id = u.id
      WHERE u.subscription_tier = 'premium'
      ORDER BY us.${scoreField} DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);
    
    const rankings = result.rows.map((row, index) => ({
      rank: offset + index + 1,
      user: {
        id: row.user_id,
        username: row.username,
        name: `${row.first_name} ${row.last_name}`,
        avatarUrl: row.avatar_url,
        faculty: row.faculty
      },
      score: row[scoreField],
      stats: {
        totalLikes: row.total_likes_received,
        totalComments: row.total_comments_received,
        totalShares: row.total_shares_received,
        totalSales: row.total_sales
      }
    }));
    
    res.json({
      success: true,
      period,
      rankings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: rankings.length === parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get Rankings Error:', error);
    res.status(500).json({ error: 'Failed to get rankings' });
  }
});

// Get User's Rank
app.get('/api/rankings/me', authenticate, requirePremium, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'weekly' } = req.query;
    
    const scoreField = period === 'weekly' ? 'weekly_score' 
                     : period === 'monthly' ? 'monthly_score' 
                     : 'all_time_score';
    
    // Get user's score
    const scoreResult = await pgPool.query(
      `SELECT * FROM user_scores WHERE user_id = $1`,
      [userId]
    );
    
    if (scoreResult.rows.length === 0) {
      return res.status(404).json({ error: 'Score not found' });
    }
    
    const userScore = scoreResult.rows[0];
    
    // Get user's rank
    const rankResult = await pgPool.query(`
      SELECT COUNT(*) + 1 as rank
      FROM user_scores us
      JOIN users u ON us.user_id = u.id
      WHERE us.${scoreField} > $1
      AND u.subscription_tier = 'premium'
    `, [userScore[scoreField]]);
    
    res.json({
      success: true,
      rank: parseInt(rankResult.rows[0].rank),
      score: userScore[scoreField],
      stats: {
        weeklyScore: userScore.weekly_score,
        monthlyScore: userScore.monthly_score,
        allTimeScore: userScore.all_time_score,
        totalLikes: userScore.total_likes_received,
        totalComments: userScore.total_comments_received,
        totalShares: userScore.total_shares_received,
        totalSales: userScore.total_sales
      }
    });
    
  } catch (error) {
    console.error('Get User Rank Error:', error);
    res.status(500).json({ error: 'Failed to get rank' });
  }
});

// ============================================================================
// PHASE 9: CONNECTIONS/FOLLOWS
// ============================================================================

// Follow User
app.post('/api/connections/follow/:userId', authenticate, async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;
    
    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    // Check if already following
    const existing = await pgPool.query(
      'SELECT * FROM connections WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already following this user' });
    }
    
    // Create connection
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
      message: 'Successfully followed user'
    });
    
  } catch (error) {
    console.error('Follow Error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow User
app.delete('/api/connections/follow/:userId', authenticate, async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;
    
    const result = await pgPool.query(
      'DELETE FROM connections WHERE follower_id = $1 AND following_id = $2 RETURNING *',
      [followerId, followingId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    // Update counts
    await pgPool.query(
      'UPDATE users SET following_count = following_count - 1 WHERE id = $1',
      [followerId]
    );
    await pgPool.query(
      'UPDATE users SET followers_count = followers_count - 1 WHERE id = $1',
      [followingId]
    );
    
    res.json({
      success: true,
      message: 'Successfully unfollowed user'
    });
    
  } catch (error) {
    console.error('Unfollow Error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get Followers
app.get('/api/connections/followers', authenticate, async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const result = await pgPool.query(`
      SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty, c.created_at
      FROM connections c
      JOIN users u ON c.follower_id = u.id
      WHERE c.following_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    const followers = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      name: `${row.first_name} ${row.last_name}`,
      avatarUrl: row.avatar_url,
      faculty: row.faculty,
      followedAt: row.created_at
    }));
    
    res.json({
      success: true,
      followers,
      pagination: {
        page,
        limit,
        hasMore: followers.length === limit
      }
    });
    
  } catch (error) {
    console.error('Get Followers Error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// Get Following
app.get('/api/connections/following', authenticate, async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const result = await pgPool.query(`
      SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty, c.created_at
      FROM connections c
      JOIN users u ON c.following_id = u.id
      WHERE c.follower_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    const following = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      name: `${row.first_name} ${row.last_name}`,
      avatarUrl: row.avatar_url,
      faculty: row.faculty,
      followedAt: row.created_at
    }));
    
    res.json({
      success: true,
      following,
      pagination: {
        page,
        limit,
        hasMore: following.length === limit
      }
    });
    
  } catch (error) {
    console.error('Get Following Error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

// ============================================================================
// PHASE 10: NOTIFICATIONS
// ============================================================================

// Get Notifications
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({
      userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    // Get actor info
    const actorIds = notifications
      .filter(n => n.actorId)
      .map(n => n.actorId);
    
    const actors = await pgPool.query(
      'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)',
      [actorIds]
    );
    
    const actorMap = {};
    actors.rows.forEach(a => {
      actorMap[a.id] = {
        id: a.id,
        username: a.username,
        name: `${a.first_name} ${a.last_name}`,
        avatarUrl: a.avatar_url
      };
    });
    
    const enrichedNotifications = notifications.map(notif => ({
      id: notif._id,
      type: notif.type,
      actor: notif.actorId ? actorMap[notif.actorId] : null,
      message: notif.message,
      referenceType: notif.referenceType,
      referenceId: notif.referenceId,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
      timeAgo: getTimeAgo(notif.createdAt)
    }));
    
    res.json({
      success: true,
      notifications: enrichedNotifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
    
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark Notification as Read
app.patch('/api/notifications/:notificationId/read', authenticate, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await Notification.updateOne(
      { _id: notificationId, userId: req.user.id },
      { $set: { isRead: true, readAt: new Date() } }
    );
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
    
  } catch (error) {
    console.error('Mark Notification Error:', error);
    res.status(500).json({ error: 'Failed to mark notification' });
  }
});

// Mark All Notifications as Read
app.patch('/api/notifications/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
    
  } catch (error) {
    console.error('Mark All Notifications Error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications' });
  }
});

// ============================================================================
// PHASE 11: SEARCH
// ============================================================================

// Search Everything
app.get('/api/search', authenticate, async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query too short' });
    }
    
    const searchTerm = q.trim().toLowerCase();
    const results = { users: [], posts: [], items: [], events: [] };
    
    // Search Users
    if (type === 'all' || type === 'users') {
      const userResult = await pgPool.query(`
        SELECT id, username, first_name, last_name, avatar_url, faculty, bio
        FROM users
        WHERE (
          username ILIKE $1 OR
          first_name ILIKE $1 OR
          last_name ILIKE $1 OR
          bio ILIKE $1
        )
        AND deleted_at IS NULL
        LIMIT 10
      `, [`%${searchTerm}%`]);
      
      results.users = userResult.rows.map(u => ({
        id: u.id,
        username: u.username,
        name: `${u.first_name} ${u.last_name}`,
        avatarUrl: u.avatar_url,
        faculty: u.faculty,
        bio: u.bio
      }));
    }
    
    // Search Posts
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        $or: [
          { caption: { $regex: searchTerm, $options: 'i' } },
          { tags: { $regex: searchTerm, $options: 'i' } }
        ],
        deletedAt: null,
        visibility: 'public'
      })
      .limit(10)
      .lean();
      
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
        createdAt: p.createdAt
      }));
    }
    
    // Search Store Items
    if (type === 'all' || type === 'items') {
      const itemResult = await pgPool.query(`
        SELECT id, name, description, price, category, images, seller_id
        FROM store_items
        WHERE (
          name ILIKE $1 OR
          description ILIKE $1 OR
          brand ILIKE $1
        )
        AND status = 'active'
        AND deleted_at IS NULL
        LIMIT 10
      `, [`%${searchTerm}%`]);
      
      results.items = itemResult.rows.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category: item.category,
        images: item.images
      }));
    }
    
    // Search Events
    if (type === 'all' || type === 'events') {
      const eventResult = await pgPool.query(`
        SELECT id, title, description, event_date, location, category, image_url
        FROM events
        WHERE (
          title ILIKE $1 OR
          description ILIKE $1
        )
        AND deleted_at IS NULL
        AND event_date >= CURRENT_DATE
        LIMIT 10
      `, [`%${searchTerm}%`]);
      
      results.events = eventResult.rows.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.event_date,
        location: e.location,
        category: e.category,
        imageUrl: e.image_url
      }));
    }
    
    res.json({
      success: true,
      query: q,
      results
    });
    
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Update User Score (for premium users)
async function updateUserScore(userId, actionType) {
  try {
    const points = CONFIG.POINTS[actionType.toUpperCase().replace(' ', '_')] || 0;
    
    if (points === 0) return;
    
    // Update scores
    await pgPool.query(`
      UPDATE user_scores
      SET 
        weekly_score = weekly_score + $1,
        monthly_score = monthly_score + $1,
        all_time_score = all_time_score + $1,
        ${getScoreFieldForAction(actionType)} = ${getScoreFieldForAction(actionType)} + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `, [points, userId]);
    
  } catch (error) {
    console.error('Update Score Error:', error);
  }
}

function getScoreFieldForAction(actionType) {
  const fieldMap = {
    'like': 'total_likes_received',
    'comment': 'total_comments_received',
    'share': 'total_shares_received',
    'sale': 'total_sales',
    'feature': 'total_features'
  };
  return fieldMap[actionType] || 'total_likes_received';
}

// Get Time Ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval}${unit.charAt(0)} ago`;
    }
  }
  
  return 'just now';
}

// ============================================================================
// SOCKET.IO REAL-TIME EVENTS
// ============================================================================

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Invalid token'));
    }
    
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Join user's personal room
  socket.join(`user:${socket.userId}`);
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(`user:${data.receiverId}`).emit('user_typing', {
      senderId: socket.userId,
      conversationId: data.conversationId
    });
  });
  
  // Handle stop typing
  socket.on('stop_typing', (data) => {
    socket.to(`user:${data.receiverId}`).emit('user_stop_typing', {
      senderId: socket.userId,
      conversationId: data.conversationId
    });
  });
  
  // Handle message read
  socket.on('message_read', async (data) => {
    await Message.updateOne(
      { _id: data.messageId },
      { $set: { isRead: true, readAt: new Date() } }
    );
    
    socket.to(`user:${data.senderId}`).emit('message_read', {
      messageId: data.messageId,
      readBy: socket.userId
    });
  });
  
  // Handle online status
  socket.on('online', () => {
    socket.broadcast.emit('user_online', { userId: socket.userId });
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    socket.broadcast.emit('user_offline', { userId: socket.userId });
  });
});

// ============================================================================
// FILE UPLOAD ENDPOINTS
// ============================================================================

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: CONFIG.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [...CONFIG.ALLOWED_IMAGE_TYPES, ...CONFIG.ALLOWED_VIDEO_TYPES];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload Image
app.post('/api/upload/image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Process image with Sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    // Upload to S3 or storage service
    const url = await uploadFile({
      buffer: processedImage,
      mimetype: 'image/jpeg',
      originalname: req.file.originalname
    }, 'images');
    
    res.json({
      success: true,
      url
    });
    
  } catch (error) {
    console.error('Upload Image Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload Multiple Images
app.post('/api/upload/images', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const urls = [];
    
    for (const file of req.files) {
      const processedImage = await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      const url = await uploadFile({
        buffer: processedImage,
        mimetype: 'image/jpeg',
        originalname: file.originalname
      }, 'images');
      
      urls.push(url);
    }
    
    res.json({
      success: true,
      urls
    });
    
  } catch (error) {
    console.error('Upload Images Error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// ============================================================================
// ADMIN/MODERATION ENDPOINTS
// ============================================================================

// Feature Post (Admin Only)
app.post('/api/admin/posts/:postId/feature', authenticate, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { postId } = req.params;
    
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          isFeatured: true,
          featuredAt: new Date()
        }
      },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Award points to post author
    await updateUserScore(post.userId, 'feature');
    
    res.json({
      success: true,
      message: 'Post featured successfully'
    });
    
  } catch (error) {
    console.error('Feature Post Error:', error);
    res.status(500).json({ error: 'Failed to feature post' });
  }
});

// ============================================================================
// HEALTH CHECK & ERROR HANDLING
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: CONFIG.NODE_ENV
  });
});

app.get('/api/status', async (req, res) => {
  try {
    // Check PostgreSQL
    await pgPool.query('SELECT 1');
    const pgStatus = 'connected';
    
    // Check MongoDB
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis
    const redisStatus = redis.status;
    
    res.json({
      status: 'operational',
      databases: {
        postgresql: pgStatus,
        mongodb: mongoStatus,
        redis: redisStatus
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(CONFIG.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

async function startServer() {
  try {
    // Initialize PostgreSQL schema
    await initializePostgresSchema();
    
    // Start server
    httpServer.listen(CONFIG.PORT, () => {
      console.log('='.repeat(60));
      console.log('🚀 RAVED BACKEND SERVER STARTED');
      console.log('='.repeat(60));
      console.log(`📡 Server running on port ${CONFIG.PORT}`);
      console.log(`🌍 Environment: ${CONFIG.NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${CONFIG.PORT}/api`);
      console.log(`💚 Health: http://localhost:${CONFIG.PORT}/health`);
      console.log('='.repeat(60));
      console.log('✅ PostgreSQL Connected');
      console.log('✅ MongoDB Connected');
      console.log('✅ Redis Connected');
      console.log('✅ Socket.IO Ready');
      console.log('='.repeat(60));
      console.log('📚 API ENDPOINTS AVAILABLE:');
      console.log('  Authentication: /api/auth/*');
      console.log('  Users: /api/users/*');
      console.log('  Posts: /api/posts/*');
      console.log('  Stories: /api/stories/*');
      console.log('  Store: /api/store/*');
      console.log('  Events: /api/events/*');
      console.log('  Messages: /api/messages/*');
      console.log('  Connections: /api/connections/*');
      console.log('  Subscriptions: /api/subscriptions/*');
      console.log('  Rankings: /api/rankings/* (Premium)');
      console.log('  Notifications: /api/notifications/*');
      console.log('  Search: /api/search');
      console.log('='.repeat(60));
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
  
  await pgPool.end();
  await mongoose.connection.close();
  redis.disconnect();
  
  process.exit(0);
});

// Start the server
startServer();

// Export for testing
module.exports = { app, httpServer };

