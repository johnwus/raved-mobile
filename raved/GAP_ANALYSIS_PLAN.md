# Raved Frontend Gap Analysis and Implementation Plan

This document outlines the features present in `app-prototype.html` and details the necessary frontend implementation (JS functions/logic) and corresponding backend API interactions required to integrate them into the `raved` React Native application.

## 1. Authentication

### 1.1 Login
- **Prototype Feature:** Login form with email/username/phone, password, "Remember me", "Forgot password", and "Register" links.
- **Frontend (JS Functions/Logic):**
    - `handleLogin(identifier, password, rememberMe)`: Function to submit login credentials.
    - `togglePasswordVisibility()`: Function to show/hide password.
    - Navigation to `/forgot-password` and `/register`.
- **Backend (API Interactions):**
    - `POST /auth/login`: Authenticate user.
        - Request: `{ identifier: string, password: string, rememberMe: boolean }`
        - Response: `{ token: string, refreshToken: string, user: UserObject }`
    - `POST /auth/refresh-token`: (Implicitly needed for "Remember me") Refresh authentication token.

### 1.2 Register
- **Prototype Feature:** Registration form (details not fully visible in truncated HTML, but implied).
- **Frontend (JS Functions/Logic):**
    - `handleRegistration(userData)`: Function to submit new user details.
- **Backend (API Interactions):**
    - `POST /auth/register`: Register a new user.
        - Request: `{ username, email, password, ... }`
        - Response: `{ message: string, user: UserObject }`

### 1.3 Forgot Password
- **Prototype Feature:** Link for forgot password.
- **Frontend (JS Functions/Logic):**
    - `handleForgotPassword(emailOrIdentifier)`: Function to request password reset.
- **Backend (API Interactions):**
    - `POST /auth/forgot-password`: Initiate password reset.
        - Request: `{ identifier: string }`
        - Response: `{ message: string }`

## 2. App Shell & Global Components

### 2.1 Top App Bar
- **Prototype Feature:** Menu button, dynamic title, Search button, Notifications button (with badge), Theme toggle.
- **Frontend (JS Functions/Logic):**
    - `openMoreSheet()`: Toggle visibility of the "More actions" sheet.
    - `navigateToSearch()`: Navigate to search screen.
    - `navigateToNotifications()`: Navigate to notifications screen.
    - `toggleTheme()`: Switch between light/dark mode.
    - `updateNotificationBadge(count)`: Update notification count.
- **Backend (API Interactions):**
    - `GET /notifications/unread-count`: Get count of unread notifications.

### 2.2 Bottom Tabbar
- **Prototype Feature:** Home, Faculties, Create Post, Events, Profile tabs.
- **Frontend (JS Functions/Logic):**
    - `switchTab(tabName)`: Navigate between main tabs.
    - `openCreatePost()`: Navigate to the create post screen.
- **Backend (API Interactions):** (Implicitly handled by loading data for each tab)

### 2.3 Floating Action Buttons (FABs)
- **Prototype Feature:** Store, Connections, Messages FABs with badges.
- **Frontend (JS Functions/Logic):**
    - `openStore()`: Navigate to store.
    - `openConnections()`: Navigate to connections.
    - `openMessages()`: Navigate to messages/chat.
    - `updateCartBadge(count)`: Update cart item count.
    - `updateConnectionsBadge(count)`: Update new connection request count.
    - `updateMessagesBadge(count)`: Update unread message count.
- **Backend (API Interactions):**
    - `GET /cart/count`: Get number of items in user's cart.
    - `GET /connections/pending-count`: Get count of pending connection requests.
    - `GET /messages/unread-count`: Get count of unread messages.

### 2.4 Toast Notifications
- **Prototype Feature:** Temporary success/error messages.
- **Frontend (JS Functions/Logic):**
    - `showToast(message, type)`: Display a toast notification.
- **Backend (API Interactions):** (Frontend-only, no direct backend interaction)

### 2.5 Sheets/Modals (General)
- **Prototype Feature:** Reusable sheet component with handle, header, content, and footer.
- **Frontend (JS Functions/Logic):**
    - `openSheet(sheetId)`: Show a specific sheet.
    - `closeSheet(sheetId)`: Hide a specific sheet.
    - `toggleSheetState(sheetId, state)`: Collapse/expand sheet.
- **Backend (API Interactions):** (General UI component, specific sheets will have their own API needs)

## 3. Home Screen (`index.tsx`)

### 3.1 Stories
- **Prototype Feature:** Horizontal scrollable list of user stories.
- **Frontend (JS Functions/Logic):**
    - `renderStories(storiesData)`: Display stories.
    - `viewStory(storyId)`: Open a story viewer.
- **Backend (API Interactions):**
    - `GET /stories`: Fetch current user stories and stories from followed users.
        - Response: `[{ id, userId, username, avatar, media: [{ type, url }], timestamp, viewed }]`

### 3.2 Featured Post
- **Prototype Feature:** A prominent single post.
- **Frontend (JS Functions/Logic):**
    - `renderFeaturedPost(postData)`: Display the featured post.
- **Backend (API Interactions):**
    - `GET /posts/featured`: Fetch the featured post.
        - Response: `PostObject`

### 3.3 Store Teaser
- **Prototype Feature:** Grid of store items, "View All Items" button.
- **Frontend (JS Functions/Logic):**
    - `renderStoreItems(itemsData)`: Display a subset of store items.
    - `navigateToStore()`: Navigate to the full store screen.
- **Backend (API Interactions):**
    - `GET /store/items?limit=4`: Fetch a limited number of store items.
        - Response: `[ItemObject]`

### 3.4 Rankings Teaser
- **Prototype Feature:** Top 3 creators (if premium), CTA for free users.
- **Frontend (JS Functions/Logic):**
    - `renderRankings(rankingsData)`: Display top creators.
    - `navigateToRankings()`: Navigate to the full rankings screen.
    - `navigateToSubscription()`: Navigate to subscription screen.
- **Backend (API Interactions):**
    - `GET /rankings?period=weekly&limit=3`: Fetch top 3 weekly rankings.
        - Response: `[{ userId, name, avatar, score }]`

### 3.5 User Feed
- **Prototype Feature:** Scrollable list of posts, "Load More" button.
- **Frontend (JS Functions/Logic):**
    - `renderFeed(postsData)`: Display posts.
    - `loadMorePosts()`: Fetch and append more posts to the feed.
- **Backend (API Interactions):**
    - `GET /posts/feed?page=X&limit=Y`: Fetch paginated user feed posts.
        - Response: `[{ PostObject }]`

## 4. Faculties Screen (`app/faculties.tsx` - implied)

### 4.1 Faculty Selection
- **Prototype Feature:** Grid of faculty buttons with member counts, filter posts by faculty.
- **Frontend (JS Functions/Logic):**
    - `selectFaculty(facultyId)`: Filter posts by selected faculty.
    - `renderFacultyList(facultiesData)`: Display available faculties.
- **Backend (API Interactions):**
    - `GET /faculties`: Fetch list of faculties with member counts.
        - Response: `[{ id, name, memberCount, postCount, eventCount }]`

### 4.2 Faculty Stats
- **Prototype Feature:** Displays members, posts, events for selected faculty.
- **Frontend (JS Functions/Logic):**
    - `updateFacultyStats(statsData)`: Update displayed stats.
- **Backend (API Interactions):**
    - `GET /faculties/{id}/stats`: Fetch stats for a specific faculty.
        - Response: `{ memberCount, postCount, eventCount }`

### 4.3 Faculty Feed
- **Prototype Feature:** Posts related to the selected faculty, "Load More" button.
- **Frontend (JS Functions/Logic):**
    - `renderFacultyFeed(postsData)`: Display faculty-specific posts.
    - `loadMoreFacultyPosts(facultyId)`: Fetch and append more faculty posts.
- **Backend (API Interactions):**
    - `GET /posts/faculty/{facultyId}?page=X&limit=Y`: Fetch paginated posts for a faculty.
        - Response: `[{ PostObject }]`

## 5. Create Post Screen (`app/add-item.tsx` or `app/create-post.tsx` - implied)

### 5.1 Post Content Input
- **Prototype Feature:** Textarea for caption, character count, media upload area, media preview.
- **Frontend (JS Functions/Logic):**
    - `handleCaptionChange(text)`: Update caption, manage character count.
    - `handleMediaUpload(files)`: Process selected image/video files, show previews.
    - `removeMedia(fileId)`: Remove a media item from preview.
    - `saveDraft(postData)`: Save current post as a draft.
- **Backend (API Interactions):**
    - `POST /uploads/media`: Upload media files.
        - Request: `FormData` with files.
        - Response: `[{ url: string, type: string }]`
    - `POST /posts/draft`: Save post as draft.
        - Request: `PostDraftObject`
        - Response: `{ message: string, draftId: string }`

### 5.2 Post Details (Visibility, Location, Tags, Outfit)
- **Prototype Feature:** Select visibility, add location (with suggestions), add fashion tags (with popular tags), add outfit details (brand, occasion).
- **Frontend (JS Functions/Logic):**
    - `selectVisibility(option)`: Set post visibility.
    - `useCurrentLocation()`: Get user's current geographical location.
    - `searchLocation(query)`: Fetch location suggestions.
    - `addTag(tag)`: Add a fashion tag.
    - `removeTag(tag)`: Remove a fashion tag.
    - `handleOutfitDetailsChange(field, value)`: Update outfit details.
- **Backend (API Interactions):**
    - `GET /locations/search?query=X`: Search for location suggestions.
        - Response: `[{ name, coordinates }]`
    - `GET /tags/popular`: Fetch popular fashion tags.
        - Response: `[{ name, count }]`

### 5.3 Marketplace Integration (Sell Item)
- **Prototype Feature:** Toggle "Available for sale", input price, condition, size, category, item description, payment methods, contact info.
- **Frontend (JS Functions/Logic):**
    - `toggleForSale(isEnabled)`: Show/hide sale details.
    - `handleSaleDetailsChange(field, value)`: Update sale item details.
    - `selectPaymentMethod(method)`: Select accepted payment methods.
    - `handleContactInfoChange(field, value)`: Update contact information.
- **Backend (API Interactions):**
    - (This is part of the `POST /posts` or `POST /store/items` endpoint, depending on how it's structured. If it's a separate item, then `POST /store/items`.)
    - `POST /store/items`: Create a new store item.
        - Request: `{ postId, price, condition, size, category, description, paymentMethods, contactInfo }`
        - Response: `{ message: string, itemId: string }`

### 5.4 Share Post
- **Prototype Feature:** "Share" button to publish the post.
- **Frontend (JS Functions/Logic):**
    - `publishPost(postData)`: Submit the complete post.
- **Backend (API Interactions):**
    - `POST /posts`: Create a new post.
        - Request: `{ caption, mediaUrls, visibility, location, tags, outfitDetails, saleItemDetails (optional) }`
        - Response: `{ message: string, postId: string }`

## 6. Events Screen (`app/event/create-event.tsx` and `app/event/index.tsx` - implied)

### 6.1 Event Creation
- **Prototype Feature:** "Create Event" button.
- **Frontend (JS Functions/Logic):**
    - `navigateToCreateEvent()`: Navigate to event creation form.
- **Backend (API Interactions):**
    - `POST /events`: Create a new event.
        - Request: `{ title, description, date, time, location, type, audience, imageUrl }`
        - Response: `{ message: string, eventId: string }`

### 6.2 Event Filters
- **Prototype Feature:** Filter events by type (All, Fashion Shows, Workshops, etc.) and audience (All Students, Undergraduate, etc.).
- **Frontend (JS Functions/Logic):**
    - `filterEventsByType(type)`: Filter events by category.
    - `filterEventsByAudience(audience)`: Filter events by target audience.
- **Backend (API Interactions):**
    - `GET /events?type=X&audience=Y`: Fetch events based on filters.
        - Response: `[{ EventObject }]`

### 6.3 Events List
- **Prototype Feature:** Displays a list of events.
- **Frontend (JS Functions/Logic):**
    - `renderEvents(eventsData)`: Display events.
- **Backend (API Interactions):**
    - `GET /events`: Fetch all events.
        - Response: `[{ EventObject }]`

## 7. Profile Screen (`app/profile-settings.tsx` and `app/edit-profile.tsx` - implied)

### 7.1 Profile Header
- **Prototype Feature:** Avatar (with change option), name, username, bio, location, join date, premium badge, settings button.
- **Frontend (JS Functions/Logic):**
    - `openChangeAvatar()`: Open avatar upload/selection.
    - `openProfileSettings()`: Navigate to profile settings.
    - `shareProfile()`: Trigger native share sheet for profile link.
- **Backend (API Interactions):**
    - `GET /users/{userId}/profile`: Fetch user profile details.
        - Response: `UserObject` (including avatar, name, username, bio, location, joinDate, isPremium)
    - `POST /uploads/avatar`: Upload new avatar.
        - Request: `FormData` with image file.
        - Response: `{ avatarUrl: string }`

### 7.2 Profile Stats
- **Prototype Feature:** Posts, Followers, Following, Likes counts.
- **Frontend (JS Functions/Logic):**
    - `updateProfileStats(statsData)`: Update displayed counts.
- **Backend (API Interactions):**
    - `GET /users/{userId}/stats`: Fetch user's stats.
        - Response: `{ postCount, followerCount, followingCount, likeCount }`

### 7.3 Action Buttons
- **Prototype Feature:** "Edit Profile" button.
- **Frontend (JS Functions/Logic):**
    - `navigateToEditProfile()`: Navigate to edit profile screen.
- **Backend (API Interactions):** (Handled by `PUT /users/{userId}/profile` on edit profile screen)

### 7.4 Subscription Status
- **Prototype Feature:** Displays trial status or premium status.
- **Frontend (JS Functions/Logic):**
    - `updateSubscriptionStatus(statusData)`: Display subscription info.
- **Backend (API Interactions):**
    - `GET /users/{userId}/subscription-status`: Fetch user's subscription status.
        - Response: `S{ status: 'free' | 'trial' | 'premium', trialDaysLeft: number (if trial), endDate: Date (if premium) }`

### 7.5 Profile Content Tabs (Posts, Comments, Liked, Saved)
- **Prototype Feature:** Tabs to switch between different content types.
- **Frontend (JS Functions/Logic):**
    - `switchProfileTab(tabName)`: Change active tab.
    - `renderUserPosts(postsData)`: Display user's own posts.
    - `renderUserComments(commentsData)`: Display user's comments.
    - `renderLikedPosts(postsData)`: Display posts liked by user.
    - `renderSavedPosts(postsData)`: Display posts saved by user.
- **Backend (API Interactions):**
    - `GET /users/{userId}/posts?page=X&limit=Y`: Fetch user's posts.
    - `GET /users/{userId}/comments?page=X&limit=Y`: Fetch user's comments.
    - `GET /users/{userId}/liked-posts?page=X&limit=Y`: Fetch posts liked by user.
    - `GET /users/{userId}/saved-posts?page=X&limit=Y`: Fetch posts saved by user.

## 8. Sheets/Modals (Specific Implementations)

### 8.1 More Actions Sheet (`components/sheets/MoreSheet.tsx`)
- **Prototype Feature:** Quick access to Messages, Cart, Bookmarks, Connections, Faculties, Rankings, Seller Dashboard, Logout.
- **Frontend (JS Functions/Logic):**
    - `navigateToMessages()`, `navigateToCart()`, `navigateToBookmarks()`, `navigateToConnections()`, `navigateToFaculties()`, `navigateToRankings()`, `navigateToSellerDashboard()`, `handleLogout()`.
- **Backend (API Interactions):**
    - `POST /auth/logout`: Invalidate session/token.

### 8.2 Search Sheet (`app/search.tsx` - implied)
- **Prototype Feature:** Search input, filters (All, Users, Posts, Tags), search results.
- **Frontend (JS Functions/Logic):**
    - `handleSearchInput(query)`: Perform search as user types.
    - `applySearchFilter(filterType)`: Filter search results.
    - `clearSearch()`: Clear search input and results.
- **Backend (API Interactions):**
    - `GET /search?query=X&filter=Y`: Search across users, posts, tags.
        - Response: `{ users: [], posts: [], tags: [] }`

### 8.3 Notifications Sheet (`app/notifications.tsx` - implied)
- **Prototype Feature:** List of notifications.
- **Frontend (JS Functions/Logic):**
    - `renderNotifications(notificationsData)`: Display notifications.
    - `markNotificationAsRead(notificationId)`: Mark a notification as read.
- **Backend (API Interactions):**
    - `GET /notifications`: Fetch user's notifications.
        - Response: `[{ id, type, message, timestamp, read, relatedEntityId }]`
    - `PUT /notifications/{id}/read`: Mark notification as read.

### 8.4 Comments Sheet (`app/comments.tsx` - implied)
- **Prototype Feature:** Displays comments for a post, input to add new comment.
- **Frontend (JS Functions/Logic):**
    - `renderComments(commentsData)`: Display comments for a specific post.
    - `addComment(postId, text)`: Submit a new comment.
- **Backend (API Interactions):**
    - `GET /posts/{postId}/comments`: Fetch comments for a post.
        - Response: `[{ id, userId, username, avatar, text, timestamp }]`
    - `POST /posts/{postId}/comments`: Add a comment to a post.
        - Request: `{ text: string }`
        - Response: `{ message: string, commentId: string }`

### 8.5 Post Detail Sheet (`app/product/index.tsx` or similar - implied)
- **Prototype Feature:** Displays full details of a post.
- **Frontend (JS Functions/Logic):**
    - `renderPostDetail(postData)`: Display all post information.
- **Backend (API Interactions):**
    - `GET /posts/{postId}`: Fetch full details of a single post.
        - Response: `PostObject`

### 8.6 Store Item Sheet (`app/product/index.tsx` or similar - implied)
- **Prototype Feature:** Displays full details of a store item.
- **Frontend (JS Functions/Logic):**
    - `renderItemDetail(itemData)`: Display all item information.
- **Backend (API Interactions):**
    - `GET /store/items/{itemId}`: Fetch full details of a single store item.
        - Response: `ItemObject`

### 8.7 Store Sheet (`app/store.tsx` - implied)
- **Prototype Feature:** Store banner, category filters, sort options, items grid, "Load More", "Sell Your Item" CTA.
- **Frontend (JS Functions/Logic):**
    - `filterStoreItems(category)`: Filter items by category.
    - `sortStoreItems(sortBy)`: Sort items.
    - `loadMoreStoreItems()`: Fetch and append more store items.
    - `openCart()`: Navigate to cart.
    - `openSellItem()`: Navigate to create item screen.
- **Backend (API Interactions):**
    - `GET /store/stats`: Get store statistics (seller count, item count).
        - Response: `{ sellerCount, itemCount }`
    - `GET /store/items?category=X&sortBy=Y&page=Z&limit=W`: Fetch paginated and filtered store items.
        - Response: `[{ ItemObject }]`

### 8.8 Product Detail Sheet (`app/product/index.tsx` - implied)
- **Prototype Feature:** Displays product details, share, save, add to cart.
- **Frontend (JS Functions/Logic):**
    - `shareProduct()`: Trigger native share.
    - `toggleProductSave()`: Save/unsave product.
    - `addToCart(itemId, quantity)`: Add item to cart.
- **Backend (API Interactions):**
    - `POST /users/{userId}/saved-items/{itemId}`: Save an item.
    - `DELETE /users/{userId}/saved-items/{itemId}`: Unsave an item.
    - `POST /cart/add`: Add item to cart.
        - Request: `{ itemId, quantity }`
        - Response: `{ message: string, cartItemCount: number }`

### 8.9 Theme Selector Sheet (`app/themes.tsx` - implied)
- **Prototype Feature:** Premium themes, theme previews, apply button.
- **Frontend (JS Functions/Logic):**
    - `selectTheme(themeName)`: Select a theme.
    - `applyTheme()`: Apply the selected theme.
- **Backend (API Interactions):**
    - `PUT /users/{userId}/preferences/theme`: Save user's theme preference.
        - Request: `{ theme: string }`
        - Response: `{ message: string }`

### 8.10 Seller Dashboard Sheet (`app/seller-dashboard.tsx` - implied)
- **Prototype Feature:** Store stats (total items, sales), quick actions (add new item, bulk discount), list of seller's items.
- **Frontend (JS Functions/Logic):**
    - `openCreateStoreItem()`: Navigate to create item.
    - `openBulkActions()`: Open bulk discount modal/screen.
    - `refreshSellerItems()`: Refresh list of items.
    - `renderSellerItems(itemsData)`: Display seller's items.
- **Backend (API Interactions):**
    - `GET /users/{userId}/seller-stats`: Fetch seller's statistics.
        - Response: `{ totalItems, totalSales }`
    - `GET /users/{userId}/store-items`: Fetch items listed by the seller.
        - Response: `[{ ItemObject }]`

### 8.11 Rankings Sheet (`app/rankings.tsx` - implied)
- **Prototype Feature:** Prize pool info, ranking filters (week, month, all time), top 3 podium, full rankings list, scoring system, subscription CTA.
- **Frontend (JS Functions/Logic):**
    - `filterRankings(period)`: Filter rankings by time period.
    - `renderPodium(top3Data)`: Display top 3.
    - `renderFullRankings(rankingsData)`: Display full list.
- **Backend (API Interactions):**
    - `GET /rankings?period=X`: Fetch rankings for a specific period.
        - Response: `[{ userId, name, avatar, score }]`

### 8.12 Subscription Sheet (`app/subscription.tsx` - implied)
- **Prototype Feature:** Current status (trial/premium), premium features list, pricing, payment methods, subscribe button.
- **Frontend (JS Functions/Logic):**
    - `selectPaymentMethod(method)`: Select payment method.
    - `subscribeToPremium()`: Initiate subscription process.
- **Backend (API Interactions):**
    - `POST /subscriptions/create`: Initiate subscription payment.
        - Request: `{ planId, paymentMethod, ... }`
        - Response: `{ paymentUrl: string | confirmationDetails }`
    - `GET /subscriptions/plans`: Fetch available subscription plans.
        - Response: `[{ id, name, price, features }]`

## 9. Other Screens (Implied from `raved/app` directory)

### 9.1 Cart Screen (`app/cart.tsx`)
- **Prototype Feature:** List of items in cart, checkout.
- **Frontend (JS Functions/Logic):**
    - `renderCartItems(itemsData)`: Display items in cart.
    - `updateCartItemQuantity(itemId, quantity)`: Change quantity.
    - `removeCartItem(itemId)`: Remove item from cart.
    - `proceedToCheckout()`: Navigate to checkout.
- **Backend (API Interactions):**
    - `GET /cart`: Fetch user's cart contents.
        - Response: `[{ itemId, name, price, quantity, imageUrl }]`
    - `PUT /cart/update-item`: Update item quantity in cart.
    - `DELETE /cart/remove-item`: Remove item from cart.

### 9.2 Checkout Screen (`app/checkout.tsx`)
- **Prototype Feature:** Shipping, payment, order summary.
- **Frontend (JS Functions/Logic):**
    - `submitOrder(orderDetails)`: Place the order.
- **Backend (API Interactions):**
    - `POST /orders`: Create a new order.
        - Request: `{ cartItems, shippingAddress, paymentInfo }`
        - Response: `{ orderId, message }`

### 9.3 Connections Screen (`app/connections.tsx`)
- **Prototype Feature:** List of connections, pending requests.
- **Frontend (JS Functions/Logic):**
    - `renderConnections(connectionsData)`: Display connections.
    - `acceptConnectionRequest(requestId)`: Accept a request.
    - `declineConnectionRequest(requestId)`: Decline a request.
- **Backend (API Interactions):**
    - `GET /users/{userId}/connections`: Fetch user's connections.
    - `GET /users/{userId}/connection-requests`: Fetch pending connection requests.
    - `POST /connections/{requestId}/accept`: Accept request.
    - `POST /connections/{requestId}/decline`: Decline request.

### 9.4 Chat Screen (`app/chat.tsx`)
- **Prototype Feature:** List of chats, individual chat view.
- **Frontend (JS Functions/Logic):**
    - `renderChatList(chatsData)`: Display list of conversations.
    - `renderMessages(messagesData)`: Display messages in a chat.
    - `sendMessage(chatId, text)`: Send a message.
- **Backend (API Interactions):**
    - `GET /chats`: Fetch user's chat list.
    - `GET /chats/{chatId}/messages`: Fetch messages for a chat.
    - `POST /chats/{chatId}/messages`: Send a message.
    - (WebSocket for real-time chat)

### 9.5 Settings Screens (e.g., `app/profile-settings.tsx`, `app/api-settings.tsx`, `app/database-settings.tsx`, `app/language-settings.tsx`, `app/notification-settings.tsx`, `app/privacy-settings.tsx`)
- **Prototype Feature:** Various settings options.
- **Frontend (JS Functions/Logic):**
    - `updateSetting(settingName, value)`: Update a specific setting.
- **Backend (API Interactions):</strong>
    - `GET /users/{userId}/settings`: Fetch user settings.
    - `PUT /users/{userId}/settings`: Update user settings.
