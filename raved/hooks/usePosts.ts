import { useState, useEffect } from 'react';
import { Post, Story } from '../types';
import { Storage } from '../services/storage';
import { usePostsStore } from '../store/postsStore';
import { socketService } from '../services/socket';
import { postsApi } from '../services/postsApi';
import storiesApi from '../services/storiesApi';

export function usePosts() {
  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const {
    posts,
    featuredPost,
    loading,
    error,
    fetchFeed,
    fetchMore,
    setFeaturedPost,
    hasMore,
  } = usePostsStore();

  const generateStories = async () => {
    try {
      setStoriesLoading(true);
      const response = await storiesApi.getStories();
      if (response.success && response.storyGroups) {
        // Transform storyGroups into flat Story array for compatibility
        const flatStories: any[] = [];
        response.storyGroups.forEach((group: any) => {
          group.stories.forEach((story: any) => {
            flatStories.push({
              id: story._id || story.id,
              userId: story.userId,
              userName: group.user.username,
              avatar: group.user.avatarUrl || '',
              timestamp: new Date(story.createdAt).getTime(),
              viewed: story.viewed || false,
              type: story.type,
              text: story.text,
            });
          });
        });
        setStories(flatStories as any);
      } else {
        setStories([]);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      setStories([]);
    } finally {
      setStoriesLoading(false);
    }
  };

  const refreshFeed = async () => {
    try {
      await fetchFeed(1);
      await generateStories();
    } catch (error) {
      console.error('Failed to refresh feed:', error);
      // No fallback to mock data - rely on API
    }
  };

  useEffect(() => {
    // Fetch real data from API
    fetchFeed(1).catch((error) => {
      console.error('Failed to fetch feed:', error);
    });
    generateStories();

    // Initialize socket connection and listeners
    socketService.connect().then(() => {
      usePostsStore.getState().initializeSocketListeners();
    }).catch((error) => {
      console.error('Failed to connect to socket:', error);
    });

    // Cleanup socket connection on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return {
    posts,
    featuredPost,
    stories,
    loading,
    error,
    refreshFeed,
    fetchMore,
    hasMore,
  };
}

