-- pools: host-created questions / polls per event
CREATE TABLE public.pools (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  question            text NOT NULL,
  description         text,
  type                text NOT NULL CHECK (type IN ('options', 'text_only')),
  allow_text_response boolean NOT NULL DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pools_select_public"
  ON public.pools FOR SELECT
  USING (true);

CREATE POLICY "pools_insert_host"
  ON public.pools FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT host_id FROM public.events WHERE id = pools.event_id) = auth.uid()
  );

CREATE POLICY "pools_delete_host"
  ON public.pools FOR DELETE
  TO authenticated
  USING (
    (SELECT host_id FROM public.events WHERE id = pools.event_id) = auth.uid()
  );

-- pool_options: fixed choices for options-type pools
CREATE TABLE public.pool_options (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id    uuid NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  label      text NOT NULL,
  position   int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pool_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pool_options_select_public"
  ON public.pool_options FOR SELECT
  USING (true);

CREATE POLICY "pool_options_insert_host"
  ON public.pool_options FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT e.host_id FROM public.events e
     JOIN public.pools p ON p.event_id = e.id
     WHERE p.id = pool_options.pool_id) = auth.uid()
  );

CREATE POLICY "pool_options_delete_host"
  ON public.pool_options FOR DELETE
  TO authenticated
  USING (
    (SELECT e.host_id FROM public.events e
     JOIN public.pools p ON p.event_id = e.id
     WHERE p.id = pool_options.pool_id) = auth.uid()
  );

-- pool_responses: one response per user per pool
CREATE TABLE public.pool_responses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id       uuid NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_id     uuid REFERENCES public.pool_options(id) ON DELETE SET NULL,
  text_response text,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (pool_id, user_id)
);

ALTER TABLE public.pool_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pool_responses_select_authenticated"
  ON public.pool_responses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "pool_responses_insert_authenticated"
  ON public.pool_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pool_responses_update_own"
  ON public.pool_responses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pool_responses_delete_own"
  ON public.pool_responses FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- profiles SELECT is restricted to own row; SECURITY DEFINER bypasses that to expose
-- respondent names to all authenticated users on the event page
CREATE OR REPLACE FUNCTION public.get_pool_responses_by_event(p_event_id uuid)
RETURNS TABLE (
  id            uuid,
  pool_id       uuid,
  user_id       uuid,
  option_id     uuid,
  text_response text,
  created_at    timestamptz,
  firstname     text,
  lastname      text
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
    prof.lastname
  FROM public.pool_responses pr
  JOIN public.pools p ON p.id = pr.pool_id
  JOIN public.profiles prof ON prof.id = pr.user_id
  WHERE p.event_id = p_event_id
  ORDER BY pr.created_at;
$$;

GRANT EXECUTE ON FUNCTION public.get_pool_responses_by_event(uuid) TO authenticated;
