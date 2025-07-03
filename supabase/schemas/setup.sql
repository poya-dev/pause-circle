-- Create auth schema for RLS policies
create schema if not exists auth;

-- Create enums first
create type "privacy_mode" as enum ('named', 'anonymous');
create type "interaction_action" as enum ('blocked', 'resisted', 'override');
create type "platform" as enum ('ios', 'android');

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;

-- Grant type usage to authenticated users
grant usage on type privacy_mode to authenticated;
grant usage on type interaction_action to authenticated;
grant usage on type platform to authenticated;