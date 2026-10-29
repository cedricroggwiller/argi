import Link from "next/link";
import { alleTermine } from "@/lib/kurse";
import { chf, datumLang, zeitspanne } from "@/lib/zeit";

export const dynamic = "force-dynamic";

export default async function Uebersicht() {
  const termine = await alleTermine();
  const jetzt = Date.now();
  const kommend = termine.filter((t) => t.starts_at.getTime() >= jetzt);
  const vorbei = termine.filter((t) => t.starts_at.getTime() < jetzt).reverse();

  const Tabelle = ({ liste }: { liste: typeof termine }) => (
    <div className="tabelle-box">
      <table className="tabelle">
        <thead><tr><th>Datum</th><th>Kurs</th><th>Belegt</th><th>Preis</th><th>Stand</th><th></th></tr></thead>
        <tbody>
          {liste.map((t) => (
            <tr key={t.id}>
              <td>{datumLang(t.starts_at)}<br /><span className="small muted">{zeitspanne(t.starts_at, t.ends_at)}</span></td>
              <td>{t.course_title}{t.note ? <><br /><span className="small muted">{t.note}</span></> : null}</td>
              <td>{t.belegt} / {t.capacity}</td>
              <td>{chf(t.price_cents)}</td>
              <td>{t.cancelled_at ? <span className="badge cancelled">abgesagt</span> : t.frei === 0 ? <span className="badge paid">voll</span> : <span className="badge">{t.frei} frei</span>}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <Link href={`/admin/termine/${t.id}`}>Öffnen</Link>{" · "}
                <Link href={`/admin/termine/neu?von=${t.id}`}>Duplizieren</Link>
              </td>
            </tr>
          ))}
          {liste.length === 0 && <tr><td colSpan={6} className="muted">Keine Termine.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Termine</h1>
        <Link href="/admin/termine/neu" className="btn btn-dark btn-small">Neuer Termin</Link>
      </div>
      <h2>Kommend</h2>
      <Tabelle liste={kommend} />
      <h2>Letzte 31 Tage</h2>
      <Tabelle liste={vorbei} />
    </>
  );
}
