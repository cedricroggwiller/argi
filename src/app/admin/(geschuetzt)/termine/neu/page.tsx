import Link from "next/link";
import { aktiveKurse, termin } from "@/lib/kurse";
import { chf, dateToZurichInput } from "@/lib/zeit";
import { terminAnlegen } from "../../../aktionen";

export const dynamic = "force-dynamic";

export default async function NeuerTermin(props: PageProps<"/admin/termine/neu">) {
  const sp = await props.searchParams;
  const kurse = await aktiveKurse();
  const vorlage = sp.von ? await termin(Number(sp.von)) : null;
  // Duplizieren: eine Woche später, gleiche Zeit und Dauer.
  const start = vorlage ? dateToZurichInput(new Date(vorlage.starts_at.getTime() + 7 * 86400_000)) : "";
  const dauer = vorlage ? Math.round((vorlage.ends_at.getTime() - vorlage.starts_at.getTime()) / 60000) : undefined;

  if (kurse.length === 0) {
    return (
      <>
        <h1>Neuer Termin</h1>
        <p>Lege zuerst eine <Link href="/admin/kurse">Kursart</Link> an (Titel, Preis, Plätze, Dauer).</p>
      </>
    );
  }

  return (
    <>
      <h1>{vorlage ? "Termin duplizieren" : "Neuer Termin"}</h1>
      <form action={terminAnlegen} className="karte form" style={{ maxWidth: 560 }}>
        {sp.fehler && <p className="fehler" role="alert">Bitte Kurs, Datum und Zeit prüfen.</p>}
        <label className="feld">Kursart
          <select name="kurs" defaultValue={vorlage?.course_id ?? kurse[0].id} required>
            {kurse.map((k) => <option key={k.id} value={k.id}>{k.title} ({chf(k.price_cents)}, {k.capacity} Plätze, {k.duration_min} Min.)</option>)}
          </select>
        </label>
        <label className="feld">Beginn (Zürcher Zeit)
          <input type="datetime-local" name="start" defaultValue={start} required step={300} />
        </label>
        <label className="feld">Dauer in Minuten (leer = wie Kursart)
          <input type="number" name="dauer" min={15} max={720} step={15} defaultValue={dauer} />
        </label>
        <div className="raster">
          <label className="feld">Preis in CHF (leer = wie Kursart)
            <input name="preis" inputMode="decimal" defaultValue={vorlage ? String(vorlage.price_cents / 100) : ""} />
          </label>
          <label className="feld">Plätze (leer = wie Kursart)
            <input type="number" name="plaetze" min={1} max={40} defaultValue={vorlage?.capacity} />
          </label>
        </div>
        <label className="feld">Hinweis auf der Website (freiwillig)
          <input name="note" maxLength={200} defaultValue={vorlage?.note} placeholder="z. B. Spezialabend Weihnachtsgeschenke" />
        </label>
        <button className="btn btn-dark" type="submit">Termin veröffentlichen</button>
      </form>
    </>
  );
}
