import type { Metadata } from "next";
import { Textseite } from "../textseite";
import { SITE } from "@/lib/site";

// Kontaktangaben kommen zur Laufzeit aus der Umgebung.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Teilnahmebedingungen" };

export default function Agb() {
  return (
    <Textseite titel="Teilnahmebedingungen">
      <p className="muted small">Entwurf, vor dem Start von Argi zu prüfen.</p>
      <ol style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680 }}>
        <li>Die Buchung ist verbindlich, sobald die Zahlung eingegangen ist; du bekommst eine Bestätigung per E-Mail.</li>
        <li>Bis {SITE.stornoTage} Tage vor Kursbeginn kannst du kostenlos absagen oder auf einen anderen Termin umbuchen. Danach ist der volle Betrag geschuldet; du kannst deinen Platz aber an eine andere Person weitergeben.</li>
        <li>Muss ein Kurs abgesagt werden (z. B. Krankheit, zu wenige Anmeldungen), bekommst du den vollen Betrag zurück oder einen Ersatztermin.</li>
        <li>Die Stücke werden nach dem Kurs gebrannt und glasiert. Ton ist ein Naturmaterial: Risse oder Veränderungen beim Brand sind möglich und kein Mangel.</li>
        <li>Abholung der fertigen Stücke im {SITE.ort.name}, {SITE.ort.strasse}, Baden, innert [Frist] nach Benachrichtigung.</li>
        <li>Teilnahme auf eigene Verantwortung; für Flecken auf Kleidung wird nicht gehaftet.</li>
      </ol>
    </Textseite>
  );
}
