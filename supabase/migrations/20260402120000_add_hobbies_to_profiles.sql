-- Add hobbies as a text array (up to 5 entries enforced in the app).
alter table public.profiles
  add column if not exists hobbies text[] default '{}';

comment on column public.profiles.hobbies is 'User-selected hobby labels, max 5';