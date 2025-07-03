create table "blocked_apps" (
  "id" uuid not null primary key default gen_random_uuid(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "challenge_id" uuid not null references challenges(id) on delete cascade,
  "app_identifier" text not null,
  "app_name" text not null,
  "platform" platform not null,
  unique ("challenge_id", "app_identifier", "platform")
);

-- Create indexes
create index blocked_apps_challenge_id_idx on blocked_apps(challenge_id);

-- Enable Row Level Security
alter table blocked_apps enable row level security;