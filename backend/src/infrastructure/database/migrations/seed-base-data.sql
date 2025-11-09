-- ========================================
-- SEED BASE DATA – VolunteerHub
-- ========================================

-- ========================================
-- 1. ROOT ADMIN
-- ========================================
INSERT INTO users (
    id, username, email, password_hash, role, status, avatar_url, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'Root Admin',
    'rootadmin@volunteerhub.com',
    crypt('password', gen_salt('bf')),
    'admin',
    'active',
    '/uploads/avatars/default-avatar.png',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 2. EVENT MANAGERS (Your Custom Data)
-- ========================================
INSERT INTO users (id, username, email, password_hash, role, status, avatar_url, created_at, updated_at) VALUES
(gen_random_uuid(), 'Theresia Van Astrea', 'theresia@volunteerhub.com', crypt('password', gen_salt('bf')), 'event_manager', 'active', '/uploads/avatars/theresia.jpg', NOW(), NOW()),
(gen_random_uuid(), 'chicongn', 'chicongn@volunteerhub.com', crypt('password', gen_salt('bf')), 'event_manager', 'active', '/uploads/avatars/chicongn.jpg', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 3. VOLUNTEERS (Fixed image paths)
-- ========================================
INSERT INTO users (id, username, email, password_hash, role, status, avatar_url, created_at, updated_at) VALUES
(gen_random_uuid(), 'Emma Davis',     'emma.volunteer@gmail.com',     crypt('password', gen_salt('bf')), 'volunteer', 'active', '/uploads/avatars/default-avatar.png', NOW(), NOW()),
(gen_random_uuid(), 'Liam Chen',      'liam.volunteer@gmail.com',     crypt('password', gen_salt('bf')), 'volunteer', 'active', '/uploads/avatars/default-avatar.png', NOW(), NOW()),
(gen_random_uuid(), 'Sophia Martinez','sophia.volunteer@gmail.com', crypt('password', gen_salt('bf')), 'volunteer', 'active', '/uploads/avatars/default-avatar.png', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 4. SAMPLE EVENTS (Owned by Theresia)
-- ========================================
DO $$
DECLARE
    theresia_id UUID;
BEGIN
    -- Get Theresia's ID
    SELECT id INTO theresia_id FROM users WHERE email = 'theresia@volunteerhub.com';

    -- Event 1: Tree Planting (Approved)
    INSERT INTO events (
        id, name, location, start_time, end_time, description, image_url,
        categories, register_count, capacity, status, owner_id, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'Plant 1000 Trees at Tao Dan Park',
        'Tao Dan Park, District 1, Ho Chi Minh City',
        '2025-11-15 08:00:00+07', '2025-11-15 12:00:00+07',
        'Join us to plant 1000 trees and make the city greener! Open to all ages.',
        '/uploads/events/default-event.jpg',
        ARRAY['community_service']::event_category[],
        0, 50, 'approved', theresia_id, NOW(), NOW()
    );

    -- Event 2: Scratch Coding Workshop (Approved)
    INSERT INTO events (
        id, name, location, start_time, end_time, description, image_url,
        categories, register_count, capacity, status, owner_id, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'Scratch Coding for Kids (8-14)',
        'Creative Tech Center, District 7, HCMC',
        '2025-11-20 09:00:00+07', '2025-11-20 16:00:00+07',
        'Teach kids how to code games with Scratch. Laptops provided.',
        '/uploads/events/default-event.jpg',
        ARRAY['education', 'technology_stem']::event_category[],
        0, 30, 'approved', theresia_id, NOW(), NOW()
    );

    -- Event 3: Charity Run 5K (Approved)
    INSERT INTO events (
        id, name, location, start_time, end_time, description, image_url,
        categories, register_count, capacity, status, owner_id, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        '5K Charity Run for Education',
        'Starlight Bridge, District 2, HCMC',
        '2025-12-01 06:00:00+07', '2025-12-01 09:00:00+07',
        'Run 5K to raise funds for underprivileged students.',
        '/uploads/events/default-event.jpg',
        ARRAY['social', 'health_wellness']::event_category[],
        0, 200, 'approved', theresia_id, NOW(), NOW()
    );

    -- Event 4: Build Bridge (Pending)
    INSERT INTO events (
        id, name, location, start_time, end_time, description, image_url,
        categories, register_count, capacity, status, owner_id, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'Build Suspension Bridge in Sa Pa',
        'Cat Cat Village, Sa Pa, Lao Cai',
        '2025-12-10 07:00:00+07', '2025-12-14 17:00:00+07',
        '5-day trip to build a bridge for 50 families.',
        '/uploads/events/default-event.jpg',
        ARRAY['community_service']::event_category[],
        0, 20, 'pending', theresia_id, NOW(), NOW()
    );

    -- Event 5: Beach Cleanup (Completed)
    INSERT INTO events (
        id, name, location, start_time, end_time, description, image_url,
        categories, register_count, capacity, status, owner_id, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'My Khe Beach Cleanup',
        'My Khe Beach, Da Nang',
        '2025-10-20 07:00:00+07', '2025-10-20 11:00:00+07',
        'Event completed! Collected 500kg of trash.',
        '/uploads/events/default-event.jpg',
        ARRAY['community_service', 'social']::event_category[],
        85, 100, 'completed', theresia_id, NOW(), NOW()
    );
END $$;

-- ========================================
-- 5. REGISTRATIONS
-- ========================================
INSERT INTO registrations (id, event_id, user_id, status, created_at, updated_at)
SELECT
    gen_random_uuid(),
    e.id,
    u.id,
    CASE
        WHEN u.email LIKE '%@gmail.com' THEN 'approved'
        ELSE 'pending'
    END,
    NOW(), NOW()
FROM events e
CROSS JOIN users u
WHERE e.name LIKE '%Tree%' AND u.role = 'volunteer'
   OR e.name LIKE '%Scratch%' AND u.email = 'emma.volunteer@gmail.com'
   OR e.name LIKE '%Charity Run%' AND u.email IN ('emma.volunteer@gmail.com', 'liam.volunteer@gmail.com')
ON CONFLICT (event_id, user_id) DO NOTHING;

-- Update register_count
UPDATE events SET register_count = (
    SELECT COUNT(*) FROM registrations r 
    WHERE r.event_id = events.id AND r.status = 'approved'
);

-- ========================================
-- 6. POSTS (Tree Planting event – by Theresia)
-- ========================================
WITH tree_event AS (SELECT id FROM events WHERE name LIKE '%Tree%' LIMIT 1),
     theresia AS (SELECT id FROM users WHERE email = 'theresia@volunteerhub.com' LIMIT 1),
     emma AS (SELECT id FROM users WHERE email = 'emma.volunteer@gmail.com' LIMIT 1)
INSERT INTO posts (id, event_id, author_id, content, image_url, created_at, updated_at) VALUES
(gen_random_uuid(),
 (SELECT id FROM tree_event), (SELECT id FROM theresia),
 'URGENT: Event postponed to Sunday (Nov 16) due to heavy rain. All volunteers will be notified.',
 '/uploads/events/default-event.jpg', NOW(), NOW()),
 
(gen_random_uuid(),
 (SELECT id FROM tree_event), (SELECT id FROM emma),
 'I''m so excited! First time volunteering. Who''s joining?',
 NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. COMMENTS
-- ========================================
WITH first_post AS (SELECT id FROM posts ORDER BY created_at LIMIT 1)
INSERT INTO comments (id, post_id, author_id, content, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM first_post), (SELECT id FROM users WHERE email = 'liam.volunteer@gmail.com'), 'Got it! Thanks Theresia.', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM first_post), (SELECT id FROM users WHERE email = 'sophia.volunteer@gmail.com'), 'Will the new date work?', NOW(), NOW());

-- ========================================
-- 8. REACTIONS
-- ========================================
INSERT INTO reactions (post_id, user_id, reaction, created_at) VALUES
((SELECT id FROM posts ORDER BY created_at LIMIT 1), (SELECT id FROM users WHERE email = 'emma.volunteer@gmail.com'), 'like', NOW()),
((SELECT id FROM posts ORDER BY created_at LIMIT 1), (SELECT id FROM users WHERE email = 'liam.volunteer@gmail.com'), 'sad', NOW());

-- ========================================
-- 9. NOTIFICATIONS (for Emma)
-- ========================================
INSERT INTO notifications (id, user_id, message, type, redirect_url, read, created_at) VALUES
(gen_random_uuid(),
 (SELECT id FROM users WHERE email = 'emma.volunteer@gmail.com'),
 'Your registration for "Plant 1000 Trees" has been approved!',
 'event', '/events/plant-1000-trees', false, NOW()),
 
(gen_random_uuid(),
 (SELECT id FROM users WHERE email = 'emma.volunteer@gmail.com'),
 'Event postponed to Nov 16 due to rain.',
 'event', '/events/plant-1000-trees', false, NOW());

-- ========================================
-- 10. AUDIT LOGS
-- ========================================
INSERT INTO audit_logs (id, user_id, action, details, ip_address, created_at) VALUES
(gen_random_uuid(),
 (SELECT id FROM users WHERE email = 'admin@volunteerhub.com'),
 'event_approved',
 jsonb_build_object('event_name', 'Scratch Coding for Kids', 'approved_by', 'Root Admin'),
 '192.168.1.1', NOW());

-- ========================================
-- DONE!
-- ========================================