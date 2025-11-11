import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Post } from '../types';
import { Storage } from '../services/storage';
import postsApi from '../services/postsApi';
import socketService from '../services/socket';

interface PostsState {
  posts: Post[];
  featuredPost: Post | null;
  likedPosts: Set<string>;
  savedPosts: Set<string>;
  loading: boolean;
  error: string | null;
  addPost: (post: Post) => void;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  savePost: (postId: string) => void;
  unsavePost: (postId: string) => void;
  setFeaturedPost: (postId: string) => void;
  fetchFeed: () => Promise<void>;
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

      savePost: (postId) => {
        set((state) => {
          const newSaved = new Set(state.savedPosts);
          newSaved.add(postId);
          return { savedPosts: newSaved };
        });
      },

      unsavePost: (postId) => {
        set((state) => {
          const newSaved = new Set(state.savedPosts);
          newSaved.delete(postId);
          return { savedPosts: newSaved };
        });
      },

      setFeaturedPost: (postId) => {
        const post = get().posts.find(p => p.id === postId);
        if (post) {
          set({ featuredPost: post });
        }
      },

      fetchFeed: async () => {
        set({ loading: true, error: null });
        try {
          const response = await postsApi.getFeed();
          const posts = response.posts.map((post: any) => ({
            ...post,
            liked: get().likedPosts.has(post.id),
            saved: get().savedPosts.has(post.id),
          }));
          set({ posts, loading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch feed', loading: false });
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

