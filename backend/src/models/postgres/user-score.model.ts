export interface UserScore {
    id: string;
    user_id: string;
    weekly_score: number;
    monthly_score: number;
    all_time_score: number;
    total_likes_received: number;
    total_comments_received: number;
    total_shares_received: number;
    total_sales: number;
    total_features: number;
    last_weekly_reset: Date;
    last_monthly_reset: Date;
    updated_at: Date;
}
