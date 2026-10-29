import Link from "next/link";
import { alleKurse } from "@/lib/kurse";
import { chf } from "@/lib/zeit";
import { KursFormular } from "./kursformular";

export const dynamic = "force-dynamic";

export default async function Kurse(props: PageProps<"/admin/kurse">) {
  const sp = await props.searchParams;
  const kurse = await alleKurse();
  return (
    <>
      <h1>Kursarten</h1>
      <p className="muted" style={{ marginTop: -8 }}>Vorlagen für Termine: Text, Preis, Plätze und Dauer werden beim Anlegen eines Termins übernommen.</p>
      {sp.gespeichert && <p className="hinweis">Gespeichert.</p>}
      <div className="tabelle-box">
        <table className="tabelle">
          <thead><tr><th>Titel</th><th>Preis</th><th>Plätze</th><th>Dauer</th><th>Sichtbar</th><th></th></tr></thead>
          <tbody>
            {kurse.map((k) => (
              <tr key={k.id}>
                <td>{k.title}<br /><span className="small muted">/kurse/{k.slug}</span></td>
                <td>{chf(k.price_cents)}</td>
                <td>{k.capacity}</td>
                <td>{k.duration_min} Min.</td>
                <td>{k.active ? "ja" : "nein"}</td>
                <td><Link href={`/admin/kurse/${k.id}`}>Bearbeiten</Link></td>
              </tr>
            ))}
            {kurse.length === 0 && <tr><td colSpan={6} className="muted">Noch keine Kursart.</td></tr>}
          </tbody>
        </table>
      </div>
      <h2>Neue Kursart</h2>
      {sp.fehler && <p className="fehler" role="alert">Bitte Titel, Preis, Plätze und Dauer prüfen.</p>}
      <KursFormular />
    </>
  );
}
