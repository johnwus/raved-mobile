"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const express_validator_1 = require("express-validator");
const admin_service_1 = require("../services/admin.service");
exports.adminController = {
    getReports: async (req, res) => {
        try {
            const { status = 'pending', type, page = 1, limit = 20 } = req.query;
            const reports = await admin_service_1.adminService.getReports(status, type, parseInt(page), parseInt(limit));
            res.json({
                success: true,
                reports,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: reports.length === parseInt(limit)
                }
            });
        }
        catch (error) {
            console.error('Get Reports Error:', error);
            res.status(500).json({ error: 'Failed to get reports' });
        }
    },
    reportContent: async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const reporterId = req.user.id;
            const { contentType, contentId, reason, description } = req.body;
            await admin_service_1.adminService.reportContent(reporterId, contentType, contentId, reason, description);
            res.json({
                success: true,
                message: 'Content reported successfully'
            });
        }
        catch (error) {
            console.error('Report Content Error:', error);
            res.status(400).json({ error: error.message });
        }
    },
    resolveReport: async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { reportId } = req.params;
            const { action, notes } = req.body;
            const adminId = req.user.id;
            await admin_service_1.adminService.resolveReport(reportId, action, notes, adminId);
            res.json({
                success: true,
                message: `Report resolved with action: ${action}`
            });
        }
        catch (error) {
            console.error('Resolve Report Error:', error);
            res.status(404).json({ error: error.message });
        }
    },
    getPlatformStatistics: async (req, res) => {
        try {
            const { period = '7d' } = req.query;
            const statistics = await admin_service_1.adminService.getPlatformStatistics(period);
            res.json({
                success: true,
                period,
                statistics
            });
        }
        catch (error) {
            console.error('Get Statistics Error:', error);
            res.status(500).json({ error: 'Failed to get statistics' });
        }
    },
    getUserManagementList: async (req, res) => {
        try {
            const { search, role, status, page = 1, limit = 50 } = req.query;
            const users = await admin_service_1.adminService.getUserManagementList(search, role, status, parseInt(page), parseInt(limit));
            res.json({
                success: true,
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: users.length === parseInt(limit)
                }
            });
        }
        catch (error) {
            console.error('Get Users Error:', error);
            res.status(500).json({ error: 'Failed to get users' });
        }
    },
    getThemeAnalytics: async (req, res) => {
        try {
            const { period = '30d' } = req.query;
            const analytics = await admin_service_1.adminService.getThemeAnalytics(period);
            res.json({
                success: true,
                period,
                analytics
            });
        }
        catch (error) {
            console.error('Get Theme Analytics Error:', error);
            res.status(500).json({ error: 'Failed to get theme analytics' });
        }
    },
    getThemeUsageStats: async (req, res) => {
        try {
            const stats = await admin_service_1.adminService.getThemeUsageStats();
            res.json({
                success: true,
                stats
            });
        }
        catch (error) {
            console.error('Get Theme Usage Stats Error:', error);
            res.status(500).json({ error: 'Failed to get theme usage stats' });
        }
    },
    setDefaultTheme: async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { themeId, darkMode } = req.body;
            const adminId = req.user.id;
            await admin_service_1.adminService.setDefaultTheme(themeId, darkMode, adminId);
            res.json({
                success: true,
                message: 'Default theme updated successfully',
                defaultTheme: { themeId, darkMode }
            });
        }
        catch (error) {
            console.error('Set Default Theme Error:', error);
            res.status(400).json({ error: error.message });
        }
    }
};
