import type { Metadata } from "next";
import { Textseite } from "../textseite";
import { SITE } from "@/lib/site";

// Kontaktangaben kommen zur Laufzeit aus der Umgebung.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Private Gruppen" };

export default function Gruppen() {
  const mail = `mailto:${SITE.kontaktEmail}?subject=${encodeURIComponent("Anfrage private Gruppe")}&body=${encodeURIComponent("Hoi Argi\n\nAnlass:\nAnzahl Personen:\nWunschdaten:\n\nLiebe Grüsse")}`;
  return (
    <Textseite titel="Eure eigene Runde" eyebrow="Private Gruppen">
      <p className="lead" style={{ fontSize: 19, maxWidth: 620 }}>
        Geburtstag, Polterabend, Team-Event oder einfach mit Freundinnen: Die Werkstatt im Keller des Kafi Hoi Zäme
        gehört für einen Abend euch.
      </p>
      <p>Schreib mir Anlass, Anzahl Personen und ein paar Wunschdaten, dann mache ich dir ein Angebot.</p>
      <p><a className="btn btn-accent" href={mail}>Anfrage senden</a></p>
    </Textseite>
  );
}
