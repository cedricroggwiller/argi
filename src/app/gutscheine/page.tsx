import type { Metadata } from "next";
import { Textseite } from "../textseite";
import { SITE } from "@/lib/site";

// Kontaktangaben kommen zur Laufzeit aus der Umgebung.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Gutscheine" };

export default function Gutscheine() {
  const mail = `mailto:${SITE.kontaktEmail}?subject=${encodeURIComponent("Gutschein")}&body=${encodeURIComponent("Hoi Argi\n\nIch hätte gern einen Gutschein über: [Betrag oder Kurs]\nFür: [Name der beschenkten Person]\n\nLiebe Grüsse")}`;
  return (
    <Textseite titel="Ein Abend am Ton, verschenkt." eyebrow="Gutscheine">
      <p className="lead" style={{ fontSize: 19, maxWidth: 620 }}>
        Gutscheine gibt es für einen bestimmten Kurs oder einen freien Betrag. Schreib mir kurz, für wen und wie viel;
        du bekommst den Gutschein als PDF zum Ausdrucken oder Weiterleiten.
      </p>
      <p><a className="btn btn-accent" href={mail}>Gutschein anfragen</a></p>
      <p className="muted small">Online kaufen und direkt einlösen kommt in einer nächsten Etappe.</p>
    </Textseite>
  );
}
