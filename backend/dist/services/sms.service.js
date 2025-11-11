"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.SMSService = void 0;
const twilio_1 = __importDefault(require("twilio"));
const config_1 = require("../config");
const database_1 = require("../config/database");
class SMSService {
    constructor() {
        this.client = (0, twilio_1.default)(config_1.CONFIG.TWILIO_ACCOUNT_SID, config_1.CONFIG.TWILIO_AUTH_TOKEN);
    }
    /**
     * Send SMS message with rate limiting
     */
    async sendSMS(to, message) {
        try {
            // Rate limiting: max 5 SMS per phone number per hour
            const rateLimitKey = `sms_rate_limit:${to}`;
            const currentCount = await database_1.redis.get(rateLimitKey);
            if (currentCount && parseInt(currentCount) >= 5) {
                throw new Error('SMS rate limit exceeded. Please try again later.');
            }
            // Send SMS via Twilio
            await this.client.messages.create({
                body: message,
                from: config_1.CONFIG.TWILIO_PHONE_NUMBER,
                to: to.startsWith('+') ? to : `+233${to.slice(1)}` // Assuming Ghana numbers
            });
            // Update rate limit counter (expires in 1 hour)
            await database_1.redis.incr(rateLimitKey);
            await database_1.redis.expire(rateLimitKey, 3600);
            return true;
        }
        catch (error) {
            console.error('SMS sending failed:', error);
            throw error;
        }
    }
    /**
     * Send verification code SMS
     */
    async sendVerificationCode(phone, code) {
        const message = `Your Raved verification code is: ${code}. This code expires in 10 minutes.`;
        return this.sendSMS(phone, message);
    }
    /**
     * Send password reset SMS
     */
    async sendPasswordResetCode(phone, code) {
        const message = `Your Raved password reset code is: ${code}. This code expires in 10 minutes.`;
        return this.sendSMS(phone, message);
    }
    /**
     * Send 2FA code SMS
     */
    async sendTwoFactorCode(phone, code) {
        const message = `Your Raved 2FA code is: ${code}. This code expires in 5 minutes.`;
        return this.sendSMS(phone, message);
    }
    /**
     * Send login notification SMS
     */
    async sendLoginNotification(phone, deviceInfo) {
        const message = `New login to your Raved account from ${deviceInfo}. If this wasn't you, please change your password immediately.`;
        return this.sendSMS(phone, message);
    }
    /**
     * Send security alert SMS
     */
    async sendSecurityAlert(phone, alertType) {
        const message = `Security alert for your Raved account: ${alertType}. Please review your account security settings.`;
        return this.sendSMS(phone, message);
    }
    /**
     * Check if phone number is valid for SMS
     */
    isValidPhoneNumber(phone) {
        // Basic validation for Ghana phone numbers (adjust for other countries)
        const ghanaPhoneRegex = /^(\+233|0)[0-9]{9}$/;
        return ghanaPhoneRegex.test(phone);
    }
    /**
     * Format phone number for Twilio
     */
    formatPhoneNumber(phone) {
        if (phone.startsWith('+')) {
            return phone;
        }
        // Assuming Ghana numbers, convert to international format
        return `+233${phone.slice(1)}`;
    }
}
exports.SMSService = SMSService;
// Export singleton instance
exports.smsService = new SMSService();
