import { Router } from 'express';
import { authenticate, requirePremium } from '../middleware/auth.middleware';
import { themeController } from '../controllers/theme.controller';

const router = Router();

// Get available themes (Premium only)
router.get('/themes', authenticate, requirePremium, themeController.getThemes);

// Get user's current theme
router.get('/users/theme', authenticate, themeController.getUserTheme);

// Set user's theme (Premium only for premium themes)
router.post('/users/theme', authenticate, themeController.setUserTheme);

// Set user's dark mode preference
router.post('/users/dark-mode', authenticate, themeController.setUserDarkMode);

// Get system theme (day/night based on time)
router.get('/system-theme', themeController.getSystemTheme);

// Get auto theme for user (combines user preference and system theme)
router.get('/users/auto-theme', authenticate, themeController.getAutoTheme);

export default router;
