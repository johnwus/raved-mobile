# Raved Mobile Codebase Index

## Overview

This codebase consists of a full-stack social media application called "Raved Mobile". It includes:

- **Backend**: Node.js/TypeScript API server with Express, PostgreSQL, MongoDB, Socket.io for real-time features
- **Frontend**: React Native/Expo mobile app with offline capabilities, state management, and real-time sync

The application supports user posts, stories, chat, store/marketplace, events, rankings, subscriptions, and more.

## Backend Structure

Located in `backend/` directory.

### Key Technologies
- Node.js with TypeScript
- Express.js for API routes
- PostgreSQL for relational data (users, events, store items, etc.)
- MongoDB for document-based data (posts, comments, messages, etc.)
- Socket.io for real-time communication
- Redis for caching and rate limiting
- JWT for authentication
- Paystack for payments

### Main Directories

#### `backend/src/`
Main source code directory.

#### `backend/src/routes/`
API route handlers. Key routes include:
- `auth.routes.ts`: Authentication (login, register, password reset, 2FA)
- `posts.routes.ts`: Post management (create, like, comment, share)
- `chat.routes.ts`: Chat functionality (create chats, send messages)
- `users.routes.ts`: User profiles and connections
- `store.routes.ts`: Marketplace/store items
- `events.routes.ts`: Event management
- `notifications.routes.ts`: Push notifications
- `offline-sync.routes.ts`: Offline data synchronization
- `upload.routes.ts`: File uploads (images, videos, avatars)
- And many more...

#### `backend/src/services/`
Business logic services. Key services:
- `auth.service.ts`: Authentication logic
- `posts.service.ts`: Post operations
- `chat.service.ts`: Chat management
- `moderation.service.ts`: Content moderation
- `offline-queue.service.ts`: Offline data queuing
- `push-notification.service.ts`: Push notifications
- `payment.service.ts`: Payment processing
- `search.service.ts`: Search functionality
- `feed-algorithm.service.ts`: Feed ranking algorithm

#### `backend/src/models/`
Data models.

**PostgreSQL models** (`backend/src/models/postgres/`):
- `user.model.ts`: User accounts
- `post.model.ts`: Posts (relational data)
- `event.model.ts`: Events
- `store-item.model.ts`: Marketplace items
- `subscription.model.ts`: User subscriptions
- `connection.model.ts`: User connections/follows
- `offline-queue.model.ts`: Offline sync queue
- `sync-conflict.model.ts`: Data sync conflicts

**MongoDB models** (`backend/src/models/mongoose/`):
- `post.model.ts`: Posts (document data)
- `comment.model.ts`: Comments
- `message.model.ts`: Chat messages
- `notification.model.ts`: Notifications
- `story.model.ts`: Stories

#### `backend/src/controllers/`
Route controllers that handle HTTP requests and responses.

#### `backend/src/middleware/`
Express middleware:
- `auth.middleware.ts`: JWT authentication
- `rate-limit.middleware.ts`: Rate limiting
- `moderation.middleware.ts`: Content moderation
- `cache.middleware.ts`: Caching
- `validation.middleware.ts`: Request validation

#### `backend/src/utils/`
Utility functions:
- `auth.utils.ts`: Authentication utilities

#### `backend/src/config/`
Configuration files:
- `database.ts`: Database connections
- `i18n.ts`: Internationalization

#### `backend/src/jobs/`
Background jobs:
- `analytics-cron.ts`: Analytics processing
- `cron.ts`: Scheduled tasks

#### `backend/src/locales/`
Translation files for multiple languages (en, fr, ha, tw).

### Key Backend Components

#### Socket Server (`backend/src/socket.ts`)
- Real-time communication using Socket.io
- Handles chat messages, post likes, notifications
- Authentication middleware for sockets

#### Main Server (`backend/src/index.ts`)
- Express app setup
- Middleware configuration
- Route mounting
- Socket server integration
- Graceful shutdown handling

## Frontend Structure (Raved)

Located in `raved/` directory. React Native/Expo app.

### Key Technologies
- React Native with Expo
- TypeScript
- Zustand for state management
- React Navigation for routing
- Socket.io client for real-time features
- AsyncStorage for local storage
- Offline queue for sync

### Main Directories

#### `raved/app/`
Expo Router app directory:
- `_layout.tsx`: Root layout
- `subscription.tsx`: Subscription screen
- `themes.tsx`: Theme selection

#### `raved/components/`
React components.

**UI Components** (`raved/components/ui/`):
- `Avatar.tsx`: User avatars
- `Button.tsx`: Buttons
- `Card.tsx`: Cards
- `Input.tsx`: Input fields
- `Toast.tsx`: Toast notifications
- `LoadingState.tsx`: Loading indicators
- `ErrorState.tsx`: Error displays
- `SyncStatusIndicator.tsx`: Offline sync status

**Feature Components**:
- `ErrorBoundary.tsx`: Error boundary wrapper
- `sheets/`: Bottom sheets (PasswordResetSheet, RegistrationSheet)
- `store/`: Store components (ProductCard, ProductGrid)
- `stories/`: Story components (StoryRow, StoryViewer)

#### `raved/services/`
API services and utilities.

**API Services**:
- `api.ts`: Base API configuration with interceptors
- `authApi.ts`: Authentication API calls
- `postsApi.ts`: Posts API
- `userApi.ts`: User management
- `storeApi.ts`: Store/marketplace API
- `notificationsApi.ts`: Notifications
- `eventsApi.ts`: Events
- `searchApi.ts`: Search
- `uploadApi.ts`: File uploads

**Utility Services**:
- `socket.ts`: Socket.io client for real-time features
- `storage.ts`: AsyncStorage wrapper
- `backgroundSync.ts`: Background synchronization service
- `offlineQueue.ts`: Offline queue management
- `syncManager.ts`: Sync management
- `notificationService.ts`: Local/push notifications

#### `raved/store/`
Zustand stores for state management:
- `postsStore.ts`: Posts state (feed, likes, saves)
- `storeStore.ts`: Store/marketplace state (cart, products)
- `storiesStore.ts`: Stories state
- `toastStore.ts`: Toast notifications state

#### `raved/types/`
TypeScript type definitions (`raved/types/index.ts`):
- `User`: User interface
- `Post`: Post interface
- `Story`: Story interface
- `StoreItem`: Store item interface
- `Event`: Event interface
- `Comment`: Comment interface
- `Notification`: Notification interface
- `Connection`: User connection interface
- `Subscription`: Subscription interface
- `AppState`: Overall app state

#### `raved/constants/`
App constants:
- `theme.ts`: Theme constants

#### `raved/contexts/`
React contexts:
- `ThemeContext.tsx`: Theme context

#### `raved/hooks/`
Custom React hooks:
- `useAuth.tsx`: Authentication hook
- `useOfflineSync.ts`: Offline sync hook
- `usePosts.ts`: Posts hook
- `useStore.tsx`: Store hook

#### `raved/locales/`
Translation files (en, fr, ha, tw).

#### `raved/theme/`
Theme configuration:
- `colors.ts`: Color palette
- `typography.ts`: Typography
- `spacing.ts`: Spacing
- `borderRadius.ts`: Border radius

#### `raved/utils/`
Utility functions:
- `formatters.ts`: Data formatters
- `mockData.ts`: Mock data for development

## Other Files

- `.gitignore`: Git ignore rules
- `app-prototype.html`: HTML prototype
- `IMPLEMENTATION_PLAN.md`: Implementation plan
- `IMPLEMENTATION_SUMMARY.md`: Implementation summary
- `backend/README.md`: Backend documentation

## Key Features

## Key File Summaries

### Backend Main Entry Point (`backend/src/index.ts`)
The main Express server file that:
- Initializes database connections (PostgreSQL and MongoDB)
- Sets up comprehensive middleware stack including security (helmet, CORS), logging, analytics, offline support, rate limiting, and validation
- Configures Socket.io for real-time features
- Initializes background jobs and services (push notifications, email)
- Handles graceful shutdown
- Mounts all API routes under `/api/v1`

### Frontend Root Layout (`raved/app/_layout.tsx`)
The root component of the Expo Router app that:
- Sets up providers for theme, authentication, store state, and toasts
- Configures notification permissions and handlers
- Defines all screen routes as modal presentations with slide animations
- Includes extensive LogBox ignore rules for development
- Wraps the entire app in an ErrorBoundary

### Socket Server (`backend/src/socket.ts`)
Handles real-time communication:
- Authenticates socket connections with JWT
- Manages chat rooms and messaging
- Broadcasts post likes, comments, and notifications
- Handles typing indicators and user presence

### Authentication Service (`backend/src/services/auth.service.ts`)
Manages user authentication including:
- JWT token generation and validation
- Password hashing and verification
- Two-factor authentication (SMS and app-based)
- Password reset flows
- Session management

### Posts Service (`backend/src/services/posts.service.ts`)
Handles post-related business logic:
- Creating and retrieving posts
- Like/unlike functionality
- Comment management
- Share tracking
- Feed algorithm processing

### Offline Queue Service (`raved/services/offlineQueue.ts`)
Manages offline functionality:
- Queues API requests when offline
- Processes queued requests when back online
- Handles sync conflicts and resolution
- Manages offline data storage

### Posts Store (`raved/store/postsStore.ts`)
Zustand store for posts state:
- Manages feed posts, user posts, saved posts
- Handles like/unlike actions
- Socket integration for real-time updates
- Persistent storage with local cache

### API Service (`raved/services/api.ts`)
Base API configuration:
- Axios instance with interceptors
- Request/response logging
- Automatic token refresh
- Error handling and retry logic
- Offline request queuing

## Database Schema Highlights

### PostgreSQL (Relational Data)
- **Users**: Account information, profiles, settings
- **Events**: Event creation, attendance tracking
- **Store Items**: Marketplace products, pricing, inventory
- **Subscriptions**: Premium features, billing
- **Connections**: User relationships, follows
- **Offline Queue**: Sync management
- **Analytics**: User behavior tracking

### MongoDB (Document Data)
- **Posts**: Social media posts with rich content
- **Comments**: Threaded comment system
- **Messages**: Chat conversations
- **Notifications**: User notifications
- **Stories**: Ephemeral content
- **Likes**: Post interactions

## Development and Deployment

- **Backend**: Node.js with TypeScript, uses nodemon for development, PM2 for production
- **Frontend**: Expo CLI for development, EAS Build for production builds
- **Databases**: PostgreSQL and MongoDB, with migration scripts
- **Caching**: Redis for session and API caching
- **Background Jobs**: Cron jobs for analytics, cleanup, notifications
- **Monitoring**: Comprehensive logging and error tracking
- **Testing**: Various test files for authentication, login flows, etc.

This index provides a comprehensive overview of the Raved Mobile codebase architecture, key components, and functionality.
1. **Social Feed**: Posts, comments, likes, shares
2. **Stories**: Ephemeral content
3. **Chat**: Real-time messaging
4. **Marketplace**: Buy/sell items
5. **Events**: Event creation and attendance
6. **Rankings**: User rankings by faculty/activity
7. **Subscriptions**: Premium features
8. **Offline Support**: Full offline functionality with sync
9. **Multi-language**: Support for English, French, Hausa, Twi
10. **Real-time Updates**: Socket.io for live features
11. **Push Notifications**: Local and push notifications
12. **Moderation**: Content moderation system
13. **Analytics**: User and app analytics

## Architecture Highlights

- **Hybrid Database**: PostgreSQL for relational data, MongoDB for flexible document data
- **Offline-First**: Comprehensive offline support with conflict resolution
- **Microservices-like**: Modular service architecture
- **Real-time**: Socket.io for instant updates
- **Scalable**: Rate limiting, caching, background jobs
- **Secure**: JWT auth, input validation, moderation
- **International**: Multi-language support
- **Cross-platform**: React Native for iOS/Android/Web