# Screen Type & Presentation Mapping
**Decision made:** 2025-11-12

## Strategy Summary

We use **two presentation approaches**, matching WhatsApp and native iOS/Android patterns:

1. **Modal Stack Screens** (via expo-router `presentation: 'modal', animation: 'slide_from_bottom'`)
   - For full-screen destination routes that should be in navigation history
   - Native back gestures work automatically
   - Deep linking support built-in
   - Proper lifecycle management

2. **BottomSheet Component** (custom React Native component)
   - For lightweight, contextual overlays (peek, quick actions, filters)
   - No navigation history entry
   - Swipe-to-expand/collapse (60vh ↔ 95vh)
   - Optional overlay dismissal (`allowOverlayDismiss` prop)

---

## Modal Stack Screens (✅ Already Configured)

These screens are registered in `app/_layout.tsx` with `presentation: 'modal'`:

### E-Commerce Flows
- `/store` - Browse marketplace
- `/product/[id]` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/add-item` - Sell an item
- `/seller-dashboard` - Seller management (premium)
- `/similar-items` - Similar products view

### Social & Communication
- `/chat` - Messages list
- `/chat/[id]` - Individual conversation
- `/connections` - Network management
- `/search` - Global search
- `/notifications` - Notifications feed

### Content Creation & Viewing
- `/stories/create` - Story creator
- `/stories/view` - Story viewer (full-screen)
- `/comments` - Post comments (can be full-screen or sheet)
- `/post/[id]` - Post detail (optional, if needed)

### Events
- `/create-event` - Event creation form
- `/event/[id]` - Event detail page

### Premium Features
- `/subscription` - Subscription purchase
- `/rankings` - Leaderboard & prizes
- `/themes` - Theme selector (premium)

### Settings & Profile
- `/edit-profile` - Edit user profile
- `/profile/[id]` - View another user's profile (modal)
- `/profile-settings` - Settings menu
- `/avatar-picker` - Avatar selector
- `/privacy-settings` - Privacy controls
- `/language-settings` - Language picker
- `/notification-settings` - Notification prefs
- `/database-settings` - Dev: DB config
- `/api-settings` - Dev: API config
- `/help` - Help & support
- `/about` - About Raved
- `/faq` - FAQ page

**Total: 30+ modal screens** ✅ All configured in `_layout.tsx`

---

## BottomSheet Component Usage

These features should use `<BottomSheet>` for lightweight, in-place overlays. Sizing will match the prototype and be optimized for mobile: many use 60vh collapsed and 95vh expanded; some are full-screen when appropriate (e.g., More menu). All have X close and pull-down gesture where relevant.

### Already Implemented
1. **MoreSheet** (`components/sheets/MoreSheet.tsx`) ✅
   - Quick actions menu
   - Uses `allowOverlayDismiss={false}` - must close explicitly
   - Full-screen: covers device height, with handle and X; pull-down to dismiss

2. **ShareSheet** (`components/sheets/ShareSheet.tsx`) ✅
   - Contextual sharing (copy link, quick targets)
   - 65% height, collapsible

3. **SortFilterSheet** (`components/sheets/SortFilterSheet.tsx`) ✅
   - Store sort and category filters
   - 75% height, collapsible

4. **Registration** (`app/(auth)/register.tsx`) ✅
   - Full-screen stack screen (not a sheet)
   - Uses RegistrationSheet in asScreen mode

3. **Reset Password** (`app/(auth)/reset-password.tsx`) ✅
   - Full-screen stack screen (not a sheet)
   - Uses backend /auth/forgot-password

2. **RegistrationSheet** (`components/sheets/RegistrationSheet.tsx`) ✅
   - 6-step signup flow
   - Can also render as full screen (`asScreen` prop)
   - Uses default overlay dismiss behavior

3. **PasswordResetSheet** (`components/sheets/PasswordResetSheet.tsx`) ✅
   - Password recovery form

### To Be Implemented (Contextual Overlays)
Policy: Size per prototype (mobile-optimized). Default collapsed ~60vh, expanded ~95vh; elevate to full-screen only when called out in prototype.

4. **SortFilterSheet** (store, events, posts) — 60vh/95vh BottomSheet
   - Quick sort options (Newest, Popular, Price)
   - Category filters

5. **ShareSheet** (posts, products) — 60vh/95vh BottomSheet
   - Share options grid, copy link

6. **ReportSheet** (content moderation) — 60vh/95vh BottomSheet
   - Report categories, details textarea, submit

7. **VisibilityPicker** (create post) — 40–60vh BottomSheet
   - Public, Faculty, Connections, Private

8. **LocationPicker** (create post) — 50–85vh BottomSheet
   - Search, use current location, suggestions

9. **TagSelectorSheet** (create post) — 60vh BottomSheet
   - Popular tags, search/add custom tags

10. **QuickAddToCartSheet** (fast add) — 40vh BottomSheet
    - Size, quantity, add to cart

---

## Decision Rules

Use **Modal Stack Screen** when:
- ✅ It's a destination you'd share via deep link
- ✅ User expects "back" button to work
- ✅ Screen has its own header/navigation
- ✅ Contains complex forms or multi-step flows
- ✅ Needs full keyboard handling space
- ✅ Should appear in navigation history

Use **BottomSheet** when:
- ✅ Temporary action on current screen context
- ✅ Quick picker or selector
- ✅ Filters or sort options
- ✅ Lightweight form (2-5 fields max)
- ✅ Should NOT be in navigation history
- ✅ User expects to dismiss with gesture or overlay tap

---

## BottomSheet Props Reference

```tsx
interface BottomSheetProps {
  visible: boolean;              // Show/hide
  onClose: () => void;          // Close handler
  children: React.ReactNode;     // Sheet content
  height?: number | string;      // Default: '90%'
  showHandle?: boolean;          // Default: true (drag handle)
  allowCollapse?: boolean;       // Default: true (60vh ↔ 95vh)
  allowOverlayDismiss?: boolean; // Default: true (tap overlay to dismiss)
}
```

**Common Configurations:**
- Default: `<BottomSheet visible={open} onClose={close}>{content}</BottomSheet>`
- Persistent (like MoreSheet): `allowOverlayDismiss={false}`
- Fixed height: `height="50%"` or `height={400}`
- No collapse: `allowCollapse={false}`
- No drag handle: `showHandle={false}`

---

## Implementation Status

### Phase A: Verify Existing Routes ✅
- [x] All modal screens configured in `_layout.tsx`
- [x] BottomSheet base component supports `allowOverlayDismiss`
- [x] MoreSheet persistence fixed

### Phase B: Create Missing Modal Screens (Current)
Priority order based on user flow:
1. 🔴 `/store` - Store home with products grid
2. 🔴 `/product/[id]` - Product detail page
3. 🔴 `/cart` - Shopping cart
4. 🔴 `/checkout` - Checkout form
5. 🔴 `/comments` - Post comments
6. 🟡 `/search` - Search interface
7. 🟡 `/notifications` - Notifications feed
8. 🟡 `/connections` - Connections management
9. 🟡 `/chat` - Messages list
10. 🟡 `/chat/[id]` - Chat conversation

### Phase C: Create Contextual BottomSheets
1. SortFilterSheet (reusable)
2. ShareSheet (reusable)
3. LocationPicker
4. TagSelectorSheet
5. VisibilityPicker
6. ReportSheet

---

## Backend API Endpoints (for badge counts)

From backend inspection, these endpoints exist:

### Cart Count
```
GET /cart
Response: { items: [...], total, count }
```

### Unread Messages Count
```
GET /chat
Response: { chats: [{ unreadCount, ... }], count }
```
Or aggregate on frontend from `chats.reduce((sum, c) => sum + c.unreadCount, 0)`

### Pending Connection Requests
```
GET /connection/requests
Response: [{ id, from_user, status, ... }]
```
Count where `status === 'pending'`

### Unread Notifications
```
GET /notifications
Response: { notifications: [...], unreadCount, pagination }
```
Already returns `unreadCount` directly.

---

## Next Steps

1. ✅ Fixed More menu persistence
2. ✅ Documented screen presentation strategy
3. ⏳ Add API helper functions for badge counts → `services/api.ts`
4. ⏳ Update FloatingActionButtons with badge counts
5. ⏳ Implement priority modal screens (store, product, cart, checkout)
6. ⏳ Update gaps file with progress

