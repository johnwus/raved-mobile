"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportController = void 0;
const database_1 = require("../config/database");
exports.supportController = {
    contactSupport: async (req, res) => {
        try {
            const userId = req.user.id;
            const { subject, message } = req.body;
            // Store support request in database
            await database_1.pgPool.query(`
        INSERT INTO support_requests (
          user_id, subject, message, status, created_at
        ) VALUES ($1, $2, $3, 'open', CURRENT_TIMESTAMP)
      `, [userId, subject, message]);
            // TODO: Send email notification to support team
            // TODO: Send confirmation email to user
            res.json({
                success: true,
                message: 'Your support request has been submitted. We\'ll get back to you soon!',
            });
        }
        catch (error) {
            console.error('Contact Support Error:', error);
            res.status(500).json({ error: 'Failed to submit support request' });
        }
    },
};
