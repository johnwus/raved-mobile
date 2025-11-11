import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { CONFIG } from '../config';

export const paymentController = {
  handlePaystackWebhook: async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      if (CONFIG.PAYSTACK_SECRET_KEY) {
        const crypto = require('crypto');
        const hash = crypto.createHmac('sha512', CONFIG.PAYSTACK_SECRET_KEY).update(payload).digest('hex');
        if (hash !== signature) {
          console.error('Invalid webhook signature');
          return res.status(401).send('Invalid signature');
        }
      }

      await paymentService.handlePaystackWebhook(req.body);

      res.status(200).send('Webhook processed');
    } catch (error) {
      console.error('Webhook Error:', error);
      res.status(500).send('Webhook processing failed');
    }
  },

  initializeSubscriptionPayment: async (req: Request, res: Response) => {
    try {
      const { plan } = req.body;
      const userId = req.user.id;
      const userEmail = req.user.email;
      
      const paymentDetails = await paymentService.initializeSubscriptionPayment(userId, userEmail, plan);
      
      res.json({
        success: true,
        payment: paymentDetails
      });
    } catch (error) {
      console.error('Initialize Payment Error:', error);
      res.status(500).json({ error: 'Failed to initialize payment' });
    }
  },

  initializeCheckoutPayment: async (req: Request, res: Response) => {
    try {
      const checkoutData = req.body;
      const userId = req.user.id;
      const userEmail = req.user.email;

      const paymentDetails = await paymentService.initializeCheckoutPayment(userId, userEmail, checkoutData);

      res.json({
        success: true,
        ...paymentDetails
      });
    } catch (error: any) {
      console.error('Initialize Checkout Payment Error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  verifyPayment: async (req: Request, res: Response) => {
    try {
      const { reference } = req.params;
      const userId = req.user.id;
      const userEmail = req.user.email;

      const subscription = await paymentService.verifyPayment(reference, userId, userEmail);

      res.json({
        success: true,
        message: 'Payment verified and subscription activated',
        subscription
      });
    } catch (error: any) {
      console.error('Verify Payment Error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
};
