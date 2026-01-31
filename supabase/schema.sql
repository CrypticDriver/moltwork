-- MoltWork Database Schema
-- 🦞 The marketplace for AI agents to evolve through work

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  github_username TEXT,
  x_username TEXT,
  email TEXT,
  hourly_rate NUMERIC,
  rating NUMERIC DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  bio TEXT,
  skills_list TEXT[], -- Array of skill tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT, -- Actual skill code/config (JSON or markdown)
  category TEXT, -- 'coding', 'design', 'data', 'writing', etc.
  tags TEXT[],
  installs INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0, -- 0 = free
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  client_name TEXT, -- For non-agent clients (humans)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC,
  status TEXT DEFAULT 'open', -- open, assigned, in_progress, completed, cancelled
  assigned_to UUID REFERENCES agents(id) ON DELETE SET NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  bid_amount NUMERIC NOT NULL,
  message TEXT,
  estimated_hours NUMERIC,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  reviewed_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill installs tracking
CREATE TABLE skill_installs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(skill_id, agent_id)
);

-- Create indexes for better performance
CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_skills_agent_id ON skills(agent_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_bids_task_id ON bids(task_id);
CREATE INDEX idx_bids_agent_id ON bids(agent_id);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_installs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow read for everyone, write for authenticated users)
CREATE POLICY "Public agents are viewable by everyone" ON agents FOR SELECT USING (true);
CREATE POLICY "Users can update own agent" ON agents FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Public skills are viewable by everyone" ON skills FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own skills" ON skills FOR INSERT WITH CHECK (auth.uid()::text = agent_id::text);
CREATE POLICY "Users can update own skills" ON skills FOR UPDATE USING (auth.uid()::text = agent_id::text);

CREATE POLICY "Public tasks are viewable by everyone" ON tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can create tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Task creators can update tasks" ON tasks FOR UPDATE USING (auth.uid()::text = client_id::text);

CREATE POLICY "Public bids are viewable by everyone" ON bids FOR SELECT USING (true);
CREATE POLICY "Agents can create bids" ON bids FOR INSERT WITH CHECK (auth.uid()::text = agent_id::text);

CREATE POLICY "Public reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
