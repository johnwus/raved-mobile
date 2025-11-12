import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Post } from '../types';
import { Storage } from '../services/storage';
import { postsApi } from '../services/postsApi';
import { socketService } from '../services/socket';

interface PostsState {
  posts: Post[];
  featuredPost: Post | null;
  likedPosts: Set<string>;
  savedPosts: Set<string>;
  loading: boolean;
  error: string | null;
  // pagination
  currentPage: number;
  hasMore: boolean;
  limit: number;
  // actions
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

export const usePostsStore = create<PostsState>()(
  persist(
    (set, get) => ({
      posts: [],
      featuredPost: null,
      likedPosts: new Set<string>(),
      savedPosts: new Set<string>(),
      loading: false,
      error: null,
      currentPage: 0,
      hasMore: true,
      limit: 10,

      addPost: (post) => {
        set((state) => ({
          posts: [post, ...state.posts],
        }));
      },

      likePost: async (postId) => {
        try {
          const response = await postsApi.likePost(postId);
          set((state) => {
            const newLiked = new Set(state.likedPosts);
            newLiked.add(postId);
            // Update post likes count
            const updatedPosts = state.posts.map(post =>
              post.id === postId
                ? { ...post, likes: post.likes + 1, liked: true }
                : post
            );
            return { likedPosts: newLiked, posts: updatedPosts };
          });
        } catch (error) {
          console.error('Failed to like post:', error);
          throw error;
        }
      },

      unlikePost: async (postId) => {
        try {
          const response = await postsApi.likePost(postId);
          set((state) => {
            const newLiked = new Set(state.likedPosts);
            newLiked.delete(postId);
            // Update post likes count
            const updatedPosts = state.posts.map(post =>
              post.id === postId
                ? { ...post, likes: post.likes - 1, liked: false }
                : post
            );
            return { likedPosts: newLiked, posts: updatedPosts };
          });
        } catch (error) {
          console.error('Failed to unlike post:', error);
          throw error;
        }
      },

      savePost: async (postId) => {
        try {
          await postsApi.savePost(postId);
          set((state) => {
            const newSaved = new Set(state.savedPosts);
            newSaved.add(postId);
            return {
              savedPosts: newSaved,
              posts: state.posts.map(p => p.id === postId ? { ...p, saved: true } : p)
            };
          });
        } catch (error) {
          console.warn('Save post failed, queueing for offline sync:', error);
          // Optimistic update + enqueue
          set((state) => ({
            savedPosts: new Set([...state.savedPosts, postId]),
            posts: state.posts.map(p => p.id === postId ? { ...p, saved: true } : p)
          }));
          try {
            const { default: syncManager } = await import('../services/syncManager');
            await syncManager.queueRequest('POST', `/posts/${postId}/save`);
          } catch (e) {
            console.error('Failed to queue save request:', e);
          }
        }
      },

      unsavePost: async (postId) => {
        try {
          await postsApi.unsavePost(postId);
          set((state) => {
            const newSaved = new Set(state.savedPosts);
            newSaved.delete(postId);
            return {
              savedPosts: newSaved,
              posts: state.posts.map(p => p.id === postId ? { ...p, saved: false } : p)
            };
          });
        } catch (error) {
          console.warn('Unsave post failed, queueing for offline sync:', error);
          // Optimistic update + enqueue
          set((state) => {
            const newSaved = new Set(state.savedPosts);
            newSaved.delete(postId);
            return {
              savedPosts: newSaved,
              posts: state.posts.map(p => p.id === postId ? { ...p, saved: false } : p)
            };
          });
          try {
            const { default: syncManager } = await import('../services/syncManager');
            await syncManager.queueRequest('DELETE', `/posts/${postId}/save`);
          } catch (e) {
            console.error('Failed to queue unsave request:', e);
          }
        }
      },

      setFeaturedPost: (postId) => {
        const post = get().posts.find(p => p.id === postId);
        if (post) {
          set({ featuredPost: post });
        }
      },

      fetchFeed: async (page = 1) => {
        set({ loading: true, error: null });
        try {
          const { limit } = get();
          const response = await postsApi.getFeed(page, limit);
          const posts = (response.posts || []).map((post: any) => ({
            ...post,
            liked: get().likedPosts.has(post.id),
            saved: get().savedPosts.has(post.id),
          }));
          const hasMore = !!response.pagination?.hasMore && posts.length >= limit;
          set({
            posts,
            featuredPost: posts[0] || null,
            loading: false,
            currentPage: page,
            hasMore,
          });
        } catch (error: any) {
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
          const newPosts = (response.posts || []).map((post: any) => ({
            ...post,
            liked: get().likedPosts.has(post.id),
            saved: get().savedPosts.has(post.id),
          }));
          const merged = [...get().posts];
          newPosts.forEach((p: any) => {
            if (!merged.find(mp => mp.id === p.id)) merged.push(p);
          });
          const hasMore = !!response.pagination?.hasMore && newPosts.length >= limit;
          set({ posts: merged, currentPage: nextPage, hasMore, loading: false });
        } catch (e: any) {
          console.error('Fetch more failed', e);
          set({ loading: false });
        }
      },

      createPost: async (postData) => {
        try {
          const response = await postsApi.createPost(postData);
          const newPost = {
            ...response.post,
            liked: false,
            saved: false,
          };
          get().addPost(newPost);
          return newPost;
        } catch (error: any) {
          console.error('Failed to create post:', error);
          throw error;
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Initialize socket listeners for real-time updates
      initializeSocketListeners: () => {
        socketService.onPostLike((data) => {
          set((state) => ({
            posts: state.posts.map(post =>
              post.id === data.postId
                ? {
                    ...post,
                    likes: data.liked ? post.likes + 1 : post.likes - 1,
                    liked: data.liked,
                    isLiked: data.liked
                  }
                : post
            )
          }));
        });

        socketService.onNewPost((data) => {
          const newPost = {
            ...data.post,
            liked: false,
            saved: false,
          };
          set((state) => ({
            posts: [newPost, ...state.posts]
          }));
        });

        socketService.onPostComment((data) => {
          set((state) => ({
            posts: state.posts.map(post =>
              post.id === data.postId
                ? { ...post, comments: post.comments + 1 }
                : post
            )
          }));
        });
      },
    }),
    {
      name: 'raved-posts',
      storage: {
        getItem: async (name) => {
          try {
            const value = await Storage.get(name, null);
            return value;
          } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            await Storage.set(name, value);
          } catch (error) {
            console.error('Error setting item to storage:', error);
          }
        },
        removeItem: async (name) => {
          try {
            await Storage.remove(name);
          } catch (error) {
            console.error('Error removing item from storage:', error);
          }
        },
      },
    }
  )
);

