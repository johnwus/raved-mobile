import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Post } from '../types';
import { Storage } from '../services/storage';
import { postsApi } from '../services/postsApi';
import { socketService } from '../services/socket';

interface PostsState {
  posts: Post[];
  featuredPost: Post | null;
  likedPostIds: string[];
  savedPostIds: string[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  limit: number;
  addPost: (post: Post) => void;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  savePost: (postId: string) => void;
  unsavePost: (postId: string) => void;
  setFeaturedPost: (postId: string) => void;
  fetchFeed: (page?: number) => Promise<void>;
  fetchMore: () => Promise<void>;
  createPost: (postData: any) => Promise<Post | null>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeSocketListeners: () => void;
}

function normalizeArrays(state: any) {
  try {
    if (state && typeof state === 'object') {
      if (state.likedPostIds && !Array.isArray(state.likedPostIds)) {
        state.likedPostIds = Array.isArray(state.likedPostIds)
          ? state.likedPostIds
          : Object.keys(state.likedPostIds || {});
      }
      if (state.savedPostIds && !Array.isArray(state.savedPostIds)) {
        state.savedPostIds = Array.isArray(state.savedPostIds)
          ? state.savedPostIds
          : Object.keys(state.savedPostIds || {});
      }
    }
  } catch {
    // ignore
  }
}

function ensureUserOnPost(post: any) {
  if (!post) return post;
  if (post.user && typeof post.user === 'object') return post;

  // Try common fallbacks that backend may provide
  const userId = post.userId || post.authorId || (post.author && (post.author._id || post.author.id)) || null;
  const userName = post.userName || post.authorName || post.username || (post.user && post.user.name) || 'Unknown User';
  const avatar = (post.user && post.user.avatar) || post.avatar || (post.author && post.author.avatar) || '';
  const faculty = (post.user && post.user.faculty) || post.faculty || '';

  if (userId) {
    post.user = { id: userId, name: userName, avatar, faculty };
  } else if (!post.user) {
    // best-effort placeholder so UI doesn't render 'Unknown' unexpectedly
    post.user = { id: `unknown-${Math.random().toString(36).slice(2, 8)}`, name: userName, avatar, faculty };
  }
  return post;
}

export const usePostsStore = create<PostsState>()(
  persist(
    (set, get) => ({
      posts: [],
      featuredPost: null,
      likedPostIds: [],
      savedPostIds: [],
      loading: false,
      error: null,
      currentPage: 0,
      hasMore: true,
      limit: 10,

      addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

      likePost: async (postId) => {
        try {
          await postsApi.likePost(postId);
          set((state) => {
            const newLiked = state.likedPostIds.includes(postId) ? state.likedPostIds : [...state.likedPostIds, postId];
            const updatedPosts = state.posts.map((post) => (post.id === postId ? { ...post, likes: (post.likes || 0) + 1, liked: true } : post));
            return { likedPostIds: newLiked, posts: updatedPosts };
          });
        } catch (error) {
          console.error('Failed to like post:', error);
          throw error;
        }
      },

      unlikePost: async (postId) => {
        try {
          await postsApi.likePost(postId);
          set((state) => {
            const newLiked = state.likedPostIds.filter((id) => id !== postId);
            const updatedPosts = state.posts.map((post) => (post.id === postId ? { ...post, likes: Math.max(0, (post.likes || 1) - 1), liked: false } : post));
            return { likedPostIds: newLiked, posts: updatedPosts };
          });
        } catch (error) {
          console.error('Failed to unlike post:', error);
          throw error;
        }
      },

      savePost: (postId) => {
        try {
          set((state) => ({ savedPostIds: state.savedPostIds.includes(postId) ? state.savedPostIds : [...state.savedPostIds, postId], posts: state.posts.map((p) => (p.id === postId ? { ...p, saved: true } : p)) }));
          postsApi.savePost(postId).catch((error) => {
            console.warn('Save post failed, queueing for offline sync:', error);
            import('../services/syncManager').then(({ default: syncManager }) => {
              syncManager.queueRequest('POST', `/posts/${postId}/save`).catch(() => {});
            }).catch(() => {});
          });
        } catch (error) {
          console.error('Save post error:', error);
        }
      },

      unsavePost: (postId) => {
        try {
          set((state) => ({ savedPostIds: state.savedPostIds.filter((id) => id !== postId), posts: state.posts.map((p) => (p.id === postId ? { ...p, saved: false } : p)) }));
          postsApi.unsavePost(postId).catch((error) => {
            console.warn('Unsave post failed, queueing for offline sync:', error);
          });
        } catch (error) {
          console.error('Unsave post error:', error);
        }
      },

      setFeaturedPost: (postId) => {
        const post = get().posts.find((p) => p.id === postId);
        if (post) set({ featuredPost: post });
      },

      fetchFeed: async (page = 1) => {
        set({ loading: true, error: null });
        try {
          const { limit } = get();
          const response = await postsApi.getFeed(page, limit);
          console.log('📥 Feed API Response:', JSON.stringify(response, null, 2));

          // Normalize posts: ensure user object exists, and filter out items without an id
          const rawPosts = response.posts || [];
          console.log('📝 Raw posts count:', rawPosts.length);

          const mapped = rawPosts
            .map((post: any) => ({ ...post, liked: get().likedPostIds.includes(post.id), saved: get().savedPostIds.includes(post.id) }))
            .map((p: any) => ensureUserOnPost(p))
            .filter((p: any) => p && p.id);

          console.log('✅ Mapped posts count:', mapped.length);
          console.log('📋 First post sample:', mapped[0] ? JSON.stringify(mapped[0], null, 2) : 'No posts');

          const hasMore = !!response.pagination?.hasMore && mapped.length >= limit;
          set({ posts: mapped, featuredPost: mapped.find((p: any) => p && p.user) || mapped[0] || null, loading: false, currentPage: page, hasMore });
        } catch (error: any) {
          console.error('❌ Feed fetch error:', error);
          set({ error: error.message || 'Failed to fetch feed', loading: false });
        }
      },

      fetchMore: async () => {
        if (!get().hasMore || get().loading) return;
        set({ loading: true });
        try {
          const nextPage = get().currentPage + 1;
          const { limit } = get();
          const response = await postsApi.getFeed(nextPage, limit);
          const rawNew = response.posts || [];
          const normalizedNew = rawNew
            .map((post: any) => ({ ...post, liked: get().likedPostIds.includes(post.id), saved: get().savedPostIds.includes(post.id) }))
            .map((p: any) => ensureUserOnPost(p))
            .filter((p: any) => p && p.id);

          const merged = [...get().posts];
          normalizedNew.forEach((p: any) => {
            if (!merged.find((mp) => mp.id === p.id)) merged.push(p);
          });
          const hasMore = !!response.pagination?.hasMore && normalizedNew.length >= limit;
          set({ posts: merged, currentPage: nextPage, hasMore, loading: false });
        } catch (e: any) {
          console.error('Fetch more failed', e);
          set({ loading: false });
        }
      },

      createPost: async (postData) => {
        try {
          const response = await postsApi.createPost(postData);
          const newPost = { ...response.post, liked: false, saved: false } as Post;
          get().addPost(newPost);
          return newPost;
        } catch (error: any) {
          console.error('Failed to create post:', error);
          throw error;
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      initializeSocketListeners: () => {
        socketService.onPostLike((data) => {
          set((state) => ({ posts: state.posts.map((post) => (post.id === data.postId ? { ...post, likes: data.liked ? post.likes + 1 : post.likes - 1, liked: data.liked, isLiked: data.liked } : post)) }));
        });

        socketService.onNewPost((data) => {
          const newPost = { ...data.post, liked: false, saved: false } as Post;
          set((state) => ({ posts: [newPost, ...state.posts] }));
        });

        socketService.onPostComment((data) => {
          set((state) => ({ posts: state.posts.map((post) => (post.id === data.postId ? { ...post, comments: post.comments + 1 } : post)) }));
        });
      },
    }),
    {
      name: 'raved-posts',
      // cast storage to any to satisfy zustand's StorageValue typing differences
      storage: ({
        getItem: async (name: string): Promise<string | null> => {
          try {
            const raw = await Storage.get(name, null as any);
            if (!raw) return null;
            const wrapper = typeof raw === 'object' && raw !== null && 'state' in raw ? raw : { state: raw };
            const state = wrapper.state || {};
            normalizeArrays(state);
            const out = { ...wrapper, state };
            return JSON.stringify(out);
          } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
          }
        },
        setItem: async (name: string, value: any): Promise<void> => {
          try {
            // value may be a string (from zustand) or already an object (some runtimes).
            let parsed: any = value;
            if (typeof value === 'string') {
              try {
                parsed = JSON.parse(value);
              } catch {
                // if parsing fails, keep the original string
                parsed = value;
              }
            }
            await Storage.set(name, parsed as any);
          } catch (error) {
            console.error('Error setting item to storage:', error);
          }
        },
        removeItem: async (name: string): Promise<void> => {
          try {
            await Storage.remove(name);
          } catch (error) {
            console.error('Error removing item from storage:', error);
          }
        },
      } as unknown as any),
    }
  )
);

export default usePostsStore;  
