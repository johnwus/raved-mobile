import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  login,
  sendEmailVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  sendSMSVerification,
  verifySMSCode,
  requestSMSPasswordReset,
  resetPasswordWithSMS,
  enableSMSTwoFactor,
  disableSMSTwoFactor,
  sendSMSTwoFactorCode,
  verifySMSTwoFactorCode,
  refresh,
  updateUserLanguagePreferences,
  registerUser,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimit, criticalRateLimit } from '../middleware/rate-limit.middleware';

const router = Router();

// Registration helpers (pre-auth)
router.get('/check-username', [
    // username in query
], (req: Request, res: Response) => (require('../controllers/auth.controller') as any).checkUsernameAvailability(req, res));
router.post('/register/send-email-code', [
    body('email').isEmail().normalizeEmail(),
], (req: Request, res: Response) => (require('../controllers/auth.controller') as any).sendRegistrationEmailCode(req, res));
router.post('/register/verify-email-code', [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }),
], (req: Request, res: Response) => (require('../controllers/auth.controller') as any).verifyRegistrationEmailCode(req, res));
router.post('/register/send-sms-code', [
    body('phone').notEmpty(),
], (req: Request, res: Response) => (require('../controllers/auth.controller') as any).sendRegistrationSMSCode(req, res));
router.post('/register/verify-sms-code', [
    body('phone').notEmpty(),
    body('code').isLength({ min: 6, max: 6 }),
], (req: Request, res: Response) => (require('../controllers/auth.controller') as any).verifyRegistrationSMSCode(req, res));

// Register
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('username').isLength({ min: 3 }),
], registerUser);

// Login
if (process.env.NODE_ENV === 'development') {
  router.post('/login', [
    body('identifier').notEmpty().withMessage('Identifier is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ], login);
} else {
  router.post('/login', [
    body('identifier').notEmpty().withMessage('Identifier is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ], authRateLimit, login);
}

// Refresh token
if (process.env.NODE_ENV === 'development') {
  router.post('/refresh', [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ], refresh);
} else {
  router.post('/refresh', [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ], authRateLimit, refresh);
}

// Email Verification (with rate limiting)
router.post('/send-verification-email', authenticate, authRateLimit, sendEmailVerification);
router.post('/verify-email', authRateLimit, [
    body('token').notEmpty().withMessage('Verification token is required'),
], verifyEmail);

// Password Reset (with rate limiting)
router.post('/forgot-password', authRateLimit, [
    body('email').isEmail().normalizeEmail(),
], requestPasswordReset);

router.post('/reset-password', criticalRateLimit, [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
], resetPassword);

// SMS Verification
router.post('/send-sms-verification', authenticate, sendSMSVerification);
router.post('/verify-sms-code', authenticate, [
    body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
], verifySMSCode);

// SMS Password Reset
router.post('/sms-forgot-password', [
    body('phone').matches(/^(\+233|0)[0-9]{9}$/).withMessage('Invalid Ghana phone number format'),
], requestSMSPasswordReset);

router.post('/sms-reset-password', [
    body('phone').matches(/^(\+233|0)[0-9]{9}$/).withMessage('Invalid Ghana phone number format'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Reset code must be 6 digits'),
    body('newPassword').isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
], resetPasswordWithSMS);

// SMS Two-Factor Authentication
router.post('/enable-sms-2fa', authenticate, enableSMSTwoFactor);
router.post('/disable-sms-2fa', authenticate, disableSMSTwoFactor);
router.post('/send-sms-2fa-code', [
    body('userId').notEmpty().withMessage('User ID is required'),
], sendSMSTwoFactorCode);

router.post('/verify-sms-2fa-code', [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('2FA code must be 6 digits'),
], verifySMSTwoFactorCode);

// Language Preferences
router.put('/language-preferences', authenticate, [
    body('language').optional().isIn(['en', 'fr', 'tw', 'ha']).withMessage('Invalid language'),
    body('dateFormat').optional().isIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).withMessage('Invalid date format'),
    body('currency').optional().isIn(['GHS', 'USD', 'EUR', 'GBP']).withMessage('Invalid currency'),
], updateUserLanguagePreferences);

export default router;
