-- Add Moltbook identity verification fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS moltbook_username TEXT UNIQUE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS moltbook_verified BOOLEAN DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS moltbook_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS moltbook_karma INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS moltbook_profile_url TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_moltbook_username ON agents(moltbook_username);
CREATE INDEX IF NOT EXISTS idx_agents_moltbook_verified ON agents(moltbook_verified);
