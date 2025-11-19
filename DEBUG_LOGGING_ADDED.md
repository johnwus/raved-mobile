# Debug Logging Added - January 2025

## Purpose
Added comprehensive logging to track the data flow from API to UI to identify why posts are not displaying on the index and faculty screens.

## Files Modified

### 1. `raved/services/postsApi.ts`
Added logging to API calls:
- `getFeed()` - Logs request parameters and response data
- `getFacultyPosts()` - Logs request parameters and response data

**Logs to watch for:**
- 🌐 Fetching feed: page=X, limit=Y
- 🌐 Feed API raw response: [full JSON response]
- 🌐 Feed posts count: X
- 🌐 Fetching faculty posts: facultyId=X, page=Y, limit=Z
- 🌐 Faculty posts API raw response: [full JSON response]
- 🌐 Faculty posts count: X

### 2. `raved/store/postsStore.ts`
Added logging to the `fetchFeed()` function:

**Logs to watch for:**
- 📥 Feed API Response: [full JSON response]
- 📝 Raw posts count: X
- ✅ Mapped posts count: X
- 📋 First post sample: [full post object]
- ❌ Feed fetch error: [error details]

### 3. `raved/app/(tabs)/index.tsx`
Added logging when posts update:

**Logs to watch for:**
- 🏠 Index screen - Posts updated: X
- 🏠 Index screen - First post: [full post object]

### 4. `raved/app/(tabs)/faculties.tsx`
Added logging to faculty data loading:

**Logs to watch for:**
- 🎓 Loading faculty data for: [facultyId]
- 🎓 Faculty posts data: [full JSON response]
- 🎓 Faculty posts count: X
- ❌ Failed to load faculty data: [error details]

### 5. `raved/store/postsStore.ts`
Fixed linting errors:
- Removed unused `e` parameter in catch blocks

## How to Use

1. **Reload the React Native app** (press `r` in Metro bundler or shake device and select "Reload")

2. **Watch the console logs** for the emoji indicators above

3. **Check the data flow**:
   ```
   API Request (🌐)
   → API Response (🌐)
   → Store Processing (📥 📝 ✅ 📋)
   → Component Update (🏠 or 🎓)
   ```

4. **Look for issues**:
   - Is the API returning data? Check 🌐 logs
   - Is the store receiving data? Check 📥 logs
   - Are posts being filtered out? Compare 📝 vs ✅ counts
   - Are posts reaching the component? Check 🏠 logs

## Expected Flow

### For Index Screen (Home Feed):
1. User opens app or pulls to refresh
2. `🌐 Fetching feed: page=1, limit=10`
3. `🌐 Feed API raw response:` shows full response with posts array
4. `🌐 Feed posts count: 10` (or however many posts)
5. `📥 Feed API Response:` shows same data in store
6. `📝 Raw posts count: 10`
7. `✅ Mapped posts count: 10` (should match raw count)
8. `📋 First post sample:` shows a complete post object
9. `🏠 Index screen - Posts updated: 10`
10. `🏠 Index screen - First post:` shows the post

### For Faculty Screen:
1. User selects a faculty
2. `🎓 Loading faculty data for: arts` (or other faculty)
3. `🌐 Fetching faculty posts: facultyId=arts, page=1, limit=20`
4. `🌐 Faculty posts API raw response:` shows full response
5. `🌐 Faculty posts count: X`
6. `🎓 Faculty posts data:` shows same data
7. `🎓 Faculty posts count: X`

## What to Share

When you reload the app, please share:
1. All console logs with the emoji indicators (🌐 📥 📝 ✅ 📋 🏠 🎓 ❌)
2. Any error messages
3. Whether posts are displaying or not

This will help us identify exactly where the data is getting lost or transformed incorrectly.

## Next Steps After Debugging

Once we identify the issue from the logs, we can:
1. Fix the data transformation if posts are being filtered out
2. Fix the API response format if it's not matching expectations
3. Fix the component rendering if posts are in state but not displaying
4. Remove the debug logs once the issue is resolved
