-- ==============================================================================
-- LIFE LEARNING ROULETTE - SUPABASE DATABASE INITIALIZATION MIGRATION
-- ==============================================================================
-- This script sets up:
--  1. Tables: topics, user_progress, user_streaks, user_settings
--  2. Row Level Security (RLS) policies for each table
--  3. Automated user bootstrap trigger (creates streaks & settings on auth signup)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE DEFINITIONS
-- ------------------------------------------------------------------------------

-- 1.1 Topics Table (Shared catalogue, admin/service-role managed)
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY, -- Slug identifier (e.g. 'rag-basics')
    group_name TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    resources JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array of { "label": "...", "url": "..." }
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index frequently filtered columns on topics
CREATE INDEX IF NOT EXISTS idx_topics_group_category ON public.topics (group_name, category);

-- 1.2 User Progress Table (Per-user, per-topic learning state)
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    times_seen INT NOT NULL DEFAULT 0,
    last_seen TIMESTAMPTZ,
    PRIMARY KEY (user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress (user_id);

-- 1.3 User Streaks Table (Per-user streak and activity tracking)
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_active_date DATE
);

-- 1.4 User Settings Table (Per-user preferences & notification options)
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled_categories JSONB NOT NULL DEFAULT '{}'::JSONB,
    reminder_time TEXT NOT NULL DEFAULT '09:00',
    notifications_enabled BOOLEAN NOT NULL DEFAULT false,
    sound_enabled BOOLEAN NOT NULL DEFAULT true,
    haptics_enabled BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 2.1 Topics Policies:
-- Allow authenticated users to view topics. No public insert/update/delete policies
-- are defined, ensuring writes can only occur via Supabase Dashboard / Service Role.
CREATE POLICY "Allow authenticated users to read topics"
    ON public.topics
    FOR SELECT
    TO authenticated
    USING (true);

-- 2.2 User Progress Policies:
-- Users can manage (SELECT, INSERT, UPDATE, DELETE) only their own progress records.
CREATE POLICY "Users can manage own progress"
    ON public.user_progress
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2.3 User Streaks Policies:
-- Users can manage (SELECT, INSERT, UPDATE, DELETE) only their own streak records.
CREATE POLICY "Users can manage own streaks"
    ON public.user_streaks
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2.4 User Settings Policies:
-- Users can manage (SELECT, INSERT, UPDATE, DELETE) only their own settings records.
CREATE POLICY "Users can manage own settings"
    ON public.user_settings
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. NEW USER BOOTSTRAP TRIGGER & FUNCTION
-- ------------------------------------------------------------------------------

-- Function executed whenever a new record is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Initialize default user settings
    INSERT INTO public.user_settings (
        user_id,
        enabled_categories,
        reminder_time,
        notifications_enabled,
        sound_enabled,
        haptics_enabled
    )
    VALUES (
        NEW.id,
        '{}'::JSONB,
        '09:00',
        false,
        true,
        true
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- 2. Initialize default user streak
    INSERT INTO public.user_streaks (
        user_id,
        current_streak,
        longest_streak,
        last_active_date
    )
    VALUES (
        NEW.id,
        0,
        0,
        NULL
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Drop trigger if it already exists before creating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger firing immediately after a user registers in auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
