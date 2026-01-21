-- Habit Tracker Database Schema for Supabase
-- Run these commands in your Supabase SQL editor

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'barbell',
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'custom', 'weekly')),
    selected_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
    effort_rating INTEGER NOT NULL CHECK (effort_rating >= 1 AND effort_rating <= 5),
    time_window TEXT NOT NULL DEFAULT 'anytime',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    streak INTEGER DEFAULT 0,
    is_paused BOOLEAN DEFAULT FALSE,
    paused_until TIMESTAMPTZ,
    skips_used_this_week INTEGER DEFAULT 0,
    max_skips_per_week INTEGER DEFAULT 2,
    last_skip_reset_week INTEGER DEFAULT 0
);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
    id TEXT PRIMARY KEY,
    habit_id TEXT REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('completed', 'skipped', 'failed')),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create weekly_reports table
CREATE TABLE IF NOT EXISTS weekly_reports (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    week_start BIGINT NOT NULL,
    week_end BIGINT NOT NULL,
    generated_at BIGINT NOT NULL,
    total_completions INTEGER DEFAULT 0,
    total_missed INTEGER DEFAULT 0,
    overall_success_rate INTEGER DEFAULT 0,
    best_day INTEGER,
    worst_day INTEGER,
    habit_metrics JSONB,
    at_risk_habits TEXT[],
    suggestions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create habit_adjustments table
CREATE TABLE IF NOT EXISTS habit_adjustments (
    id TEXT PRIMARY KEY,
    habit_id TEXT REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    timestamp BIGINT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('decrease_difficulty', 'shift_time_window', 'reduce_frequency', 'recommend_pause')),
    previous_value TEXT,
    new_value TEXT,
    was_auto_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits(created_at);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_timestamp ON habit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_habit_logs_status ON habit_logs(status);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_user_id ON weekly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_start ON weekly_reports(week_start);

CREATE INDEX IF NOT EXISTS idx_habit_adjustments_user_id ON habit_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_adjustments_habit_id ON habit_adjustments(habit_id);

-- Enable Row Level Security (RLS)
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_adjustments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for habits
CREATE POLICY "Users can view their own habits" ON habits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits" ON habits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON habits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON habits
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for habit_logs
CREATE POLICY "Users can view their own habit logs" ON habit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs" ON habit_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs" ON habit_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs" ON habit_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for weekly_reports
CREATE POLICY "Users can view their own weekly reports" ON weekly_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly reports" ON weekly_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly reports" ON weekly_reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly reports" ON weekly_reports
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for habit_adjustments
CREATE POLICY "Users can view their own habit adjustments" ON habit_adjustments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit adjustments" ON habit_adjustments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit adjustments" ON habit_adjustments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit adjustments" ON habit_adjustments
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at on habits
DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at 
    BEFORE UPDATE ON habits
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a function to clean up old logs
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM habit_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    DELETE FROM weekly_reports 
    WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;
