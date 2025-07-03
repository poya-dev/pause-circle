create table "app_interactions" (
  "id" uuid not null primary key default gen_random_uuid(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "user_id" uuid not null references profiles(id) on delete cascade,
  "challenge_id" uuid not null references challenges(id) on delete cascade,
  "app_identifier" text not null,
  "app_name" text not null,
  "action" interaction_action not null,
  "timestamp" timestamp with time zone default timezone('utc'::text, now()) not null,
  "mood" text,
  "intention" text
);

-- Create indexes
create index app_interactions_user_id_idx on app_interactions(user_id);
create index app_interactions_challenge_id_idx on app_interactions(challenge_id);

-- Enable Row Level Security
alter table app_interactions enable row level security;