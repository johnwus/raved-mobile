export interface User {
    id: string;
    username: string;
    email: string;
    phone?: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    bio?: string;
    faculty?: string;
    university?: string;
    student_id?: string;
    location?: string;
    website?: string;
    email_verified: boolean;
    phone_verified: boolean;
    is_private: boolean;
    show_activity: boolean;
    read_receipts: boolean;
    allow_downloads: boolean;
    allow_story_sharing: boolean;
    // SMS Preferences
    sms_notifications_enabled: boolean;
    sms_marketing_enabled: boolean;
    sms_security_alerts_enabled: boolean;
    sms_two_factor_enabled: boolean;
    // Language Preferences
    language: string;
    date_format: string;
    currency: string;
    // Theme Preferences
    dark_mode_preference: boolean;
    followers_count: number;
    following_count: number;
    posts_count: number;
    subscription_tier: string;
    subscription_expires_at?: Date;
    trial_started_at: Date;
    created_at: Date;
    updated_at: Date;
    last_login_at?: Date;
    deleted_at?: Date;
}
