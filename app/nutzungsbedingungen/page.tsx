import LegalTextScreen, { type LegalSection } from '@/features/profile/LegalTextScreen'

// Der Text, auf den sich die gesamte Datensparsamkeit der App stützt.
//
// In SCHEMA.md steht als Begründung dafür, dass kein Geburtsdatum gespeichert wird:
// "The 16+ minimum lives in the terms." Bis jetzt gab es diese terms nicht — die
// Begründung stand also in der Luft. § 2 ist die Stelle, die sie trägt. Wenn dieser
// Absatz je verschwindet, muss die Entscheidung gegen das Geburtsdatum neu bewertet
// werden.
//
// Die Anschrift ist die einzige offene Stelle und mit «...» markiert.
const SECTIONS: LegalSection[] = [
  {
    paragraphs: [
      'Diese Bedingungen regeln die Nutzung von Student Connect. Mit der Erstellung eines Kontos stimmst du ihnen zu.',
    ],
  },
  {
    heading: '1. Was Student Connect ist',
    paragraphs: [
      'Student Connect ist eine App, mit der du private Veranstaltungen erstellen, per Link teilen und Zu- oder Absagen verwalten kannst.',
      'Anbieter ist Arthur Kunz, «Straße und Hausnummer», «PLZ und Ort». Das Angebot ist kostenlos und wird ohne Gewinnerzielungsabsicht bereitgestellt.',
      'Wir sind nicht Veranstalter der über die App organisierten Partys und nicht Vertragspartner zwischen Gastgeber und Gästen. Wir stellen nur das Werkzeug bereit.',
    ],
  },
  {
    heading: '2. Mindestalter',
    paragraphs: [
      'Die Nutzung ist Menschen ab 16 Jahren gestattet. Mit der Anmeldung bestätigst du, dass du mindestens 16 Jahre alt bist.',
      'Wir erheben zur Prüfung kein Geburtsdatum, weil wir so wenig Daten wie möglich speichern wollen. Wir vertrauen auf deine Bestätigung. Erlangen wir Kenntnis davon, dass ein Konto von einer jüngeren Person geführt wird, löschen wir es.',
    ],
  },
  {
    heading: '3. Dein Konto',
    paragraphs: [
      'Du legst ein Konto mit einer E-Mail-Adresse an oder meldest dich mit Google an. Deine Zugangsdaten gehören dir allein; gib sie nicht weiter.',
      'Gib bei Vor- und Nachnamen den Namen an, unter dem andere Gäste dich erkennen. Konten, die erkennbar eine andere Person vortäuschen, können wir sperren.',
      'Pro Person ist ein Konto vorgesehen.',
    ],
  },
  {
    heading: '4. Der Einladungslink',
    paragraphs: [
      'Jede Party bekommt einen Link mit einem zufälligen Code. Dieser Code ist der einzige Schutz der Party: Wer den Link hat, sieht Titel, Datum, Adresse und Gästeliste — auch ohne Konto sieht er die Eckdaten.',
      'Gib den Link deshalb nur an Menschen weiter, die eingeladen sein sollen. Als Gastgeber bist du dafür verantwortlich, wem du ihn gibst; als Gast dafür, dass du ihn nicht ungefragt weiterleitest.',
    ],
  },
  {
    heading: '5. Deine Inhalte',
    paragraphs: [
      'Titel, Beschreibungen, Adressen, Bilder und Umfragen, die du einstellst, bleiben deine Inhalte. Du räumst uns nur das Recht ein, sie im Rahmen der App zu speichern und den berechtigten Empfängern anzuzeigen — also den Gästen deiner Party.',
      'Du sicherst zu, dass du die nötigen Rechte an dem hast, was du hochlädst. Lade keine Bilder hoch, an denen andere Rechte haben, und keine Fotos von Personen ohne deren Einverständnis.',
      'Gib als Adresse nur einen Ort an, über den du verfügen darfst.',
    ],
  },
  {
    heading: '6. Was nicht erlaubt ist',
    paragraphs: [
      'Untersagt sind insbesondere: rechtswidrige, beleidigende, diskriminierende, gewaltverherrlichende oder jugendgefährdende Inhalte; Belästigung anderer Nutzerinnen und Nutzer; Werbung und gewerbliche Veranstaltungen; das Vortäuschen einer fremden Identität.',
      'Ebenfalls untersagt sind automatisierte Zugriffe, Versuche, die Zugriffsbeschränkungen der App zu umgehen, sowie das systematische Auslesen von Daten anderer Nutzerinnen und Nutzer.',
      'Verstöße können zur Sperrung oder Löschung des Kontos führen.',
    ],
  },
  {
    heading: '7. Verantwortung für Partys',
    paragraphs: [
      'Für eine Party ist allein verantwortlich, wer sie erstellt hat — für ihren Ablauf, die Einhaltung von Hausrecht, Nachbarschaftsschutz, Jugendschutz und allen weiteren geltenden Vorschriften.',
      'Die Angaben zu einer Party stammen vom Gastgeber. Wir prüfen sie nicht und übernehmen keine Gewähr für ihre Richtigkeit.',
    ],
  },
  {
    heading: '8. Verfügbarkeit',
    paragraphs: [
      'Student Connect ist ein kostenloses Angebot in einer frühen Fassung. Es besteht kein Anspruch auf eine bestimmte Verfügbarkeit, auf bestimmte Funktionen oder darauf, dass Funktionen erhalten bleiben.',
      'Wartungsarbeiten, Störungen und Weiterentwicklungen können den Dienst zeitweise unterbrechen oder verändern.',
    ],
  },
  {
    heading: '9. Haftung',
    paragraphs: [
      'Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.',
      'Bei einfacher Fahrlässigkeit haften wir nur bei Verletzung einer wesentlichen Vertragspflicht — also einer Pflicht, deren Erfüllung die ordnungsgemäße Nutzung überhaupt erst ermöglicht und auf deren Einhaltung du vertrauen darfst — und begrenzt auf den vertragstypischen, vorhersehbaren Schaden.',
      'Für Schäden im Zusammenhang mit einer Party selbst haften wir nicht; dafür ist der Gastgeber verantwortlich.',
      'Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.',
    ],
  },
  {
    heading: '10. Beendigung',
    paragraphs: [
      'Du kannst dein Konto jederzeit ohne Angabe von Gründen unter „Profil → Account" löschen. Damit werden deine Daten unwiderruflich entfernt.',
      'Wir können ein Konto bei erheblichen oder wiederholten Verstößen gegen diese Bedingungen sperren oder löschen. Vorher weisen wir dich, soweit möglich und zumutbar, auf den Verstoß hin.',
    ],
  },
  {
    heading: '11. Änderungen dieser Bedingungen',
    paragraphs: [
      'Wir können diese Bedingungen ändern, wenn sich die App oder die Rechtslage ändert. Über wesentliche Änderungen informieren wir dich in der App. Bist du nicht einverstanden, kannst du dein Konto löschen.',
    ],
  },
  {
    heading: '12. Schlussbestimmungen',
    paragraphs: [
      'Es gilt deutsches Recht. Ist eine Bestimmung dieser Bedingungen unwirksam, bleibt der übrige Teil davon unberührt.',
      'Verbraucherinnen und Verbraucher können sich unabhängig davon stets auf die zwingenden Vorschriften ihres Aufenthaltsstaats berufen.',
    ],
  },
]

export default function NutzungsbedingungenPage() {
  return <LegalTextScreen title='Nutzungsbedingungen' sections={SECTIONS} updated='21. August 2026' />
}
