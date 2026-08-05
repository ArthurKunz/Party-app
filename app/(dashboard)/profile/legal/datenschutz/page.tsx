import LegalTextScreen from '@/features/profile/LegalTextScreen'

// Placeholder copy — replace with the real Datenschutzerklärung.
const PARAGRAPHS = [
  'Diese App speichert nur, was für die Nutzung nötig ist: deinen Namen, dein Geburtsdatum, dein Profilbild und deine Zu- und Absagen zu Events.',
  'Deine Daten liegen bei unserem Hosting-Anbieter und werden nicht an Dritte verkauft. Andere Gäste sehen deinen Namen, dein Alter und dein Profilbild.',
  'Du kannst deinen Account jederzeit unter „Account verwalten“ löschen. Damit werden deine Profildaten und deine Antworten entfernt.',
  'Dieser Text ist ein Platzhalter und wird vor dem Launch durch die vollständige Datenschutzerklärung ersetzt.',
]

export default function DatenschutzPage() {
  return <LegalTextScreen title='Datenschutz' paragraphs={PARAGRAPHS} />
}
