-- 1. USER TABLE
CREATE TABLE "user" (
  "user_id" SERIAL PRIMARY KEY,
  "fb_uid" VARCHAR(128) UNIQUE NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "avatar_url" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROOM TABLE
CREATE TABLE "room" (
  "room_id" SERIAL PRIMARY KEY,
  "room_code" VARCHAR(10) UNIQUE NOT NULL,
  "created_by" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "FK_room_created_by" 
    FOREIGN KEY ("created_by") REFERENCES "user"("user_id")
);

-- 3.ROOM_MEMBERSHIP
CREATE TABLE "room_membership" (
  "membership_id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "room_id" INTEGER NOT NULL,
  "role" VARCHAR(50) DEFAULT 'member',
  "points" INTEGER DEFAULT 0,
  "streak_count" INTEGER DEFAULT 0,
  "total_completed" INTEGER DEFAULT 0,
  "trust_score" DECIMAL(3,2) DEFAULT 5.00,
  "joined_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "is_active" BOOLEAN DEFAULT TRUE,                  -- Can leave/rejoin rooms
  
  CONSTRAINT "FK_room_membership_user_id" 
    FOREIGN KEY ("user_id") REFERENCES "user"("user_id"),
  CONSTRAINT "FK_room_membership_room_id" 
    FOREIGN KEY ("room_id") REFERENCES "room"("room_id"),
  CONSTRAINT "UQ_room_membership" 
    UNIQUE ("user_id", "room_id")
);

-- 4. ROOM_INVITATION
CREATE TABLE "room_invitation" (
  "invitation_id" SERIAL PRIMARY KEY,
  "room_id" INTEGER NOT NULL,
  "invited_by" INTEGER NOT NULL,                     -- User who sent invitation
  "invited_user_id" INTEGER,                         -- If inviting existing user
  "invited_email" VARCHAR(255),                      -- If inviting by email
  "invited_name" VARCHAR(255),                       -- Name provided by inviter
  "status" VARCHAR(50) DEFAULT 'pending',            -- 'pending', 'accepted', 'rejected', 'expired'
  "invitation_token" VARCHAR(128) UNIQUE,            -- Unique token for invitation link
  "message" TEXT,                                    -- Optional message from inviter
  "expires_at" TIMESTAMP,                            -- Invitation expiry
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "responded_at" TIMESTAMP,
  
  CONSTRAINT "FK_room_invitation_room_id" 
    FOREIGN KEY ("room_id") REFERENCES "room"("room_id"),
  CONSTRAINT "FK_room_invitation_invited_by" 
    FOREIGN KEY ("invited_by") REFERENCES "user"("user_id"),
  CONSTRAINT "FK_room_invitation_invited_user_id" 
    FOREIGN KEY ("invited_user_id") REFERENCES "user"("user_id"),
  CONSTRAINT "CHK_invitation_target" 
    CHECK (
      (invited_user_id IS NOT NULL AND invited_email IS NULL) OR 
      (invited_user_id IS NULL AND invited_email IS NOT NULL)
    )
);

-- 5. CHORE TABLE
CREATE TABLE "chore" (
  "chore_id" SERIAL PRIMARY KEY,
  "room_id" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "frequency" VARCHAR(50) NOT NULL,
  "frequency_value" INTEGER,
  "day_of_week" INTEGER,
  "timing" TIME,
  "last_completed" TIMESTAMP,
  "assigned_to" INTEGER,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "FK_chore_room_id" 
    FOREIGN KEY ("room_id") REFERENCES "room"("room_id"),
  CONSTRAINT "FK_chore_assigned_to" 
    FOREIGN KEY ("assigned_to") REFERENCES "room_membership"("membership_id")
);

-- 6. CHORE_COMPLETION TABLE
CREATE TABLE "chore_completion" (
  "completion_id" SERIAL PRIMARY KEY,
  "chore_id" INTEGER NOT NULL,
  "membership_id" INTEGER NOT NULL,
  "completed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "photo_url" TEXT,
  "status" VARCHAR(50) DEFAULT 'pending',
  "points_earned" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "FK_chore_completion_chore_id" 
    FOREIGN KEY ("chore_id") REFERENCES "chore"("chore_id"),
  CONSTRAINT "FK_chore_completion_membership_id" 
    FOREIGN KEY ("membership_id") REFERENCES "room_membership"("membership_id")
);

-- 7. CHORE_VERIFICATION TABLE
CREATE TABLE "chore_verification" (
  "verification_id" SERIAL PRIMARY KEY,
  "completion_id" INTEGER NOT NULL,
  "verified_by" INTEGER NOT NULL,
  "verification_type" VARCHAR(20) NOT NULL,
  "comment" TEXT,
  "verified_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "FK_chore_verification_completion_id" 
    FOREIGN KEY ("completion_id") REFERENCES "chore_completion"("completion_id"),
  CONSTRAINT "FK_chore_verification_verified_by" 
    FOREIGN KEY ("verified_by") REFERENCES "room_membership"("membership_id")
);

-- 8. CHORE_ASSIGNMENT_HISTORY TABLE
CREATE TABLE "chore_assignment_history" (
  "assignment_id" SERIAL PRIMARY KEY,
  "chore_id" INTEGER NOT NULL,
  "membership_id" INTEGER NOT NULL,
  "assigned_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP,
  "status" VARCHAR(50) DEFAULT 'assigned',
  
  CONSTRAINT "FK_chore_assignment_history_chore_id" 
    FOREIGN KEY ("chore_id") REFERENCES "chore"("chore_id"),
  CONSTRAINT "FK_chore_assignment_history_membership_id" 
    FOREIGN KEY ("membership_id") REFERENCES "room_membership"("membership_id")
);

-- 9. CHORE_SWAP_REQUEST TABLE
CREATE TABLE "chore_swap_request" (
  "swap_id" SERIAL PRIMARY KEY,
  "chore_id" INTEGER NOT NULL,
  "from_membership" INTEGER NOT NULL,
  "to_membership" INTEGER NOT NULL,
  "status" VARCHAR(50) DEFAULT 'pending',
  "message" TEXT,
  "requested_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "responded_at" TIMESTAMP,
  
  CONSTRAINT "FK_chore_swap_request_chore_id" 
    FOREIGN KEY ("chore_id") REFERENCES "chore"("chore_id"),
  CONSTRAINT "FK_chore_swap_request_from_membership" 
    FOREIGN KEY ("from_membership") REFERENCES "room_membership"("membership_id"),
  CONSTRAINT "FK_chore_swap_request_to_membership" 
    FOREIGN KEY ("to_membership") REFERENCES "room_membership"("membership_id")
);

-- 10. EXPENSE TABLE
CREATE TABLE "expense" (
  "expense_id" SERIAL PRIMARY KEY,
  "room_id" INTEGER NOT NULL,
  "payer_membership_id" INTEGER NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "description" VARCHAR(500) NOT NULL,
  "category" VARCHAR(100),
  "expense_date" DATE NOT NULL,
  "receipt_url" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "FK_expense_room_id" 
    FOREIGN KEY ("room_id") REFERENCES "room"("room_id"),
  CONSTRAINT "FK_expense_payer_membership_id" 
    FOREIGN KEY ("payer_membership_id") REFERENCES "room_membership"("membership_id")
);

-- 11. EXPENSE_SPLIT TABLE
CREATE TABLE "expense_split" (
  "split_id" SERIAL PRIMARY KEY,
  "expense_id" INTEGER NOT NULL,
  "membership_id" INTEGER NOT NULL,
  "amount_owed" DECIMAL(10,2) NOT NULL,
  "is_paid" BOOLEAN DEFAULT FALSE,
  "paid_at" TIMESTAMP,
  
  CONSTRAINT "FK_expense_split_expense_id" 
    FOREIGN KEY ("expense_id") REFERENCES "expense"("expense_id"),
  CONSTRAINT "FK_expense_split_membership_id" 
    FOREIGN KEY ("membership_id") REFERENCES "room_membership"("membership_id")
);