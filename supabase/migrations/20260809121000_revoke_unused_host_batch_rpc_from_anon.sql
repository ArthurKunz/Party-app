-- get_host_info_for_events was the last SECURITY DEFINER function still handing
-- profile data to callers without an account (host names for any batch of event
-- ids). Nothing in the app calls it — the party list uses get_event_host one row at
-- a time — so closing it to anonymous callers costs nothing. The function itself is
-- left in place; it is not this migration's job to decide it is dead.
revoke execute on function public.get_host_info_for_events(uuid[]) from public, anon;
grant execute on function public.get_host_info_for_events(uuid[]) to authenticated;
