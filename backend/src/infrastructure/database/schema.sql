-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- -----------------------
-- ENUM Types
-- -----------------------
CREATE TYPE user_role AS ENUM ('volunteer', 'event_manager', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'locked', 'deleted');
CREATE TYPE event_status AS ENUM ('pending', 'approved', 'ongoing', 'cancelled', 'completed');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE emoji AS ENUM ('like', 'dislike', 'wow', 'sad', 'angry', 'haha');
CREATE TYPE notification_type AS ENUM ('system', 'user', 'event');
CREATE TYPE report_type AS ENUM ('spam', 'harassment', 'illegal_content', 'violence', 'copyright_violation', 'other');
CREATE TYPE event_category AS ENUM ('education','social','community_service', 'health_wellness', 'technology_stem', 'other');

-- -----------------------
-- Table: users
-- -----------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'volunteer',
    status user_status NOT NULL DEFAULT 'pending',
    avatar_url TEXT DEFAULT '/images/default-avatar.png',
    last_login TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------
-- Table: events
-- -----------------------
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    categories event_category[],
    register_count INTEGER DEFAULT 0,
    capacity INTEGER NOT NULL,
    status event_status NOT NULL DEFAULT 'pending',
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_event_time CHECK (end_time IS NULL OR start_time < end_time),
    CONSTRAINT chk_event_capacity CHECK (capacity > 0)
);

-- -----------------------
-- Table: event_forms
-- -----------------------
-- CREATE TABLE event_forms (
--     event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
--     form_schema JSONB,
--     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--     updated_at TIMESTAMPTZ DEFAULT now()
-- );

-- -----------------------
-- Table: registrations
-- -----------------------
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status registration_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (event_id, user_id)
);

-- -----------------------
-- Table: posts
-- -----------------------
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------
-- Table: comments
-- -----------------------
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------
-- Table: reactions
-- -----------------------
CREATE TABLE reactions (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction emoji NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

-- -----------------------
-- Table: notifications
-- -----------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    type notification_type NOT NULL,
    redirect_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------
-- Table: post_reports
-- -----------------------
CREATE TABLE post_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type report_type NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------
-- Table: comment_reports
-- -----------------------
CREATE TABLE comment_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type report_type NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------
-- Table: push_subscriptions
-- -----------------------
-- CREATE TABLE push_subscriptions (
--     user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
--     subscription JSONB NOT NULL,
--     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- -----------------------
-- Table: audit_logs
-- -----------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------
-- Indexes
-- -----------------------
-- Events --
-- 1. Filter + sort
CREATE INDEX idx_events_status_time ON events (status, start_time DESC);
CREATE INDEX idx_events_owner ON events (owner_id);

-- 2. Text search cho location, name
CREATE INDEX idx_events_location_trgm ON events USING gin (location gin_trgm_ops);
CREATE INDEX idx_events_name_trgm ON events USING gin (name gin_trgm_ops);

-- 3. Category filter (array)
CREATE INDEX idx_events_categories_gin ON events USING gin (categories);

-- Posts --
CREATE INDEX idx_posts_event_created_at ON posts (event_id, created_at DESC);
CREATE INDEX idx_posts_author ON posts (author_id);


-- Comments --
CREATE INDEX idx_comments_post_created_at ON comments (post_id, created_at DESC);

-- Reactions --
CREATE INDEX idx_reactions_post_user_created_at ON reactions (post_id, user_id, created_at DESC);

-- Notifications --
CREATE INDEX idx_notifications_user_created_at ON notifications (user_id, created_at DESC);

-- Registrations --
CREATE INDEX idx_registrations_event_user ON registrations (event_id, user_id);
CREATE INDEX idx_registrations_user ON registrations (user_id);

-- -----------------------
-- Function: update updated_at
-- -----------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------
-- Attach trigger to each table with updated_at
-- -----------------------

-- users
DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- events
DROP TRIGGER IF EXISTS events_updated_at ON events;
CREATE TRIGGER events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- event_forms
DROP TRIGGER IF EXISTS event_forms_updated_at ON event_forms;
CREATE TRIGGER event_forms_updated_at
BEFORE UPDATE ON event_forms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- registrations
DROP TRIGGER IF EXISTS registrations_updated_at ON registrations;
CREATE TRIGGER registrations_updated_at
BEFORE UPDATE ON registrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- posts
DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- comments
DROP TRIGGER IF EXISTS comments_updated_at ON comments;
CREATE TRIGGER comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- reactions
DROP TRIGGER IF EXISTS reactions_updated_at ON reactions;
CREATE TRIGGER reactions_updated_at
BEFORE UPDATE ON reactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- push_subscriptions
-- DROP TRIGGER IF EXISTS push_subscriptions_updated_at ON push_subscriptions;
-- CREATE TRIGGER push_subscriptions_updated_at
-- BEFORE UPDATE ON push_subscriptions
-- FOR EACH ROW
-- EXECUTE FUNCTION update_updated_at_column();
