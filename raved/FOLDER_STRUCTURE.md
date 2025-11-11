# Complete Folder Structure

This document shows the complete folder structure implemented for the Raved app.

```
raved/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx               # Root layout with providers
│   ├── (auth)/                   # Authentication stack
│   │   ├── _layout.tsx
│   │   ├── login.tsx             # Login screen
│   │   ├── register.tsx          # Registration (6-step flow)
│   │   └── reset-password.tsx    # Password reset
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx           # Tab bar layout
│   │   ├── index.tsx             # Home feed
│   │   ├── faculties.tsx         # Faculties (placeholder)
│   │   ├── create.tsx            # Create post screen ✅
│   │   ├── events.tsx            # Events (placeholder)
│   │   └── profile.tsx           # Profile (placeholder)
│   ├── stories/                  # Stories routes
│   │   ├── create.tsx            # Story creator ✅
│   │   └── view.tsx              # Story viewer ✅
│   ├── store.tsx                 # Store/marketplace screen ✅
│   ├── cart.tsx                  # Shopping cart ✅
│   ├── checkout.tsx              # Checkout flow ✅
│   ├── post/[id].tsx             # Post detail (to implement)
│   └── product/[id].tsx         # Product detail (to implement)
│
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Toast.tsx
│   ├── posts/
│   │   └── PostCard.tsx          # Post card component
│   ├── stories/
│   │   ├── StoryRow.tsx          # Stories horizontal row
│   │   └── StoryViewer.tsx       # Story viewer modal
│   ├── store/
│   │   ├── ProductCard.tsx       # Product card
│   │   └── ProductGrid.tsx       # Product grid
│   └── sheets/
│       ├── PasswordResetSheet.tsx
│       └── RegistrationSheet.tsx # 6-step registration
│
├── contexts/
│   └── ThemeContext.tsx          # Theme provider
│
├── hooks/
│   ├── useAuth.ts                # Auth hook & provider
│   ├── usePosts.ts               # Posts data hook
│   └── useStore.ts               # Store hook & provider
│
├── store/                        # Zustand stores
│   ├── postsStore.ts             # Posts state management
│   ├── storiesStore.ts           # Stories state management
│   └── storeStore.ts             # Marketplace state management
│
├── services/
│   └── storage.ts                # AsyncStorage wrapper
│
├── theme/                        # Theme system
│   ├── colors.ts                 # Color definitions
│   ├── typography.ts             # Typography system
│   ├── spacing.ts                # Spacing scale
│   ├── borderRadius.ts           # Border radius values
│   └── index.ts                  # Theme exports
│
├── types/
│   └── index.ts                  # TypeScript definitions
│
└── utils/
    ├── formatters.ts             # Formatting utilities
    ├── mockData.ts               # Mock data matching HTML
    └── validation.ts             # Validation utilities
```

## File Count Summary

- **App Screens**: 12 files
- **Components**: 15 files
- **Hooks & Contexts**: 4 files
- **Stores**: 3 files
- **Theme System**: 5 files
- **Utils & Services**: 4 files
- **Types**: 1 file

**Total**: ~44 TypeScript/TSX files implemented

## Key Features by File

### Authentication
- `app/(auth)/login.tsx` - Login with email/username/phone
- `components/sheets/RegistrationSheet.tsx` - 6-step registration
- `components/sheets/PasswordResetSheet.tsx` - Password reset

### Home Feed
- `app/(tabs)/index.tsx` - Main feed with stories, featured, store teaser
- `components/posts/PostCard.tsx` - Post display (image/video/carousel)
- `components/stories/StoryRow.tsx` - Stories horizontal scroll

### Create Post
- `app/(tabs)/create.tsx` - Full post creation with:
  - Media picker
  - Location suggestions
  - Tag system
  - Marketplace toggle
  - Payment methods

### Stories
- `app/stories/create.tsx` - Story creator with templates
- `app/stories/view.tsx` - Story viewer wrapper
- `components/stories/StoryViewer.tsx` - Story viewer with progress

### Marketplace
- `app/store.tsx` - Store screen with search & categories
- `app/cart.tsx` - Shopping cart
- `app/checkout.tsx` - Checkout with delivery & payment
- `components/store/ProductCard.tsx` - Product card
- `components/store/ProductGrid.tsx` - Product grid

### State Management
- `store/postsStore.ts` - Posts, likes, saves
- `store/storiesStore.ts` - Stories, viewed, highlights
- `store/storeStore.ts` - Cart, products, saved items

