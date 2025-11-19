import { Request, Response } from 'express';
import { themeService } from '../services/theme.service';

export const themeController = {
  getThemes: async (req: Request, res: Response) => {
    try {
      const isPremium = req.user.subscription_tier === 'premium';
      const themes = await themeService.getThemes(isPremium);
      res.json({ success: true, themes });
    } catch (error) {
      console.error('Get Themes Error:', error);
      res.status(500).json({ error: 'Failed to get themes' });
    }
  },

  getUserTheme: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const userTheme = await themeService.getUserTheme(userId);
      const autoTheme = await themeService.getAutoTheme(userId);
      const systemTheme = await themeService.getSystemTheme();

      res.json({
        success: true,
        theme: {
          themeId: userTheme.themeId,
          darkMode: userTheme.darkMode,
          autoTheme,
          systemTheme
        }
      });
    } catch (error) {
      console.error('Get User Theme Error:', error);
      res.status(500).json({ error: 'Failed to get user theme' });
    }
  },

  setUserTheme: async (req: Request, res: Response) => {
    try {
      const { themeId } = req.body;
      const userId = req.user.id;
      const isPremiumUser = req.user.subscription_tier === 'premium' || req.user.role === 'admin';

      const updatedThemeId = await themeService.setUserTheme(userId, themeId, isPremiumUser);
      res.json({ success: true, message: 'Theme updated successfully', themeId: updatedThemeId });
    } catch (error: any) {
      console.error('Set Theme Error:', error);
      if (error.message.includes('Invalid theme') || error.message.includes('Premium subscription required')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to set theme' });
    }
  },

  setUserDarkMode: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const updatedDarkMode = await themeService.setUserDarkMode(userId);
      res.json({ success: true, message: 'Dark mode preference toggled successfully', darkMode: updatedDarkMode });
    } catch (error: any) {
      console.error('Toggle Dark Mode Error:', error);
      res.status(500).json({ error: 'Failed to toggle dark mode preference' });
    }
  },

  getSystemTheme: async (req: Request, res: Response) => {
    try {
      const isNight = await themeService.getSystemTheme();
      res.json({ success: true, systemTheme: isNight });
    } catch (error) {
      console.error('Get System Theme Error:', error);
      res.status(500).json({ error: 'Failed to get system theme' });
    }
  },

  getAutoTheme: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const autoTheme = await themeService.getAutoTheme(userId);
      res.json({ success: true, autoTheme });
    } catch (error) {
      console.error('Get Auto Theme Error:', error);
      res.status(500).json({ error: 'Failed to get auto theme' });
    }
  }
};
