create table "challenge_participants" (
  "id" uuid not null primary key default gen_random_uuid(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "challenge_id" uuid not null references challenges(id) on delete cascade,
  "user_id" uuid not null references profiles(id) on delete cascade,
  "joined_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "is_accountability_partner" boolean default false not null,
  unique ("challenge_id", "user_id")
);

-- Create indexes
create index challenge_participants_challenge_id_idx on challenge_participants(challenge_id);
create index challenge_participants_user_id_idx on challenge_participants(user_id);

-- Enable Row Level Security
alter table challenge_participants enable row level security;