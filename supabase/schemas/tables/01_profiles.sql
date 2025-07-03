create table "profiles" (
  "id" uuid not null primary key,
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "email" text not null,
  "display_name" text,
  "avatar_url" text,
  "is_anonymous" boolean default false not null
);

-- Enable Row Level Security
alter table profiles enable row level security;