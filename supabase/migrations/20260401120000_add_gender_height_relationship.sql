-- Run in Supabase SQL Editor if you do not use CLI migrations.
alter table public.profiles
  add column if not exists gender text,
  add column if not exists height integer,
  add column if not exists relationship text;

comment on column public.profiles.gender is 'e.g. female, male, diverse, prefer_not_to_say';
comment on column public.profiles.height is 'Height in centimeters';
comment on column public.profiles.relationship is 'e.g. single, relationship, married, prefer_not_to_say';