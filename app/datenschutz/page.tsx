import LegalTextScreen from '@/features/profile/LegalTextScreen'

// Placeholder copy — replace with the real Datenschutzerklärung.
//
// The 16+ line is not decoration: the app deliberately stores no date of birth and
// asks for none, so the terms are the only place the minimum age exists. If that
// sentence goes, the threshold goes with it.
const PARAGRAPHS = [
  'Diese App richtet sich an Menschen ab 16 Jahren. Mit der Anmeldung bestätigst du, dass du mindestens 16 Jahre alt bist.',
  'Diese App speichert nur, was für die Nutzung nötig ist: deinen Namen, dein Profilbild und deine Zu- und Absagen zu Partys. Ein Geburtsdatum wird weder abgefragt noch gespeichert.',
  'Deine Daten liegen bei unserem Hosting-Anbieter und werden nicht an Dritte verkauft. Andere Gäste sehen deinen Namen und dein Profilbild.',
  'Du kannst deinen Account jederzeit unter „Account verwalten“ löschen. Damit werden deine Profildaten und deine Antworten entfernt.',
  'Dieser Text ist ein Platzhalter und wird vor dem Launch durch die vollständige Datenschutzerklärung ersetzt.',
]

export default function DatenschutzPage() {
  return <LegalTextScreen title='Datenschutz' paragraphs={PARAGRAPHS} />
}
