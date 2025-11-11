import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Story } from '../types';
import { Storage } from '../services/storage';

interface StoriesState {
  stories: Story[];
  userStories: Story[];
  viewedStories: Set<string>;
  addStory: (story: Omit<Story, 'id' | 'timestamp' | 'viewed'>) => void;
  markStoryAsViewed: (storyId: string) => void;
  deleteStory: (storyId: string) => void;
  addToHighlights: (storyId: string) => void;
}

export const useStoriesStore = create<StoriesState>()(
  persist(
    (set, get) => ({
      stories: [],
      userStories: [],
      viewedStories: new Set<string>(),

      addStory: (storyData) => {
        const newStory: Story = {
          ...storyData,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          viewed: false,
        };
        set((state) => ({
          stories: [newStory, ...state.stories],
          userStories: [newStory, ...state.userStories],
        }));
      },

      markStoryAsViewed: (storyId) => {
        set((state) => {
          const newViewed = new Set(state.viewedStories);
          newViewed.add(storyId);
          return {
            viewedStories: newViewed,
            stories: state.stories.map(story =>
              story.id === storyId ? { ...story, viewed: true } : story
            ),
          };
        });
      },

      deleteStory: (storyId) => {
        set((state) => ({
          stories: state.stories.filter(story => story.id !== storyId),
          userStories: state.userStories.filter(story => story.id !== storyId),
        }));
      },

      addToHighlights: (storyId) => {
        set((state) => ({
          stories: state.stories.map(story =>
            story.id === storyId ? { ...story, addToHighlights: true } : story
          ),
        }));
      },
    }),
    {
      name: 'raved-stories',
      storage: {
        getItem: async (name) => {
          try {
            const value = await Storage.get(name, null);
            if (value === null) return null;
            return JSON.stringify(value);
          } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            const parsed = JSON.parse(value);
            await Storage.set(name, parsed);
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

