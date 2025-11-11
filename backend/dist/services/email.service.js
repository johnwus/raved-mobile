"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const bull_1 = __importDefault(require("bull"));
class EmailService {
    static initialize() {
        if (this.initialized)
            return;
        // Initialize SendGrid
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            console.error('SENDGRID_API_KEY not found in environment variables');
            return;
        }
        mail_1.default.setApiKey(apiKey);
        // Initialize Bull queue with Redis
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.emailQueue = new bull_1.default('email-queue', redisUrl);
        // Process email jobs
        this.emailQueue.process(async (job) => {
            const { emailData } = job.data;
            await this.sendEmailDirect(emailData);
        });
        // Handle failed jobs
        this.emailQueue.on('failed', (job, err) => {
            console.error('Email job failed:', err);
        });
        this.initialized = true;
        console.log('Email service initialized successfully');
    }
    static async sendEmail(emailData) {
        if (!this.initialized) {
            throw new Error('Email service not initialized');
        }
        // Add to queue for async processing
        await this.emailQueue.add({ emailData }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        });
    }
    static async sendEmailDirect(emailData) {
        try {
            const msg = {
                to: emailData.to,
                from: emailData.from || process.env.ADMIN_EMAIL || 'noreply@raved.app',
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text,
            };
            const result = await mail_1.default.send(msg);
            console.log('Email sent successfully:', result[0].statusCode);
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
    static async sendWelcomeEmail(email, firstName) {
        const template = this.getWelcomeTemplate(firstName);
        await this.sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }
    static async sendVerificationEmail(email, firstName, verificationToken) {
        const template = this.getVerificationTemplate(firstName, verificationToken);
        await this.sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }
    static async sendPasswordResetEmail(email, firstName, resetToken) {
        const template = this.getPasswordResetTemplate(firstName, resetToken);
        await this.sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }
    static async sendNotificationEmail(email, firstName, notification) {
        const template = this.getNotificationTemplate(firstName, notification);
        await this.sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }
    static getWelcomeTemplate(firstName) {
        return {
            subject: 'Welcome to Raved!',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Raved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Raved!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Welcome to Raved! We're excited to have you join our community of students and professionals.</p>
              <p>Here's what you can do to get started:</p>
              <ul>
                <li>Complete your profile</li>
                <li>Connect with friends and classmates</li>
                <li>Share your thoughts and experiences</li>
                <li>Discover events and opportunities</li>
              </ul>
              <a href="${process.env.CLIENT_URL || 'https://raved.app'}/profile" class="button">Complete Your Profile</a>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy exploring!</p>
              <p>The Raved Team</p>
            </div>
            <div class="footer">
              <p>You received this email because you signed up for Raved.</p>
              <p><a href="${process.env.CLIENT_URL || 'https://raved.app'}/unsubscribe">Unsubscribe</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        Welcome to Raved!

        Hi ${firstName},

        Welcome to Raved! We're excited to have you join our community of students and professionals.

        Here's what you can do to get started:
        - Complete your profile
        - Connect with friends and classmates
        - Share your thoughts and experiences
        - Discover events and opportunities

        Complete Your Profile: ${process.env.CLIENT_URL || 'https://raved.app'}/profile

        If you have any questions, feel free to reach out to our support team.

        Happy exploring!

        The Raved Team

        You received this email because you signed up for Raved.
        Unsubscribe: ${process.env.CLIENT_URL || 'https://raved.app'}/unsubscribe
      `
        };
    }
    static getVerificationTemplate(firstName, token) {
        const verificationUrl = `${process.env.CLIENT_URL || 'https://raved.app'}/verify-email?token=${token}`;
        return {
            subject: 'Verify Your Email - Raved',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .code { background: #e8f4f8; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Thank you for signing up for Raved! To complete your registration, please verify your email address.</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p>This link will expire in 24 hours for security reasons.</p>
              <p>If you didn't create an account with Raved, please ignore this email.</p>
              <p>The Raved Team</p>
            </div>
            <div class="footer">
              <p>You received this email because you signed up for Raved.</p>
              <p><a href="${process.env.CLIENT_URL || 'https://raved.app'}/unsubscribe">Unsubscribe</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        Verify Your Email - Raved

        Hi ${firstName},

        Thank you for signing up for Raved! To complete your registration, please verify your email address.

        Verify Email Address: ${verificationUrl}

        This link will expire in 24 hours for security reasons.

        If you didn't create an account with Raved, please ignore this email.

        The Raved Team

        You received this email because you signed up for Raved.
        Unsubscribe: ${process.env.CLIENT_URL || 'https://raved.app'}/unsubscribe
      `
        };
    }
    static getPasswordResetTemplate(firstName, token) {
        const resetUrl = `${process.env.CLIENT_URL || 'https://raved.app'}/reset-password?token=${token}`;
        return {
            subject: 'Reset Your Password - Raved',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>You requested to reset your password for your Raved account. Click the button below to create a new password.</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <div class="warning">
                <strong>Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email.
              </div>
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>The Raved Team</p>
            </div>
            <div class="footer">
              <p>You received this email because you requested a password reset for your Raved account.</p>
              <p><a href="${process.env.CLIENT_URL || 'https://raved.app'}/unsubscribe">Unsubscribe</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        Reset Your Password - Raved

        Hi ${firstName},

        You requested to reset your password for your Raved account. Click the link below to create a new password.

        Reset Password: ${resetUrl}

        Security Notice: This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email.

        If you have any questions, feel free to contact our support team.

        The Raved Team

        You received this email because you requested a password reset for your Raved account.
        Unsubscribe: ${process.env.CLIENT_URL || 'https://raved.app'}/unsubscribe
      `
        };
    }
    static getNotificationTemplate(firstName, notification) {
        const { type, title, message, actorName } = notification;
        return {
            subject: `New Notification: ${title}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .notification-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Notification</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>You have a new notification on Raved:</p>
              <div class="notification-box">
                <h3>${title}</h3>
                <p>${message}</p>
                ${actorName ? `<p><em>From: ${actorName}</em></p>` : ''}
              </div>
              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'https://raved.app'}/notifications" class="button">View All Notifications</a>
              </div>
              <p>You can manage your email notification preferences in your account settings.</p>
              <p>The Raved Team</p>
            </div>
            <div class="footer">
              <p>You received this email because you have email notifications enabled for ${type} activities.</p>
              <p><a href="${process.env.CLIENT_URL || 'https://raved.app'}/settings/notifications">Manage Preferences</a> | <a href="${process.env.CLIENT_URL || 'https://raved.app'}/unsubscribe">Unsubscribe</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        New Notification - Raved

        Hi ${firstName},

        You have a new notification on Raved:

        ${title}
        ${message}
        ${actorName ? `From: ${actorName}` : ''}

        View All Notifications: ${process.env.CLIENT_URL || 'https://raved.app'}/notifications

        You can manage your email notification preferences in your account settings.

        The Raved Team

        You received this email because you have email notifications enabled for ${type} activities.
        Manage Preferences: ${process.env.CLIENT_URL || 'https://raved.app'}/settings/notifications
        Unsubscribe: ${process.env.CLIENT_URL || 'https://raved.app'}/unsubscribe
      `
        };
    }
    static async getQueueStats() {
        if (!this.initialized)
            return null;
        const waiting = await this.emailQueue.getWaiting();
        const active = await this.emailQueue.getActive();
        const completed = await this.emailQueue.getCompleted();
        const failed = await this.emailQueue.getFailed();
        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
        };
    }
    static async close() {
        if (this.emailQueue) {
            await this.emailQueue.close();
        }
    }
}
exports.EmailService = EmailService;
EmailService.initialized = false;
