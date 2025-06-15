BEGIN;

-- Clear existing data in proper dependency order
TRUNCATE 
  chore_verification,
  chore_completion,
  chore_swap_request,
  chore_assignment_history,
  chore,
  room_membership,
  room_invitation,
  room,
  "user",
  expense_split,
  expense
RESTART IDENTITY CASCADE;

-- Insert new data into the tables
INSERT INTO "user" (fb_uid, name, email, avatar_url) VALUES
('fb_001', 'Alice', 'alice@example.com', 'https://example.com/avatar/alice.png'),
('fb_002', 'Bob', 'bob@example.com', 'https://example.com/avatar/bob.png'),
('fb_003', 'Carol', 'carol@example.com', 'https://example.com/avatar/carol.png');

INSERT INTO room (room_code, created_by, name) VALUES
('R123ABC', 1, 'Room A');

INSERT INTO room_membership (user_id, room_id, role, points, streak_count, total_completed, trust_score)
VALUES
(1, 1, 'admin', 25, 3, 5, 4.5),
(2, 1, 'member', 18, 2, 4, 4.7),
(3, 1, 'member', 10, 1, 2, 4.2);

INSERT INTO chore (room_id, name, frequency, frequency_value, day_of_week, timing, assigned_to, is_active) VALUES
(1, 'Take out trash', 'weekly', 1, 1, '19:00', 1, TRUE),
(1, 'Clean kitchen', 'weekly', 1, 3, '18:00', 2, TRUE),
(1, 'Vacuum living room', 'biweekly', 2, 5, '17:00', 3, TRUE);

INSERT INTO chore_completion (chore_id, membership_id, completed_at, photo_url, status, points_earned) VALUES
(1, 1, CURRENT_TIMESTAMP - INTERVAL '2 days', 'https://example.com/photos/trash.jpg', 'approved', 10),
(2, 2, CURRENT_TIMESTAMP - INTERVAL '1 days', 'https://example.com/photos/kitchen.jpg', 'pending', 5);

INSERT INTO chore_verification (completion_id, verified_by, verification_type, comment) VALUES
(1, 2, 'peer', 'Looks good!'),
(2, 3, 'peer', 'Waiting for better photo');

INSERT INTO chore_assignment_history (chore_id, membership_id, assigned_at, completed_at, status) VALUES
(1, 1, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '2 days', 'completed'),
(2, 2, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 days', 'completed'),
(3, 3, CURRENT_TIMESTAMP - INTERVAL '7 days', NULL, 'assigned');

INSERT INTO chore_swap_request (chore_id, from_membership, to_membership, status, message, requested_at) VALUES
(3, 3, 1, 'pending', 'Hey, can you vacuum this week? I’m busy.', CURRENT_TIMESTAMP - INTERVAL '1 days');


ROLLBACK;