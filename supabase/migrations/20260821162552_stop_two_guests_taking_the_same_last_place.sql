-- max_guests hatte eine Lücke, die keine Policy schließen kann.
--
-- party_has_room zählt die Zusagen und vergleicht mit max_guests. Zwischen dem Zählen
-- und dem Einfügen liegt aber nichts: sagen zwei Leute im selben Moment zu, lesen
-- beide denselben Stand, bestehen beide den Test, und die Party ist um eine Person
-- überbucht. Genau der Moment, in dem alle gleichzeitig auf den Einladungslink tippen,
-- ist der, für den diese App gebaut ist.
--
-- Warum das nicht in der Policy zu lösen ist: eine RLS-Prüfung ist ein Ausdruck, den
-- Postgres auswertet — sie kann nichts sperren und weiß nichts von den anderen
-- Transaktionen, die gerade dasselbe tun. Serialisieren muss jemand, der garantiert
-- genau einmal pro Zeile läuft. Das ist ein Trigger.
--
-- party_has_room bleibt unverändert in der Policy stehen. Der Trigger ersetzt sie
-- nicht, er sichert sie ab: die Policy weist den Normalfall ab, der Trigger den
-- Gleichstand. Zwei unabhängige Prüfungen, die sich gegenseitig auffangen.

create or replace function public.rsvps_enforce_capacity()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  cap int;
  taken int;
begin
  -- Nur eine Zusage kostet einen Platz. 'maybe' und 'not_going' laufen hier ohne
  -- jede Sperre durch — sie sollen auch auf einer vollen Party möglich bleiben.
  if new.status <> 'going' then
    return new;
  end if;

  select e.max_guests into cap from events e where e.id = new.event_id;

  -- Ohne Limit gibt es nichts zu serialisieren. Wichtig, damit unbegrenzte Partys
  -- gar nicht erst in die Sperre laufen.
  if cap is null then
    return new;
  end if;

  -- Transaktionsgebunden und auf DIESE Party geschlüsselt: zwei Zusagen zur selben
  -- Party warten aufeinander, zwei Zusagen zu verschiedenen Partys nie. Die Sperre
  -- fällt automatisch, sobald die Transaktion endet — auch wenn sie scheitert.
  --
  -- Advisory statt 'select ... for update' auf der events-Zeile, weil Letzteres den
  -- Gastgeber blockieren würde, der gerade seine Party bearbeitet. Eine Hash-Kollision
  -- zwischen zwei Party-Ids ließe nur zwei Partys unnötig aufeinander warten; falsch
  -- zählen kann sie nichts.
  perform pg_advisory_xact_lock(hashtext(new.event_id::text));

  -- Alle außer der Person, die gerade antwortet. Wer schon einen Platz hat, behält
  -- ihn dadurch beim erneuten Speichern — dieselbe Regel, die party_has_room über
  -- seinen exists-Zweig durchsetzt, nur ohne Sonderfall.
  select count(*) into taken
  from rsvps r
  where r.event_id = new.event_id
    and r.status = 'going'
    and r.user_id <> new.user_id;

  if taken >= cap then
    -- Diese Meldung landet in der App unter 'Deine Antwort konnte nicht gespeichert
    -- werden.' — deutlich brauchbarer als die RLS-Meldung, die sonst käme.
    raise exception 'Diese Party ist voll.' using errcode = 'check_violation';
  end if;

  return new;
end;
$function$;

-- BEFORE, nicht AFTER: die Zeile darf gar nicht erst geschrieben werden.
drop trigger if exists rsvps_enforce_capacity on public.rsvps;

create trigger rsvps_enforce_capacity
  before insert or update on public.rsvps
  for each row
  execute function public.rsvps_enforce_capacity();

-- Wie bei pool_responses_single_answer: eine Trigger-Funktion gehört dem Trigger und
-- hat über /rest/v1/rpc nichts verloren.
revoke execute on function public.rsvps_enforce_capacity() from public, anon, authenticated;
