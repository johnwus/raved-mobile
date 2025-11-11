export interface UserTrustScore {
  id: number;
  user_id: string;
  trust_score: number; // 0-100 scale
  total_posts: number;
  flagged_posts: number;
  total_comments: number;
  flagged_comments: number;
  total_messages: number;
  flagged_messages: number;
  violations_count: number;
  last_violation_date?: Date;
  account_age_days: number;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;

  // Virtual field for trust level
  trust_level: string;
}