export class SMSTemplates {
    /**
     * Verification code template
     */
    static verificationCode(code: string, expiresIn: string = '10 minutes'): string {
        return `Your Raved verification code is: ${code}. This code expires in ${expiresIn}.`;
    }

    /**
     * Password reset code template
     */
    static passwordResetCode(code: string, expiresIn: string = '10 minutes'): string {
        return `Your Raved password reset code is: ${code}. This code expires in ${expiresIn}.`;
    }

    /**
     * Two-factor authentication code template
     */
    static twoFactorCode(code: string, expiresIn: string = '5 minutes'): string {
        return `Your Raved 2FA code is: ${code}. This code expires in ${expiresIn}.`;
    }

    /**
     * Login notification template
     */
    static loginNotification(deviceInfo: string): string {
        return `New login to your Raved account from ${deviceInfo}. If this wasn't you, please change your password immediately.`;
    }

    /**
     * Security alert template
     */
    static securityAlert(alertType: string): string {
        return `Security alert for your Raved account: ${alertType}. Please review your account security settings.`;
    }

    /**
     * Account verification success template
     */
    static accountVerified(): string {
        return `Your Raved account has been successfully verified! Welcome to the community.`;
    }

    /**
     * Password changed notification template
     */
    static passwordChanged(): string {
        return `Your Raved account password has been changed successfully. If you didn't make this change, please contact support immediately.`;
    }

    /**
     * Phone number changed notification template
     */
    static phoneNumberChanged(): string {
        return `Your Raved account phone number has been changed. If you didn't make this change, please contact support immediately.`;
    }

    /**
     * Subscription renewal reminder template
     */
    static subscriptionRenewalReminder(daysLeft: number): string {
        return `Your Raved premium subscription expires in ${daysLeft} days. Renew now to keep enjoying premium features.`;
    }

    /**
     * Subscription expired template
     */
    static subscriptionExpired(): string {
        return `Your Raved premium subscription has expired. Upgrade to continue enjoying premium features.`;
    }

    /**
     * Welcome message for new users
     */
    static welcomeMessage(username: string): string {
        return `Welcome to Raved, ${username}! Your account has been created successfully. Start connecting with your university community.`;
    }

    /**
     * Account suspension warning template
     */
    static accountSuspensionWarning(reason: string): string {
        return `Warning: Your Raved account may be suspended due to: ${reason}. Please review our community guidelines.`;
    }

    /**
     * Account reactivation template
     */
    static accountReactivated(): string {
        return `Your Raved account has been reactivated. Welcome back!`;
    }

    /**
     * Friend request accepted template
     */
    static friendRequestAccepted(username: string): string {
        return `${username} accepted your friend request on Raved!`;
    }

    /**
     * Event reminder template
     */
    static eventReminder(eventName: string, timeUntil: string): string {
        return `Reminder: ${eventName} starts in ${timeUntil}. Don't miss out!`;
    }

    /**
     * Marketplace item sold template
     */
    static itemSold(itemName: string, buyerUsername: string): string {
        return `Congratulations! Your ${itemName} has been sold to ${buyerUsername} on Raved Marketplace.`;
    }

    /**
     * Payment received template
     */
    static paymentReceived(amount: string, from: string): string {
        return `Payment received: ${amount} from ${from} on Raved.`;
    }

    /**
     * System maintenance template
     */
    static systemMaintenance(startTime: string, duration: string): string {
        return `Scheduled maintenance: Raved will be unavailable from ${startTime} for approximately ${duration}.`;
    }
}

// Export singleton instance
export const smsTemplates = SMSTemplates;