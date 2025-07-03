create type "public"."interaction_action" as enum ('blocked', 'resisted', 'override');

create type "public"."platform" as enum ('ios', 'android');

create type "public"."privacy_mode" as enum ('named', 'anonymous');

create table "public"."app_interactions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "user_id" uuid not null,
    "challenge_id" uuid not null,
    "app_identifier" text not null,
    "app_name" text not null,
    "action" interaction_action not null,
    "timestamp" timestamp with time zone not null default timezone('utc'::text, now()),
    "mood" text,
    "intention" text
);


alter table "public"."app_interactions" enable row level security;

create table "public"."blocked_apps" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "challenge_id" uuid not null,
    "app_identifier" text not null,
    "app_name" text not null,
    "platform" platform not null
);


alter table "public"."blocked_apps" enable row level security;

create table "public"."challenge_participants" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "challenge_id" uuid not null,
    "user_id" uuid not null,
    "joined_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "is_accountability_partner" boolean not null default false
);


alter table "public"."challenge_participants" enable row level security;

create table "public"."challenges" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "creator_id" uuid not null,
    "name" text not null,
    "description" text,
    "start_date" timestamp with time zone not null,
    "end_date" timestamp with time zone not null,
    "is_active" boolean not null default true,
    "privacy_mode" privacy_mode not null default 'named'::privacy_mode,
    "bedtime_start" time without time zone,
    "bedtime_end" time without time zone,
    "invite_code" text not null
);


alter table "public"."challenges" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "email" text not null,
    "display_name" text,
    "avatar_url" text,
    "is_anonymous" boolean not null default false
);


alter table "public"."profiles" enable row level security;

create table "public"."user_settings" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "user_id" uuid not null,
    "bedtime_enabled" boolean not null default false,
    "bedtime_start" time without time zone,
    "bedtime_end" time without time zone,
    "morning_reminder_enabled" boolean not null default false,
    "morning_reminder_time" time without time zone,
    "evening_reminder_enabled" boolean not null default false,
    "evening_reminder_time" time without time zone,
    "accountability_notifications" boolean not null default true
);


alter table "public"."user_settings" enable row level security;

CREATE INDEX app_interactions_challenge_id_idx ON public.app_interactions USING btree (challenge_id);

CREATE UNIQUE INDEX app_interactions_pkey ON public.app_interactions USING btree (id);

CREATE INDEX app_interactions_user_id_idx ON public.app_interactions USING btree (user_id);

CREATE UNIQUE INDEX blocked_apps_challenge_id_app_identifier_platform_key ON public.blocked_apps USING btree (challenge_id, app_identifier, platform);

CREATE INDEX blocked_apps_challenge_id_idx ON public.blocked_apps USING btree (challenge_id);

CREATE UNIQUE INDEX blocked_apps_pkey ON public.blocked_apps USING btree (id);

CREATE INDEX challenge_participants_challenge_id_idx ON public.challenge_participants USING btree (challenge_id);

CREATE UNIQUE INDEX challenge_participants_challenge_id_user_id_key ON public.challenge_participants USING btree (challenge_id, user_id);

CREATE UNIQUE INDEX challenge_participants_pkey ON public.challenge_participants USING btree (id);

CREATE INDEX challenge_participants_user_id_idx ON public.challenge_participants USING btree (user_id);

CREATE INDEX challenges_creator_id_idx ON public.challenges USING btree (creator_id);

CREATE UNIQUE INDEX challenges_invite_code_key ON public.challenges USING btree (invite_code);

CREATE UNIQUE INDEX challenges_pkey ON public.challenges USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (id);

CREATE INDEX user_settings_user_id_idx ON public.user_settings USING btree (user_id);

CREATE UNIQUE INDEX user_settings_user_id_key ON public.user_settings USING btree (user_id);

alter table "public"."app_interactions" add constraint "app_interactions_pkey" PRIMARY KEY using index "app_interactions_pkey";

alter table "public"."blocked_apps" add constraint "blocked_apps_pkey" PRIMARY KEY using index "blocked_apps_pkey";

alter table "public"."challenge_participants" add constraint "challenge_participants_pkey" PRIMARY KEY using index "challenge_participants_pkey";

alter table "public"."challenges" add constraint "challenges_pkey" PRIMARY KEY using index "challenges_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."user_settings" add constraint "user_settings_pkey" PRIMARY KEY using index "user_settings_pkey";

alter table "public"."app_interactions" add constraint "app_interactions_challenge_id_fkey" FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE not valid;

alter table "public"."app_interactions" validate constraint "app_interactions_challenge_id_fkey";

alter table "public"."app_interactions" add constraint "app_interactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."app_interactions" validate constraint "app_interactions_user_id_fkey";

alter table "public"."blocked_apps" add constraint "blocked_apps_challenge_id_app_identifier_platform_key" UNIQUE using index "blocked_apps_challenge_id_app_identifier_platform_key";

alter table "public"."blocked_apps" add constraint "blocked_apps_challenge_id_fkey" FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE not valid;

alter table "public"."blocked_apps" validate constraint "blocked_apps_challenge_id_fkey";

alter table "public"."challenge_participants" add constraint "challenge_participants_challenge_id_fkey" FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE not valid;

alter table "public"."challenge_participants" validate constraint "challenge_participants_challenge_id_fkey";

alter table "public"."challenge_participants" add constraint "challenge_participants_challenge_id_user_id_key" UNIQUE using index "challenge_participants_challenge_id_user_id_key";

alter table "public"."challenge_participants" add constraint "challenge_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."challenge_participants" validate constraint "challenge_participants_user_id_fkey";

alter table "public"."challenges" add constraint "challenges_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."challenges" validate constraint "challenges_creator_id_fkey";

alter table "public"."challenges" add constraint "challenges_invite_code_key" UNIQUE using index "challenges_invite_code_key";

alter table "public"."user_settings" add constraint "user_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_settings" validate constraint "user_settings_user_id_fkey";

alter table "public"."user_settings" add constraint "user_settings_user_id_key" UNIQUE using index "user_settings_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$function$
;

grant delete on table "public"."app_interactions" to "anon";

grant insert on table "public"."app_interactions" to "anon";

grant references on table "public"."app_interactions" to "anon";

grant select on table "public"."app_interactions" to "anon";

grant trigger on table "public"."app_interactions" to "anon";

grant truncate on table "public"."app_interactions" to "anon";

grant update on table "public"."app_interactions" to "anon";

grant delete on table "public"."app_interactions" to "authenticated";

grant insert on table "public"."app_interactions" to "authenticated";

grant references on table "public"."app_interactions" to "authenticated";

grant select on table "public"."app_interactions" to "authenticated";

grant trigger on table "public"."app_interactions" to "authenticated";

grant truncate on table "public"."app_interactions" to "authenticated";

grant update on table "public"."app_interactions" to "authenticated";

grant delete on table "public"."app_interactions" to "service_role";

grant insert on table "public"."app_interactions" to "service_role";

grant references on table "public"."app_interactions" to "service_role";

grant select on table "public"."app_interactions" to "service_role";

grant trigger on table "public"."app_interactions" to "service_role";

grant truncate on table "public"."app_interactions" to "service_role";

grant update on table "public"."app_interactions" to "service_role";

grant delete on table "public"."blocked_apps" to "anon";

grant insert on table "public"."blocked_apps" to "anon";

grant references on table "public"."blocked_apps" to "anon";

grant select on table "public"."blocked_apps" to "anon";

grant trigger on table "public"."blocked_apps" to "anon";

grant truncate on table "public"."blocked_apps" to "anon";

grant update on table "public"."blocked_apps" to "anon";

grant delete on table "public"."blocked_apps" to "authenticated";

grant insert on table "public"."blocked_apps" to "authenticated";

grant references on table "public"."blocked_apps" to "authenticated";

grant select on table "public"."blocked_apps" to "authenticated";

grant trigger on table "public"."blocked_apps" to "authenticated";

grant truncate on table "public"."blocked_apps" to "authenticated";

grant update on table "public"."blocked_apps" to "authenticated";

grant delete on table "public"."blocked_apps" to "service_role";

grant insert on table "public"."blocked_apps" to "service_role";

grant references on table "public"."blocked_apps" to "service_role";

grant select on table "public"."blocked_apps" to "service_role";

grant trigger on table "public"."blocked_apps" to "service_role";

grant truncate on table "public"."blocked_apps" to "service_role";

grant update on table "public"."blocked_apps" to "service_role";

grant delete on table "public"."challenge_participants" to "anon";

grant insert on table "public"."challenge_participants" to "anon";

grant references on table "public"."challenge_participants" to "anon";

grant select on table "public"."challenge_participants" to "anon";

grant trigger on table "public"."challenge_participants" to "anon";

grant truncate on table "public"."challenge_participants" to "anon";

grant update on table "public"."challenge_participants" to "anon";

grant delete on table "public"."challenge_participants" to "authenticated";

grant insert on table "public"."challenge_participants" to "authenticated";

grant references on table "public"."challenge_participants" to "authenticated";

grant select on table "public"."challenge_participants" to "authenticated";

grant trigger on table "public"."challenge_participants" to "authenticated";

grant truncate on table "public"."challenge_participants" to "authenticated";

grant update on table "public"."challenge_participants" to "authenticated";

grant delete on table "public"."challenge_participants" to "service_role";

grant insert on table "public"."challenge_participants" to "service_role";

grant references on table "public"."challenge_participants" to "service_role";

grant select on table "public"."challenge_participants" to "service_role";

grant trigger on table "public"."challenge_participants" to "service_role";

grant truncate on table "public"."challenge_participants" to "service_role";

grant update on table "public"."challenge_participants" to "service_role";

grant delete on table "public"."challenges" to "anon";

grant insert on table "public"."challenges" to "anon";

grant references on table "public"."challenges" to "anon";

grant select on table "public"."challenges" to "anon";

grant trigger on table "public"."challenges" to "anon";

grant truncate on table "public"."challenges" to "anon";

grant update on table "public"."challenges" to "anon";

grant delete on table "public"."challenges" to "authenticated";

grant insert on table "public"."challenges" to "authenticated";

grant references on table "public"."challenges" to "authenticated";

grant select on table "public"."challenges" to "authenticated";

grant trigger on table "public"."challenges" to "authenticated";

grant truncate on table "public"."challenges" to "authenticated";

grant update on table "public"."challenges" to "authenticated";

grant delete on table "public"."challenges" to "service_role";

grant insert on table "public"."challenges" to "service_role";

grant references on table "public"."challenges" to "service_role";

grant select on table "public"."challenges" to "service_role";

grant trigger on table "public"."challenges" to "service_role";

grant truncate on table "public"."challenges" to "service_role";

grant update on table "public"."challenges" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."user_settings" to "anon";

grant insert on table "public"."user_settings" to "anon";

grant references on table "public"."user_settings" to "anon";

grant select on table "public"."user_settings" to "anon";

grant trigger on table "public"."user_settings" to "anon";

grant truncate on table "public"."user_settings" to "anon";

grant update on table "public"."user_settings" to "anon";

grant delete on table "public"."user_settings" to "authenticated";

grant insert on table "public"."user_settings" to "authenticated";

grant references on table "public"."user_settings" to "authenticated";

grant select on table "public"."user_settings" to "authenticated";

grant trigger on table "public"."user_settings" to "authenticated";

grant truncate on table "public"."user_settings" to "authenticated";

grant update on table "public"."user_settings" to "authenticated";

grant delete on table "public"."user_settings" to "service_role";

grant insert on table "public"."user_settings" to "service_role";

grant references on table "public"."user_settings" to "service_role";

grant select on table "public"."user_settings" to "service_role";

grant trigger on table "public"."user_settings" to "service_role";

grant truncate on table "public"."user_settings" to "service_role";

grant update on table "public"."user_settings" to "service_role";

create policy "Users can log their interactions"
on "public"."app_interactions"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view their own interactions"
on "public"."app_interactions"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Challenge creators can manage blocked apps"
on "public"."blocked_apps"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM challenges
  WHERE ((challenges.id = blocked_apps.challenge_id) AND (challenges.creator_id = auth.uid())))));


create policy "Users can view blocked apps in their challenges"
on "public"."blocked_apps"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM challenges
  WHERE ((challenges.id = blocked_apps.challenge_id) AND ((challenges.creator_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM challenge_participants
          WHERE ((challenge_participants.challenge_id = challenges.id) AND (challenge_participants.user_id = auth.uid())))))))));


create policy "Challenge creators can manage participants"
on "public"."challenge_participants"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM challenges
  WHERE ((challenges.id = challenge_participants.challenge_id) AND (challenges.creator_id = auth.uid())))));


create policy "Challenge creators can view all participants"
on "public"."challenge_participants"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM challenges
  WHERE ((challenges.id = challenge_participants.challenge_id) AND (challenges.creator_id = auth.uid())))));


create policy "Participants can view other participants in same challenge"
on "public"."challenge_participants"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM challenge_participants cp
  WHERE ((cp.challenge_id = challenge_participants.challenge_id) AND (cp.user_id = auth.uid())))));


create policy "Users can join any active challenge"
on "public"."challenge_participants"
as permissive
for insert
to public
with check (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM challenges
  WHERE ((challenges.id = challenge_participants.challenge_id) AND (challenges.is_active = true))))));


create policy "Users can leave their own participations"
on "public"."challenge_participants"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Users can view their own participations"
on "public"."challenge_participants"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Challenge creators can update their challenges"
on "public"."challenges"
as permissive
for update
to public
using ((creator_id = auth.uid()));


create policy "Users can create challenges"
on "public"."challenges"
as permissive
for insert
to public
with check ((creator_id = auth.uid()));


create policy "Users can view challenges by invite code"
on "public"."challenges"
as permissive
for select
to public
using ((is_active = true));


create policy "Users can view challenges they participate in"
on "public"."challenges"
as permissive
for select
to public
using (((creator_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM challenge_participants
  WHERE ((challenge_participants.challenge_id = challenge_participants.id) AND (challenge_participants.user_id = auth.uid()))))));


create policy "Users can create their own profile"
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view other profiles for challenges"
on "public"."profiles"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM (challenge_participants cp1
     JOIN challenge_participants cp2 ON ((cp1.challenge_id = cp2.challenge_id)))
  WHERE ((cp1.user_id = auth.uid()) AND (cp2.user_id = profiles.id)))) OR (EXISTS ( SELECT 1
   FROM challenges
  WHERE ((challenges.creator_id = auth.uid()) AND (EXISTS ( SELECT 1
           FROM challenge_participants
          WHERE ((challenge_participants.challenge_id = challenges.id) AND (challenge_participants.user_id = profiles.id)))))))));


create policy "Users can view their own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Users can manage their own settings"
on "public"."user_settings"
as permissive
for all
to public
using ((user_id = auth.uid()));



