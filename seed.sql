-- 1. USERS
INSERT INTO "user" (fb_uid, name, email, avatar_url) VALUES
('fb_001', 'Alice Johnson', 'alice@example.com', 'https://pics.com/alice.png'),
('fb_002', 'Bob Smith', 'bob@example.com', 'https://pics.com/bob.png'),
('fb_003', 'Carlos Vega', 'carlos@example.com', 'https://pics.com/carlos.png'),
('fb_004', 'Diana Wu', 'diana@example.com', 'https://pics.com/diana.png'),
('fb_005', 'Ethan Miles', 'ethan@example.com', 'https://pics.com/ethan.png');

-- 2. ROOMS
INSERT INTO "room" (room_code, created_by, name) VALUES
('ROOM101', 1, 'Alpha House'),
('ROOM102', 2, 'Beta Squad'),
('ROOM103', 3, 'Gamma Group'),
('ROOM104', 4, 'Delta Den'),
('ROOM105', 5, 'Echo Estate');

-- 3. ROOM MEMBERSHIPS
INSERT INTO "room_membership" (user_id, room_id, role, points) VALUES
(1, 1, 'admin', 15),
(2, 1, 'member', 10),
(3, 2, 'admin', 20),
(4, 2, 'member', 5),
(5, 3, 'admin', 8);

-- 4. ROOM INVITATIONS
INSERT INTO "room_invitation" (room_id, invited_by, invited_email, invited_name, invitation_token, status) VALUES
(1, 1, 'invite1@example.com', 'Friend A', 'token001', 'pending'),
(1, 1, 'invite2@example.com', 'Friend B', 'token002', 'accepted'),
(2, 3, 'invite3@example.com', 'Friend C', 'token003', 'pending'),
(3, 5, 'invite4@example.com', 'Friend D', 'token004', 'rejected'),
(3, 5, 'invite5@example.com', 'Friend E', 'token005', 'pending');

-- 5. CHORES
INSERT INTO "chore" (room_id, name, frequency, frequency_value, day_of_week, timing, description, start_date, assigned_to) VALUES
(1, 'Take out trash', 'weekly', 1, 2, '08:00', 'Take bins out every Tuesday morning.', '2025-07-01', 1),
(1, 'Clean kitchen', 'weekly', 1, 4, '10:00', 'Wipe surfaces and sweep floor.', '2025-07-02', 2),
(2, 'Vacuum living room', 'biweekly', 2, 1, '09:00', 'Use cordless vacuum.', '2025-07-03', 3),
(2, 'Bathroom cleaning', 'weekly', 1, 5, '11:00', 'Scrub toilet and sink.', '2025-07-04', 4),
(3, 'Water plants', 'daily', 1, NULL, '07:30', 'Indoor plants only.', '2025-07-01', 5);

-- 6. CHORE COMPLETIONS
INSERT INTO "chore_completion" (chore_id, membership_id, status, points_earned) VALUES
(1, 1, 'verified', 5),
(2, 2, 'pending', 0),
(3, 3, 'verified', 10),
(4, 4, 'pending', 0),
(5, 5, 'verified', 3);

-- 7. CHORE VERIFICATIONS
INSERT INTO "chore_verification" (completion_id, verified_by, verification_type, comment) VALUES
(1, 2, 'peer', 'Looks good'),
(3, 4, 'peer', 'Nice job'),
(5, 1, 'admin', 'Verified from camera'),
(2, 1, 'admin', 'Waiting on picture'),
(4, 3, 'peer', 'Almost done');

-- 8. CHORE ASSIGNMENT HISTORY
INSERT INTO "chore_assignment_history" (chore_id, membership_id, status) VALUES
(1, 1, 'completed'),
(2, 2, 'assigned'),
(3, 3, 'completed'),
(4, 4, 'assigned'),
(5, 5, 'completed');

-- 9. CHORE SWAP REQUESTS
INSERT INTO "chore_swap_request" (chore_id, from_membership, to_membership, status, message) VALUES
(1, 1, 2, 'pending', 'Can you take this chore?'),
(2, 2, 1, 'accepted', 'Sure, I got it'),
(3, 3, 4, 'rejected', 'Busy this week'),
(4, 4, 3, 'pending', 'Trade please'),
(5, 5, 1, 'accepted', 'Thanks!');

-- 10. EXPENSES
INSERT INTO "expense" (room_id, payer_membership_id, amount, description, category, expense_date) VALUES
(1, 1, 40.00, 'Groceries', 'food', '2025-06-25'),
(1, 2, 20.00, 'Cleaning supplies', 'house', '2025-06-26'),
(2, 3, 60.00, 'Pizza night', 'food', '2025-06-27'),
(2, 4, 18.50, 'Laundry coins', 'utilities', '2025-06-28'),
(3, 5, 75.00, 'Internet bill', 'utilities', '2025-06-29');

-- 11. EXPENSE SPLITS
INSERT INTO "expense_split" (expense_id, membership_id, amount_owed, is_paid) VALUES
(1, 1, 20.00, TRUE),
(1, 2, 20.00, FALSE),
(2, 1, 10.00, TRUE),
(2, 2, 10.00, TRUE),
(3, 3, 30.00, FALSE),
(3, 4, 30.00, TRUE),
(4, 3, 9.25, FALSE),
(4, 4, 9.25, TRUE),
(5, 5, 37.50, TRUE),
(5, 1, 37.50, FALSE);
