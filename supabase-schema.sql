-- =====================================================
-- LeetTracker / DSACrew Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. USERS TABLE (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS lt_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  system_role TEXT DEFAULT 'User' CHECK (system_role IN ('SuperAdmin', 'User')),
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  solved_count INTEGER DEFAULT 0,
  leetcode_total_solved INTEGER DEFAULT 0,
  last_solved_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ROOMS TABLE
CREATE TABLE IF NOT EXISTS lt_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES lt_users(id) ON DELETE SET NULL,
  target_daily_goal INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ROOM MEMBERS (many-to-many relationship)
CREATE TABLE IF NOT EXISTS lt_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES lt_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES lt_users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member' CHECK (role IN ('Admin', 'Member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- 4. PROBLEMS TABLE
CREATE TABLE IF NOT EXISTS lt_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES lt_rooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  tags TEXT[] DEFAULT '{}',
  target_time_minutes INTEGER,
  posted_by UUID REFERENCES lt_users(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS lt_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES lt_problems(id) ON DELETE CASCADE,
  user_id UUID REFERENCES lt_users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Accepted', 'Wrong Answer', 'Pending')),
  language TEXT,
  code_snippet TEXT,
  time_spent_minutes INTEGER,
  runtime_ms TEXT,
  memory_mb TEXT,
  notes TEXT,
  verified_leetcode BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS lt_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES lt_problems(id) ON DELETE CASCADE,
  user_id UUID REFERENCES lt_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  code_snippet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS lt_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES lt_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES lt_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('NEW_PROBLEM', 'PROBLEM_SOLVED', 'STREAK_MILESTONE', 'COMMENT', 'SYSTEM')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  author_name TEXT,
  author_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_lt_users_username ON lt_users(username);
CREATE INDEX IF NOT EXISTS idx_lt_rooms_code ON lt_rooms(code);
CREATE INDEX IF NOT EXISTS idx_lt_room_members_room ON lt_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_lt_room_members_user ON lt_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_lt_problems_room ON lt_problems(room_id);
CREATE INDEX IF NOT EXISTS idx_lt_problems_date ON lt_problems(date);
CREATE INDEX IF NOT EXISTS idx_lt_submissions_problem ON lt_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_lt_submissions_user ON lt_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_lt_notifications_user ON lt_notifications(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE lt_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lt_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE lt_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lt_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE lt_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lt_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lt_notifications ENABLE ROW LEVEL SECURITY;

-- USERS: Users can read all, update own
CREATE POLICY "Users can view all users" ON lt_users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON lt_users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON lt_users FOR INSERT WITH CHECK (auth.uid() = id);

-- ROOMS: Anyone can read, members can create
CREATE POLICY "Anyone can view rooms" ON lt_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms" ON lt_rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Room creator can update" ON lt_rooms FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Room creator can delete" ON lt_rooms FOR DELETE USING (creator_id = auth.uid());

-- ROOM MEMBERS: Viewable by all, manageable by room admins
CREATE POLICY "Anyone can view room members" ON lt_room_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join rooms" ON lt_room_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can leave rooms" ON lt_room_members FOR DELETE USING (user_id = auth.uid());

-- PROBLEMS: Viewable by all room members
CREATE POLICY "Anyone can view problems" ON lt_problems FOR SELECT USING (true);
CREATE POLICY "Room members can create problems" ON lt_problems FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Problem poster can update" ON lt_problems FOR UPDATE USING (posted_by = auth.uid());
CREATE POLICY "Problem poster can delete" ON lt_problems FOR DELETE USING (posted_by = auth.uid());

-- SUBMISSIONS: Viewable by all, own submissions manageable
CREATE POLICY "Anyone can view submissions" ON lt_submissions FOR SELECT USING (true);
CREATE POLICY "Users can create submissions" ON lt_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own submissions" ON lt_submissions FOR UPDATE USING (user_id = auth.uid());

-- COMMENTS: Viewable by all, own comments manageable
CREATE POLICY "Anyone can view comments" ON lt_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON lt_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON lt_comments FOR DELETE USING (user_id = auth.uid());

-- NOTIFICATIONS: Users see their own
CREATE POLICY "Users can view own notifications" ON lt_notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON lt_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON lt_notifications FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE lt_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE lt_room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE lt_problems;
ALTER PUBLICATION supabase_realtime ADD TABLE lt_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE lt_notifications;

-- =====================================================
-- HELPER FUNCTION: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lt_users_updated_at BEFORE UPDATE ON lt_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lt_rooms_updated_at BEFORE UPDATE ON lt_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
