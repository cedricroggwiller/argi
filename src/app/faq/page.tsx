import type { Metadata } from "next";
import { Textseite } from "../textseite";
import { SITE } from "@/lib/site";

// Kontaktangaben kommen zur Laufzeit aus der Umgebung.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Fragen und Antworten" };

const FRAGEN: [string, string][] = [
  ["Brauche ich Vorkenntnisse?", "Nein. Die Kurse sind für Leute gemacht, die noch nie Ton in den Händen hatten."],
  ["Was soll ich anziehen?", "Etwas, das schmutzig werden darf. Ton wäscht sich gut aus, Glasur nicht immer. Kurze Fingernägel helfen an der Drehscheibe."],
  ["Wann bekomme ich meine Stücke?", "Nach dem Kurs werden sie getrocknet, gebrannt und glasiert. Das dauert einige Wochen; ich melde mich, sobald du sie im Kafi abholen kannst. [Dauer von Argi bestätigen]"],
  ["Kann ich absagen oder umbuchen?", `Bis ${SITE.stornoTage} Tage vor dem Kurs kostenlos. Danach kannst du deinen Platz an jemand anderen weitergeben. [Regel von Argi bestätigen]`],
  ["Wie bezahle ich?", "Online beim Buchen mit TWINT oder Karte."],
  ["Wo genau findet der Kurs statt?", `In der Werkstatt im Keller des ${SITE.ort.name}, ${SITE.ort.strasse}, ${SITE.ort.plzOrt}.`],
  ["Ab welchem Alter?", "[Angabe von Argi]"],
];

export default function Faq() {
  return (
    <Textseite titel="Fragen und Antworten" eyebrow="FAQ">
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 680 }}>
        {FRAGEN.map(([f, a]) => (
          <div key={f}>
            <h2 style={{ fontSize: 28, marginBottom: 6 }}>{f}</h2>
            <p style={{ margin: 0, color: "var(--ink-2)" }}>{a}</p>
          </div>
        ))}
      </div>
    </Textseite>
  );
}
