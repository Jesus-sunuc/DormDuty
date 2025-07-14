-- psql -U $POSTGRES_USER $POSTGRES_DB
CREATE TABLE
  "user" (
    "user_id" SERIAL PRIMARY KEY,
    "fb_uid" VARCHAR(128) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now (),
    "updated_at" TIMESTAMPTZ DEFAULT now ()
  );

CREATE TABLE
  "room" (
    "room_id" SERIAL PRIMARY KEY,
    "room_code" VARCHAR(10) UNIQUE NOT NULL,
    "created_by" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now (),
    "updated_at" TIMESTAMPTZ DEFAULT now (),
    CONSTRAINT "FK_room_created_by" FOREIGN KEY ("created_by") REFERENCES "user" ("user_id")
  );

CREATE TABLE
  "room_membership" (
    "membership_id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "role" VARCHAR(50) DEFAULT 'member',
    "joined_at" TIMESTAMPTZ DEFAULT now (),
    "is_active" BOOLEAN DEFAULT TRUE, -- Can leave/rejoin rooms
    CONSTRAINT "FK_room_membership_user_id" FOREIGN KEY ("user_id") REFERENCES "user" ("user_id"),
    CONSTRAINT "FK_room_membership_room_id" FOREIGN KEY ("room_id") REFERENCES "room" ("room_id"),
    CONSTRAINT "UQ_room_membership" UNIQUE ("user_id", "room_id")
  );

CREATE TABLE
  "announcement" (
    "announcement_id" SERIAL PRIMARY KEY,
    "room_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "can_reply" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMPTZ DEFAULT now (),
    CONSTRAINT "FK_announcement_room_id" FOREIGN KEY ("room_id") REFERENCES "room" ("room_id") ON DELETE CASCADE,
    CONSTRAINT "FK_announcement_created_by" FOREIGN KEY ("created_by") REFERENCES "room_membership" ("membership_id") ON DELETE CASCADE
  );

CREATE TABLE
  "announcement_reaction" (
    "reaction_id" SERIAL PRIMARY KEY,
    "announcement_id" INTEGER NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "reacted_at" TIMESTAMPTZ DEFAULT now (),
    CONSTRAINT "FK_reaction_announcement" FOREIGN KEY ("announcement_id") REFERENCES "announcement" ("announcement_id") ON DELETE CASCADE,
    CONSTRAINT "FK_reaction_membership" FOREIGN KEY ("membership_id") REFERENCES "room_membership" ("membership_id") ON DELETE CASCADE,
    CONSTRAINT "UQ_reaction_unique" UNIQUE ("announcement_id", "membership_id")
  );

CREATE TABLE
  "announcement_reply" (
    "reply_id" SERIAL PRIMARY KEY,
    "announcement_id" INTEGER NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "replied_at" TIMESTAMPTZ DEFAULT now (),
    CONSTRAINT "FK_reply_announcement" FOREIGN KEY ("announcement_id") REFERENCES "announcement" ("announcement_id") ON DELETE CASCADE,
    CONSTRAINT "FK_reply_membership" FOREIGN KEY ("membership_id") REFERENCES "room_membership" ("membership_id") ON DELETE CASCADE
  );

CREATE TABLE
  "announcement_reply_reaction" (
    "reaction_id" SERIAL PRIMARY KEY,
    "reply_id" INTEGER NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "reacted_at" TIMESTAMPTZ DEFAULT now (),
    CONSTRAINT "FK_reply_reaction_reply" FOREIGN KEY ("reply_id") REFERENCES "announcement_reply" ("reply_id") ON DELETE CASCADE,
    CONSTRAINT "FK_reply_reaction_membership" FOREIGN KEY ("membership_id") REFERENCES "room_membership" ("membership_id") ON DELETE CASCADE,
    CONSTRAINT "UQ_reply_reaction_unique" UNIQUE ("reply_id", "membership_id")
  );

CREATE TABLE
  "announcement_read" (
    "announcement_id" INTEGER NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "read_at" TIMESTAMPTZ DEFAULT now (),
    PRIMARY KEY ("announcement_id", "membership_id"),
    CONSTRAINT "FK_read_announcement" FOREIGN KEY ("announcement_id") REFERENCES "announcement" ("announcement_id") ON DELETE CASCADE,
    CONSTRAINT "FK_read_membership" FOREIGN KEY ("membership_id") REFERENCES "room_membership" ("membership_id") ON DELETE CASCADE
  );

CREATE TABLE
  "cleaning_checklist" (
    "checklist_item_id" SERIAL PRIMARY KEY,
    "room_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN DEFAULT FALSE,
    CONSTRAINT "FK_checklist_room" FOREIGN KEY ("room_id") REFERENCES "room" ("room_id") ON DELETE CASCADE
  );

CREATE TABLE
  "cleaning_check_status" (
    "status_id" SERIAL PRIMARY KEY,
    "checklist_item_id" INTEGER NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "marked_date" DATE NOT NULL,
    "is_completed" BOOLEAN DEFAULT FALSE,
    "is_assigned" BOOLEAN DEFAULT FALSE,
    "updated_at" TIMESTAMPTZ DEFAULT now (),
    CONSTRAINT "FK_status_checklist_item" FOREIGN KEY ("checklist_item_id") REFERENCES "cleaning_checklist" ("checklist_item_id") ON DELETE CASCADE,
    CONSTRAINT "FK_status_membership" FOREIGN KEY ("membership_id") REFERENCES "room_membership" ("membership_id") ON DELETE CASCADE,
    CONSTRAINT "UQ_status_per_day" UNIQUE (
      "checklist_item_id",
      "membership_id",
      "marked_date"
    )
  );

CREATE TABLE
  "room_invitation" (
    "invitation_id" SERIAL PRIMARY KEY,
    "room_id" INTEGER NOT NULL,
    "invited_by" INTEGER NOT NULL, -- User who sent invitation
    "invited_user_id" INTEGER, -- If inviting existing user
    "invited_email" VARCHAR(255), -- If inviting by email
    "invited_name" VARCHAR(255), -- Name provided by inviter
    "status" VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
    "invitation_token" VARCHAR(128) UNIQUE, -- Unique token for invitation link
    "message" TEXT, -- Optional message from inviter
    "expires_at" TIMESTAMP, -- Invitation expiry
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP,
    CONSTRAINT "FK_room_invitation_room_id" FOREIGN KEY ("room_id") REFERENCES "room" ("room_id"),
    CONSTRAINT "FK_room_invitation_invited_by" FOREIGN KEY ("invited_by") REFERENCES "user" ("user_id"),
    CONSTRAINT "FK_room_invitation_invited_user_id" FOREIGN KEY ("invited_user_id") REFERENCES "user" ("user_id"),
    CONSTRAINT "CHK_invitation_target" CHECK (
      (
        invited_user_id IS NOT NULL
        AND invited_email IS NULL
      )
      OR (
        invited_user_id IS NULL
        AND invited_email IS NOT NULL
      )
    )
  );

CREATE TABLE
  "chore" (
    "chore_id" SERIAL PRIMARY KEY,
    "room_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "frequency" VARCHAR(50) NOT NULL,
    "frequency_value" INTEGER,
    "day_of_week" INTEGER,
    "timing" TIME,
    "description" TEXT,
    "start_date" DATE,
    "last_completed" TIMESTAMP,
    "assigned_to" INTEGER,
    "approval_required" BOOLEAN DEFAULT FALSE,
    "photo_required" BOOLEAN DEFAULT FALSE,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMPTZ DEFAULT now (),
    "updated_at" TIMESTAMPTZ DEFAULT now (),
    CONSTRAINT "FK_chore_room_id" FOREIGN KEY ("room_id") REFERENCES "room" ("room_id"),
    CONSTRAINT "FK_chore_assigned_to" FOREIGN KEY ("assigned_to") REFERENCES "room_membership" ("membership_id")
  );

CREATE TABLE
  "chore_assignment" (
    "assignment_id" SERIAL PRIMARY KEY,
    "chore_id" INTEGER NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE,
    "assigned_at" TIMESTAMPTZ DEFAULT now (),
    CONSTRAINT "FK_chore_assignment_chore_id" FOREIGN KEY ("chore_id") REFERENCES "chore" ("chore_id") ON DELETE CASCADE,
    CONSTRAINT "FK_chore_assignment_membership_id" FOREIGN KEY ("membership_id") REFERENCES "room_membership" ("membership_id") ON DELETE CASCADE,
    CONSTRAINT "UQ_chore_assignment_active" UNIQUE ("chore_id", "membership_id")
  );

CREATE TABLE
  "chore_completion" (
    "completion_id" SERIAL PRIMARY KEY,
    "chore_id" INTEGER NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "completed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "photo_url" TEXT,
    "status" VARCHAR(50) DEFAULT 'pending',
    "created_at" TIMESTAMPTZ DEFAULT now (),
    CONSTRAINT "FK_chore_completion_chore_id" FOREIGN KEY ("chore_id") REFERENCES "chore" ("chore_id"),
    CONSTRAINT "FK_chore_completion_membership_id" FOREIGN KEY ("membership_id") REFERENCES "room_membership" ("membership_id")
  );

CREATE TABLE
  "chore_verification" (
    "verification_id" SERIAL PRIMARY KEY,
    "completion_id" INTEGER NOT NULL,
    "verified_by" INTEGER NOT NULL,
    "verification_type" VARCHAR(20) NOT NULL,
    "comment" TEXT,
    "verified_at" TIMESTAMPTZ DEFAULT now (),
    CONSTRAINT "FK_chore_verification_completion_id" FOREIGN KEY ("completion_id") REFERENCES "chore_completion" ("completion_id"),
    CONSTRAINT "FK_chore_verification_verified_by" FOREIGN KEY ("verified_by") REFERENCES "room_membership" ("membership_id")
  );

CREATE TABLE
  "chore_assignment_history" (
    "assignment_id" SERIAL PRIMARY KEY,
    "chore_id" INTEGER NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMPTZ DEFAULT now (),
    "completed_at" TIMESTAMPTZ,
    "status" VARCHAR(50) DEFAULT 'assigned',
    CONSTRAINT "FK_chore_assignment_history_chore_id" FOREIGN KEY ("chore_id") REFERENCES "chore" ("chore_id"),
    CONSTRAINT "FK_chore_assignment_history_membership_id" FOREIGN KEY ("membership_id") REFERENCES "room_membership" ("membership_id")
  );

CREATE TABLE
  "chore_swap_request" (
    "swap_id" SERIAL PRIMARY KEY,
    "chore_id" INTEGER NOT NULL,
    "from_membership" INTEGER NOT NULL,
    "to_membership" INTEGER NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pending',
    "message" TEXT,
    "requested_at" TIMESTAMPTZ DEFAULT now (),
    "responded_at" TIMESTAMPTZ,
    CONSTRAINT "FK_chore_swap_request_chore_id" FOREIGN KEY ("chore_id") REFERENCES "chore" ("chore_id"),
    CONSTRAINT "FK_chore_swap_request_from_membership" FOREIGN KEY ("from_membership") REFERENCES "room_membership" ("membership_id"),
    CONSTRAINT "FK_chore_swap_request_to_membership" FOREIGN KEY ("to_membership") REFERENCES "room_membership" ("membership_id")
  );

CREATE TABLE
  "expense" (
    "expense_id" SERIAL PRIMARY KEY,
    "room_id" INTEGER NOT NULL,
    "payer_membership_id" INTEGER NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "category" VARCHAR(100),
    "expense_date" DATE NOT NULL,
    "receipt_url" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now (),
    CONSTRAINT "FK_expense_room_id" FOREIGN KEY ("room_id") REFERENCES "room" ("room_id"),
    CONSTRAINT "FK_expense_payer_membership_id" FOREIGN KEY ("payer_membership_id") REFERENCES "room_membership" ("membership_id")
  );

CREATE TABLE
  "expense_split" (
    "split_id" SERIAL PRIMARY KEY,
    "expense_id" INTEGER NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "amount_owed" DECIMAL(10, 2) NOT NULL,
    "is_paid" BOOLEAN DEFAULT FALSE,
    "paid_at" TIMESTAMPTZ,
    CONSTRAINT "FK_expense_split_expense_id" FOREIGN KEY ("expense_id") REFERENCES "expense" ("expense_id"),
    CONSTRAINT "FK_expense_split_membership_id" FOREIGN KEY ("membership_id") REFERENCES "room_membership" ("membership_id")
  );

-- INDEXES for better performance
CREATE INDEX "idx_user_fb_uid" ON "user" ("fb_uid");

CREATE INDEX "idx_room_code" ON "room" ("room_code");

CREATE INDEX "idx_room_membership_user_id" ON "room_membership" ("user_id");

CREATE INDEX "idx_room_membership_room_id" ON "room_membership" ("room_id");

CREATE INDEX "idx_room_membership_active" ON "room_membership" ("user_id", "is_active");

CREATE INDEX "idx_chore_room_id" ON "chore" ("room_id");

CREATE INDEX "idx_chore_assigned_to" ON "chore" ("assigned_to");

CREATE INDEX "idx_chore_completion_chore_id" ON "chore_completion" ("chore_id");

CREATE INDEX "idx_chore_completion_membership_id" ON "chore_completion" ("membership_id");

CREATE INDEX "idx_expense_room_id" ON "expense" ("room_id");

CREATE INDEX "idx_expense_split_expense_id" ON "expense_split" ("expense_id");

CREATE INDEX "idx_room_invitation_token" ON "room_invitation" ("invitation_token");

CREATE INDEX "idx_room_invitation_email" ON "room_invitation" ("invited_email");

CREATE INDEX "idx_room_invitation_status" ON "room_invitation" ("status", "expires_at");

CREATE INDEX idx_announcement_room_id ON "announcement" ("room_id");

CREATE INDEX idx_announcement_created_by ON "announcement" ("created_by");

CREATE INDEX idx_announcement_reaction_announcement_id ON "announcement_reaction" ("announcement_id");

CREATE INDEX idx_announcement_reaction_membership_id ON "announcement_reaction" ("membership_id");

CREATE INDEX idx_announcement_read_announcement_id ON "announcement_read" ("announcement_id");

CREATE INDEX idx_cleaning_checklist_room_id ON "cleaning_checklist" ("room_id");

CREATE INDEX idx_cleaning_check_status_checklist_item_id ON "cleaning_check_status" ("checklist_item_id");

CREATE INDEX idx_cleaning_check_status_membership_id ON "cleaning_check_status" ("membership_id");

CREATE INDEX idx_announcement_reply_announcement_id ON "announcement_reply" ("announcement_id");

CREATE INDEX idx_announcement_reply_membership_id ON "announcement_reply" ("membership_id");

CREATE VIEW
  "user_rooms" AS
SELECT
  u.user_id,
  u.name as user_name,
  u.email,
  rm.membership_id,
  r.room_id,
  r.name as room_name,
  r.room_code,
  rm.role,
  rm.joined_at,
  rm.is_active
FROM
  "user" u
  JOIN "room_membership" rm ON u.user_id = rm.user_id
  JOIN "room" r ON rm.room_id = r.room_id
WHERE
  rm.is_active = TRUE;

CREATE VIEW
  "room_members" AS
SELECT
  r.room_id,
  r.name as room_name,
  u.user_id,
  u.name as user_name,
  u.email,
  u.avatar_url,
  rm.membership_id,
  rm.role,
  rm.joined_at
FROM
  "room" r
  JOIN "room_membership" rm ON r.room_id = rm.room_id
  JOIN "user" u ON rm.user_id = u.user_id
WHERE
  rm.is_active = TRUE;