import { Request, Response } from 'express';
import { pgPool } from '../config/database';
import { CONFIG } from '../config';

export const subscriptionsController = {
  // Get subscription plans
  getPlans: async (req: Request, res: Response) => {
    try {
      const plans = [
        {
          id: 'weekly',
          name: 'Weekly Premium',
          price: CONFIG.PREMIUM_WEEKLY_PRICE,
          currency: 'GHS',
          duration: '7 days',
          features: [
            'Access to rankings',
            'Premium themes',
            'Advanced analytics',
            'Priority support',
            'Ad-free experience'
          ]
        },
        {
          id: 'monthly',
          name: 'Monthly Premium',
          price: CONFIG.PREMIUM_WEEKLY_PRICE * 4 * 0.85, // 15% discount
          currency: 'GHS',
          duration: '30 days',
          features: [
            'Access to rankings',
            'Premium themes',
            'Advanced analytics',
            'Priority support',
            'Ad-free experience',
            '15% discount'
          ]
        }
      ];

      res.json({
        success: true,
        plans
      });
    } catch (error: any) {
      console.error('Get Plans Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription plans'
      });
    }
  },

  // Get user subscription status
  getSubscriptionStatus: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      // Get user's subscription tier
      const userResult = await pgPool.query(`
        SELECT subscription_tier, created_at
        FROM users
        WHERE id = $1
      `, [userId]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const user = userResult.rows[0];
      const tier = user.subscription_tier;
      const isPremium = tier === 'premium' || tier === 'admin';
      const isTrial = tier === 'trial';

      // Get active subscription if premium
      let subscription = null;
      if (isPremium) {
        const subResult = await pgPool.query(`
          SELECT id, plan_type, amount, status, starts_at, expires_at
          FROM subscriptions
          WHERE user_id = $1
            AND status = 'active'
            AND expires_at > CURRENT_TIMESTAMP
          ORDER BY expires_at DESC
          LIMIT 1
        `, [userId]);

        if (subResult.rows.length > 0) {
          subscription = {
            id: subResult.rows[0].id,
            planType: subResult.rows[0].plan_type,
            amount: parseFloat(subResult.rows[0].amount),
            status: subResult.rows[0].status,
            startsAt: subResult.rows[0].starts_at,
            expiresAt: subResult.rows[0].expires_at
          };
        }
      }

      // Calculate trial days left if on trial
      let trialDaysLeft = 0;
      if (isTrial) {
        const userCreatedAt = new Date(user.created_at);
        const trialEndDate = new Date(userCreatedAt);
        trialEndDate.setDate(trialEndDate.getDate() + CONFIG.TRIAL_PERIOD_DAYS);
        const now = new Date();
        const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        trialDaysLeft = Math.max(0, daysLeft);
      }

      res.json({
        success: true,
        status: tier,
        isPremium,
        isTrial,
        trialDaysLeft: isTrial ? trialDaysLeft : null,
        subscription
      });
    } catch (error: any) {
      console.error('Get Subscription Status Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription status'
      });
    }
  },

  // Dev/Mock upgrade endpoint to activate premium immediately
  upgrade: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { plan = 'weekly' } = req.body || {};

      const startsAt = new Date();
      const expiresAt = new Date(startsAt);
      if (plan === 'monthly') {
        expiresAt.setDate(expiresAt.getDate() + 30);
      } else {
        expiresAt.setDate(expiresAt.getDate() + 7);
      }

      // Insert subscription record
      await pgPool.query(`
        INSERT INTO subscriptions (user_id, plan_type, amount, payment_method, payment_reference, status, starts_at, expires_at)
        VALUES ($1, $2, $3, $4, $5, 'active', $6, $7)
      `, [
        userId,
        plan,
        plan === 'monthly' ? CONFIG.PREMIUM_WEEKLY_PRICE * 4 * 0.85 : CONFIG.PREMIUM_WEEKLY_PRICE,
        'manual',
        'upgrade_dev',
        startsAt,
        expiresAt,
      ]);

      // Update user tier
      await pgPool.query(`
        UPDATE users
        SET subscription_tier = 'premium',
            subscription_expires_at = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [expiresAt, userId]);

      res.json({
        success: true,
        status: 'premium',
        isPremium: true,
        subscription: {
          planType: plan,
          amount: plan === 'monthly' ? CONFIG.PREMIUM_WEEKLY_PRICE * 4 * 0.85 : CONFIG.PREMIUM_WEEKLY_PRICE,
          startsAt,
          expiresAt,
          status: 'active'
        }
      });
    } catch (error: any) {
      console.error('Upgrade Error:', error);
      res.status(500).json({ success: false, error: 'Failed to upgrade' });
    }
  }
};

