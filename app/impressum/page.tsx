import LegalTextScreen, { type LegalSection } from '@/features/profile/LegalTextScreen'

// Struktur und Pflichtangaben nach § 5 DDG stehen. Drei Werte kann nur Arthur
// eintragen — sie sind mit «...» markiert, damit sie beim Überfliegen auffallen und
// nicht versehentlich so online gehen:
//
//   1. die ladungsfähige Anschrift (kein Postfach — das genügt nicht)
//   2. die Kontakt-E-Mail
//   3. ob eine Telefonnummer angegeben wird (freiwillig, aber ein zweiter schneller
//      Kontaktweg neben der E-Mail wird erwartet — ein Kontaktformular genügt auch)
//
// Solange Student Connect kostenlos und ohne Gewinnerzielungsabsicht läuft, ist es
// ein privates Angebot: keine Rechtsform, keine USt-IdNr., kein Registereintrag.
// Sobald Geld fließt, kommen diese Angaben dazu.
const SECTIONS: LegalSection[] = [
  {
    paragraphs: [
      'Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG).',
    ],
  },
  {
    heading: 'Anbieter',
    paragraphs: [
      'Arthur Kunz',
      '«Straße und Hausnummer»',
      '«PLZ und Ort»',
      'Deutschland',
    ],
  },
  {
    heading: 'Kontakt',
    paragraphs: [
      'E-Mail: «kontakt@deine-domain.de»',
      'Auf Anfragen über diese Adresse antworten wir so schnell wie möglich.',
    ],
  },
  {
    heading: 'Verantwortlich für den Inhalt',
    paragraphs: [
      'Verantwortlich für journalistisch-redaktionelle Inhalte gemäß § 18 Abs. 2 Medienstaatsvertrag (MStV) ist Arthur Kunz, Anschrift wie oben.',
    ],
  },
  {
    heading: 'Art des Angebots',
    paragraphs: [
      'Student Connect ist ein privates, nicht-kommerzielles Angebot. Es wird keine Gewinnerzielungsabsicht verfolgt, es besteht keine Eintragung in ein Handels-, Vereins-, Partnerschafts- oder Genossenschaftsregister, und es wird keine Umsatzsteuer-Identifikationsnummer geführt.',
    ],
  },
  {
    heading: 'Streitbeilegung',
    paragraphs: [
      'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr',
      'Wir sind weder verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
    ],
  },
  {
    heading: 'Haftung für Inhalte von Nutzerinnen und Nutzern',
    paragraphs: [
      'Partys, Beschreibungen, Adressen, Bilder und Umfragen werden von den Nutzerinnen und Nutzern selbst eingestellt. Für diese Inhalte ist ausschließlich verantwortlich, wer sie eingestellt hat. Wir machen uns fremde Inhalte nicht zu eigen.',
      'Als Diensteanbieter sind wir nach § 7 Abs. 1 DDG für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.',
      'Sobald uns eine konkrete Rechtsverletzung bekannt wird, entfernen wir den betroffenen Inhalt umgehend. Hinweise dazu bitte an die oben genannte E-Mail-Adresse.',
    ],
  },
  {
    heading: 'Haftung für Links',
    paragraphs: [
      'Unser Angebot verlinkt auf externe Websites, auf deren Inhalte wir keinen Einfluss haben. Für diese Inhalte ist stets der jeweilige Anbieter verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar.',
    ],
  },
]

export default function ImpressumPage() {
  return <LegalTextScreen title='Impressum' sections={SECTIONS} updated='21. August 2026' />
}
