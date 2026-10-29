import type { Metadata } from "next";
import { Textseite } from "../textseite";
import { SITE } from "@/lib/site";

// Kontaktangaben kommen zur Laufzeit aus der Umgebung.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Impressum" };

export default function Impressum() {
  return (
    <Textseite titel="Impressum">
      <p>
        argi<br />
        [Vor- und Nachname]<br />
        [Adresse]<br />
        [PLZ Ort]<br />
        E-Mail: {SITE.kontaktEmail}
      </p>
      <p>Kursort: {SITE.ort.name}, {SITE.ort.zusatz}, {SITE.ort.strasse}, {SITE.ort.plzOrt}</p>
      <p className="muted small">Fotos: argi.</p>
    </Textseite>
  );
}
