import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include admin info
declare global {
  namespace Express {
    interface Request {
      user?: any;
      adminRole?: string;
    }
  }
}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user exists and has admin role
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // Check admin role in database
    const { pgPool } = await import('../config/database');
    const adminCheck = await pgPool.query(
      'SELECT role FROM users WHERE id = $1 AND deleted_at IS NULL',
      [req.user.id]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'Account may have been deleted'
      });
    }

    const userRole = adminCheck.rows[0].role;

    // Check if user has admin role
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required',
        message: 'This action requires administrator access',
        requiredRole: 'admin',
        currentRole: userRole || 'user'
      });
    }

    // Add admin info to request for further processing
    req.adminRole = userRole;

    next();
  } catch (error) {
    console.error('Admin Check Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify admin privileges',
      message: 'Please try again later'
    });
  }
};
