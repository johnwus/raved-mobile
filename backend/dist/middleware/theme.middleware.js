"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeConsistencyMiddleware = exports.themeAnalyticsMiddleware = exports.themePersistenceMiddleware = void 0;
const theme_service_1 = require("../services/theme.service");
const themePersistenceMiddleware = async (req, res, next) => {
    try {
        if (req.user?.id) {
            // Get user's theme preferences
            const userTheme = await theme_service_1.themeService.getUserTheme(req.user.id);
            // Attach theme info to request for use in controllers
            req.theme = {
                themeId: userTheme.themeId,
                darkMode: userTheme.darkMode,
                autoTheme: await theme_service_1.themeService.getAutoTheme(req.user.id)
            };
        }
        else {
            // For non-authenticated requests, use system theme
            const systemTheme = await theme_service_1.themeService.getSystemTheme();
            req.theme = {
                themeId: 'default',
                darkMode: systemTheme,
                autoTheme: systemTheme
            };
        }
    }
    catch (error) {
        console.warn('Theme middleware error:', error);
        // Continue without theme info if there's an error
    }
    next();
};
exports.themePersistenceMiddleware = themePersistenceMiddleware;
const themeAnalyticsMiddleware = async (req, res, next) => {
    const originalSend = res.json;
    res.json = function (data) {
        try {
            // Track theme usage if user is authenticated
            if (req.user?.id && req.theme) {
                // Log theme analytics (this could be expanded to store in database)
                console.log(`Theme usage: User ${req.user.id}, Theme: ${req.theme.themeId}, Dark: ${req.theme.darkMode}, Auto: ${req.theme.autoTheme}`);
                // In a production system, you would store this in a database table
                // Example: await analyticsService.trackThemeUsage(req.user.id, req.theme);
            }
        }
        catch (error) {
            console.warn('Theme analytics error:', error);
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.themeAnalyticsMiddleware = themeAnalyticsMiddleware;
const themeConsistencyMiddleware = async (req, res, next) => {
    const originalSend = res.json;
    res.json = function (data) {
        try {
            // Add theme information to all API responses for consistency
            if (req.theme && typeof data === 'object' && data !== null) {
                // Only add theme info if it's not already present and response is an object
                if (!data.theme && !data.success) {
                    data.theme = {
                        themeId: req.theme.themeId,
                        darkMode: req.theme.darkMode,
                        autoTheme: req.theme.autoTheme
                    };
                }
            }
        }
        catch (error) {
            console.warn('Theme consistency error:', error);
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.themeConsistencyMiddleware = themeConsistencyMiddleware;
