import LegalTextScreen from '@/features/profile/LegalTextScreen'

// Placeholder copy — replace with the real Impressum.
const PARAGRAPHS = [
  'Angaben gemäß § 5 TMG. Hier stehen bald der Name des Anbieters, die vollständige Anschrift und eine Kontaktmöglichkeit.',
  'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: Platzhalter. Dieser Text ist noch nicht rechtsverbindlich und wird vor dem Launch ersetzt.',
  'Bei Fragen zu diesem Angebot erreichst du uns vorerst über die E-Mail-Adresse, mit der du deinen Account erstellt hast.',
]

export default function ImpressumPage() {
  return <LegalTextScreen title='Impressum' paragraphs={PARAGRAPHS} />
}
