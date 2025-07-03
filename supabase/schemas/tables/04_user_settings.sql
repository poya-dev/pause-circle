create table "user_settings" (
  "id" uuid not null primary key default gen_random_uuid(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "user_id" uuid not null references profiles(id) on delete cascade unique,
  "bedtime_enabled" boolean default false not null,
  "bedtime_start" time,
  "bedtime_end" time,
  "morning_reminder_enabled" boolean default false not null,
  "morning_reminder_time" time,
  "evening_reminder_enabled" boolean default false not null,
  "evening_reminder_time" time,
  "accountability_notifications" boolean default true not null
);

-- Create indexes
create index user_settings_user_id_idx on user_settings(user_id);

-- Enable Row Level Security
alter table user_settings enable row level security;