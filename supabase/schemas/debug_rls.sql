-- Debug RLS Policies
-- Use this file to test and debug RLS policy issues

-- Check if user has a profile
select 
  auth.uid() as current_user_id,
  p.id as profile_id,
  p.email,
  p.display_name,
  p.created_at
from profiles p 
where p.id = auth.uid();

-- Test challenge creation (this should show what the policy checks)
select 
  auth.uid() as current_user_id,
  'Can create challenge?' as test,
  case 
    when auth.uid() is not null then 'YES'
    else 'NO - Not authenticated'
  end as result;

-- Check existing challenges
select 
  c.id,
  c.name,
  c.creator_id,
  c.created_at,
  case 
    when c.creator_id = auth.uid() then 'CREATOR'
    else 'PARTICIPANT'
  end as role
from challenges c;

-- Check challenge participants
select 
  cp.challenge_id,
  cp.user_id,
  cp.joined_at,
  c.name as challenge_name
from challenge_participants cp
join challenges c on cp.challenge_id = c.id;

-- Test if current user can insert a challenge
-- (Run this as a separate query to test)
/*
insert into challenges (creator_id, name, description, start_date, end_date, invite_code)
values (
  auth.uid(),
  'Test Challenge',
  'Testing challenge creation',
  now(),
  now() + interval '7 days',
  'TEST' || extract(epoch from now())::text
);
*/