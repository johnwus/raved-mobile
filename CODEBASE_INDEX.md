# Raved Mobile Codebase Index

**Last Updated:** January 2025

## Overview

This codebase consists of a full-stack social media application called "Raved Mobile". It includes:

- **Backend**: Node.js/TypeScript API server with Express, PostgreSQL, MongoDB, Socket.io for real-time features
- **Frontend**: React Native/Expo mobile app with offline capabilities, state management, and real-time sync

The application supports user posts, stories, chat, store/marketplace, events, rankings, subscriptions, and more.

## Quick Stats

- **Total Files**: ~67,000+ files (including node_modules)
- **Backend Source Files**: 163 files in `backend/src/`
- **Frontend Source Files**: 100+ files in `raved/` (excluding node_modules)
- **Frontend Screens**: 48 screens/routes in `raved/app/`
- **Backend Routes**: 25+ route files
- **Backend Services**: 40+ service files
- **Frontend Components**: 37 component files
- **Frontend Services**: 25 API/service files

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
API route handlers (25+ route files). All routes are mounted under `/api/v1`:

**Core Routes**:
- `index.ts`: Route aggregator and mounting
- `auth.routes.ts`: Authentication (login, register, password reset, 2FA)
- `users.routes.ts`: User profiles and management
- `posts.routes.ts`: Post management (create, like, comment, share)
- `chat.routes.ts`: Chat functionality (create chats, send messages)
- `upload.routes.ts`: File uploads (images, videos, avatars)
- `search.routes.ts`: Search functionality

**Feature Routes**:
- `store.routes.ts`: Marketplace/store items
- `cart.routes.ts`: Shopping cart
- `payment.routes.ts`: Payment processing
- `events.routes.ts`: Event management
- `stories.routes.ts`: Stories
- `notifications.routes.ts`: Push notifications
- `rankings.routes.ts`: User rankings
- `faculties.routes.ts`: Faculties/departments
- `subscriptions.routes.ts`: Premium subscriptions

**Connection & Social Routes**:
- `connection.routes.ts`: User connections (single)
- `connections.routes.ts`: User connections (plural)

**System Routes**:
- `offline-sync.routes.ts`: Offline data synchronization
- `analytics.routes.ts`: Analytics tracking
- `moderation.routes.ts`: Content moderation
- `rate-limit.routes.ts`: Rate limiting configuration
- `device-token.routes.ts`: Device token management
- `backup.routes.ts`: Backup operations
- `support.routes.ts`: Support/help
- `theme.routes.ts`: Theme management
- `admin.routes.ts`: Admin operations
- `ops.routes.ts`: Operations/health checks

#### `backend/src/services/`
Business logic services (40+ service files):

**Core Services**:
- `auth.service.ts`: Authentication logic (not listed but referenced)
- `posts.service.ts`: Post operations (not listed but referenced)
- `chat.service.ts`: Chat management
- `comment.service.ts`: Comment operations
- `like.service.ts`: Like/unlike operations
- `share.service.ts`: Share tracking
- `search.service.ts`: Search functionality
- `upload.service.ts`: File upload handling

**User & Social Services**:
- `connection.service.ts`: User connections/follows
- `registration.service.ts`: User registration
- `admin.service.ts`: Admin operations

**E-commerce Services**:
- `cart.service.ts`: Shopping cart
- `payment.service.ts`: Payment processing
- `transaction.service.ts`: Transaction management

**Communication Services**:
- `email.service.ts`: Email sending
- `sms.service.ts`: SMS sending
- `sms-templates.service.ts`: SMS templates
- `push-notification.service.ts`: Push notifications
- `device-token.service.ts`: Device token management

**Content & Moderation Services**:
- `moderation.service.ts`: Content moderation
- `moderation-queue.service.ts`: Moderation queue
- `theme.service.ts`: Theme management

**Offline & Sync Services**:
- `offline-queue.service.ts`: Offline data queuing
- `offline-data.service.ts`: Offline data management
- `offline-status.service.ts`: Offline status tracking
- `background-sync.service.ts`: Background synchronization
- `sync-conflict.service.ts`: Sync conflict resolution
- `data-versioning.service.ts`: Data version tracking

**Analytics & Monitoring Services**:
- `analytics.service.ts`: Analytics tracking
- `offline-analytics.service.ts`: Offline analytics
- `share-analytics.service.ts`: Share analytics
- `rate-limit-analytics.service.ts`: Rate limit analytics

**Caching & Performance Services**:
- `cache.service.ts`: Caching
- `selective-cache.service.ts`: Selective caching
- `rate-limiter.service.ts`: Rate limiting

**Algorithm & Optimization Services**:
- `feed-algorithm.service.ts`: Feed ranking algorithm

**Integration Services**:
- `open-graph.service.ts`: Open Graph metadata
- `deep-linking.service.ts`: Deep linking
- `social-share.service.ts`: Social sharing
- `share-templates.service.ts`: Share templates

**System Services**:
- `backup.service.ts`: Backup operations

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
Route controllers that handle HTTP requests and responses (24 controller files):
- `auth.controller.ts`: Authentication endpoints
- `users.controller.ts`: User management
- `posts.controller.ts`: Post operations
- `cart.controller.ts`: Shopping cart
- `store.controller.ts`: Store/marketplace
- `payment.controller.ts`: Payment processing
- `events.controller.ts`: Event management
- `stories.controller.ts`: Stories
- `notifications.controller.ts`: Notifications
- `rankings.controller.ts`: Rankings
- `faculties.controller.ts`: Faculties
- `connection.controller.ts`: User connections (single)
- `connections.controller.ts`: User connections (plural)
- `subscriptions.controller.ts`: Subscriptions
- `search.controller.ts`: Search
- `analytics.controller.ts`: Analytics
- `moderation.controller.ts`: Content moderation
- `offline-sync.controller.ts`: Offline sync
- `device-token.controller.ts`: Device tokens
- `rate-limit.controller.ts`: Rate limiting
- `theme.controller.ts`: Themes
- `admin.controller.ts`: Admin operations
- `backup.controller.ts`: Backup operations
- `support.controller.ts`: Support/help
- `ops.controller.ts`: Operations/health

#### `backend/src/middleware/`
Express middleware (10 middleware files):
- `auth.middleware.ts`: JWT authentication
- `admin.middleware.ts`: Admin authorization
- `rate-limit.middleware.ts`: Rate limiting
- `rate-limit-v2.middleware.ts`: Rate limiting v2
- `moderation.middleware.ts`: Content moderation
- `cache.middleware.ts`: Caching
- `validation.middleware.ts`: Request validation
- `logging.middleware.ts`: Request/response logging
- `analytics.middleware.ts`: Analytics tracking
- `offline.middleware.ts`: Offline support
- `theme.middleware.ts`: Theme handling

#### `backend/src/utils/`
Utility functions:
- `index.ts`: Utility exports
- `auth.utils.ts`: Authentication utilities

#### `backend/src/config/`
Configuration files:
- `index.ts`: Main configuration
- `database.ts`: Database connections (PostgreSQL, MongoDB, Redis)
- `i18n.ts`: Internationalization setup

#### `backend/src/types/`
TypeScript type definitions:
- `paystack.d.ts`: Paystack payment types
- `rate-limit.ts`: Rate limiting types
- `node-cron.d.ts`: Node-cron types

#### `backend/src/jobs/`
Background jobs and scheduled tasks:
- `cron.ts`: Main scheduled tasks
- `analytics-cron.ts`: Analytics processing jobs

#### `backend/src/scripts/`
Database and utility scripts:
- `init-db.ts`: Initialize database schema
- `seed-mock-data.ts`: Seed mock data for development
- `check-seed.ts`: Check seeded data
- `backfill-store-item-ids.ts`: Backfill store item IDs

#### `backend/src/locales/`
Translation files for multiple languages (en, fr, ha, tw):
- Each language has: `auth.json`, `common.json`, `errors.json`, `notifications.json`

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
Expo Router app directory with 48 screens organized into feature groups:

**Authentication Screens** (`(auth)/`):
- `login.tsx`: User login
- `register.tsx`: User registration
- `reset-password.tsx`: Password reset flow
- `_layout.tsx`: Auth layout wrapper

**Main Tab Screens** (`(tabs)/`):
- `index.tsx`: Home feed
- `create.tsx`: Create post
- `events.tsx`: Events list
- `profile.tsx`: User profile
- `faculties.tsx`: Faculties/rankings
- `_layout.tsx`: Tab navigation layout

**Dynamic Detail Screens**:
- `chat/[id].tsx`: Individual chat conversation
- `event/[id].tsx`: Event details
- `post/[id].tsx`: Post details
- `product/[id].tsx`: Product details
- `profile/[id].tsx`: User profile view

**Stories**:
- `stories/view.tsx`: Story viewer
- `stories/create.tsx`: Create story

**Admin**:
- `admin/themes.tsx`: Theme management

**Other Screens**:
- `store.tsx`: Marketplace/store
- `cart.tsx`: Shopping cart
- `checkout.tsx`: Checkout flow
- `add-item.tsx`: Add store item
- `seller-dashboard.tsx`: Seller dashboard
- `similar-items.tsx`: Similar products
- `chat.tsx`: Chat list
- `search.tsx`: Search
- `rankings.tsx`: Rankings
- `connections.tsx`: User connections
- `notifications.tsx`: Notifications
- `comments.tsx`: Comments view
- `create-event.tsx`: Create event
- `subscription.tsx`: Subscription management
- `themes.tsx`: Theme selection
- `edit-profile.tsx`: Edit profile
- `profile-settings.tsx`: Profile settings
- `privacy-settings.tsx`: Privacy settings
- `notification-settings.tsx`: Notification settings
- `language-settings.tsx`: Language settings
- `database-settings.tsx`: Database settings
- `api-settings.tsx`: API settings
- `avatar-picker.tsx`: Avatar selection
- `about.tsx`: About page
- `help.tsx`: Help/support
- `faq.tsx`: FAQ
- `modal.tsx`: Generic modal
- `+html.tsx`: HTML renderer
- `+native-intent.ts`: Native intent handler

#### `raved/components/`
React components organized by feature and type.

**UI Components** (`raved/components/ui/`):
- `Avatar.tsx`: User avatars
- `Button.tsx`: Buttons
- `Card.tsx`: Cards
- `Badge.tsx`: Badge component
- `Input.tsx`: Input fields
- `Toast.tsx`: Toast notifications
- `Toggle.tsx`: Toggle switches
- `LoadingState.tsx`: Loading indicators
- `ErrorState.tsx`: Error displays
- `EmptyState.tsx`: Empty state displays
- `SkeletonLoader.tsx`: Skeleton loading placeholders
- `SyncStatusIndicator.tsx`: Offline sync status
- `ConflictResolver.tsx`: Sync conflict resolution UI
- `BottomSheet.tsx`: Bottom sheet component
- `FloatingActionButtons.tsx`: FAB component
- `collapsible.tsx`: Collapsible component
- `icon-symbol.tsx`: Icon symbol component
- `icon-symbol.ios.tsx`: iOS-specific icon symbols

**Feature Components**:
- `ErrorBoundary.tsx`: Error boundary wrapper
- `providers/ToastProvider.tsx`: Toast notification provider
- `chat/ChatListItem.tsx`: Chat list item component
- `posts/PostCard.tsx`: Post card component

**Bottom Sheets** (`sheets/`):
- `PasswordResetSheet.tsx`: Password reset bottom sheet
- `RegistrationSheet.tsx`: Registration bottom sheet
- `MoreSheet.tsx`: More options sheet
- `ShareSheet.tsx`: Share options sheet
- `SortFilterSheet.tsx`: Sort and filter sheet

**Store Components** (`store/`):
- `ProductCard.tsx`: Product card
- `ProductGrid.tsx`: Product grid layout

**Story Components** (`stories/`):
- `StoryRow.tsx`: Story row display
- `StoryViewer.tsx`: Story viewer

**Other Components**:
- `haptic-tab.tsx`: Haptic feedback tab
- `hello-wave.tsx`: Animated wave component
- `themed-text.tsx`: Themed text component
- `themed-view.tsx`: Themed view component
- `external-link.tsx`: External link component
- `parallax-scroll-view.tsx`: Parallax scroll view

#### `raved/services/`
API services and utilities (25 service files).

**API Services**:
- `api.ts`: Base API configuration with interceptors
- `apiPublic.ts`: Public API endpoints (no auth required)
- `authApi.ts`: Authentication API calls
- `postsApi.ts`: Posts API
- `userApi.ts`: User management
- `storeApi.ts`: Store/marketplace API
- `notificationsApi.ts`: Notifications
- `eventsApi.ts`: Events
- `searchApi.ts`: Search
- `uploadApi.ts`: File uploads
- `chatApi.ts`: Chat/messaging API
- `storiesApi.ts`: Stories API
- `rankingsApi.ts`: Rankings API
- `facultiesApi.ts`: Faculties API
- `connectionsApi.ts`: User connections API
- `subscriptionsApi.ts`: Subscriptions API
- `analyticsApi.ts`: Analytics API

**Utility Services**:
- `socket.ts`: Socket.io client for real-time features
- `storage.ts`: AsyncStorage wrapper
- `backgroundSync.ts`: Background synchronization service
- `offlineQueue.ts`: Offline queue management
- `syncManager.ts`: Sync management
- `notificationService.ts`: Local/push notifications
- `i18n.ts`: Internationalization service
- `geocoding.ts`: Geocoding service

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

## Documentation Files

The project includes extensive documentation (40+ markdown files):

**Root Documentation**:
- `START_HERE.md`: Getting started guide
- `CODEBASE_INDEX.md`: This file - comprehensive codebase index
- `README_FIXES_NOV_13.md`: November 13 fixes documentation
- `IMPLEMENTATION_PLAN.md`: Implementation plan
- `IMPLEMENTATION_SUMMARY.md`: Implementation summary
- `IMPLEMENTATION_FIXES_NOV_13.md`: Implementation fixes from Nov 13
- `FIXES_APPLIED_NOV_13.md`: Applied fixes from Nov 13

**Testing & Debugging**:
- `TESTING_GUIDE.md`: Testing guide
- `QUICK_START_TESTING.md`: Quick start testing guide
- `DEBUG_LOGGING.md`: Debug logging reference
- `CONSOLE_LOG_REFERENCE.md`: Console log reference
- `CODE_CHANGES_REFERENCE.md`: Code changes reference

**Feature-Specific Documentation**:
- `DEVICE_SYNC_INDEX.md`: Device sync index
- `DEVICE_SYNC_IMPLEMENTATION.md`: Device sync implementation
- `DEVICE_SYNC_FIX_SUMMARY.md`: Device sync fix summary
- `DEVICE_SYNC_ERROR_ANALYSIS.md`: Device sync error analysis
- `DEVICE_SYNC_VISUAL_SUMMARY.md`: Device sync visual summary
- `DEVICE_SYNC_REPORT.md`: Device sync report
- `DEVICE_SYNC_QUICK_FIX.md`: Device sync quick fix
- `DATA_LOADING_INDEX.md`: Data loading index
- `DATA_LOADING_FIX_SUMMARY.md`: Data loading fix summary
- `DATA_LOADING_CHANGES_DIFF.md`: Data loading changes diff
- `DATA_LOADING_QUICK_FIX.md`: Data loading quick fix
- `CART_AND_NOTIFICATIONS_FIX.md`: Cart and notifications fix
- `SESSION_INDEX.md`: Session index
- `SESSION_SUMMARY_NOV_13.md`: Session summary Nov 13
- `SESSION_SUMMARY_NOV_13_CONTINUED.md`: Session summary Nov 13 continued

**Analysis & Planning**:
- `CURRENT_ISSUES_ANALYSIS.md`: Current issues analysis
- `INTEGRATION_GAPS_CHECKLIST.md`: Integration gaps checklist
- `QUICK_REFERENCE_FIX.md`: Quick reference fix
- `WARP.md`: WARP documentation

**Frontend Documentation** (`raved/`):
- `README.md`: Frontend README
- `FOLDER_STRUCTURE.md`: Folder structure
- `GAP_ANALYSIS.md`: Gap analysis
- `GAP_ANALYSIS_PLAN.md`: Gap analysis plan
- `SCREEN_TYPE_MAPPING.md`: Screen type mapping
- `PROTOTYPE_VS_IMPLEMENTATION_GAPS.md`: Prototype vs implementation gaps
- `IMPLEMENTATION_SUMMARY.md`: Implementation summary
- `# AppStats.md`: App statistics

**Backend Documentation** (`backend/`):
- `README.md`: Backend README

**Other Files**:
- `app-prototype.html`: HTML prototype
- `test-presence-system.js`: Presence system test
- `qodana.yaml`: Qodana configuration

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

## Technology Stack

### Backend Dependencies
**Core Framework**:
- Node.js with TypeScript
- Express.js 4.18.2
- Socket.io 4.6.1

**Databases**:
- PostgreSQL (via Sequelize 6.37.7 and pg 8.9.0)
- MongoDB (via Mongoose 7.0.0)
- Redis (via ioredis 5.3.1)

**Authentication & Security**:
- JWT (jsonwebtoken 9.0.0)
- bcryptjs 2.4.3
- helmet 6.0.1
- express-rate-limit 6.7.0
- rate-limiter-flexible 8.2.0

**File Handling**:
- Cloudinary 2.8.0
- Multer 1.4.5-lts.1
- Sharp 0.34.5

**Communication**:
- Twilio 5.10.4 (SMS)
- SendGrid (@sendgrid/mail 8.1.6) (Email)
- Firebase Admin 13.6.0 (Push notifications)

**Payment**:
- Paystack 2.0.1

**Background Jobs**:
- Bull 4.16.5
- node-cron 3.0.0

**AI/ML**:
- OpenAI 6.8.1

**Utilities**:
- i18next 25.6.1 (Internationalization)
- compression 1.7.4
- cors 2.8.5
- dotenv 17.2.3
- uuid 13.0.0

### Frontend Dependencies
**Core Framework**:
- React 19.1.0
- React Native 0.81.5
- Expo ~54.0.23
- Expo Router ~6.0.14

**Navigation**:
- @react-navigation/native 7.1.19
- @react-navigation/native-stack 7.6.2
- @react-navigation/bottom-tabs 7.8.4
- @react-navigation/drawer 7.7.2

**State Management**:
- Zustand 5.0.8

**UI Components**:
- @gorhom/bottom-sheet 5.2.6
- react-native-modal 14.0.0-rc.1
- react-native-skeleton-placeholder 5.2.4
- react-native-vector-icons 10.3.0
- @expo/vector-icons 15.0.3

**Networking**:
- Axios 1.13.2
- Socket.io-client 4.8.1
- @react-native-community/netinfo 11.4.1

**Storage**:
- @react-native-async-storage/async-storage 2.2.0
- react-native-mmkv 4.0.0
- expo-secure-store ~15.0.7

**Media & Camera**:
- expo-camera ~17.0.9
- expo-image ~3.0.10
- expo-image-picker ~17.0.8
- expo-video ~3.0.14
- expo-media-library ~18.2.0

**Utilities**:
- i18next 25.6.1
- react-i18next 16.2.4
- date-fns 4.1.0
- uuid 13.0.0
- form-data 4.0.0

**Expo Modules**:
- expo-notifications ~0.32.12
- expo-location ~19.0.7
- expo-haptics ~15.0.7
- expo-linking ~8.0.8
- expo-clipboard ~8.0.7
- expo-constants ~18.0.10
- expo-device ~8.0.9
- expo-font ~14.0.9
- expo-blur ~15.0.7
- expo-linear-gradient ~15.0.7
- expo-localization ~17.0.7
- expo-splash-screen ~31.0.10
- expo-status-bar ~3.0.8
- expo-symbols ~1.0.7
- expo-system-ui ~6.0.8
- expo-web-browser ~15.0.9

**Animation**:
- react-native-reanimated ~4.1.1
- react-native-gesture-handler ~2.28.0
- react-native-worklets 0.5.1

## Development and Deployment

**Backend**:
- Development: `npm run dev` (nodemon with ts-node)
- Build: `npm run build` (TypeScript compilation)
- Production: `npm start` (runs compiled dist/index.js)
- Database Init: `npm run init-db`
- Seed Data: `npm run seed-mock`

**Frontend**:
- Development: `npm start` (Expo CLI)
- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`
- Lint: `npm run lint`
- Test APIs: `npm run test:apis`

**Databases**:
- PostgreSQL and MongoDB with migration/seed scripts
- Redis for caching and rate limiting

**Background Jobs**:
- Cron jobs for analytics, cleanup, notifications

**Monitoring**:
- Comprehensive logging and error tracking
- Analytics tracking throughout the app

## Project Structure Summary

```
raved-mobile/
├── backend/                    # Node.js/TypeScript API server
│   ├── src/
│   │   ├── routes/            # 25+ API route files
│   │   ├── controllers/       # 24 controller files
│   │   ├── services/          # 40+ service files
│   │   ├── models/
│   │   │   ├── postgres/      # 19 PostgreSQL models
│   │   │   └── mongoose/      # 8 MongoDB models
│   │   ├── middleware/        # 10 middleware files
│   │   ├── config/            # Configuration files
│   │   ├── jobs/              # Background jobs
│   │   ├── scripts/           # Database scripts
│   │   ├── locales/           # i18n translations (en, fr, ha, tw)
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── index.ts           # Main server entry
│   │   └── socket.ts          # Socket.io server
│   ├── dist/                  # Compiled JavaScript
│   ├── node_modules/          # Dependencies
│   └── package.json
│
├── raved/                     # React Native/Expo mobile app
│   ├── app/                   # 48 Expo Router screens
│   │   ├── (auth)/           # Authentication screens
│   │   ├── (tabs)/           # Main tab screens
│   │   ├── chat/             # Chat screens
│   │   ├── event/            # Event screens
│   │   ├── post/             # Post screens
│   │   ├── product/          # Product screens
│   │   ├── profile/          # Profile screens
│   │   ├── stories/          # Story screens
│   │   └── admin/            # Admin screens
│   ├── components/            # 37 React components
│   │   ├── ui/               # UI components
│   │   ├── sheets/           # Bottom sheets
│   │   ├── store/            # Store components
│   │   ├── stories/          # Story components
│   │   ├── posts/            # Post components
│   │   ├── chat/             # Chat components
│   │   └── providers/        # Context providers
│   ├── services/              # 25 API/service files
│   ├── store/                 # Zustand state stores
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   ├── theme/                 # Theme configuration
│   ├── constants/             # App constants
│   ├── contexts/              # React contexts
│   ├── locales/               # i18n translations
│   ├── utils/                 # Utility functions
│   ├── assets/                # Images, fonts, etc.
│   ├── node_modules/          # Dependencies
│   └── package.json
│
└── Documentation/             # 40+ markdown files
    ├── CODEBASE_INDEX.md     # This file
    ├── START_HERE.md         # Getting started
    ├── TESTING_GUIDE.md      # Testing guide
    └── [38 more docs...]
```

## Architecture Highlights

- **Hybrid Database**: PostgreSQL for relational data, MongoDB for flexible document data
- **Offline-First**: Comprehensive offline support with conflict resolution
- **Microservices-like**: Modular service architecture
- **Real-time**: Socket.io for instant updates
- **Scalable**: Rate limiting, caching, background jobs
- **Secure**: JWT auth, input validation, moderation
- **International**: Multi-language support (English, French, Hausa, Twi)
- **Cross-platform**: React Native for iOS/Android/Web

---

This index provides a comprehensive overview of the Raved Mobile codebase architecture, key components, and functionality.