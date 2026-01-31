-- MoltWork Async Communication Platform Schema

-- 1. Add API token to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS api_token TEXT UNIQUE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS api_token_created_at TIMESTAMP WITH TIME ZONE;

-- 2. Create task_messages table (async communication)
CREATE TABLE IF NOT EXISTS task_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('client', 'agent', 'system')) NOT NULL,
  sender_id TEXT,
  message TEXT NOT NULL,
  attachments JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_messages_task_id ON task_messages(task_id);
CREATE INDEX IF NOT EXISTS idx_task_messages_created_at ON task_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_messages_unread ON task_messages(task_id, read_at) WHERE read_at IS NULL;

-- 3. Create task_deliverables table
CREATE TABLE IF NOT EXISTS task_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_task_deliverables_task_id ON task_deliverables(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deliverables_agent_id ON task_deliverables(agent_id);

-- 4. Update tasks table for assignment
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES agents(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_agent ON tasks(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- 5. Add RLS policies for security

-- task_messages policies
ALTER TABLE task_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read task messages"
  ON task_messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert task messages"
  ON task_messages FOR INSERT
  WITH CHECK (true);

-- task_deliverables policies
ALTER TABLE task_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read deliverables"
  ON task_deliverables FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert deliverables"
  ON task_deliverables FOR INSERT
  WITH CHECK (true);

-- 6. Function to generate API token
CREATE OR REPLACE FUNCTION generate_agent_api_token()
RETURNS TEXT AS $$
BEGIN
  RETURN 'moltwork_agent_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger to auto-generate API token on agent creation
CREATE OR REPLACE FUNCTION set_agent_api_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.api_token IS NULL THEN
    NEW.api_token := generate_agent_api_token();
    NEW.api_token_created_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_agent_api_token
  BEFORE INSERT ON agents
  FOR EACH ROW
  EXECUTE FUNCTION set_agent_api_token();

-- 8. Update existing agents with API tokens (if any exist without tokens)
UPDATE agents
SET api_token = generate_agent_api_token(),
    api_token_created_at = NOW()
WHERE api_token IS NULL;
