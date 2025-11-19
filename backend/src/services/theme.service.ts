import { pgPool } from '../config/database';
import { redis } from '../config/database';
import { CONFIG } from '../config';

export const themeService = {
  getThemes: async (isPremium: boolean) => {
    const themes = [
      {
        id: 'default',
        name: 'Raved Classic',
        colors: {
          primary: '#5D5CDE',
          primaryDark: '#4C4BC7',
          accent: '#FF6B6B'
        },
        category: 'classic',
        premium: false
      },
      {
        id: 'rose',
        name: 'Rose Garden',
        colors: {
          primary: '#f43f5e',
          primaryDark: '#e11d48',
          accent: '#fb7185'
        },
        category: 'classic',
        premium: true
      },
      {
        id: 'emerald',
        name: 'Emerald Forest',
        colors: {
          primary: '#10b981',
          primaryDark: '#059669',
          accent: '#34d399'
        },
        category: 'nature',
        premium: true
      },
      {
        id: 'ocean',
        name: 'Ocean Breeze',
        colors: {
          primary: '#3b82f6',
          primaryDark: '#2563eb',
          accent: '#60a5fa'
        },
        category: 'nature',
        premium: true
      },
      {
        id: 'sunset',
        name: 'Sunset Glow',
        colors: {
          primary: '#f97316',
          primaryDark: '#ea580c',
          accent: '#fb923c'
        },
        category: 'vibrant',
        premium: true
      },
      {
        id: 'galaxy',
        name: 'Galaxy Night',
        colors: {
          primary: '#6366f1',
          primaryDark: '#4f46e5',
          accent: '#8b5cf6'
        },
        category: 'vibrant',
        premium: true
      }
    ];

    return themes.filter(theme => !theme.premium || isPremium);
  },

  getUserTheme: async (userId: string) => {
    const cacheKey = `user_theme:${userId}`;

    // Try to get from cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (cacheError) {
      console.warn('Redis cache error:', cacheError);
    }

    // Get from database
    const result = await pgPool.query(
      'SELECT theme_preference, dark_mode_preference FROM users WHERE id = $1',
      [userId]
    );

    const themeData = {
      themeId: result.rows[0]?.theme_preference || 'default',
      darkMode: result.rows[0]?.dark_mode_preference || false
    };

    // Cache for 1 hour
    try {
      await redis.setex(cacheKey, 3600, JSON.stringify(themeData));
    } catch (cacheError) {
      console.warn('Redis cache set error:', cacheError);
    }

    return themeData;
  },

  setUserTheme: async (userId: string, themeId: string, isPremiumUser: boolean) => {
    const themes = [
      'default', 'rose', 'emerald', 'ocean', 'sunset', 'galaxy'
    ];

    if (!themes.includes(themeId)) {
      throw new Error('Invalid theme');
    }

    const premiumThemes = ['rose', 'emerald', 'ocean', 'sunset', 'galaxy'];
    if (premiumThemes.includes(themeId) && !isPremiumUser) {
      throw new Error('Premium subscription required for this theme');
    }

    await pgPool.query(
      'UPDATE users SET theme_preference = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [themeId, userId]
    );

    // Invalidate cache
    try {
      await redis.del(`user_theme:${userId}`);
    } catch (cacheError) {
      console.warn('Redis cache delete error:', cacheError);
    }

    return themeId;
  },

  setUserDarkMode: async (userId: string) => {
    // Get current dark mode preference
    const result = await pgPool.query(
      'SELECT dark_mode_preference FROM users WHERE id = $1',
      [userId]
    );

    const currentDarkMode = result.rows[0]?.dark_mode_preference || false;
    const newDarkMode = !currentDarkMode;

    await pgPool.query(
      'UPDATE users SET dark_mode_preference = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newDarkMode, userId]
    );

    // Invalidate cache
    try {
      await redis.del(`user_theme:${userId}`);
    } catch (cacheError) {
      console.warn('Redis cache delete error:', cacheError);
    }

    return newDarkMode;
  },

  getSystemTheme: async () => {
    const now = new Date();
    const hour = now.getUTCHours();

    // Consider night time between 6 PM (18:00) and 6 AM (06:00)
    const isNight = hour >= 18 || hour < 6;
    return isNight;
  },

  getAutoTheme: async (userId: string) => {
    const userPrefs = await themeService.getUserTheme(userId);
    const systemTheme = await themeService.getSystemTheme();

    // If user has dark mode preference set, use it
    // Otherwise, use system theme (day/night based on time)
    return userPrefs.darkMode !== undefined ? userPrefs.darkMode : systemTheme;
  }
};
