import api from './api';

export interface CreateStoryData {
  type: 'image' | 'video' | 'template' | 'text';
  content?: any;
  text?: string;
  thumbnail?: string;
  allowReplies?: boolean;
  addToHighlights?: boolean;
}

export interface Story {
  id: string;
  userId: string;
  type: string;
  content?: any;
  text?: string;
  thumbnail?: string;
  allowReplies: boolean;
  addToHighlights: boolean;
  expiresAt: string;
  createdAt: string;
  viewed?: boolean;
}

export interface StoryGroup {
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string;
  };
  stories: Story[];
  hasUnviewed: boolean;
}

export const storiesApi = {
  /**
   * Get stories feed (stories from followed users and current user)
   */
  getStories: async (): Promise<{ success: boolean; storyGroups: StoryGroup[] }> => {
    const response = await api.get('/stories');
    return response.data;
  },

  /**
   * Create a new story
   */
  createStory: async (storyData: CreateStoryData): Promise<{ success: boolean; story: Story }> => {
    const response = await api.post('/stories', storyData);
    return response.data;
  },
};

export default storiesApi;

