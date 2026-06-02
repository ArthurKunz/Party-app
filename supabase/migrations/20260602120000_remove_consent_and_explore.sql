-- Remove parent consent feature: table, trigger, token generator
DROP TRIGGER IF EXISTS set_consent_token ON public.consent_requests;

DROP FUNCTION IF EXISTS public.generate_consent_token() CASCADE;

DROP TABLE IF EXISTS public.consent_requests CASCADE;

-- Remove explore-wide read policy on profiles (users should not see all profiles)
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON public.profiles;

