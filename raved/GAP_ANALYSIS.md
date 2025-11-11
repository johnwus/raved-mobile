# Raved Frontend Implementation Gap Analysis and Checklist

This document outlines the features identified in `app-prototype.html` and provides a detailed checklist for their full implementation within the `raved` React Native project. The goal is to bridge the gap between the static HTML/CSS/JS design blueprint and the functional, component-based, and data-driven mobile application.

---

**I. Core App Structure & Navigation**

*   **Prototype Feature:** App Shell (max-width, min-height, background)
    *   **Raved Module:** `app/_layout.tsx`, `components/themed-view.tsx`
    *   **Checklist:**
        *   [ ] Implement responsive layout for various screen sizes using `Dimensions` API or `react-native-responsive-screen`.
        *   [ ] Ensure consistent background and theme application across the app, leveraging `ThemeContext`.
        *   [ ] Integrate `SafeAreaView` for proper handling of notches/safe areas on iOS and Android.

*   **Prototype Feature:** Top App Bar (Home, Search, Notifications, Theme Toggle)
    *   **Raved Module:** `app/(tabs)/_layout.tsx`, `components/ui/AppBar.tsx` (hypothetical custom component)
    *   **Checklist:**
        *   [ ] Create a reusable `AppBar` component using `react-native-elements` or similar UI library.
        *   [ ] Implement navigation actions for Search, Notifications, and Theme Toggle using `expo-router` or `useNavigation` hook.
        *   [ ] Integrate notification badge logic (e.g., from `zustand` store for unread count).
        *   [ ] Implement theme toggle functionality (dark/light mode, custom themes) by updating `ThemeContext`.

*   **Prototype Feature:** Bottom Tab Bar (Home, Faculties, Create, Events, Profile)
    *   **Raved Module:** `app/(tabs)/_layout.tsx`, `components/haptic-tab.tsx`
    *   **Checklist:**
        *   [ ] Configure `expo-router` tabs for main navigation, defining routes for each tab.
        *   [ ] Ensure correct icon and label display for each tab, potentially using `@expo/vector-icons`.
        *   [ ] Implement haptic feedback for tab presses using `expo-haptics`.
        *   [ ] Style the tab bar according to the prototype's design (fixed position, background, shadow) using `StyleSheet` or a styling library.

*   **Prototype Feature:** Floating Action Buttons (Store, Connections, Messages)
    *   **Raved Module:** `components/ui/FABGroup.tsx` (hypothetical custom component), `app/store.tsx`, `app/connections.tsx`, `app/chat.tsx`
    *   **Checklist:**
        *   [ ] Create a `FABGroup` component to manage multiple FABs, ensuring proper layering with `zIndex`.
        *   [ ] Implement navigation to respective screens/sheets for each FAB.
        *   [ ] Integrate badge logic for cart, connections, and messages (e.g., from `zustand` stores for counts).
        *   [ ] Ensure smooth animation and positioning of FABs using `react-native-reanimated`.

*   **Prototype Feature:** Global Overlay
    *   **Raved Module:** `components/providers/OverlayProvider.tsx` (hypothetical context provider), `react-native-modal`
    *   **Checklist:**
        *   [ ] Implement a global overlay component that can be triggered by sheets/modals, managing its visibility via a context.
        *   [ ] Ensure proper opacity and `pointerEvents` handling.

*   **Prototype Feature:** Sheet/Modal System (general functionality: show/hide, collapsed/expanded states, handle)
    *   **Raved Module:** `components/sheets/*`, `@gorhom/bottom-sheet`, `react-native-modal`
    *   **Checklist:**
        *   [ ] Standardize sheet implementation using `@gorhom/bottom-sheet` for draggable sheets or `react-native-modal` for simpler modals.
        *   [ ] Implement logic for collapsed, expanded, and full-screen states using `snapPoints` for `@gorhom/bottom-sheet`.
        *   [ ] Ensure smooth drag gestures for sheet handles.
        *   [ ] Integrate with the global overlay for background dimming.

**II. Authentication Flow**

*   **Prototype Feature:** Login Form (email/username/phone, password, remember me, forgot password, sign in button)
    *   **Raved Module:** `app/(auth)/sign-in.tsx` (hypothetical), `components/ui/TextInput.tsx`, `components/ui/Button.tsx`
    *   **Checklist:**
        *   [ ] Create `SignInForm` component with `TextInput` fields and form validation (e.g., using `Formik` and `Yup`).
        *   [ ] Implement password visibility toggle.
        *   [ ] Integrate "Remember Me" functionality using `expo-secure-store` or `react-native-mmkv` for persistent storage.
        *   [ ] Implement "Forgot Password" navigation to a dedicated recovery screen.
        *   [ ] Connect sign-in button to authentication API (`services/authApi.ts`) using `axios`.
        *   [ ] Handle loading states and display error messages to the user.

*   **Prototype Feature:** Register Link
    *   **Raved Module:** `app/(auth)/sign-up.tsx` (hypothetical)
    *   **Checklist:**
        *   [ ] Implement navigation to the registration screen.

*   **Prototype Feature:** Terms & Privacy links
    *   **Raved Module:** `app/about.tsx`, `expo-web-browser`
    *   **Checklist:**
        *   [ ] Open external links using `expo-web-browser` for a consistent user experience.

**III. Home Page (`app/(tabs)/index.tsx`)**

*   **Prototype Feature:** Stories (horizontal scroll, story rings)
    *   **Raved Module:** `components/stories/StoryFeed.tsx`, `components/stories/StoryItem.tsx`
    *   **Checklist:**
        *   [ ] Fetch stories data from API (`services/storiesApi.ts`).
        *   [ ] Implement horizontal `FlatList` for efficient scrolling of stories.
        *   [ ] Render `StoryItem` components with user avatars and status rings.
        *   [ ] Implement logic for active/inactive story rings based on viewed status.

*   **Prototype Feature:** Featured Post
    *   **Raved Module:** `components/posts/FeaturedPost.tsx`
    *   **Checklist:**
        *   [ ] Fetch featured post data from API (`services/postsApi.ts`).
        *   [ ] Render `FeaturedPost` component with post details (image, caption, user info).

*   **Prototype Feature:** Store Teaser (grid of items, "View All Items" button)
    *   **Raved Module:** `components/store/StoreTeaser.tsx`, `components/store/StoreItemCard.tsx`
    *   **Checklist:**
        *   [ ] Fetch store items data from API (`services/storeApi.ts`).
        *   [ ] Implement grid layout for teaser items using `FlatList` with `numColumns`.
        *   [ ] Implement navigation to the full store sheet (`app/store.tsx`).

*   **Prototype Feature:** Rankings Teaser/CTA (top creators, prize pool, upgrade CTA)
    *   **Raved Module:** `components/rankings/RankingsTeaser.tsx`
    *   **Checklist:**
        *   [ ] Fetch rankings data from API.
        *   [ ] Implement conditional rendering based on user subscription status (from `zustand` user store).
        *   [ ] Implement navigation to rankings sheet (`app/rankings.tsx`) or subscription sheet (`app/subscription.tsx`).

*   **Prototype Feature:** Feed (list of posts, "Load More" button)
    *   **Raved Module:** `components/posts/PostFeed.tsx`, `components/posts/PostCard.tsx`
    *   **Checklist:**
        *   [ ] Fetch feed posts data from API (`services/postsApi.ts`) with pagination.
        *   [ ] Implement `FlatList` for efficient rendering of posts, including pull-to-refresh.
        *   [ ] Render `PostCard` components with post details (media, caption, likes, comments).
        *   [ ] Implement "Load More" functionality at the end of the list.

**IV. Faculties Page (`app/(tabs)/faculties.tsx`)**

*   **Prototype Feature:** Faculty Selection (grid of buttons, active state)
    *   **Raved Module:** `components/faculties/FacultyFilter.tsx` (hypothetical custom component)
    *   **Checklist:**
        *   [ ] Fetch list of faculties from API.
        *   [ ] Implement a grid of selectable faculty buttons.
        *   [ ] Manage active faculty state using `zustand` or component state.

*   **Prototype Feature:** Faculty Stats (members, posts, events)
    *   **Raved Module:** `components/faculties/FacultyStats.tsx` (hypothetical custom component)
    *   **Checklist:**
        *   [ ] Fetch stats for the selected faculty from API.
        *   [ ] Display member, post, and event counts.

*   **Prototype Feature:** Faculty Feed (list of posts, "Load More" button)
    *   **Raved Module:** `components/posts/PostFeed.tsx` (reusable)
    *   **Checklist:**
        *   [ ] Fetch posts filtered by the selected faculty from API with pagination.
        *   [ ] Implement "Load More" functionality.

**V. Create Post Page (`app/(tabs)/create.tsx` or `app/add-item.tsx`)**

*   **Prototype Feature:** Header (New Post, Save Draft)
    *   **Raved Module:** `components/ui/Header.tsx` (reusable)
    *   **Checklist:**
        *   [ ] Implement "Save Draft" functionality (e.g., local storage using `AsyncStorage` or `react-native-mmkv`, or API).

*   **Prototype Feature:** User Info (avatar, name, faculty, visibility selector)
    *   **Raved Module:** `components/ui/UserHeader.tsx` (reusable), `components/ui/VisibilitySelector.tsx` (hypothetical custom component)
    *   **Checklist:**
        *   [ ] Display current user's avatar, name, and faculty (from `zustand` user store).
        *   [ ] Implement visibility selector with options (public, faculty, connections, private) using a `Picker` or custom dropdown.

*   **Prototype Feature:** Content Input (caption textarea, character count)
    *   **Raved Module:** `components/ui/TextArea.tsx` (custom component wrapping `TextInput`)
    *   **Checklist:**
        *   [ ] Implement a multi-line text input with character count display.

*   **Prototype Feature:** Media Upload Area (drag & drop, file input, preview, clear)
    *   **Raved Module:** `components/ui/MediaUploader.tsx` (hypothetical custom component), `expo-image-picker`, `expo-media-library`
    *   **Checklist:**
        *   [ ] Integrate `expo-image-picker` for selecting photos/videos from gallery or camera.
        *   [ ] Implement media preview (thumbnails) using `expo-image` or `Image` component.
        *   [ ] Implement "Clear" functionality for selected media.
        *   [ ] Handle multiple file selections and display progress during upload.

*   **Prototype Feature:** Location Section (input, use current location, search, suggestions)
    *   **Raved Module:** `components/ui/LocationInput.tsx` (hypothetical custom component), `expo-location`
    *   **Checklist:**
        *   [ ] Integrate `expo-location` for current location, requesting permissions.
        *   [ ] Implement location search and display suggestions (requires integration with a geocoding API like Google Maps API).

*   **Prototype Feature:** Fashion Tags (input, popular tags, selected tags display)
    *   **Raved Module:** `components/ui/TagInput.tsx` (hypothetical custom component)
    *   **Checklist:**
        *   [ ] Implement tag input with auto-completion/suggestions.
        *   [ ] Display popular tags and allow selection.
        *   [ ] Display selected tags as removable chips.

*   **Prototype Feature:** Outfit Details (brand, occasion selector)
    *   **Raved Module:** `components/ui/TextInput.tsx`, `components/ui/Picker.tsx` (hypothetical custom component wrapping `Picker` from `react-native`)
    *   **Checklist:**
        *   [ ] Implement text input for brand.
        *   [ ] Implement a dropdown/picker for occasion selection.

*   **Prototype Feature:** Marketplace Integration (for sale toggle, price, condition, size, category, item description, payment methods, contact info)
    *   **Raved Module:** `components/store/SellItemForm.tsx` (hypothetical custom component)
    *   **Checklist:**
        *   [ ] Implement toggle for "Make items available for sale" using `Switch` component.
        *   [ ] Conditionally render sale details based on toggle state.
        *   [ ] Implement input fields for price, item description.
        *   [ ] Implement pickers for condition, size, category.
        *   [ ] Implement checkboxes for payment methods.
        *   [ ] Implement input for phone number and picker for meetup location.

*   **Prototype Feature:** Action Bar (photo, video, location, poll buttons, share button)
    *   **Raved Module:** `components/ui/ActionBar.tsx` (hypothetical custom component)
    *   **Checklist:**
        *   [ ] Implement buttons for quick actions (triggering media picker, location input, etc.).
        *   [ ] Implement "Share" button to submit the post to API (`services/postsApi.ts`).
        *   [ ] Handle disabled state for the share button until content is ready.

*   **Prototype Feature:** Guidelines
    *   **Raved Module:** Static text component.
    *   **Checklist:**
        *   [ ] Display static guidelines text.

**VI. Events Page (`app/(tabs)/events.tsx`)**

*   **Prototype Feature:** "Create Event" button
    *   **Raved Module:** `app/create-event.tsx`
    *   **Checklist:**
        *   [ ] Implement navigation to the `CreateEvent` screen.

*   **Prototype Feature:** Event Type Filters
    *   **Raved Module:** `components/events/EventFilters.tsx` (hypothetical custom component)
    *   **Checklist:**
        *   [ ] Fetch event types from API or use static list.
        *   [ ] Implement horizontal scrollable filter buttons using `ScrollView` and `TouchableOpacity`.
        *   [ ] Manage active filter state.

*   **Prototype Feature:** Audience Filters
    *   **Raved Module:** `components/events/EventFilters.tsx` (reusable)
    *   **Checklist:**
        *   [ ] Fetch audience types from API or use static list.
        *   [ ] Implement horizontal scrollable filter buttons.
        *   [ ] Manage active filter state.

*   **Prototype Feature:** Events List
    *   **Raved Module:** `components/events/EventList.tsx`, `components/events/EventCard.tsx`
    *   **Checklist:**
        *   [ ] Fetch events data from API, filtered by type and audience.
        *   [ ] Implement `FlatList` for events.
        *   [ ] Render `EventCard` components.

**VII. Profile Page (`app/(tabs)/profile.tsx`)**

*   **Prototype Feature:** Profile Header (avatar, change avatar button, premium badge, name, username, bio, location, join date)
    *   **Raved Module:** `components/profile/ProfileHeader.tsx`, `app/avatar-picker.tsx`
    *   **Checklist:**
        *   [ ] Fetch user profile data from API.
        *   [ ] Display user information.
        *   [ ] Implement navigation to `AvatarPicker` for changing avatar.
        *   [ ] Conditionally render premium badge based on subscription status.

*   **Prototype Feature:** Stats (posts, followers, following, likes)
    *   **Raved Module:** `components/profile/ProfileStats.tsx`
    *   **Checklist:**
        *   [ ] Fetch user stats from API.
        *   [ ] Display counts for posts, followers, following, and likes.

*   **Prototype Feature:** Action Buttons (Edit Profile, Share Profile)
    *   **Raved Module:** `app/edit-profile.tsx`
    *   **Checklist:**
        *   [ ] Implement navigation to `EditProfile` screen.
        *   [ ] Implement "Share Profile" functionality (e.g., `expo-sharing`).

*   **Prototype Feature:** Subscription Status (trial days left, upgrade button)
    *   **Raved Module:** `components/profile/SubscriptionStatusCard.tsx`
    *   **Checklist:**
        *   [ ] Fetch subscription status from API.
        *   [ ] Display trial information.
        *   [ ] Implement navigation to subscription sheet (`app/subscription.tsx`).

*   **Prototype Feature:** Profile Content Tabs (Posts, Comments, Liked, Saved)
    *   **Raved Module:** `components/profile/ProfileTabs.tsx`, `components/posts/PostGrid.tsx`, `components/comments/CommentList.tsx`
    *   **Checklist:**
        *   [ ] Implement tab navigation for profile content using `react-native-tab-view` or similar.
        *   [ ] Fetch and display user's posts, comments, liked posts, and saved posts in respective tabs.
        *   [ ] Implement empty states for each tab.
        *   [ ] Implement "Create Your First Post" CTA for empty posts tab.

**VIII. Sheets/Modals (General Checklist for each sheet)**

*   **Raved Module:** `components/sheets/*`, `app/*.tsx` (for specific sheet content)
*   **General Checklist for each Sheet:**
    *   [ ] Create a dedicated React Native component for the sheet.
    *   [ ] Integrate with `@gorhom/bottom-sheet` or `react-native-modal` for presentation.
    *   [ ] Implement show/hide logic, including interaction with the global overlay.
    *   [ ] Implement sheet header with title and close button.
    *   [ ] Implement sheet handle for dragging.
    *   [ ] Ensure content within the sheet is scrollable (`ScrollView` or `FlatList`).
    *   [ ] Fetch and display relevant data from API.
    *   [ ] Implement all interactive elements (buttons, inputs, filters, etc.) with their respective logic.
    *   [ ] Handle loading states and error messages.
    *   [ ] Ensure proper styling and responsiveness.

**Specific Sheets:**

*   **Toast:**
    *   **Raved Module:** `components/ui/Toast.tsx`, `store/toastStore.ts`
    *   **Checklist:**
        *   [ ] Implement a global toast notification system using `zustand` for state management.
        *   [ ] Display toast with icon and message.
        *   [ ] Implement auto-hide functionality.

*   **More Actions (`sheetMore`):**
    *   **Raved Module:** `components/sheets/MoreActionsSheet.tsx` (hypothetical custom component)
    *   **Checklist:**
        *   [ ] Implement navigation for all quick actions.
        *   [ ] Conditionally render premium features and free user CTA.
        *   [ ] Implement logout functionality (clear authentication tokens).

*   **Search (`sheetSearch`):**
    *   **Raved Module:** `app/search.tsx` (likely a full screen, not just a sheet)
    *   **Checklist:**
        *   [ ] Implement search input with clear button.
        *   [ ] Implement search filters (all, users, posts, tags).
        *   [ ] Fetch search results from API based on query and filters.
        *   [ ] Display search results (e.g., list of users, posts).

*   **Notifications (`sheetNotif`):**
    *   **Raved Module:** `app/notifications.tsx` (likely a full screen, not just a sheet)
    *   **Checklist:**
        *   [ ] Fetch user notifications from API.
        *   [ ] Display notifications list.

*   **Comments (`sheetComments`):**
    *   **Raved Module:** `app/comments.tsx` (likely a full screen or dedicated sheet)
    *   **Checklist:**
        *   [ ] Fetch comments for a specific post from API.
        *   [ ] Display comments list.
        *   [ ] Implement comment input and send functionality.

*   **Post Detail (`sheetPost`):**
    *   **Raved Module:** `app/post/[id].tsx` (dynamic route)
    *   **Checklist:**
        *   [ ] Fetch full details of a single post from API.
        *   [ ] Display post content, user info, likes, comments count.

*   **Store Item (`sheetItem`) / Product Detail (`sheetProductDetail`):**
    *   **Raved Module:** `app/product/[id].tsx` (dynamic route)
    *   **Checklist:**
        *   [ ] Fetch full details of a single store item/product from API.
        *   [ ] Display product images, description, price, seller info.
        *   [ ] Implement "Add to Cart" functionality.
        *   [ ] Implement "Share Product" and "Save Product" functionality.

*   **Store (`sheetStore`):**
    *   **Raved Module:** `app/store.tsx`
    *   **Checklist:**
        *   [ ] Fetch store banner data, categories, and items from API.
        *   [ ] Implement category filters and sort options.
        *   [ ] Display store items in a grid.
        *   [ ] Implement "Load More" for pagination.
        *   [ ] Implement "Start Selling" CTA navigation.

*   **Theme Selector (`sheetThemes`):**
    *   **Raved Module:** `app/themes.tsx`
    *   **Checklist:**
        *   [ ] Fetch available themes (premium/free).
        *   [ ] Display theme previews.
        *   [ ] Implement theme selection and "Apply Theme" functionality (update app theme state).
        *   [ ] Conditionally render premium theme access based on subscription.

*   **Seller Dashboard (`sheetSellerDashboard`):**
    *   **Raved Module:** `app/seller-dashboard.tsx`
    *   **Checklist:**
        *   [ ] Fetch seller stats (total items, total sales) from API.
        *   [ ] Implement "Add New Item" and "Bulk Discount" actions.
        *   [ ] Fetch and display list of seller's items.
        *   [ ] Implement "Refresh" functionality for items.

*   **Rankings (`sheetRankings`):**
    *   **Raved Module:** `app/rankings.tsx`
    *   **Checklist:**
        *   [ ] Fetch prize pool and ranking data from API (by period: week, month, all time).
        *   [ ] Display top 3 podium and full rankings list.
        *   [ ] Display scoring system information.
        *   [ ] Conditionally render subscription CTA for free users.

*   **Subscription (`sheetSubscription`):**
    *   **Raved Module:** `app/subscription.tsx`
    *   **Checklist:**
        *   [ ] Fetch current subscription status and trial info from API.
        *   [ ] Display premium features list.
        *   [ ] Display pricing information.
        *   [ ] Implement payment method selection.
        *   [ ] Integrate with a payment gateway for "Subscribe to Premium" functionality.
        *   [ ] Display free account limitations.

**IX. General Implementation Checklist (App-wide)**

*   **[ ] API Integration:**
    *   Define API endpoints for all data fetching and submission.
    *   Use `axios` (`services/api.ts`, `services/authApi.ts`) for all API calls.
    *   Implement error handling and retry mechanisms for API requests.
    *   Ensure secure handling of authentication tokens.
*   **[ ] State Management:**
    *   Utilize `zustand` for global and shared state (e.g., user session, theme, notifications, cart).
    *   Design clear state schemas and actions for each store.
*   **[ ] Styling & Theming:**
    *   Translate Tailwind CSS styles from the prototype into React Native `StyleSheet` objects or a compatible styling library.
    *   Implement dynamic theming (light/dark mode, custom themes) using `ThemeContext` and `use-theme-color` hook.
    *   Ensure consistent typography and spacing using `theme/typography.ts`, `theme/spacing.ts`.
*   **[ ] Navigation:**
    *   Ensure all navigation paths are correctly defined in `expo-router`.
    *   Implement proper navigation stack management (push, pop, replace).
    *   Handle deep linking using `expo-linking`.
*   **[ ] Internationalization (i18n):**
    *   Externalize all user-facing strings into `locales/*.json` files.
    *   Integrate `i18next` and `react-i18next` for dynamic language switching.
*   **[ ] Offline Support:**
    *   Implement caching strategies for frequently accessed data using `react-native-mmkv` or `AsyncStorage`.
    *   Utilize `useOfflineSync.ts` and `offlineQueue.ts` for background data synchronization and handling offline mutations.
*   **[ ] Error Handling & Logging:**
    *   Implement global error boundaries (`ErrorBoundary.tsx`).
    *   Provide user-friendly error messages for API failures and other issues.
    *   Integrate logging for debugging and analytics.
*   **[ ] Performance Optimization:**
    *   Optimize `FlatList` and `ScrollView` components for large lists.
    *   Use `react-native-reanimated` for smooth animations where appropriate.
    *   Minimize re-renders using `React.memo` and `useCallback`/`useMemo`.
*   **[ ] Accessibility:**
    *   Ensure all interactive elements have appropriate `accessibilityLabel` and `accessibilityRole`.
    *   Test with screen readers and other accessibility tools.
*   **[ ] Device Features:**
    *   Properly request and handle permissions for camera, location, media library, notifications using `expo-*` modules.
    *   Integrate haptic feedback (`expo-haptics`).
*   **[ ] Code Quality:**
    *   Adhere to ESLint and TypeScript rules (`.eslintrc.js`, `tsconfig.json`).
    *   Maintain consistent code style and conventions.
