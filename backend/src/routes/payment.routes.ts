import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

// Paystack webhook handler
router.post('/webhooks/paystack', paymentController.handlePaystackWebhook);

// Initialize payment for subscription
router.post('/subscriptions/initialize', authenticate, paymentController.initializeSubscriptionPayment);

// Initialize checkout payment
router.post('/initialize-checkout', authenticate, paymentController.initializeCheckoutPayment);

// Verify payment
router.get('/payments/verify/:reference', authenticate, paymentController.verifyPayment);

export default router;
