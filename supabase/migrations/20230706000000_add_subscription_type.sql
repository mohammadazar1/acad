-- Add subscription_type column to players table
ALTER TABLE players
ADD COLUMN subscription_type VARCHAR(20) NOT NULL DEFAULT 'monthly';

