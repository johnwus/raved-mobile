import { useState, useEffect } from 'react';
import { Post, Story } from '../types';
import { Storage } from '../services/storage';
import { usePostsStore } from '../store/postsStore';
import socketService from '../services/socket';
import postsApi from '../services/postsApi';

export function usePosts() {
  const [stories, setStories] = useState<Story[]>([]);
  const {
    posts,
    featuredPost,
    loading,
    error,
    fetchFeed,
    setFeaturedPost
  } = usePostsStore();

  const generateStories = async () => {
    try {
      // Try to fetch stories from API first
      // For now, we'll keep a minimal fallback
      const generatedStories: Story[] = [];
      setStories(generatedStories);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      setStories([]);
    }
  };

  const refreshFeed = async () => {
    try {
      await fetchFeed();
      await generateStories();
    } catch (error) {
      console.error('Failed to refresh feed:', error);
      // No fallback to mock data - rely on API
    }
  };

  useEffect(() => {
    // Fetch real data from API
    fetchFeed().catch((error) => {
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
  };
}

