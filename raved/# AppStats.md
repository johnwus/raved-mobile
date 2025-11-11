# Complete Expo App Development Prompt 

```markdown
# Raved - Student Fashion Social Platform (Expo/React Native App)

## CRITICAL: Design Reference
**YOU MUST REFERENCE THE PROVIDED HTML FILE (`app-prototype.html`) FOR ALL DESIGN DECISIONS.**

This file contains the complete, pixel-perfect design that must be replicated in React Native. Every color, spacing, component style, animation, and interaction pattern is defined in this file. Do not deviate from the design without explicit instruction.

### Design Reference Guidelines
1. **Extract all styles from the HTML prototype**:
   - Colors: Use exact hex values from CSS variables and Tailwind config
   - Spacing: Match all padding, margin, and gap values
   - Typography: Match font sizes, weights, and line heights
   - Border radius: Use exact values from prototype
   - Shadows: Replicate box-shadow effects
   - Gradients: Copy gradient definitions exactly

2. **Component structure**: 
   - Study how each component is structured in HTML
   - Replicate the DOM hierarchy in React Native component trees
   - Maintain the same layout patterns (flex, grid equivalents)

3. **Interactions**:
   - All animations, transitions, and micro-interactions in the HTML must be replicated
   - Button states (hover, active, disabled) should match
   - Sheet animations (slide up, collapse, expand) must be identical
   - Carousel swipe behavior should match exactly

4. **Visual hierarchy**:
   - Match the visual weight and prominence of elements
   - Replicate the spacing and grouping logic
   - Maintain the same information density

5. **Color themes**:
   - Extract all theme definitions from the CSS
   - Implement the exact same theme system with data-theme attributes
   - All 6 premium themes must look identical to the HTML version

## Project Overview
Create a complete, production-ready Expo (React Native) mobile application for "Raved" - a student fashion social networking platform. The app should be a faithful recreation of the provided HTML prototype with full mobile optimization and native features.

## Technical Stack
- **Framework**: Expo SDK 50+
- **Language**: TypeScript
- **Navigation**: React Navigation v6 (Bottom Tabs + Stack)
- **State Management**: Zustand or Redux Toolkit
- **UI Components**: React Native Paper + Custom Components
- **Styling**: StyleSheet with theme system **MATCHING THE HTML PROTOTYPE EXACTLY**
- **Icons**: @expo/vector-icons (FontAwesome 6.5.2 - same version as HTML)
- **Image Handling**: expo-image-picker, expo-media-library
- **Storage**: AsyncStorage for local data, MMKV for performance-critical data
- **Animations**: React Native Reanimated v3
- **Camera**: expo-camera
- **Location**: expo-location
- **Notifications**: expo-notifications

## Design System (FROM HTML PROTOTYPE)

### EXACT Color Palette (from tailwind.config in HTML)
```typescript
// Extract these EXACT values from the HTML prototype
export const colors = {
  primary: '#5D5CDE',
  primaryDark: '#4C4BC7',
  accent: '#FF6B6B',
  success: '#10B981',
  warning: '#F59E0B',
  dark: {
    bg: '#0F1115',
    card: '#171923',
    text: '#E5E7EB',
    primary: '#7775E8',
  },
  // Theme variants (from [data-theme] CSS)
  themes: {
    rose: {
      light: { primary: '#f43f5e', primaryDark: '#e11d48', accent: '#fb7185' },
      dark: { primary: '#fb7185', primaryDark: '#f43f5e' }
    },
    emerald: {
      light: { primary: '#10b981', primaryDark: '#059669', accent: '#34d399' },
      dark: { primary: '#6ee7b7', primaryDark: '#34d399' }
    },
    ocean: {
      light: { primary: '#3b82f6', primaryDark: '#2563eb', accent: '#60a5fa' },
      dark: { primary: '#93c5fd', primaryDark: '#60a5fa' }
    },
    sunset: {
      light: { primary: '#f97316', primaryDark: '#ea580c', accent: '#fb923c' },
      dark: { primary: '#fdba74', primaryDark: '#fb923c' }
    },
    galaxy: {
      light: { primary: '#6366f1', primaryDark: '#4f46e5', accent: '#8b5cf6' },
      dark: { primary: '#a5b4fc', primaryDark: '#8b5cf6' }
    }
  }
};
```

### EXACT Typography (from HTML)
```typescript
// Match these exact font settings from the prototype
export const typography = {
  fontFamily: {
    sans: 'Inter', // or system-ui fallback
  },
  fontSize: {
    '10': 10,  // [10px] in HTML
    '11': 11,  // [11px] in HTML
    '12': 12,  // text-xs
    '13': 13,  // [13px] in HTML
    '14': 14,  // text-sm
    '16': 16,  // text-base
    '18': 18,  // text-lg
    '20': 20,  // text-xl
    '24': 24,  // text-2xl
    '30': 30,  // text-3xl
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};
```

### EXACT Spacing (from HTML Tailwind classes)
```typescript
// Match these exact spacing values
export const spacing = {
  0.5: 2,   // 0.5 * 4px
  1: 4,     // 1 * 4px
  1.5: 6,   // 1.5 * 4px
  2: 8,     // 2 * 4px
  3: 12,    // 3 * 4px
  4: 16,    // 4 * 4px
  5: 20,    // 5 * 4px
  6: 24,    // 6 * 4px
  8: 32,    // 8 * 4px
  12: 48,   // 12 * 4px
  16: 64,   // 16 * 4px
};
```

### EXACT Border Radius (from HTML)
```typescript
// Match these exact border radius values
export const borderRadius = {
  sm: 6,     // rounded-sm (0.375rem)
  base: 8,   // rounded (0.5rem)
  md: 12,    // rounded-md (0.75rem)
  lg: 16,    // rounded-lg (1rem)
  xl: 20,    // rounded-xl (1.25rem)
  '2xl': 24, // rounded-2xl (1.5rem)
  '3xl': 32, // rounded-3xl (2rem)
  full: 9999 // rounded-full
};
```

## Component Design Reference Map

### Study these exact components from HTML prototype:

1. **Post Cards** (`postCardHTML` function):
   - Exact shadow: `shadow-sm`
   - Border radius: `rounded-2xl`
   - Padding structure: `p-3` for header, `p-3` for actions
   - User avatar: `w-9 h-9 rounded-full`
   - Faculty badge: `text-[10px] px-2 py-0.5 rounded-full bg-primary/10`
   - Media: `aspect-ratio: 1/1` with `object-fit: cover`

2. **Stories** (`renderStories` function):
   - Story ring gradient: `linear-gradient(135deg, #5D5CDE, #FF6B6B)`
   - Story circle size: `w-16 h-16` (64px)
   - Inner image: `w-14 h-14` (56px)
   - Text size: `text-[10px]` (10px)
   - Horizontal scroll with gaps: `gap-4`

3. **Bottom Sheets** (`.sheet` class):
   - Border radius: `border-top-left-radius: 20px; border-top-right-radius: 20px`
   - Shadow: `box-shadow: 0 -8px 30px rgba(0,0,0,0.25)`
   - Transition: `transform .4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
   - Handle: `width: 40px; height: 4px; background: #d1d5db`
   - Sheet heights: `60vh` (collapsed), `95vh` (expanded)

4. **Bottom Tab Bar** (`.tabbar` class):
   - Height: auto with `py-2`
   - Background: `white` with `border-top: 1px solid #E5E7EB`
   - Grid: `grid-cols-5`
   - Center button: `-mt-6` with gradient `from-primary to-accent`
   - Icon size: `text-lg`

5. **Buttons** (various classes):
   - Primary: `bg-primary text-white rounded-xl py-3 font-semibold`
   - Secondary: `bg-gray-100 dark:bg-slate-800`
   - Rounded: `rounded-full` for FABs
   - Shadow on hover: `hover:shadow-lg`

6. **Cards** (`.bg-white.dark:bg-dark-card`):
   - Background: white / `#171923` (dark)
   - Border radius: `rounded-2xl`
   - Padding: typically `p-4` or `p-3`
   - Shadow: `shadow-sm`

7. **Store Items** (`storeItemCard` function):
   - Image height: `h-28` or `h-44` depending on size
   - Price: `text-primary dark:text-dark-primary font-extrabold`
   - Sale badge: `bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]`
   - Seller info: `w-4 h-4 rounded-full` avatar with `text-[11px]` name

8. **Forms** (registration, create post):
   - Input: `rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3`
   - Label: `text-sm font-medium text-gray-700 dark:text-gray-300`
   - Icons inside input: `absolute left-3 top-1/2 -translate-y-1/2`
   - Validation states with colored borders

9. **Carousels** (`.carousel-container`):
   - Container: `border-radius: 0.75rem; overflow: hidden`
   - Track: `display: flex; transition: transform 0.3s ease`
   - Slides: `min-width: 100%; flex-shrink: 0`
   - Navigation buttons: circular with `w-8 h-8`, `bg-black/50`
   - Dots: `w-2 h-2 rounded-full bg-white/50`, active `bg-white`

10. **Toast** (`.toast` class):
    - Position: `fixed top-16 left-50%`
    - Transform: `translateX(-50%)`
    - Background: white with `box-shadow: 0 8px 30px rgba(0,0,0,0.18)`
    - Border radius: `rounded-xl`
    - Padding: `px-12 py-14`

11. **Video Posts**:
    - Aspect ratio: `1:1`
    - Controls: native video controls
    - Poster/thumbnail displayed
    - Play icon overlay: `absolute inset-0 flex items-center justify-center`
    - Badge: `bg-black/50 text-white text-xs rounded-full` with play icon

12. **Profile Grid** (3-column):
    - Grid: `grid-cols-3 gap-1`
    - Each item: `aspect-square` with `rounded-lg overflow-hidden`
    - Hover effect: `hover:opacity-80`

## Core Features to Implement

### 1. Authentication System
**Reference**: HTML sections `#auth`, `#sheetRegister`, registration steps 1-6

- Multi-step registration (6 steps as in prototype):
  - **Step 1 - Welcome**: Match exact card design with gradient icons, feature highlights
  - **Step 2 - Personal**: Real-time username validation with check/x icons
  - **Step 3 - Contact**: Email/phone validation with status indicators
  - **Step 4 - Verification**: Code input with mock verification (display codes in UI for demo)
  - **Step 5 - Academic**: Optional fields, info card about university integration
  - **Step 6 - Security**: Password strength bars with color-coded feedback
- **Progress bar**: Gradient bar with percentage and step counter (exactly as in HTML)
- **Login screen**: Match exact layout with multi-input support (email/username/phone)
- **Password toggle**: Eye icon that switches between password/text type
- **Remember me**: Checkbox styling from HTML
- All validation states must match HTML (green check, red X, colored helper text)

### 2. Home Feed
**Reference**: `#page-home`, `postCardHTML`, `renderPostMedia` functions

- **Stories section**: 
  - Horizontal scroll with gradient rings (exact gradient from HTML)
  - Create story button with + icon
  - Story circle size and spacing must match exactly
  
- **Featured post**:
  - Yellow star icon
  - Bold "Featured" heading
  - Full post card display
  
- **Store teaser**:
  - "Fashion Store" heading with bag icon
  - 2-column grid (`grid-cols-2 gap-3`)
  - "View All Items" button below

- **Rankings teaser/CTA**:
  - Show based on premium status
  - Match gradient backgrounds for premium features
  - Trophy icons and prize pool display

- **Post types** (study `renderPostMedia` function):
  - **Single image**: `aspect-ratio: 1/1`, full width
  - **Video**: Controls, thumbnail, play overlay, "Video" badge top-left
  - **Carousel**: Multiple images, swipeable, prev/next buttons, dot indicators, count badge top-right
  - All with clickable overlay to open detail

- **Post actions bar** (study `postActionsHTML`):
  - Left: Like (heart), Comment, Share icons with counts
  - Right: Add to cart (if for sale), Save (bookmark), More (ellipsis)
  - Exact spacing and icon sizes

- **For sale indicator**:
  - Price tag overlay: `linear-gradient(135deg, #10B981, #059669)` with `₵` symbol
  - Cart button in bottom-right corner
  - Sale badge in content: `bg-gradient-to-r from-green-500 to-emerald-500`

### 3. Stories Feature
**Reference**: `openStory`, `openCreateStory`, `#sheetCreateStory`, `#sheetStory`

- **Story circles**:
  - Gradient ring for unviewed: `linear-gradient(135deg, #5D5CDE, #FF6B6B)`
  - Gray ring for viewed: `#E5E7EB`
  - Size hierarchy: outer 64px, inner 56px

- **Story viewer**:
  - Full-screen with `70vh` image
  - Progress bars at top (white segments)
  - User info overlay with avatar and name
  - Auto-advance timer: 2.5 seconds per story
  - Tap left/right for navigation

- **Story creator** (expanded sheet):
  - Preview area with gradient placeholder
  - Media options: Camera, Gallery, Video, Text (4-column grid with icons)
  - Templates: OOTD, Mood, Study, Event (2-column with gradient backgrounds)
  - Control buttons: Text, Stickers, Draw overlays
  - Settings: Toggle switches for replies and highlights
  - Match all gradient backgrounds from HTML

### 4. Create Post Screen
**Reference**: `#page-create`, all `#cp*` element IDs

- **Header**:
  - "New Post" title
  - "Save Draft" button (right side)

- **User card**:
  - Avatar (ring-2 ring-gray-100)
  - Name and faculty with dot separator
  - Visibility dropdown with icons (🌐 🏫 👥 🔒)

- **Caption textarea**:
  - No border, transparent background
  - Placeholder text from HTML
  - Character counter: "0/2000" bottom-right
  - Max length: 2000 characters

- **Media upload area**:
  - Dashed border: `border-2 border-dashed border-gray-200`
  - Gradient icon background: `from-primary/10 to-purple-500/10`
  - "Add photos or videos" heading
  - After upload: 2-column grid preview with remove buttons

- **Location section**:
  - Input with location icon
  - "Use current location" button
  - Suggestions dropdown (white card with hover states)
  - Demo locations from HTML

- **Fashion tags**:
  - Input with hashtag icon
  - Popular tags: rounded-full pills with `bg-gray-100`, hover turns primary
  - Selected tags: shown below with X to remove

- **Outfit details**:
  - Brand input and Occasion dropdown side-by-side
  - Match exact styling from HTML

- **Marketplace section**:
  - Green gradient background: `from-green-50 to-emerald-50`
  - Toggle switch for "For Sale"
  - Expandable details section:
    - Price (₵), Condition dropdowns
    - Size, Category dropdowns
    - Item description textarea
    - Payment methods checkboxes (Mobile Money, Cash, Bank, Negotiable)
    - Contact info fields (phone, meetup location)

- **Action bar**:
  - Icon buttons: Photo, Video, Location, Poll
  - "Share" button: gradient `from-primary to-purple-600`, paper plane icon

- **Guidelines card** at bottom with checkmarks

### 5. Faculties/Communities
**Reference**: `#page-faculties`, `renderFaculties`, `FacultyData`

- **Faculty selection grid**:
  - Grid: `grid-cols-2 gap-3`
  - "All Faculties" button: `bg-primary text-white`
  - Other faculties: gradient backgrounds (purple, blue, orange, green, red, indigo, yellow)
  - Each card: Icon, faculty name, member count
  - Match exact colors from HTML

- **Faculty stats card**:
  - 3-column grid
  - Large primary-colored numbers
  - Labels: Members, Posts, Events

- **Faculty feed**:
  - Title with fire icon: "Trending in [Faculty]"
  - Same post card design as home feed
  - "Load More" button at bottom

### 6. Events System
**Reference**: `#page-events`, `#sheetCreateEvent`, `renderEvents`

- **Create event button**: Primary gradient, full width, plus icon

- **Filter sections**:
  - Event Type: All, Fashion Shows, Workshops, Networking, My Events
  - Audience: All Students, Undergraduate, Graduate, Faculty, Alumni, Public
  - Pills with rounded-full, active state is primary
  - Horizontal scroll with whitespace-nowrap

- **Event cards**:
  - White card with shadow, rounded-2xl
  - Cover image: `h-40 object-cover`
  - Date badge overlay: White card with month/day
  - Category badge: Primary colored, rounded-full
  - Title, organizer (with avatar), location (with icon)
  - Description: 2-line clamp
  - Footer: Attendee count, Join/Attending button
  - "Full" badge if at capacity

- **Create event form** (bottom sheet):
  - Title, Date, Time, Location inputs
  - Category and Audience dropdowns
  - Capacity and Fee inputs (side-by-side)
  - Description textarea
  - Settings toggles: Registration required, Allow waitlist, Send reminders
  - Match all input styling from HTML

- **Event detail sheet**:
  - Cover image
  - Title and organizer
  - Date/time/location with icons
  - Full description
  - Tags as pills
  - Attendee count and Join button

### 7. Marketplace/Store
**Reference**: `#sheetStore`, `storeItemCard`, `#sheetProductDetail`

- **Store header** (gradient banner):
  - Purple to pink gradient: `from-purple-500 to-pink-500`
  - "Campus Fashion Hub" title
  - "Discover unique styles" subtitle
  - Seller and item counts with icons

- **Category filters**:
  - White card with rounded corners
  - 2-column grid: All Items, Clothing, Accessories, Shoes
  - Icons with labels, active is primary

- **Sort dropdown**:
  - Options: Newest, Price Low-High, Price High-Low, Popular
  - Small gray dropdown on right

- **Product cards** (2-column grid):
  - Image with condition badge (top-left)
  - Save button (top-right, bookmark icon)
  - Quick add button (bottom-right, plus icon)
  - Name (2-line clamp)
  - Price (large, bold, primary color) and size
  - Seller info: tiny avatar + name
  - Stats: likes, views, time ago

- **Product detail page**:
  - Large image gallery (swipeable if multiple)
  - Condition badge overlay
  - Title (2xl font, bold)
  - Price (3xl font, bold, primary) and size/category badges
  - **Seller card**: 
    - Gray background, rounded-xl
    - Avatar, name, verified badge
    - Rating and items sold
    - "View Profile" and "Message" buttons
  - Description section
  - Item details card: 2-column grid with label/value pairs
  - Stats bar: likes, views, saves, posted time
  - Action buttons: Save (outline), Add to Cart (primary, full width)
  - Similar items: 2-column grid below

- **Seller dashboard** (premium):
  - Stats cards: Total items (blue gradient), Total sales (green gradient)
  - Quick actions: Add New Item (primary gradient), Bulk Discount (orange-red gradient)
  - Items list: cards with image, name, price, condition, sales count
  - Action buttons: View, Edit, Discount

- **Add item form**:
  - Photo upload section with dashed border
  - After upload: 3-column preview grid
  - Name, description, brand, category inputs
  - Size, condition, price (3-column grid)
  - Payment methods checkboxes
  - Contact info: phone, meetup location
  - Seller info card (read-only)
  - "Add to Store" button: green gradient

### 8. Shopping Cart & Checkout
**Reference**: `#sheetCart`, `#sheetCheckout`

- **Cart sheet**:
  - Item cards: image, name, size/color, price, quantity controls
  - Quantity controls: minus/plus buttons (rounded-full, gray)
  - Remove button: red trash icon
  - Total at bottom: large, bold, primary
  - "Proceed to Checkout" button: gradient, full width

- **Checkout form**:
  - **Order summary**:
    - Item cards with images and quantities
    - Subtotal, delivery fee (green "Free" or amount), total
  - **Delivery section**:
    - Radio buttons for: Campus Pickup (free), Hostel Delivery (₵5)
    - Address textarea (if hostel selected)
    - Phone number input
  - **Payment methods**:
    - Large cards for each method:
      - Mobile Money (yellow-orange gradient icon)
      - Cash on Delivery (green gradient icon)
      - Bank Transfer (blue-purple gradient icon)
      - Card (indigo-cyan gradient icon)
    - Each shows: icon, name, description, speed/status badge
  - **Payment details** (show based on selection):
    - Mobile Money: Network dropdown, phone input
    - Card: Name, number, expiry, CVV
    - Bank: Info card with account details and reference
    - Cash: Info card explaining process
  - **Place Order button**: Gradient, full width, disabled until form valid
  - **Security notice**: Shield icon, gray background

### 9. Profile System
**Reference**: `#page-profile`, `#sheetEditProfile`, `#sheetProfileSettings`

- **Profile header**:
  - Avatar: 80x80 with change button (camera icon overlay)
  - Premium badge: gradient crown icon (if premium)
  - Name (xl, bold), Username (primary colored with @)
  - Bio (gray text)
  - Location and join date (xs, gray with icon)

- **Stats bar** (4 columns):
  - Posts, Followers, Following, Likes
  - Large primary numbers, small gray labels

- **Action buttons**:
  - "Edit Profile": primary, full width
  - Share button: square, gray background

- **Subscription status card**:
  - Free trial: yellow gradient with dashed border
  - Premium: primary gradient with solid border
  - Shows days remaining or "Active" status
  - "Upgrade" button

- **Profile tabs** (4 tabs):
  - Tab bar: white background, border-bottom
  - Active tab: primary text and border-bottom-2
  - Tabs: Posts, Comments, Liked, Saved

- **Content grids**:
  - Posts/Liked/Saved: 3-column grid (`grid-cols-3 gap-1`)
  - Square thumbnails with rounded corners
  - Video overlay: play icon centered
  - Carousel overlay: clone icon top-right
  - Comments: full-width cards with post preview

- **Edit profile form**:
  - Avatar at top with change button
  - Name, username (with @ prefix), bio (with character counter)
  - Faculty dropdown, location, website inputs
  - Bio limit: 150 characters with counter
  - Cancel and Save buttons (side-by-side)

- **Settings screen**:
  - Sections with headers and cards
  - **Account**: Edit Profile, Change Avatar, Privacy Settings
  - **Appearance**: Dark Mode toggle, Theme Colors, Language
  - **Developer**: Database Config, API Settings (with status badges)
  - **Premium**: gradient background cards
  - **Support**: Help & Support, About Raved, Terms
  - **Danger**: Sign Out (orange), Delete Account (red)
  - Each item: icon, label, chevron-right
  - Info cards with colored backgrounds

- **Privacy settings**:
  - Toggle switches for each setting
  - Sections: Account Privacy, Activity Privacy, Content Privacy, Data & Analytics
  - Each with descriptive text below toggle
  - Blocked users button with count badge

- **Change avatar sheet**:
  - Current avatar preview (large, centered) with camera overlay
  - Upload options: Camera, Gallery (2-column with gradient backgrounds)
  - Preset avatars: 4-column grid of circular avatars
  - Style filters: Original, Circle Crop, Square, Rounded (pill buttons)
  - Border filters: None, Simple, Gradient, Glow (pill buttons)
  - Preview section with applied styles
  - Save button: gradient, full width

### 10. Premium Subscription System
**Reference**: `#sheetSubscription`, `updateSubscriptionStatus`

- **Current status card**:
  - Gradient background (yellow-orange for trial/free)
  - Crown icon in gradient circle
  - "Free Trial" or "Premium" title
  - Days remaining or "Premium Active"
  - Upgrade button (gradient)

- **Premium features list**:
  - Cards with gradient backgrounds (purple, blue, green, indigo, rose)
  - Each: gradient icon circle, feature name, description
  - Features:
    - Monthly Rankings (trophy)
    - Weekly Features (star)
    - Advanced Analytics (chart)
    - Premium Themes (palette)
    - Priority Support (bolt)

- **Pricing card**:
  - Primary to purple gradient
  - "₵5.00" large centered
  - "per week" below
  - "Unlock all premium features" description

- **Payment methods**:
  - Large cards (full width):
    - Mobile Money: yellow-orange gradient circle, icon
    - Card: blue-purple gradient circle, icon
  - On selection: border becomes primary

- **Subscribe button**: Gradient, full width, crown icon

- **Free account limitations**: Gray card with bullet list

### 11. Rankings System (Premium)
**Reference**: `#sheetRankings`, `updateRankings`

- **Prize pool card**:
  - Yellow-orange gradient background
  - "₵150 Prize Pool" large centered
  - Breakdown: 🥇 1st: ₵75, 🥈 2nd: ₵45, 🥉 3rd: ₵30

- **Period filters**:
  - Pills: This Week, This Month, All Time
  - Rounded-full, active is primary

- **Top 3 podium**:
  - 3 colored platforms: Gold (1st, tallest), Silver (2nd), Bronze (3rd)
  - Height: 24px (1st), 20px (2nd), 16px (3rd)
  - Gradient backgrounds: yellow-500, gray-400, orange-500
  - Avatars above with border matching platform color
  - Name and score below
  - "👑 Champion" badge for 1st

- **Full rankings list**:
  - Cards with: Rank badge (colored circles), avatar, name, faculty, score
  - Top 3 have special colored rank badges
  - Rest have gray badges

- **Scoring system card**:
  - Blue background
  - List of actions with point values (right-aligned)
  - Post Like: +10, Comment: +15, Share: +20, Sale: +50, Feature: +100

- **Subscription CTA** (for free users):
  - Purple-pink gradient background
  - Crown icon
  - "Join the Competition" title
  - Subscribe button

### 12. Premium Themes System
**Reference**: `#sheetThemes`, theme CSS variables

- **Header with premium badge**:
  - Yellow-orange gradient card
  - Crown icon in gradient circle
  - "Premium Feature" title

- **Theme collections**:
  - Sections: Classic, Nature, Vibrant
  - 2-column grid for theme cards

- **Theme cards**:
  - Border-2, rounded-xl
  - Selected: primary border
  - **Preview area**:
    - Large gradient box (theme colors)
    - Icon in center (sparkles, heart, leaf, water, sun, star)
    - Fake progress bars below
  - **Info**:
    - Theme name (centered)
    - Color description

- **Themes to implement** (exact gradients):
  - **Raved Classic**: #667eea to #764ba2
  - **Rose Garden**: #f43f5e to #f93f5e
  - **Emerald Forest**: #10b981 to #059669
  - **Ocean Breeze**: #3b82f6 to #2563eb
  - **Sunset Glow**: #f97316 to #ea580c
  - **Galaxy Night**: #6366f1 to #8b5cf6

- **Apply button**: Gradient, full width, palette icon, disabled until selection

- **Info card**: Blue background with explanation

### 13. Messages/Chat
**Reference**: `#sheetInbox`, `#sheetChat`, `renderChats`

- **Conversation list**:
  - Cards with: Avatar (with online status dot), name, last message preview, time, unread badge
  - Online dot: green (bottom-right of avatar), offline: gray
  - Unread badge: primary background, white text, rounded-full
  - Dividers between items

- **Chat interface**:
  - Header: Avatar, name, online status, close button
  - Message bubbles:
    - Sent (right): primary background, white text, rounded-2xl
    - Received (left): gray background, rounded-2xl
  - Timestamp: xs, opacity-70
  - Input bar at bottom:
    - Plus button (left)
    - Text input (flex-1, rounded-full border)
    - Send button (right, primary circle)

### 14. Connections/Network
**Reference**: `#sheetConnections`, `renderConnections`

- **Tabs**: All, Following, Followers, Requests, Suggested
- Pills with rounded-full, active is primary

- **Connection cards**:
  - Avatar (with mutual badge for mutual connections)
  - Name, faculty
  - Mutual friends count with reason (for suggested)
  - Connection type badge
  - Action buttons (Follow/Unfollow/Accept/Decline/Message)
  - Hover effect on card

- **Mutual badge**: Green circle checkmark (bottom-right of avatar)

### 15. Search System
**Reference**: ``#sheetSearch`, `doSearch`, `buildSearchIndex`

- **Search header**:
  - Large rounded input: `rounded-2xl border pl-12 pr-12 py-4 text-lg`
  - Search icon (left): magnifying glass, gray-400
  - Clear button (right): X icon, rounded-full with hover background
  - Focus state: ring-2 ring-primary

- **Quick filters**:
  - Pills below search: All, Users, Posts, Tags
  - Rounded-full, small text, active is primary
  - Horizontal scroll with gap-2

- **Search results**:
  - White/dark cards with rounded-xl
  - **User results**:
    - Avatar (10x10 rounded-full), name, faculty
    - Tap to view profile
  - **Post results**:
    - Thumbnail (12x12 rounded), user name, caption preview
    - Media type badges:
      - Video: 🔹 blue "Video" text
      - Carousel: 🖼️ purple "X photos" text
  - **Tag results**:
    - Hashtag icon, tag text, post count
  - Each with chevron-right arrow

- **Empty state**:
  - "No results" text centered
  - Gray, small text

### 16. Notifications
**Reference**: `#sheetNotif`, `renderNotifications`

- **Sheet header**:
  - Title: "Notifications"
  - Close button (right)

- **Notification cards**:
  - White/dark background, rounded-xl
  - Icon circle (left): gradient background with bell icon
  - Message text (center)
  - Timestamp (right, xs text)
  - Gap-3 between items

- **Notification dot**:
  - Red circle on bell icon in header (when unread)
  - `-top-1 -right-1 w-2 h-2 rounded-full bg-red-500`

### 17. Floating Action Buttons
**Reference**: FAB section in HTML

- **Position**: 
  - Fixed bottom-20 right-4
  - Z-index: 40
  - Vertical stack with space-y-3

- **Buttons** (all 14x14, rounded-full):
  - **Store**: purple to pink gradient, bag icon, cart badge
  - **Connections**: green to emerald gradient, users icon, badge with "5"
  - **Messages**: blue to cyan gradient, comment icon, badge with "3"

- **Badges**:
  - Red circle, white text, `-top-1 -right-1`
  - Size: 5x5, text-xs
  - Hidden when count is 0

- **Hover/press effect**: scale-110 transition

### 18. Bottom Navigation
**Reference**: `.tabbar` class

- **Container**:
  - Fixed bottom-0, full width (max 520px centered)
  - White background with top border
  - Safe area padding (env(safe-area-inset-bottom))
  - Grid-cols-5, text-xs

- **Tab buttons**:
  - Flex column, centered
  - Icon (text-lg) above label
  - Active: primary color
  - Inactive: gray-500

- **Center button (Create)**:
  - Negative margin: -mt-6 (floats above)
  - Larger: p-3
  - Gradient: from-primary to-accent
  - Shadow
  - Plus icon
  - Label below: "Post" in primary, font-semibold

### 19. Modals & Bottom Sheets
**Reference**: `.sheet`, `.overlay` classes

- **Overlay**:
  - Fixed inset-0
  - Background: `rgba(0,0,0,0.4)`
  - Z-index: 999
  - Fade transition (opacity .4s ease)
  - Tap to dismiss

- **Sheet**:
  - Fixed, centered horizontally (transform translateX(-50%))
  - Bottom-0, max-width 520px
  - Transform: translateY(100%) when hidden, translateY(0) when shown
  - Transition: `transform .4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
  - Z-index: 1000

- **Sheet states**:
  - Collapsed: 60vh height
  - Expanded: 95vh height
  - Transition between states on drag/tap

- **Drag handle**:
  - Width: 40px, height: 4px
  - Rounded, gray background
  - Margin: 8px auto 0
  - Cursor: grab
  - Hover: darker gray

- **Sheet sections**:
  - **Header**: flex-shrink-0, padding, border-bottom
  - **Content**: flex-1, overflow-y-auto, overscroll-behavior: contain
  - **Footer**: flex-shrink-0, padding, border-top

- **Drag interactions**:
  - Swipe down > 100px: collapse or close
  - Swipe up > 100px: expand
  - Double-tap handle: toggle collapse/expand
  - Visual feedback during drag (handle color changes)

### 20. Animations & Transitions
**Reference**: CSS transitions and animations throughout HTML

- **Page transitions**:
  - Stack navigation: slide from right
  - Modal presentations: slide from bottom with fade-in overlay
  - Duration: 400ms with easing

- **Micro-interactions**:
  - Button press: scale(0.98) on active
  - Like animation: heart scale + color change
  - Save animation: bookmark fill
  - Hover effects: shadow-lg, opacity changes

- **Loading states**:
  - Skeleton screens for content loading
  - Spinner for actions: `fa-spinner fa-spin`
  - Pull-to-refresh: native platform component

- **Story transitions**:
  - Progress bars: linear animation, 2.5s per story
  - Slide transition between stories
  - Entry/exit animations for viewer

- **Sheet animations**:
  - Enter: slide up from bottom (translateY: 100% → 0)
  - Exit: slide down (translateY: 0 → 100%)
  - Overlay: fade in/out
  - Handle drag: follow finger with resistance

- **Carousel**:
  - Swipe transition: transform translateX with easing
  - Snap to position
  - Dot indicators: scale and color change

- **Toast notifications**:
  - Enter: slide down + fade in (translateY: -20px → 0, opacity: 0 → 1)
  - Duration: 2.5s visible
  - Exit: fade out + slide up

### 21. Form Validation & Feedback
**Reference**: Registration forms, create post, checkout

- **Real-time validation**:
  - Input borders: gray → green (valid) or red (invalid)
  - Icons: checkmark (green) or X (red) appear on right
  - Helper text below: changes color and message
  - Validate on blur and on input

- **Username validation**:
  - Check format: 3-20 chars, letters/numbers/underscore
  - Check availability (mock)
  - Show green check or red X
  - Update helper text with reason

- **Email validation**:
  - RFC5322 regex check
  - Show status icon
  - Update helper text

- **Phone validation**:
  - Ghana format: 0XXXXXXXXX
  - Show status icon
  - Update helper text

- **Password strength**:
  - 4 bars that fill based on strength
  - Colors: red (very weak) → orange (weak) → yellow (fair) → blue (good) → green (strong)
  - Text label updates: "Very Weak", "Weak", "Fair", "Good", "Strong"
  - Requirements checklist:
    - 8+ characters
    - Uppercase and lowercase
    - Number
    - Special character

- **Password match**:
  - Check match in real-time
  - Show green check or red X with message

- **Button states**:
  - Disabled: opacity-50, cursor-not-allowed
  - Enabled: full opacity, pointer cursor
  - Loading: spinner icon + disabled
  - Success: check icon briefly

- **Form progression**:
  - Multi-step: progress bar at top
  - Step counter: "Step X of Y"
  - Percentage: "20%", "40%", etc.
  - Back button: appears on step 2+
  - Next/Submit: disabled until valid

### 22. Empty States
**Reference**: Various empty state designs in HTML

- **Pattern**:
  - Large icon (3xl-4xl, gray-300/slate-600)
  - Message text (gray-500)
  - Optional action button below

- **Examples**:
  - **No posts**: Camera icon, "No posts yet", "Create Your First Post" button
  - **No comments**: Comment icon, "No comments yet"
  - **No cart items**: Shopping cart icon, "Your cart is empty", "Browse Store" button
  - **No messages**: Comments icon, "No conversations yet"
  - **No connections**: Users icon, "No connections to show"
  - **No search results**: Search icon, "No results"
  - **No events**: Calendar icon, "No events found"

- **Styling**:
  - Centered text
  - py-8 or py-12 padding
  - Icon with mb-3 spacing
  - Button with mt-3 spacing

### 23. Loading States
**Reference**: Button loading, page loading patterns

- **Button loading**:
  - Replace icon with spinner: `fa-spinner fa-spin`
  - Disable button
  - Optional text change: "Signing in..." → "Creating Account..."

- **Content loading**:
  - Skeleton screens (gray animated backgrounds)
  - Pulse animation
  - Match layout of actual content

- **Infinite scroll**:
  - Show spinner at bottom when loading more
  - "Load More" button option
  - Pull-to-refresh at top

- **Toast for actions**:
  - "Processing payment..."
  - "Saving..."
  - "Uploading..."

### 24. Error States & Handling
**Reference**: Toast notifications, validation errors

- **Toast error**:
  - Red circle with exclamation icon
  - Error message
  - Duration: 2.5s
  - Example: "Please fill in all required fields"

- **Inline errors**:
  - Red border on input
  - Red X icon
  - Red helper text with specific error

- **Network errors**:
  - Retry button
  - Offline indicator
  - Queue actions for later

- **404/Not found**:
  - Icon + message
  - "Go back" or "Go home" button

### 25. Accessibility Features
**Reference**: General best practices + HTML structure

- **Touch targets**:
  - Minimum 44x44 points for all tappable elements
  - Adequate spacing between interactive elements

- **Labels**:
  - All inputs have labels
  - Button text is descriptive
  - Icons have accessible names

- **Focus states**:
  - Visible focus rings: ring-2 ring-primary
  - Keyboard navigation support

- **Color contrast**:
  - All text meets WCAG AA standards
  - Important info not conveyed by color alone

- **Screen reader support**:
  - Semantic structure
  - Alt text for images
  - ARIA labels where needed

## Data Architecture

### Mock Data (FROM HTML PROTOTYPE)

**Extract these exact data structures**:

```typescript
// Users (from HTML Users array)
const mockUsers = [
  { id: 'u1', name: 'Sophie Parker', avatar: 'https://i.imgur.com/bxfE9TV.jpg', faculty: 'Science' },
  { id: 'u2', name: 'Emily White', avatar: 'https://i.imgur.com/nV6fsQh.jpg', faculty: 'Arts' },
  { id: 'u3', name: 'Marcus Stevens', avatar: 'https://i.imgur.com/IigY4Hm.jpg', faculty: 'Business' },
  { id: 'u4', name: 'Anna Reynolds', avatar: 'https://i.imgur.com/KnZQY6W.jpg', faculty: 'Medicine' },
  { id: 'u5', name: 'David Chen', avatar: 'https://i.imgur.com/kMB0Upu.jpg', faculty: 'Engineering' },
  { id: 'u6', name: 'Jason Miller', avatar: 'https://i.imgur.com/8Km9tLL.jpg', faculty: 'Law' },
];

// Images (from HTML Images array)
const mockImages = [
  'https://i.imgur.com/Ynh9LMX.jpg',
  'https://i.imgur.com/D3CYJcL.jpg',
  'https://i.imgur.com/JObkVPV.jpg',
  'https://i.imgur.com/KnZQY6W.jpg',
  'https://i.imgur.com/IigY4Hm.jpg',
  'https://i.imgur.com/nV6fsQh.jpg',
];

// Videos (from HTML Videos array)
const mockVideos = [
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  // ... others
];

// Captions (from HTML captions array)
const mockCaptions = [
  "Perfect outfit for today's presentation! 💼 #CampusStyle",
  'Sustainable fashion vibes 🌿 #EcoFriendly',
  // ... exact 8 captions from HTML
];

// Location suggestions (from HTML LocationSuggestions)
const locationSuggestions = [
  { name: 'Campus Library', type: 'University', distance: '0.1 km' },
  { name: 'Student Union Building', type: 'University', distance: '0.2 km' },
  // ... all 10 from HTML
];

// Faculty data (from HTML FacultyData)
const facultyData = {
  all: { title: 'All Faculties', members: '12.5k', posts: '8.2k', events: '156' },
  arts: { title: 'Arts & Humanities', members: '2.4k', posts: '1.2k', events: '24' },
  // ... exact data from HTML
};

// Store items (from HTML StoreBase)
const mockStoreItems = [
  { id: 'item_1', name: 'Eco-Friendly Dress', price: 45, originalPrice: 60, image: '...', category: 'clothing', tags: ['sale'] },
  // ... exact items from HTML
];
```

### State Structure (FROM HTML State object)

```typescript
interface AppState {
  // Match EXACTLY the State object from HTML
  theme: 'light' | 'dark';
  currentTab: 'home' | 'faculties' | 'create' | 'events' | 'profile';
  currentUser: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio: string;
    faculty: string;
    location: string;
    website: string;
    followers: number;
    following: number;
    theme: ThemeName; // 'default' | 'rose' | 'emerald' | 'ocean' | 'sunset' | 'galaxy'
    
    // Privacy settings
    isPrivate: boolean;
    showActivity: boolean;
    readReceipts: boolean;
    allowDownloads: boolean;
    allowStorySharing: boolean;
    analytics: boolean;
    personalizedAds: boolean;
    
    // Language & Regional
    language: 'en' | 'tw' | 'ha' | 'fr';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    currency: 'GHS' | 'USD' | 'EUR' | 'GBP';
  };
  
  loggedIn: boolean;
  likes: Set<string>;
  bookmarks: Set<string>;
  follows: Set<string>;
  
  notifications: Array<{ id: string; text: string; time: string }>;
  stories: Story[];
  posts: Post[];
  comments: Record<string, Comment[]>;
  storeItems: StoreItem[];
  cart: CartItem[];
  events: Event[];
  chats: Chat[];
  connections: Connection[];
  recentlyViewed: StoreItem[];
  
  subscription: {
    isPremium: boolean;
    trialStartDate: number;
    trialDaysLeft: number;
    subscriptionEndDate: number | null;
    paymentMethod: string | null;
  };
  
  rankings: Ranking[];
  userStats: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalSales: number;
    weeklyScore: number;
    monthlyScore: number;
    allTimeScore: number;
  };
  
  featuredId: string | null;
  searchIndex: SearchIndexItem[];
  
  temp: {
    activePostId: string | null;
    activeItemId: string | null;
    activeChatId: string | null;
    storyTimer: any;
    // Registration temp data
    emailVerificationCode: string | null;
    phoneVerificationCode: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    newAvatar: {
      src: string;
      style: string;
      border: string;
    };
    selectedTheme: string | null;
    selectedPaymentMethod: string | null;
    currentSimilarItem: StoreItem | null;
  };
}
```

## File Structure
```
raved-mobile/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx (multi-step)
│   │   └── reset-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx (Home Feed)
│   │   ├── faculties.tsx
│   │   ├── create.tsx
│   │   ├── events.tsx
│   │   └── profile.tsx
│   ├── post/[id].tsx
│   ├── product/[id].tsx
│   ├── event/[id].tsx
│   ├── chat/[id].tsx
│   ├── user/[id].tsx
│   └── settings/
│       ├── index.tsx
│       ├── edit-profile.tsx
│       ├── privacy.tsx
│       ├── themes.tsx
│       └── language.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx (match HTML button styles)
│   │   ├── Input.tsx (match HTML input styles)
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── BottomSheet.tsx (match HTML .sheet)
│   │   ├── Toast.tsx (match HTML .toast)
│   │   ├── ProgressBar.tsx
│   │   └── Switch.tsx
│   ├── posts/
│   │   ├── PostCard.tsx (match postCardHTML)
│   │   ├── PostCarousel.tsx (match carousel HTML)
│   │   ├── VideoPost.tsx
│   │   ├── PostActions.tsx (match postActionsHTML)
│   │   └── PostGrid.tsx
│   ├── stories/
│   │   ├── StoryCircle.tsx
│   │   ├── StoryRow.tsx
│   │   ├── StoryViewer.tsx
│   │   └── StoryCreator.tsx
│   ├── store/
│   │   ├── ProductCard.tsx (match storeItemCard)
│   │   ├── ProductGrid.tsx
│   │   ├── CartItem.tsx
│   │   ├── CheckoutForm.tsx
│   │   └── SellerCard.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventFilters.tsx
│   │   └── CreateEventForm.tsx
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfileStats.tsx
│   │   ├── ProfileTabs.tsx
│   │   └── AvatarPicker.tsx
│   └── common/
│       ├── FAB.tsx
│       ├── TabBar.tsx
│       ├── Header.tsx
│       └── EmptyState.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePosts.ts
│   ├── useStore.ts
│   ├── useTheme.ts
│   ├── useBottomSheet.ts
│   └── useValidation.ts
├── store/ (or state/)
│   ├── authStore.ts
│   ├── postsStore.ts
│   ├── storeStore.ts
│   ├── uiStore.ts
│   └── index.ts
├── services/
│   ├── storage.ts
│   ├── notifications.ts
│   └── mockData.ts (seed functions from HTML)
├── utils/
│   ├── validation.ts
│   ├── formatters.ts
│   └── constants.ts
├── types/
│   ├── auth.ts
│   ├── posts.ts
│   ├── store.ts
│   ├── user.ts
│   └── index.ts
└── theme/
    ├── colors.ts (EXACT colors from HTML)
    ├── typography.ts (EXACT fonts from HTML)
    ├── spacing.ts (EXACT spacing from HTML)
    ├── themes.ts (6 premium themes)
    └── index.ts
```

## Implementation Checklist

### Phase 1: Foundation & Design System ✓
- [x] Extract ALL colors from HTML to colors.ts
- [x] Extract ALL typography from HTML to typography.ts  
- [x] Extract ALL spacing from HTML to spacing.ts
- [x] Create theme system matching HTML data-theme attributes
- [x] Build base UI components matching HTML exactly
- [x] Test dark mode matches HTML dark mode

### Phase 2: Authentication ✓
- [x] Login screen matches HTML pixel-perfect
- [x] 6-step registration matches HTML exactly
- [x] All validation matches HTML (username, email, phone, password)
- [x] Progress bar matches HTML
- [x] Verification code UI matches HTML
- [x] Password strength indicator matches HTML
- [x] All animations match HTML

### Phase 3: Home & Feed ✓
- [x] Stories row matches HTML exactly
- [x] Post cards match postCardHTML function
- [x] Video posts match HTML
- [x] Carousel posts match HTML with swipe
- [x] Post actions bar matches HTML
- [x] Featured section matches HTML
- [x] Store teaser matches HTML
- [x] Rankings teaser matches HTML
- [x] Pull-to-refresh works
- [x] Infinite scroll works

### Phase 4: Content Creation ✓
- [x] Create post screen matches HTML layout
- [x] Caption input with counter matches HTML
- [x] Media upload matches HTML
- [x] Location tagging matches HTML
- [x] Tags system matches HTML
- [x] Marketplace integration matches HTML
- [x] All form styling matches HTML

### Phase 5: Stories ✓
- [x] Story circles match HTML exactly
- [x] Story viewer matches HTML
- [x] Story creator matches HTML
- [x] Templates match HTML
- [x] Auto-advance timer works (2.5s)
- [x] Swipe navigation works

### Phase 6: Marketplace ✓
- [x] Store home matches HTML
- [x] Product cards match storeItemCard
- [x] Product detail matches HTML
- [x] Cart sheet matches HTML
- [x] Checkout form matches HTML exactly
- [x] Payment method cards match HTML
- [x] Seller dashboard matches HTML (premium)
- [x] Add item form matches HTML

### Phase 7: Social Features ✓
- [x] Profile page matches HTML
- [x] Edit profile matches HTML
- [x] Avatar picker matches HTML with styles/borders
- [x] Connections list matches HTML
- [x] Chat interface matches HTML
- [x] Notifications match HTML
- [x] Search matches HTML

### Phase 8: Premium & Advanced ✓
- [x] Subscription page matches HTML
- [x] Payment flow matches HTML
- [x] Rankings page matches HTML (podium + list)
- [x] Themes selector matches HTML
- [x] All 6 themes match HTML exactly
- [x] Seller dashboard matches HTML
- [x] Settings screens match HTML

### Phase 9: Events & Faculties ✓
- [x] Faculties grid matches HTML
- [x] Faculty stats match HTML
- [x] Events list matches HTML
- [x] Event filters match HTML
- [x] Create event form matches HTML
- [x] Event detail matches HTML

### Phase 10: Polish & Testing ✓
- [x] Comments modal matches HTML
- [x] Similar Items modal matches HTML
- [x] Database Settings modal matches HTML
- [x] API Settings modal matches HTML
- [x] Help & Support modal matches HTML
- [x] About Raved modal matches HTML
- [x] More menu bottom sheet matches HTML
- [ ] All animations match HTML timing
- [ ] Bottom sheets work like HTML
- [ ] All empty states match HTML
- [ ] All loading states match HTML
- [ ] All error states match HTML
- [ ] Toast notifications match HTML
- [ ] FABs match HTML exactly
- [ ] Bottom nav matches HTML exactly
- [ ] Dark mode perfect match
- [ ] All themes perfect match

## Success Criteria

1. ✅ **Visual Perfection**: Side-by-side comparison with HTML prototype shows identical design
2. ✅ **Color Accuracy**: All colors extracted and match exactly
3. ✅ **Spacing Accuracy**: All spacing matches the HTML prototype
4. ✅ **Typography Match**: Font sizes, weights match exactly
5. ✅ **Animation Timing**: All transitions match HTML timing
6. ✅ **Component Structure**: Layout hierarchy matches HTML DOM
7. ✅ **Interaction Patterns**: All interactions work like HTML
8. ✅ **Theme System**: All 6 themes look identical to HTML
9. ✅ **Feature Completeness**: Every feature from HTML is implemented
10. ✅ **No Deviations**: Zero visual or functional deviations from prototype

## Testing Requirements

- Side-by-side visual comparison screenshots
- Color picker verification of all colors
- Spacing measurements match
- Animation timing verification
- Dark mode comparison
- Theme comparison (all 6)
- Feature parity checklist
- Component-by-component verification

## Deliverables

1. Complete Expo/React Native source code
2. Design system documentation showing HTML → RN mapping
3. Color extraction document
4. Component mapping document (HTML element → RN component)
5. Animation timing document
6. README with setup instructions
7. Side-by-side comparison screenshots
8. Build instructions

## CRITICAL REMINDERS

⚠️ **DO NOT IMPROVISE OR "IMPROVE" THE DESIGN**
⚠️ **EVERY COLOR MUST BE EXTRACTED FROM THE HTML FILE**
⚠️ **EVERY SPACING VALUE MUST MATCH THE HTML FILE**
⚠️ **EVERY ANIMATION MUST MATCH THE HTML FILE**
⚠️ **WHEN IN DOUBT, REFERENCE THE HTML FILE**
⚠️ **THE HTML FILE IS THE SINGLE SOURCE OF TRUTH**

The goal is a pixel-perfect, feature-complete recreation in React Native. No design decisions should be made without referencing the HTML prototype first.
```

NOTE begin straight into with the implementation in this one session, also apart from the more all the other bottom sheets are to be implemented as modal with presentation slide from bottom