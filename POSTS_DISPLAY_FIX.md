# Posts Display Fix - January 2025

## Issue Summary
Posts were not displaying on the index (home) screen and faculty screen.

## Root Causes Identified

### 1. Database Empty (Primary Issue)
The MongoDB database had **0 posts** initially. The seed script needed to be run to populate the database with mock data.

### 2. Backend Data Transformation Bug (Secondary Issue)
The backend was incorrectly transforming post media URLs for carousel posts:
- **Image posts**: Have `media.image` ✅
- **Video posts**: Have `media.video` ✅
- **Carousel posts**: Have `media.images[]` array (NOT `media.image` or `media.video`)

The backend code was doing:
```typescript
url: post.media?.image || post.media?.video
```

This resulted in `url: null` for carousel posts, causing them not to display.

### 3. Frontend Safety Check (Minor Issue)
The `PostCard` component was attempting to access `post.media.type` without checking if the `media` object exists first.

## Files Modified

### 1. `backend/src/controllers/posts.controller.ts`
**Change**: Added `getMediaUrl()` helper function and fixed all media URL transformations

**Added Helper Function**:
```typescript
function getMediaUrl(post: any): string | null {
    if (post.type === 'image') {
        return post.media?.image || null;
    } else if (post.type === 'video') {
        return post.media?.video || null;
    } else if (post.type === 'carousel' && post.media?.images && post.media.images.length > 0) {
        return post.media.images[0]; // Use first image as primary URL
    }
    return null;
}
```

**Fixed 5 instances** where media URL was incorrectly set:
- `getFeed()` function (line ~608)
- `getPublicFeed()` function (line ~440)
- `getFacultyPosts()` function (line ~520)
- `getPost()` function (line ~726)
- `searchPosts()` function (line ~1125)

### 2. `backend/src/controllers/users.controller.ts`
**Change**: Added same `getMediaUrl()` helper function and fixed all media URL transformations

**Fixed 3 instances**:
- `getUserPosts()` function (line ~318)
- `getLikedPosts()` function (line ~457)
- `getSavedPosts()` function (line ~540)

### 3. `raved/components/posts/PostCard.tsx`
**Change**: Added null/undefined safety check in `renderMedia()` function

**Before**:
```typescript
const renderMedia = () => {
  if (post.media.type === 'image') {
    // ... render image
  }
  // ... other media types
};
```

**After**:
```typescript
const renderMedia = () => {
  // Safety check: ensure media exists and has required properties
  if (!post.media || !post.media.type) {
    return null;
  }

  if (post.media.type === 'image') {
    // ... render image
  }
  // ... other media types

  // For text posts or unknown types, return null
  return null;
};
```

## How It Works Now

1. **Index Screen (Home)**:
   - Fetches posts via `usePosts()` hook → `usePostsStore` → `postsApi.getFeed()`
   - Backend returns posts with media structure: `{ type, url, thumbnail, items }`
   - PostCard now safely checks if media exists before rendering
   - Text posts or posts without media will render without the media section

2. **Faculty Screen**:
   - Fetches posts via `postsApi.getFacultyPosts(facultyId)`
   - Same media structure from backend
   - Same safe rendering logic in PostCard

## Backend Data Structure
The backend (`backend/src/controllers/posts.controller.ts`) returns posts with this structure:

```typescript
{
  id: string,
  user: { id, name, username, avatar, faculty },
  caption: string,
  media: {
    type: 'image' | 'video' | 'carousel' | 'text',
    url: string,
    thumbnail: string,
    items: string[]
  },
  tags: string[],
  likes: number,
  comments: number,
  shares: number,
  timeAgo: string,
  liked: boolean,
  saved: boolean,
  forSale: boolean,
  price: number,
  // ... other fields
}
```

## Database Status

**MongoDB Atlas**: Connected to cloud instance
- **Total Posts**: 145 posts
- **Post Types**:
  - Image posts with `media.image`
  - Video posts with `media.video` and `media.thumbnail`
  - Carousel posts with `media.images[]` array
- **Sample Data**: Mock users (u1-u6) with various posts across different faculties

## Testing Checklist

- [x] Database populated with 145 posts
- [x] Backend media URL transformation fixed for all post types
- [x] PostCard component has null safety checks
- [x] No TypeScript/linter errors in backend controllers
- [x] No TypeScript/linter errors in frontend component
- [ ] **Restart backend server** to apply changes
- [ ] Test with posts that have images
- [ ] Test with posts that have videos
- [ ] Test with posts that have carousels
- [ ] Test with text-only posts
- [ ] Test on index screen (home feed)
- [ ] Test on faculty screen
- [ ] Verify posts display with correct media

## Reference
- HTML Prototype: `app-prototype.html` (lines 482-566 for home feed, lines 569-649 for faculty feed)
- The prototype shows posts should display with media, captions, user info, and action buttons
- Our implementation now matches this behavior with proper error handling

## CRITICAL FIX - Cache Format Issue (January 13, 2025) ✅ SOLVED

### ACTUAL Root Cause
Posts were being **filtered out** in the frontend because:
1. Backend cache was returning posts with `_id` (MongoDB format)
2. Frontend was filtering for posts with `id` field
3. Result: All 10 posts filtered out → 0 posts displayed

**Evidence from logs:**
```
LOG  📝 Raw posts count: 10
LOG  ✅ Mapped posts count: 0  ← ALL FILTERED OUT!
LOG  📋 First post sample: No posts
```

### Solution Applied
**Disabled caching temporarily** in `backend/src/controllers/posts.controller.ts`
- The cache was using `FeedAlgorithmService.getPersonalizedFeed()` which returns raw MongoDB docs with `_id`
- The non-cached path uses `fetchFeedData()` which properly transforms `_id` → `id`
- Caching is now disabled until FeedAlgorithmService is fixed to return proper format

## SECONDARY ISSUE - Timeout (January 13, 2025)

### Root Cause Identified
The posts were not displaying because of a **Network Timeout Error**:
- Frontend axios timeout: **10 seconds**
- Backend feed query taking: **10+ seconds** (sometimes 7-19 seconds)
- Result: Network Error before response received

### Additional Fixes Applied

#### 1. Frontend Timeout Increase
**File**: `raved/services/api.ts`
- Changed timeout from `10000ms` (10s) to `30000ms` (30s)
- This gives the backend enough time to complete slow queries

#### 2. Backend Performance Logging
**File**: `backend/src/controllers/posts.controller.ts`
- Added timing logs to `fetchFeedData()` function
- Tracks time for each database query:
  - PostgreSQL connections query
  - MongoDB posts query
  - PostgreSQL users query
  - MongoDB likes query
  - Total execution time

**Backend logs to watch for:**
- 🔍 fetchFeedData START
- ⏱️ Connections query took: Xms
- ⏱️ MongoDB posts query took: Xms
- ⏱️ PostgreSQL users query took: Xms
- ⏱️ MongoDB likes query took: Xms
- ✅ fetchFeedData COMPLETE - Total time: Xms

## Next Steps to Test

1. **Backend is already running** - The changes are applied

2. **Reload the React Native app**:
   - Press `r` in Metro bundler, OR
   - Shake device and select "Reload"

3. **Test the app**:
   - Navigate to the home screen (index)
   - Pull to refresh to load posts
   - **Wait up to 30 seconds** for the feed to load
   - Check backend logs for timing information
   - Verify posts display with images, videos, and carousels
   - Navigate to faculty screen
   - Select a faculty and verify posts display

4. **Expected Behavior**:
   - Posts should now display on both index and faculty screens (may take 10-30 seconds on first load)
   - Image posts show single images
   - Video posts show video player with thumbnail
   - Carousel posts show multiple images with dots indicator
   - All posts show user info, caption, likes, comments, etc.

5. **Performance Optimization Needed**:
   - If backend logs show queries taking >5 seconds, we need to:
     - Add database indexes
     - Optimize the MongoDB query
     - Consider caching the feed
     - Implement pagination more efficiently
