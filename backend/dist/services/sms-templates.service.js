"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsTemplates = exports.SMSTemplates = void 0;
class SMSTemplates {
    /**
     * Verification code template
     */
    static verificationCode(code, expiresIn = '10 minutes') {
        return `Your Raved verification code is: ${code}. This code expires in ${expiresIn}.`;
    }
    /**
     * Password reset code template
     */
    static passwordResetCode(code, expiresIn = '10 minutes') {
        return `Your Raved password reset code is: ${code}. This code expires in ${expiresIn}.`;
    }
    /**
     * Two-factor authentication code template
     */
    static twoFactorCode(code, expiresIn = '5 minutes') {
        return `Your Raved 2FA code is: ${code}. This code expires in ${expiresIn}.`;
    }
    /**
     * Login notification template
     */
    static loginNotification(deviceInfo) {
        return `New login to your Raved account from ${deviceInfo}. If this wasn't you, please change your password immediately.`;
    }
    /**
     * Security alert template
     */
    static securityAlert(alertType) {
        return `Security alert for your Raved account: ${alertType}. Please review your account security settings.`;
    }
    /**
     * Account verification success template
     */
    static accountVerified() {
        return `Your Raved account has been successfully verified! Welcome to the community.`;
    }
    /**
     * Password changed notification template
     */
    static passwordChanged() {
        return `Your Raved account password has been changed successfully. If you didn't make this change, please contact support immediately.`;
    }
    /**
     * Phone number changed notification template
     */
    static phoneNumberChanged() {
        return `Your Raved account phone number has been changed. If you didn't make this change, please contact support immediately.`;
    }
    /**
     * Subscription renewal reminder template
     */
    static subscriptionRenewalReminder(daysLeft) {
        return `Your Raved premium subscription expires in ${daysLeft} days. Renew now to keep enjoying premium features.`;
    }
    /**
     * Subscription expired template
     */
    static subscriptionExpired() {
        return `Your Raved premium subscription has expired. Upgrade to continue enjoying premium features.`;
    }
    /**
     * Welcome message for new users
     */
    static welcomeMessage(username) {
        return `Welcome to Raved, ${username}! Your account has been created successfully. Start connecting with your university community.`;
    }
    /**
     * Account suspension warning template
     */
    static accountSuspensionWarning(reason) {
        return `Warning: Your Raved account may be suspended due to: ${reason}. Please review our community guidelines.`;
    }
    /**
     * Account reactivation template
     */
    static accountReactivated() {
        return `Your Raved account has been reactivated. Welcome back!`;
    }
    /**
     * Friend request accepted template
     */
    static friendRequestAccepted(username) {
        return `${username} accepted your friend request on Raved!`;
    }
    /**
     * Event reminder template
     */
    static eventReminder(eventName, timeUntil) {
        return `Reminder: ${eventName} starts in ${timeUntil}. Don't miss out!`;
    }
    /**
     * Marketplace item sold template
     */
    static itemSold(itemName, buyerUsername) {
        return `Congratulations! Your ${itemName} has been sold to ${buyerUsername} on Raved Marketplace.`;
    }
    /**
     * Payment received template
     */
    static paymentReceived(amount, from) {
        return `Payment received: ${amount} from ${from} on Raved.`;
    }
    /**
     * System maintenance template
     */
    static systemMaintenance(startTime, duration) {
        return `Scheduled maintenance: Raved will be unavailable from ${startTime} for approximately ${duration}.`;
    }
}
exports.SMSTemplates = SMSTemplates;
// Export singleton instance
exports.smsTemplates = SMSTemplates;
