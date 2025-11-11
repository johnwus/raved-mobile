import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { adminService } from '../services/admin.service';

export const adminController = {
  getReports: async (req: Request, res: Response) => {
    try {
      const { status = 'pending', type, page = 1, limit = 20 } = req.query;
      const reports = await adminService.getReports(status as string, type as string, parseInt(page as string), parseInt(limit as string));
      
      res.json({
        success: true,
        reports,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          hasMore: reports.length === parseInt(limit as string)
        }
      });
    } catch (error) {
      console.error('Get Reports Error:', error);
      res.status(500).json({ error: 'Failed to get reports' });
    }
  },

  reportContent: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const reporterId = req.user.id;
      const { contentType, contentId, reason, description } = req.body;
      
      await adminService.reportContent(reporterId, contentType, contentId, reason, description);
      
      res.json({
        success: true,
        message: 'Content reported successfully'
      });
    } catch (error: any) {
      console.error('Report Content Error:', error);
      res.status(400).json({ error: error.message });
    }
  },

  resolveReport: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { reportId } = req.params;
      const { action, notes } = req.body;
      const adminId = req.user.id;
      
      await adminService.resolveReport(reportId, action, notes, adminId);
      
      res.json({
        success: true,
        message: `Report resolved with action: ${action}`
      });
    } catch (error: any) {
      console.error('Resolve Report Error:', error);
      res.status(404).json({ error: error.message });
    }
  },

  getPlatformStatistics: async (req: Request, res: Response) => {
    try {
      const { period = '7d' } = req.query;
      const statistics = await adminService.getPlatformStatistics(period as string);
      
      res.json({
        success: true,
        period,
        statistics
      });
    } catch (error) {
      console.error('Get Statistics Error:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  },

  getUserManagementList: async (req: Request, res: Response) => {
    try {
      const { search, role, status, page = 1, limit = 50 } = req.query;
      const users = await adminService.getUserManagementList(
        search as string,
        role as string,
        status as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        users,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          hasMore: users.length === parseInt(limit as string)
        }
      });
    } catch (error) {
      console.error('Get Users Error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  },

  getThemeAnalytics: async (req: Request, res: Response) => {
    try {
      const { period = '30d' } = req.query;
      const analytics = await adminService.getThemeAnalytics(period as string);

      res.json({
        success: true,
        period,
        analytics
      });
    } catch (error) {
      console.error('Get Theme Analytics Error:', error);
      res.status(500).json({ error: 'Failed to get theme analytics' });
    }
  },

  getThemeUsageStats: async (req: Request, res: Response) => {
    try {
      const stats = await adminService.getThemeUsageStats();

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get Theme Usage Stats Error:', error);
      res.status(500).json({ error: 'Failed to get theme usage stats' });
    }
  },

  setDefaultTheme: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { themeId, darkMode } = req.body;
      const adminId = req.user.id;

      await adminService.setDefaultTheme(themeId, darkMode, adminId);

      res.json({
        success: true,
        message: 'Default theme updated successfully',
        defaultTheme: { themeId, darkMode }
      });
    } catch (error: any) {
      console.error('Set Default Theme Error:', error);
      res.status(400).json({ error: error.message });
    }
  }
};
