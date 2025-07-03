create table "challenges" (
  "id" uuid not null primary key default gen_random_uuid(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "creator_id" uuid not null references profiles(id) on delete cascade,
  "name" text not null,
  "description" text,
  "start_date" timestamp with time zone not null,
  "end_date" timestamp with time zone not null,
  "is_active" boolean default true not null,
  "privacy_mode" privacy_mode default 'named' not null,
  "bedtime_start" time,
  "bedtime_end" time,
  "invite_code" text not null unique
);

-- Create indexes
create index challenges_creator_id_idx on challenges(creator_id);

-- Enable Row Level Security
alter table challenges enable row level security;