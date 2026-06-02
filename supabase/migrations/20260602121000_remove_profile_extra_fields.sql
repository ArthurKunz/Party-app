-- Drop collected profile data fields we no longer want to store.
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS birthday,
  DROP COLUMN IF EXISTS gradelevel,
  DROP COLUMN IF EXISTS school,
  DROP COLUMN IF EXISTS averagemark,
  DROP COLUMN IF EXISTS relationship,
  DROP COLUMN IF EXISTS instagram,
  DROP COLUMN IF EXISTS tiktok,
  DROP COLUMN IF EXISTS snapchat,
  DROP COLUMN IF EXISTS hobbies;

