DROP FUNCTION IF EXISTS public.get_pool_responses_by_event(uuid);

CREATE FUNCTION public.get_pool_responses_by_event(p_event_id uuid)
RETURNS TABLE (
  id            uuid,
  pool_id       uuid,
  user_id       uuid,
  option_id     uuid,
  text_response text,
  created_at    timestamptz,
  firstname     text,
  lastname      text,
  avatar_url    text,
  avatar_color  text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pr.id,
    pr.pool_id,
    pr.user_id,
    pr.option_id,
    pr.text_response,
    pr.created_at,
    prof.firstname,
    prof.lastname,
    prof.avatar_url,
    prof.avatar_color
  FROM public.pool_responses pr
  JOIN public.pools p ON p.id = pr.pool_id
  JOIN public.profiles prof ON prof.id = pr.user_id
  WHERE p.event_id = p_event_id
  ORDER BY pr.created_at;
$$;

GRANT EXECUTE ON FUNCTION public.get_pool_responses_by_event(uuid) TO authenticated;
