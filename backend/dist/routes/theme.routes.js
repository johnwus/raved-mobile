"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const theme_controller_1 = require("../controllers/theme.controller");
const router = (0, express_1.Router)();
// Get available themes (Premium only)
router.get('/themes', auth_middleware_1.authenticate, auth_middleware_1.requirePremium, theme_controller_1.themeController.getThemes);
// Get user's current theme
router.get('/users/theme', auth_middleware_1.authenticate, theme_controller_1.themeController.getUserTheme);
// Set user's theme (Premium only for premium themes)
router.post('/users/theme', auth_middleware_1.authenticate, theme_controller_1.themeController.setUserTheme);
// Set user's dark mode preference
router.post('/users/dark-mode', auth_middleware_1.authenticate, theme_controller_1.themeController.setUserDarkMode);
// Get system theme (day/night based on time)
router.get('/system-theme', theme_controller_1.themeController.getSystemTheme);
// Get auto theme for user (combines user preference and system theme)
router.get('/users/auto-theme', auth_middleware_1.authenticate, theme_controller_1.themeController.getAutoTheme);
exports.default = router;
