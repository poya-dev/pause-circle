-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can view other profiles for challenges"
  on profiles for select
  using (
    EXISTS (
      select 1 from challenge_participants cp1
      join challenge_participants cp2 on cp1.challenge_id = cp2.challenge_id
      where cp1.user_id = auth.uid() and cp2.user_id = profiles.id
    ) OR
    EXISTS (
      select 1 from challenges
      where creator_id = auth.uid() and 
      EXISTS (
        select 1 from challenge_participants
        where challenge_id = challenges.id and user_id = profiles.id
      )
    )
  );

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can create their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Challenges policies
create policy "Users can view challenges they participate in"
  on challenges for select
  using (
    creator_id = auth.uid() OR 
    EXISTS (
      select 1 
      from challenge_participants 
      where challenge_participants.challenge_id = id 
      and challenge_participants.user_id = auth.uid()
    )
  );

create policy "Users can view challenges by invite code"
  on challenges for select
  using (is_active = true);

create policy "Users can create challenges"
  on challenges for insert
  with check (creator_id = auth.uid());

create policy "Challenge creators can update their challenges"
  on challenges for update
  using (creator_id = auth.uid());

-- Challenge participants policies
create policy "Users can view their own participations"
  on challenge_participants for select
  using (user_id = auth.uid());

create policy "Challenge creators can view all participants"
  on challenge_participants for select
  using (
    EXISTS (
      select 1 from challenges
      where id = challenge_id and creator_id = auth.uid()
    )
  );

create policy "Participants can view other participants in same challenge"
  on challenge_participants for select
  using (
    EXISTS (
      select 1 from challenge_participants cp
      where cp.challenge_id = challenge_participants.challenge_id 
      and cp.user_id = auth.uid()
    )
  );

create policy "Users can join any active challenge"
  on challenge_participants for insert
  with check (
    user_id = auth.uid() and
    EXISTS (
      select 1 from challenges
      where id = challenge_id and is_active = true
    )
  );

create policy "Users can leave their own participations"
  on challenge_participants for delete
  using (user_id = auth.uid());

create policy "Challenge creators can manage participants"
  on challenge_participants for all
  using (
    EXISTS (
      select 1 from challenges
      where id = challenge_id and creator_id = auth.uid()
    )
  );

-- Blocked apps policies
create policy "Users can view blocked apps in their challenges"
  on blocked_apps for select
  using (
    EXISTS (
      select 1 from challenges
      where id = challenge_id and (
        creator_id = auth.uid() or
        EXISTS (
          select 1 from challenge_participants
          where challenge_id = challenges.id and user_id = auth.uid()
        )
      )
    )
  );

create policy "Challenge creators can manage blocked apps"
  on blocked_apps for all
  using (
    EXISTS (
      select 1 from challenges
      where id = challenge_id and creator_id = auth.uid()
    )
  );

-- App interactions policies
create policy "Users can view their own interactions"
  on app_interactions for select
  using (auth.uid() = user_id);

create policy "Users can log their interactions"
  on app_interactions for insert
  with check (auth.uid() = user_id);

-- User settings policies
create policy "Users can manage their own settings"
  on user_settings for all
  using (user_id = auth.uid());