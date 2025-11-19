"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// Registration helpers (pre-auth)
router.get('/check-username', [
// username in query
], (req, res) => require('../controllers/auth.controller').checkUsernameAvailability(req, res));
router.post('/register/send-email-code', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
], (req, res) => require('../controllers/auth.controller').sendRegistrationEmailCode(req, res));
router.post('/register/verify-email-code', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('code').isLength({ min: 6, max: 6 }),
], (req, res) => require('../controllers/auth.controller').verifyRegistrationEmailCode(req, res));
router.post('/register/send-sms-code', [
    (0, express_validator_1.body)('phone').notEmpty(),
], (req, res) => require('../controllers/auth.controller').sendRegistrationSMSCode(req, res));
router.post('/register/verify-sms-code', [
    (0, express_validator_1.body)('phone').notEmpty(),
    (0, express_validator_1.body)('code').isLength({ min: 6, max: 6 }),
], (req, res) => require('../controllers/auth.controller').verifyRegistrationSMSCode(req, res));
// Register
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }),
    (0, express_validator_1.body)('firstName').notEmpty(),
    (0, express_validator_1.body)('lastName').notEmpty(),
    (0, express_validator_1.body)('username').isLength({ min: 3 }),
], auth_controller_1.registerUser);
// Login
if (process.env.NODE_ENV === 'development') {
    router.post('/login', [
        (0, express_validator_1.body)('identifier').notEmpty().withMessage('Identifier is required'),
        (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    ], auth_controller_1.login);
}
else {
    router.post('/login', [
        (0, express_validator_1.body)('identifier').notEmpty().withMessage('Identifier is required'),
        (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    ], rate_limit_middleware_1.authRateLimit, auth_controller_1.login);
}
// Refresh token
if (process.env.NODE_ENV === 'development') {
    router.post('/refresh', [
        (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token is required'),
    ], auth_controller_1.refresh);
}
else {
    router.post('/refresh', [
        (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token is required'),
    ], rate_limit_middleware_1.authRateLimit, auth_controller_1.refresh);
}
// Email Verification (with rate limiting)
router.post('/send-verification-email', auth_middleware_1.authenticate, rate_limit_middleware_1.authRateLimit, auth_controller_1.sendEmailVerification);
router.post('/verify-email', rate_limit_middleware_1.authRateLimit, [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Verification token is required'),
], auth_controller_1.verifyEmail);
// Password Reset (with rate limiting)
router.post('/forgot-password', rate_limit_middleware_1.authRateLimit, [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
], auth_controller_1.requestPasswordReset);
router.post('/reset-password', rate_limit_middleware_1.criticalRateLimit, [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Reset token is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
], auth_controller_1.resetPassword);
// SMS Verification
router.post('/send-sms-verification', auth_middleware_1.authenticate, auth_controller_1.sendSMSVerification);
router.post('/verify-sms-code', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
], auth_controller_1.verifySMSCode);
// SMS Password Reset
router.post('/sms-forgot-password', [
    (0, express_validator_1.body)('phone').matches(/^(\+233|0)[0-9]{9}$/).withMessage('Invalid Ghana phone number format'),
], auth_controller_1.requestSMSPasswordReset);
router.post('/sms-reset-password', [
    (0, express_validator_1.body)('phone').matches(/^(\+233|0)[0-9]{9}$/).withMessage('Invalid Ghana phone number format'),
    (0, express_validator_1.body)('code').isLength({ min: 6, max: 6 }).withMessage('Reset code must be 6 digits'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
], auth_controller_1.resetPasswordWithSMS);
// SMS Two-Factor Authentication
router.post('/enable-sms-2fa', auth_middleware_1.authenticate, auth_controller_1.enableSMSTwoFactor);
router.post('/disable-sms-2fa', auth_middleware_1.authenticate, auth_controller_1.disableSMSTwoFactor);
router.post('/send-sms-2fa-code', [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('User ID is required'),
], auth_controller_1.sendSMSTwoFactorCode);
router.post('/verify-sms-2fa-code', [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('User ID is required'),
    (0, express_validator_1.body)('code').isLength({ min: 6, max: 6 }).withMessage('2FA code must be 6 digits'),
], auth_controller_1.verifySMSTwoFactorCode);
// Language Preferences
router.put('/language-preferences', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('language').optional().isIn(['en', 'fr', 'tw', 'ha']).withMessage('Invalid language'),
    (0, express_validator_1.body)('dateFormat').optional().isIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).withMessage('Invalid date format'),
    (0, express_validator_1.body)('currency').optional().isIn(['GHS', 'USD', 'EUR', 'GBP']).withMessage('Invalid currency'),
], auth_controller_1.updateUserLanguagePreferences);
exports.default = router;
