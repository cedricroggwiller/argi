import type { Metadata } from "next";
import { Textseite } from "../textseite";
import { SITE } from "@/lib/site";

// Kontaktangaben kommen zur Laufzeit aus der Umgebung.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Datenschutz" };

export default function Datenschutz() {
  return (
    <Textseite titel="Datenschutz">
      <p className="muted small">Entwurf, vor dem Start von Argi zu prüfen.</p>
      <h2 style={{ fontSize: 28 }}>Wer ist verantwortlich?</h2>
      <p>[Vor- und Nachname, Adresse], {SITE.kontaktEmail}</p>
      <h2 style={{ fontSize: 28 }}>Welche Daten?</h2>
      <p>
        Wenn du einen Kurs buchst, speichern wir Name, E-Mail-Adresse, freiwillig Telefonnummer und Nachricht sowie
        die gebuchten Plätze. Wir brauchen sie, um den Kurs durchzuführen, dir Bestätigung und Erinnerung zu schicken
        und dich bei Änderungen zu erreichen.
      </p>
      <h2 style={{ fontSize: 28 }}>Zahlung</h2>
      <p>
        Online-Zahlungen laufen über Stripe Payments Europe Ltd. Karten- und TWINT-Daten gibst du direkt bei Stripe ein;
        wir sehen sie nicht. Es gilt zusätzlich die Datenschutzerklärung von Stripe.
      </p>
      <h2 style={{ fontSize: 28 }}>Cookies und Statistik</h2>
      <p>Diese Website setzt keine Tracking- oder Werbe-Cookies und nutzt keine Besucherstatistik.</p>
      <h2 style={{ fontSize: 28 }}>Wie lange?</h2>
      <p>Buchungsdaten bewahren wir auf, solange es für Buchhaltung und gesetzliche Pflichten nötig ist [Frist ergänzen].</p>
      <h2 style={{ fontSize: 28 }}>Deine Rechte</h2>
      <p>Du kannst jederzeit Auskunft, Berichtigung oder Löschung deiner Daten verlangen: {SITE.kontaktEmail}.</p>
    </Textseite>
  );
}
