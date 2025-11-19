-- Migration: Create user trust scores table for post-moderation system
-- Run this against your PostgreSQL database

CREATE TABLE IF NOT EXISTS user_trust_scores (
  user_id VARCHAR(255) PRIMARY KEY,
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  flagged_posts INTEGER DEFAULT 0,
  flagged_comments INTEGER DEFAULT 0,
  flagged_messages INTEGER DEFAULT 0,
  violations_count INTEGER DEFAULT 0,
  last_violation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_trust_scores_trust_score ON user_trust_scores(trust_score);
CREATE INDEX IF NOT EXISTS idx_user_trust_scores_updated_at ON user_trust_scores(updated_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_trust_scores_updated_at ON user_trust_scores;
CREATE TRIGGER update_user_trust_scores_updated_at
    BEFORE UPDATE ON user_trust_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial trust scores for existing users (run after table creation)
-- This will be populated when users first interact with moderated content