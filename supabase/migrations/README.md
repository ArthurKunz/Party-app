# Zum Stand dieses Ordners

**Kurz: dieser Ordner ist nicht die Wahrheit über die Datenbank.** Er ist eine
unvollständige Teilmenge davon. Solange es genau ein Supabase-Projekt gibt, merkt man
davon nichts — der Tag, an dem es weh tut, ist der, an dem eine Staging-Umgebung
gebraucht wird, das Projekt neu aufgesetzt werden muss oder ein Backup zurückgespielt
wird.

Stand 21.08.2026, geprüft mit `supabase migration list --linked`:

| | Anzahl |
|---|---|
| Dateien in diesem Ordner | 32 |
| Migrationen auf der Datenbank | 51 |
| davon **nur** auf der Datenbank, ohne Datei hier | 22 |
| davon **nur** hier, nie angewendet | 5 |

## Die 5 Dateien, die nie angewendet wurden

Zwei davon sind aktiv gefährlich, weil sie mit `add column if not exists` arbeiten:
abgespielt würden sie **stillschweigend** Spalten zurückbringen, die bewusst entfernt
wurden — `gender` steht in `CLAUDE.md` ausdrücklich unter „Not in V1", und zwar aus
rechtlichen Gründen bei Minderjährigen.

| Datei | Verhalten beim Abspielen |
|---|---|
| `20260401120000_add_gender_height_relationship.sql` | **gefährlich** — bringt `gender`, `height`, `relationship` zurück |
| `20260402120000_add_hobbies_to_profiles.sql` | **gefährlich** — bringt `hobbies` zurück |
| `20260613120000_create_events_and_rsvps.sql` | harmlos — `CREATE TABLE` ohne `IF NOT EXISTS`, bricht laut ab |
| `20260602120000_remove_consent_and_explore.sql` | harmlos — ist angewendet, nur unter der Version `20260602114136` |
| `20260602121000_remove_profile_extra_fields.sql` | harmlos — ist angewendet, nur unter der Version `20260602120114` |

Die beiden gefährlichen Dateien wurden **nicht** gelöscht, weil Löschen eine
Entscheidung ist, die Arthur treffen sollte. Bis dahin gilt: **kein `supabase db push`
ausführen**, ohne vorher diese Liste durchzugehen.

## Warum die Abweichung entstanden ist

Die 22 fehlenden Migrationen wurden über die Supabase-Oberfläche bzw. per MCP direkt
auf der Datenbank angewendet. Dabei vergibt Supabase die Version selbst und legt keine
Datei an. Der vollständige SQL-Text jeder einzelnen liegt weiterhin auf der Datenbank
in `supabase_migrations.schema_migrations.statements` — verloren ist also nichts, es
steht nur nicht im Repository.

## Wie man das sauber repariert

Ein Befehl, der die Datenbank selbst nicht anfasst, aber die Migrations-Buchführung
neu schreibt — deshalb bewusst nicht nebenbei ausgeführt:

```bash
supabase db pull          # fragt nach dem Datenbank-Passwort
```

Das erzeugt eine Baseline-Migration mit dem aktuellen Schema und markiert sie als
angewendet. Danach:

1. Die 5 nie angewendeten Dateien oben löschen — allen voran die beiden gefährlichen.
2. `supabase migration list --linked` erneut ausführen: links und rechts müssen
   danach Zeile für Zeile übereinstimmen.
3. Ergebnis einchecken.

## Regel für alles Weitere

Neue Änderungen ab jetzt **immer** als Datei hier anlegen und den Dateinamen mit der
Version verwenden, unter der sie tatsächlich angewendet wird. Die beiden jüngsten
Migrationen (`20260820230141_…`, `20260820230226_…`) sind genau so benannt — ihre
Dateinamen tragen die Versionsnummern, die auf der Datenbank stehen, nicht die
Uhrzeit, zu der sie geschrieben wurden.
