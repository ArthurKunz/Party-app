-- Closes the findings from the audit that carry no behavioural risk for signed-in
-- users. The two open table policies (events readable by everyone, any account able
-- to open any party) are NOT touched here: those need the invite page reworked first.

-- 1. event-backgrounds was writable and DELETABLE by any signed-in user, with the
-- policy checking only the bucket. Any account could wipe or replace every party's
-- background. Every path the app writes is `{user_id}/{party_id}/background.ext`,
-- and all 41 existing objects match that shape, so scoping to the first folder —
-- exactly what the avatars bucket already does — locks it down without touching a
-- single existing file. The UPDATE policy is new: the uploader passes `upsert: true`,
-- which needs one, and without it a re-upload to the same path would fail.
drop policy if exists "Hosts can delete event backgrounds" on storage.objects;
drop policy if exists "Hosts can upload event backgrounds" on storage.objects;

create policy "event_backgrounds_insert_own_folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'event-backgrounds' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "event_backgrounds_update_own_folder"
  on storage.objects for update to authenticated
  using (bucket_id = 'event-backgrounds' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'event-backgrounds' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "event_backgrounds_delete_own_folder"
  on storage.objects for delete to authenticated
  using (bucket_id = 'event-backgrounds' and (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Both buckets accepted any size and any content type: the checks in the upload
-- screens are courtesy, not enforcement, since anyone can post straight at the API.
-- The numbers are the ones the client already applies (MAX_BYTES and BG_MAX_BYTES),
-- and the mime list is what those screens already accept, so nothing a user can do
-- through the app starts failing. The largest file in either bucket today is 4.6 MB.
update storage.buckets
  set file_size_limit = 5 * 1024 * 1024,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  where id = 'avatars';

update storage.buckets
  set file_size_limit = 10 * 1024 * 1024,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  where id = 'event-backgrounds';

-- 3. delete_self was the one SECURITY DEFINER function without a pinned search_path,
-- which is the standard escalation route for this kind of function. Both names in
-- the body are schema-qualified already, so an empty search_path changes nothing
-- about what it does.
create or replace function public.delete_self()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

-- 4. These three SECURITY DEFINER functions exist to bypass the profiles RLS, and
-- they were callable WITHOUT AN ACCOUNT: `get_event_attendees` alone hands out the
-- firstname, lastname and BIRTHDAY of every guest of any event id. Postgres grants
-- EXECUTE to PUBLIC by default, which is how `anon` got in — revoking from `anon`
-- alone would not have helped, so PUBLIC goes and `authenticated` is granted back.
--
-- What this changes in the app: a logged-out visitor on /e/[invite_code] no longer
-- sees the guest list or the poll answers behind the sign-up sheet. Both callers
-- already treat an error as an empty list, so nothing breaks. Deliberately still
-- open to anonymous visitors: get_event_host and the two count functions — who is
-- inviting you and how many are coming is what an invitation is for.
revoke execute on function public.delete_self() from public, anon;
grant execute on function public.delete_self() to authenticated;

revoke execute on function public.get_event_attendees(uuid) from public, anon;
grant execute on function public.get_event_attendees(uuid) to authenticated;

revoke execute on function public.get_attendee_avatars_for_events(uuid[]) from public, anon;
grant execute on function public.get_attendee_avatars_for_events(uuid[]) to authenticated;

revoke execute on function public.get_pool_responses_by_event(uuid) from public, anon;
grant execute on function public.get_pool_responses_by_event(uuid) to authenticated;
