-- Die Partyliste stellte pro Party eigene Anfragen: getHostedParties zwei,
-- getAttendedParties drei. Bei fünf eigenen und fünf fremden Partys waren das
-- 27 Roundtrips für einen Bildschirm — auf dem Handy im Mobilfunknetz der
-- Unterschied zwischen "die Liste ist da" und "die Liste baut sich auf".
--
-- Zwei der drei Batch-Funktionen gab es schon: get_host_info_for_events und
-- get_attendee_avatars_for_events wurden genau dafür gebaut und dann nie
-- aufgerufen. Was fehlte, sind diese beiden hier.
--
-- Beide sind bewusst Zeile für Zeile aus ihren Einzelversionen abgeleitet, damit
-- die Liste danach exakt dasselbe anzeigt wie vorher — gleiche Status, gleicher
-- Gastgeber-Sonderfall, gleiche Sortierung. Eine schnellere Liste, die andere
-- Namen zeigt, wäre kein Fortschritt.

-- Entspricht get_event_attendees, nur für mehrere Partys auf einmal.
--
-- Der union-all-Zweig ist der Gastgeber: er hat keine rsvps-Zeile (die Policy
-- verbietet ihm, zur eigenen Party zuzusagen), soll aber trotzdem in der
-- Gästeliste auftauchen. 'host' ist deshalb ein vierter Status, den es nur hier
-- gibt und der nie gespeichert wird.
--
-- Die Sortierung muss stimmen, weil der Client auf zehn Einträge kürzt: erst der
-- Gastgeber, dann die Zusagen, dann vielleicht, dann die Absagen.
create or replace function public.get_event_attendees_for_events(p_event_ids uuid[])
returns table(event_id uuid, user_id uuid, firstname text, lastname text, avatar_url text, avatar_color text, status text)
language sql
security definer
set search_path to 'public'
as $function$
  with rows as (
    select r.event_id as event_id, p.id as user_id, p.firstname as firstname,
           p.lastname as lastname, p.avatar_url as avatar_url,
           p.avatar_color as avatar_color, r.status as status
    from rsvps r
    join profiles p on p.id = r.user_id
    where r.event_id = any(p_event_ids)
      and r.status in ('going', 'maybe', 'not_going')
    union all
    select e.id, p.id, p.firstname, p.lastname, p.avatar_url, p.avatar_color, 'host'
    from events e
    join profiles p on p.id = e.host_id
    where e.id = any(p_event_ids)
      and not exists (
        select 1 from rsvps r
        where r.event_id = e.id and r.user_id = e.host_id
      )
  )
  select rows.event_id, rows.user_id, rows.firstname, rows.lastname,
         rows.avatar_url, rows.avatar_color, rows.status
  from rows
  where public.is_party_member(rows.event_id)
  order by
    rows.event_id,
    case rows.status when 'host' then 0 when 'going' then 1 when 'maybe' then 2 else 3 end,
    rows.firstname;
$function$;

-- Entspricht get_rsvp_count, nur für mehrere Partys auf einmal.
--
-- 'going' und 'maybe' zählen, 'not_going' nicht — das ist die Zahl auf der Karte.
-- Der Gastgeber ist nicht dabei, weil er keine rsvps-Zeile hat.
--
-- Partys ohne eine einzige Antwort tauchen im Ergebnis gar nicht auf; der Client
-- setzt für die fehlenden Zeilen 0 ein, genau wie er es vorher für ein leeres
-- Einzelergebnis getan hat.
create or replace function public.get_rsvp_counts_for_events(p_event_ids uuid[])
returns table(event_id uuid, attendee_count integer)
language sql
security definer
set search_path to 'public'
as $function$
  select r.event_id, count(*)::integer
  from rsvps r
  where r.event_id = any(p_event_ids)
    and r.status in ('going', 'maybe')
    and public.is_party_member(r.event_id)
  group by r.event_id;
$function$;

-- Beide sind Mitglieder-Funktionen wie ihre Nachbarn: anon hat hier nichts zu suchen.
revoke execute on function public.get_event_attendees_for_events(uuid[]) from public, anon;
grant execute on function public.get_event_attendees_for_events(uuid[]) to authenticated;

revoke execute on function public.get_rsvp_counts_for_events(uuid[]) from public, anon;
grant execute on function public.get_rsvp_counts_for_events(uuid[]) to authenticated;
