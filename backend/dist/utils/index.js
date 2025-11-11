"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeAgo = exports.uploadFile = exports.sendSMS = exports.sendEmail = exports.generateVerificationCode = void 0;
// Generate Verification Code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
exports.generateVerificationCode = generateVerificationCode;
// Send Email (Mock - replace with SendGrid)
async function sendEmail(to, subject, html) {
    console.log(`📧 Email to ${to}: ${subject}`);
    // TODO: Implement SendGrid integration
    return true;
}
exports.sendEmail = sendEmail;
// Send SMS (Mock - replace with Twilio)
async function sendSMS(to, message) {
    console.log(`📱 SMS to ${to}: ${message}`);
    // TODO: Implement Twilio integration
    return true;
}
exports.sendSMS = sendSMS;
// Upload File (Mock - replace with AWS S3)
async function uploadFile(file, folder = 'uploads') {
    // Generate unique filename
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.mimetype.split('/')[1]}`;
    const url = `/uploads/${folder}/${filename}`;
    // TODO: Implement actual S3 upload
    console.log(`📁 File uploaded: ${url}`);
    return url;
}
exports.uploadFile = uploadFile;
function getTimeAgo(date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) {
        return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
}
exports.getTimeAgo = getTimeAgo;
