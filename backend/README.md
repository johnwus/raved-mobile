# Raved Backend

A comprehensive social media platform backend built with Node.js, Express, TypeScript, MongoDB, and PostgreSQL.

## Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Social Features** - Posts, comments, likes, stories, connections, events
- **Real-time Chat** - Socket.io powered messaging system
- **Content Moderation** - AI-powered content moderation using OpenAI
- **File Upload** - Cloudinary integration for image/video uploads
- **Payment Integration** - Paystack payment processing
- **Push Notifications** - Firebase Cloud Messaging
- **Rate Limiting** - Advanced rate limiting with Redis
- **Analytics** - Comprehensive user and content analytics

## Content Moderation System

The platform includes a comprehensive content moderation system that automatically detects and handles inappropriate content:

### Features
- **AI-Powered Detection**: Uses OpenAI's Moderation API for text analysis and GPT-4 Vision for image moderation
- **Multi-Content Support**: Moderates posts, comments, messages, and stories
- **User Trust Scoring**: Dynamic trust scores based on user behavior and content history
- **Admin Review Queue**: Human oversight for flagged content
- **Automated Actions**: Automatic blocking of high-severity violations
- **Analytics Dashboard**: Comprehensive moderation statistics and reporting

### Moderation Categories
- **Text Content**: Hate speech, threats, self-harm, sexual content, violence
- **Image Content**: Sexual content, violence, hate symbols, self-harm
- **Severity Levels**: Low, medium, high (based on content and user trust)

### Trust Score System
Users receive trust scores (0-100) that influence moderation decisions:
- **High Trust (80+)**: More lenient moderation
- **Medium Trust (50-79)**: Standard moderation rules
- **Low Trust (<50)**: Stricter moderation, requires admin review

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd raved-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Initialize database
   npm run init-db
   ```

5. **Build and Run**
   ```bash
   npm run build
   npm start
   # Or for development
   npm run dev
   ```

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key for content moderation

### Optional
- `CLOUDINARY_*` - Cloudinary configuration for file uploads
- `REDIS_URL` - Redis connection for caching
- `SENDGRID_API_KEY` - Email service
- `TWILIO_*` - SMS service
- `PAYSTACK_*` - Payment processing
- `FIREBASE_*` - Push notifications

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token

### Posts
- `GET /posts/feed` - Get user feed
- `POST /posts` - Create new post (moderated)
- `GET /posts/:postId` - Get single post
- `POST /posts/:postId/like` - Like/unlike post
- `POST /posts/:postId/comments` - Add comment (moderated)

### Stories
- `POST /stories` - Create story (moderated)
- `GET /stories` - Get user stories

### Chat
- `GET /chat` - Get user conversations
- `POST /chat` - Start new conversation
- `POST /chat/:chatId/messages` - Send message (moderated)

### Moderation (Admin Only)
- `GET /moderation/pending` - Get pending moderation items
- `POST /moderation/:queueId/approve` - Approve content
- `POST /moderation/:queueId/reject` - Reject content
- `GET /moderation/stats` - Get moderation statistics
- `GET /moderation/users/:userId/trust-score` - Get user trust score
- `PUT /moderation/users/:userId/trust-score` - Update user trust score

## Content Moderation Workflow

1. **Content Creation**: User creates post/comment/message/story
2. **AI Analysis**: Content is analyzed by OpenAI moderation APIs
3. **Decision Making**:
   - **Safe Content**: Approved automatically
   - **Flagged Content**: Added to admin review queue
   - **High Risk**: Blocked immediately based on severity and user trust
4. **Admin Review**: Admins can approve or reject queued content
5. **Trust Updates**: User trust scores updated based on violations

## Database Schema

### PostgreSQL Tables
- `users` - User accounts and profiles
- `user_trust_scores` - Content moderation trust scores
- `connections` - User relationships
- `subscriptions` - Premium subscriptions
- `store_items` - Marketplace items
- `events` - Social events
- `analytics_events` - User analytics

### MongoDB Collections
- `posts` - Social media posts
- `comments` - Post comments
- `messages` - Chat messages
- `stories` - User stories
- `moderationqueue` - Content moderation queue
- `notifications` - Push notifications

## Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Database initialization
npm run init-db
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License