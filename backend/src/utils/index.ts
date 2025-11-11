// Generate Verification Code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get avatar URL with fallback
export function getAvatarUrl(avatarUrl: string | null | undefined, userId: string): string {
  if (avatarUrl?.trim()) {
    return avatarUrl;
  }
  // Return DiceBear avatar as fallback
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
}

// Send Email (Mock - replace with SendGrid)
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  console.log(`📧 Email to ${to}: ${subject}`);
  // TODO: Implement SendGrid integration
  return true;
}

// Send SMS (Mock - replace with Twilio)
export async function sendSMS(to: string, message: string): Promise<boolean> {
  console.log(`📱 SMS to ${to}: ${message}`);
  // TODO: Implement Twilio integration
  return true;
}

// Upload File (Mock - replace with AWS S3)
export async function uploadFile(file: any, folder: string = 'uploads'): Promise<string> {
  // Generate unique filename
  const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.mimetype.split('/')[1]}`;
  const url = `/uploads/${folder}/${filename}`;
  
  // TODO: Implement actual S3 upload
  console.log(`📁 File uploaded: ${url}`);
  return url;
}

export function getTimeAgo(date: Date): string {
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
