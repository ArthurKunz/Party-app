-- events
CREATE TABLE public.events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  event_type  text,
  invite_code text NOT NULL UNIQUE,
  event_date  timestamptz NOT NULL,
  location    text NOT NULL,
  max_guests  int,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- anyone (incl. anon) can read — required for /e/[invite_code] shareable links
CREATE POLICY "events_select_public"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "events_insert_authenticated"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "events_update_host"
  ON public.events FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "events_delete_host"
  ON public.events FOR DELETE
  TO authenticated
  USING (host_id = auth.uid());

-- rsvps
CREATE TABLE public.rsvps (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       text NOT NULL CHECK (status IN ('going', 'not_going')),
  responded_at timestamptz DEFAULT now(),
  UNIQUE (event_id, user_id)
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rsvps_select_own"
  ON public.rsvps FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "rsvps_select_host"
  ON public.rsvps FOR SELECT
  TO authenticated
  USING (
    (SELECT host_id FROM public.events WHERE id = rsvps.event_id) = auth.uid()
  );

CREATE POLICY "rsvps_insert_authenticated"
  ON public.rsvps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rsvps_update_own"
  ON public.rsvps FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rsvps_delete_own"
  ON public.rsvps FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
