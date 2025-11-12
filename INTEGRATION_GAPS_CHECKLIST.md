# INTEGRATION_GAPS_CHECKLIST.md

This document tracks gaps between the prototype interactions in `app-prototype.html` and the actual implementations in `raved/` (Expo app) and `backend/` (Node/Express API). It focuses on concrete frontend actions, expected backend endpoints, current code, and precise fixes.

Scope anchors
- Prototype: app-prototype.html (UI + JS functions like UI.openSheet, openStore, openRankings, etc.)
- Mobile app: raved/ (Expo Router screens and services)
- API: backend/src (routes + controllers)

Legend
- Status: implemented | partially | missing | mismatch
- Action types: FE (frontend), BE (backend), Both

1) Authentication and session
- Prototype intent: Login with email/username/phone; remember me; reset password sheet; sign out
- Frontend actual: raved/services/api.ts exports login that currently enforces email-only and posts {identifier, password}; raved/components/sheets/PasswordResetSheet.tsx exists; useAuth.tsx manages session; MoreSheet -> Logout.
- Backend actual: POST /auth/login, /auth/refresh, reset and SMS flows exist.
- Gaps
  - Identifier normalization: prototype accepts email/username/phone; FE login currently rejects non-email. Status: mismatch. Action (FE): expand login normalization to support username/phone and map to backend’s identifier field.
  - “Remember me”: prototype has checkbox; FE uses Storage for tokens but no explicit remember toggle. Status: partially. Action (FE): add remember flag to choose secure storage vs memory.

2) Home: stories, featured, store teaser, rankings teaser, feed
- Prototype intent: render stories row, featured post, store teaser with “View All Items”, rankings teaser for premium users, feed with load more.
- Frontend actual: Home screen implements all, calls postsApi.getPostSuggestions, getTrendingPosts, userApi.getRankings; StoryRow uses stories from storiesApi; store teaser uses useStore; FABs navigate to /store, /connections, /chat.
- Backend actual: /stories, /posts/suggestions, /posts/trending, /rankings, /store/items present.
- Gaps
  - Rankings API usage: Home uses userApi.getRankings, which calls GET /rankings with period param. OK. Status: implemented.
  - Suggestions/trending: FE implemented and mapped. Status: implemented.

3) Faculties: filtering + stats + feed
- Prototype intent: campus communities selector, stats (members/posts/events), feed per faculty, load more.
- Frontend actual: app/(tabs)/faculties.tsx uses facultiesApi.getFaculties, getFacultyStats and postsApi.getFacultyPosts.
- Backend actual: /faculties, /faculties/:facultyId/stats; /posts/faculty/:facultyId.
- Gaps: None. Status: implemented.

4) Create Post: media upload, tags, location, marketplace toggle, share
- Prototype intent: build Create Post with media picker, tags, optional location with suggestions, “for sale” details (price, condition, size, category, payments), Share button.
- Frontend actual: app/(tabs)/create.tsx implements UI, uses ImagePicker, prepares CreatePostData and calls usePostsStore.createPost -> postsApi.createPost.
- Backend actual: POST /posts supports isForSale + saleDetails and creates corresponding store item.
- Gaps
  - Location search/suggestions: prototype shows suggestions; FE uses utils/mockData only. Status: partially. Action (FE): integrate real geocoding API or adopt backend support if/when exposed.
  - ForSale validation: ensure FE enforces numeric price > 0 and required category/condition before share. Status: partially. Action (FE): add client-side validation consistent with backend express-validator rules.

5) Post interactions: like, comment, share, save/bookmark
- Prototype intent: like, comment sheet, share, save; add-to-cart when sale.
- Frontend actual: PostCard uses likePost/unlikePost (toggle by calling same POST), comment navigation to /comments, share button placeholder, bookmark local state; sale badge shows cart icon.
- Backend actual: POST /posts/:id/like, POST /posts/:id/comments, GET /posts/:id/comments.
- Gaps
  - Share: prototype has share; FE button does nothing. Status: missing. Action (FE): implement postsApi.sharePost endpoint and UI.
  - Save/bookmark: prototype shows save; FE only local state. Backend has user saved posts endpoints under /users. Status: partially. Action (FE): wire to backend saved-posts endpoints or add dedicated posts save API if available.

6) Store: items grid, product detail, similar items, cart, checkout
- Prototype intent: store grid with filters/sort, item detail with save/share, similar items flow, cart and checkout with multiple payment methods, wishlist, “sell item” flow.
- Frontend actual: app/store.tsx, product/[id].tsx, cart.tsx, checkout.tsx exist; storeApi.ts implements many APIs; useStoreStore handles cart and wishlist in local state and calls storeApi for server ops.
- Backend actual: store.routes (/store/items CRUD), cart.routes mounted at '/', with:
  - POST /cart/items, GET /cart, PATCH /cart/items/:cartItemId, DELETE /cart/items/:cartItemId
  - POST /items/:itemId/save, DELETE /items/:itemId/save, GET /wishlist
  - Payment routes exist under payment.routes (initialize/verify)
- Gaps (critical endpoint mismatches)
  - FE storeApi.addToCart calls POST /cart/add. Backend expects POST /cart/items. Status: mismatch. Action (FE): change to /cart/items.
  - FE storeApi.updateCartItem uses PUT /cart/item/:id. Backend expects PATCH /cart/items/:id. Status: mismatch. Action (FE): change method+path.
  - FE storeApi.removeFromCart uses DELETE /cart/item/:id. Backend expects DELETE /cart/items/:id. Status: mismatch. Action (FE): change path.
  - FE storeApi.getUserWishlist uses GET /cart/wishlist. Backend is GET /wishlist. Status: mismatch. Action (FE): change path.
  - FE storeApi.addToWishlist uses POST /cart/wishlist/:itemId. Backend is POST /items/:itemId/save. Status: mismatch. Action (FE): change path.
  - FE storeApi.removeFromWishlist uses DELETE /cart/wishlist/:itemId. Backend is DELETE /items/:itemId/save. Status: mismatch. Action (FE): change path.
  - FE storeApi.saveItem/unsaveItem duplicate wishlist semantics; prefer unified endpoints above. Action (FE): keep aliases pointing to new endpoints.
  - FE apiPublic.ts hardcodes a LAN IP. Status: mismatch/fragile. Action (FE): align with EXPO_PUBLIC_API_URL like api.ts.

7) Themes and appearance
- Prototype intent: theme selector sheet, apply theme, premium themes gating; dark mode toggle.
- Frontend actual: app/themes.tsx exists; ThemeContext with toggleDarkMode; premium gating via useStore/isPremium.
- Backend actual: theme.routes present; likely theme settings persisted.
- Gaps: Ensure theme selection persists to backend if required. Status: partially. Action (Both): confirm theme API usage or keep client-only state.

8) Subscription and rankings
- Prototype intent: subscription sheet, pricing, payment methods, upgrade button; rankings screens and prize pool.
- Frontend actual: app/subscription.tsx, rankings.tsx exist; userApi.getRankings used; storeApi has payment initialize/verify; subscriptionsApi exists in services.
- Backend actual: /rankings, /subscriptions, /payment routes exist.
- Gaps: End-to-end subscription purchase flow may not be fully wired in FE (depends on subscriptionsApi usage). Status: partially. Action (FE): implement upgrade flow using subscriptionsApi/payment.

9) Stories: create/view
- Prototype intent: create story (camera/gallery/video/templates/text), viewer with overlays, allow replies toggle, add to highlights.
- Frontend actual: app/stories/create.tsx, stories/view.tsx; storiesApi.getStories/createStory exist; useStoriesStore persists local state; StoryRow/StoryViewer present.
- Backend actual: POST /stories, GET /stories.
- Gaps: Ensure createStory payload maps to backend validation (requires content for non-text/template). Status: partially. Action (FE): validate before POST and support template/text forms.

10) Search
- Prototype intent: search sheet with filters (all/users/posts/tags), clear and results list.
- Frontend actual: app/search.tsx exists; searchApi.ts present; Home navigates to /search.
- Backend actual: GET /search/advanced exists with throttling.
- Gaps: Verify searchApi maps to backend path; ensure filters wired. Status: partially. Action (FE): confirm endpoints and params.

11) Profile: edit, avatar, privacy, language, settings
- Prototype intent: edit profile, change avatar, privacy toggles, language and regional settings, blocked users management, delete account.
- Frontend actual: app/edit-profile.tsx, avatar-picker.tsx, privacy-settings.tsx, language-settings.tsx, profile-settings.tsx; userApi has endpoints for profile, privacy, notifications, settings, avatar, delete.
- Backend actual: /users routes exist; auth.routes has language preferences.
- Gaps: Ensure settings pages call the correct userApi functions and persist. Status: partially. Action (FE): connect each settings toggle to userApi endpoints.

12) Notifications, chat, connections
- Prototype intent: notifications sheet, chat sheet and inbox, connections sheet with filters.
- Frontend actual: notifications.tsx, chat.tsx and chat/[id].tsx, connections.tsx exist; socket service wired; connectionsApi, notificationsApi present.
- Backend actual: corresponding routes exist.
- Gaps: Validation of event names and socket auth token refresh. Status: partially. Action (FE): ensure socketService.updateAuthToken is invoked on login/refresh.

Status updates (this session)
- Implemented: FE storeApi endpoint alignment to backend cart and wishlist routes.
- Implemented: FE apiPublic.ts uses EXPO_PUBLIC_API_URL (or localhost) in dev.
- Implemented: Login normalization (email/username/phone) and socket auth token updates.
- Implemented: Post share action wired to backend with optimistic UI + toast.
- Implemented: Create Post client-side validation for for-sale fields.
- Implemented: Location suggestions via geocoding service with debounce and loading indicator; falls back to mock data if env not set.
- Implemented: Theme persistence to backend (get/set theme, dark mode) in ThemeContext.
- Implemented: Post bookmarks/save endpoints (POST/DELETE /posts/:postId/save) and GET /users/:userId/saved-posts; wired FE to use new endpoints.
- Implemented: Share endpoint POST /posts/:postId/share to increment shares.

Initial implementation changes applied
- FE storeApi endpoint alignment to backend cart and wishlist routes (see diff).
- FE apiPublic.ts now reads EXPO_PUBLIC_API_URL (or defaults like api.ts), removing hardcoded LAN IP.

Next recommended implementation steps
- FE: Expand login() in services/api.ts to support username/phone identifiers (normalize to backend ‘identifier’), while keeping email path.
- FE: Wire Post “share” button to postsApi.sharePost and implement UI confirmation + error handling.
- FE: Hook save/bookmark to backend saved-posts APIs (or add posts save endpoints if backend supports them elsewhere).
- FE: Add client-side validation to Create Post “for sale” fields per backend validators.
- FE: Replace mock location suggestions with a geocoding integration or defer behind a feature flag.
- FE: Align store wishlist UI to call the updated endpoints and display GET /wishlist results.
- FE: Ensure socket token updates on auth change.
- BE (optional): Add explicit ‘unlike’ endpoint to reduce client ambiguity (currently toggled by POST /like).

Testing checkpoints
- Post feed loads via /posts/feed; trending/suggestions render.
- Faculties stats + posts load via /faculties + /posts/faculty/:id.
- Create Post creates normal and for-sale posts; verify a store item is created for sale posts.
- Store grid loads via /store/items; add/update/remove cart items via /cart; wishlist via /items/:id/save and /wishlist.
- Stories list via /stories; createStory payload validation.
- Rankings load via /rankings?period=weekly.

Owner
- Keep this checklist updated as endpoints or UI flows change.

# Integration Gaps Checklist

This checklist documents the identified gaps in backend-frontend integration for the Raved Mobile app, organized by development phases from AppStats.md. Analysis of the `app-prototype.html` JavaScript functions against the actual React Native implementation reveals that while most phases are marked as "completed" in AppStats.md, critical functionality gaps exist where API calls fail silently, causing empty screens despite implemented UI components.

## Phase 1: Foundation & Design System
**Status**: Marked as ✓ in AppStats.md, but theme system has integration gaps
- [ ] **Theme Sync Across Devices**: `ThemeContext` calls `/themes/users/theme` and `/themes/users/dark-mode` but sync fails. **Gap**: Theme preferences not persisting to backend or syncing across devices despite API routes existing
- [ ] **Theme Consistency**: Many screens don't properly use `useTheme()` hook, causing inconsistent dark mode application despite `ThemeContext` implementation

## Phase 2: Authentication
**Status**: Marked as ✓ in AppStats.md, but session management may have gaps
- [ ] **User Session Management**: Authentication state may not persist properly across app restarts
- [ ] **Token Validation**: JWT tokens may not be properly validated by backend middleware

## Phase 3: Home & Feed
**Status**: Marked as ✓ in AppStats.md, but core functionality broken
- [ ] **Posts Feed**: `usePosts()` hook calls `postsApi.getFeed()` but posts array remains empty. **Critical Gap**: `postsApi.getFeed()` API call failing silently - no posts displayed despite `/posts/feed` route existing
- [ ] **Stories**: `usePosts()` hook calls `storiesApi.getStories()` but stories remain empty. **Critical Gap**: `storiesApi.getStories()` API call failing - no stories displayed despite `/stories` routes existing
- [ ] **Real-time Updates**: Socket listeners initialized but real-time likes/comments/new posts not working despite `socketService` implementation

## Phase 4: Content Creation
**Status**: Marked as ✓ in AppStats.md, but backend integration may be broken
- [ ] **Post Creation**: `postsApi.createPost()` may fail silently when creating posts
- [ ] **Media Upload**: Upload functionality may not work with backend despite UI implementation

## Phase 5: Stories
**Status**: Marked as ✓ in AppStats.md, but data loading broken
- [ ] **Story Data Loading**: Stories not loading from backend despite `storiesApi.getStories()` implementation
- [ ] **Story Creation**: `storiesApi.createStory()` may fail when publishing stories

## Phase 6: Marketplace
**Status**: Marked as ✓ in AppStats.md, but data integration broken
- [ ] **Store Items Loading**: Store items not loading from backend despite store API implementations
- [ ] **Cart Persistence**: Cart data may not sync with backend despite cart functionality

## Phase 7: Social Features
**Status**: Marked as ✓ in AppStats.md, but major functionality gaps
- [ ] **Connections Display**: `userApi.getConnections()` and `connectionsApi.getPendingFollowRequests()` fail - empty connections screen despite backend routes
- [ ] **Chat System**: Missing main chat/conversations tab in navigation despite chat screens existing. **Critical Gap**: No way to access conversations from main app flow
- [ ] **Notifications**: `notificationsApi.getNotifications()` fails, falls back to mock data instead of real backend notifications
- [ ] **Profile Settings Sync**: `userApi.updateUserSettings()` calls fail - profile changes don't persist to backend

## Phase 8: Premium & Advanced
**Status**: Marked as ✓ in AppStats.md, but backend integration broken
- [ ] **Subscription Management**: Premium status may not sync properly with backend
- [ ] **Rankings Data**: Rankings API calls may fail despite rankings UI implementation

## Phase 9: Events & Faculties
**Status**: Marked as ✓ in AppStats.md, but data loading broken
- [ ] **Faculty Posts**: `postsApi.getFacultyPosts(facultyId)` fails - no faculty-specific posts displayed despite `/posts/faculty/:facultyId` route
- [ ] **Events Data**: Events not loading from backend despite events API implementations

## Phase 10: Polish & Testing
**Status**: Partially incomplete in AppStats.md, major gaps identified
- [ ] **API Error Handling**: Silent API failures not logged - users see empty screens instead of error messages
- [ ] **Data Persistence**: Zustand stores not persisting data across app restarts despite storage implementations
- [ ] **Offline Functionality**: Offline queue system not working despite `offline-queue.service.ts` infrastructure
- [ ] **Socket Real-time Features**: Live notifications and updates not functioning despite socket listeners
- [ ] **Cross-device Sync**: Theme and settings not syncing across multiple devices

## Critical Integration Issues (Across All Phases)

### API Failure Pattern
**Root Cause**: Most backend API calls are failing silently, causing:
- Empty screens instead of content
- Fallback to mock data where implemented
- Silent errors not exposed to users
- No proper error boundaries or logging

**Affected APIs**:
- `postsApi.getFeed()` - Posts not loading
- `storiesApi.getStories()` - Stories not loading
- `notificationsApi.getNotifications()` - Real notifications not loading
- `userApi.getConnections()` - Connections not loading
- `postsApi.getFacultyPosts()` - Faculty posts not loading
- `userApi.updateUserSettings()` - Profile settings not syncing
- Theme sync APIs - Theme preferences not persisting

### Navigation Gaps
- **Missing Chat Tab**: Critical navigation gap - users cannot access chat functionality despite implemented chat screens
- **Incomplete Tab Structure**: Main features not accessible from navigation despite UI implementations

### Real-time Features
- **Socket Connections**: Initialized but not functioning for live updates
- **Live Notifications**: Falling back to mock data instead of real-time backend notifications
- **Real-time Interactions**: Likes, comments, new posts not updating live

## Root Cause Analysis

**Primary Issue**: Despite AppStats.md showing most phases as "completed", the actual implementation has systematic API integration failures where backend calls fail silently, causing the app to appear broken despite implemented UI components.

**Likely Causes** (prioritized):
1. **Backend API Endpoints Broken**: Routes exist but controllers have bugs or database issues
2. **Authentication Middleware Issues**: JWT tokens/session validation failing
3. **Database Empty/Missing Data**: Backend routes work but no test data seeded
4. **Network/Request Configuration**: CORS, request headers, or base URL issues
5. **Error Handling Masking Problems**: Failed requests not logged, making debugging impossible

## Immediate Action Plan (By Priority)

### High Priority (Breaking Core Functionality)
1. **Add Comprehensive API Logging**: Log all requests/responses in frontend and backend
2. **Test Backend Endpoints**: Use Postman to verify routes work independently
3. **Check Database Seeding**: Ensure mock data is properly seeded
4. **Verify Authentication Flow**: Confirm JWT tokens and middleware working
5. **Add Chat Navigation**: Implement missing chat tab in main navigation

### Medium Priority (Feature Completion)
6. **Fix Theme Sync**: Ensure theme preferences persist to backend
7. **Implement Error Boundaries**: Show proper error messages instead of empty screens
8. **Test Socket Connections**: Verify real-time features working
9. **Fix Data Persistence**: Ensure Zustand stores persist across app restarts

### Low Priority (Polish)
10. **Cross-device Testing**: Verify theme/settings sync across devices
11. **Offline Functionality**: Test offline queue processing
12. **Performance Optimization**: Ensure smooth interactions matching prototype

## Testing Strategy

1. **Backend Verification**: Test all routes with Postman using valid auth tokens
2. **API Logging**: Add console logging to all API calls to identify failures
3. **Database Audit**: Verify seeding scripts populate data correctly
4. **Authentication Testing**: Confirm login/token persistence working
5. **Real-time Testing**: Test socket connections and live updates
6. **Navigation Testing**: Ensure all features accessible from main tabs
7. **Cross-device Sync**: Verify theme and settings sync across devices
8. **Error Handling**: Test error states and user feedback

## Success Criteria

- **Functional Parity**: All prototype JavaScript functions have working React Native equivalents
- **Data Loading**: All screens display real data from backend instead of empty states
- **Real-time Features**: Live updates working for notifications, likes, comments
- **Navigation Completeness**: All main features accessible from tab navigation
- **Data Persistence**: User preferences and data persist across app sessions
- **Cross-device Sync**: Theme and settings sync properly across multiple devices