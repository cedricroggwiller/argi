import Link from "next/link";
import { notFound } from "next/navigation";
import { termin } from "@/lib/kurse";
import { buchungenVonTermin } from "@/lib/buchung";
import { chf, datumLang, zeitspanne } from "@/lib/zeit";
import { buchungStornieren, terminAbsagenAktion, terminAendern } from "../../../aktionen";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = { paid: "bezahlt", reserved: "zahlt vor Ort", pending: "Zahlung offen", expired: "abgebrochen", cancelled: "storniert" };

export default async function TerminDetail(props: PageProps<"/admin/termine/[id]">) {
  const id = Number((await props.params).id);
  const sp = await props.searchParams;
  const t = Number.isInteger(id) ? await termin(id) : null;
  if (!t) notFound();
  const buchungen = await buchungenVonTermin(id);
  const aktiv = buchungen.filter((b) => b.status === "paid" || b.status === "reserved");
  const einnahmen = buchungen.filter((b) => b.status === "paid").reduce((s, b) => s + b.amount_cents, 0);
  const offenVorOrt = buchungen.filter((b) => b.status === "reserved").reduce((s, b) => s + b.amount_cents, 0);
  const meldung = typeof sp.meldung === "string" ? sp.meldung : null;

  return (
    <>
      <p><Link href="/admin">← Alle Termine</Link></p>
      <h1>{t.course_title}</h1>
      <p style={{ marginTop: -8 }}>{datumLang(t.starts_at)}, {zeitspanne(t.starts_at, t.ends_at)} Uhr · {chf(t.price_cents)} · {t.belegt} von {t.capacity} Plätzen belegt
        {t.cancelled_at && <> · <span className="badge cancelled">abgesagt</span></>}</p>
      {sp.neu && <p className="hinweis">Termin ist veröffentlicht. <Link href={`/buchen/${t.id}`} target="_blank">Buchungsseite ansehen</Link></p>}
      {sp.gespeichert && <p className="hinweis">Gespeichert.</p>}
      {sp.storniert && <p className="hinweis">Buchung storniert, die Person wurde per E-Mail informiert.</p>}
      {sp.abgesagt && <p className="hinweis">Termin abgesagt. Alle Teilnehmenden sind informiert, bezahlte Beträge zurückerstattet.</p>}
      {meldung && <p className="fehler" role="alert">{meldung}</p>}

      <h2>Teilnehmende ({aktiv.reduce((s, b) => s + b.seats, 0)})</h2>
      <p className="small muted" style={{ marginTop: -6 }}>Bezahlt online: {chf(einnahmen)} · offen vor Ort: {chf(offenVorOrt)} · <a href={`/api/admin/termine/${t.id}/csv`}>Liste als CSV</a></p>
      <div className="tabelle-box">
        <table className="tabelle">
          <thead><tr><th>Name</th><th>Kontakt</th><th>Plätze</th><th>Betrag</th><th>Stand</th><th>Nachricht</th><th></th></tr></thead>
          <tbody>
            {buchungen.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td><a href={`mailto:${b.email}`}>{b.email}</a>{b.phone && <><br /><a href={`tel:${b.phone}`}>{b.phone}</a></>}</td>
                <td>{b.seats}</td>
                <td>{chf(b.amount_cents)}</td>
                <td><span className={`badge ${b.status}`}>{STATUS[b.status]}</span>{b.refunded_at && <><br /><span className="small muted">zurückerstattet</span></>}</td>
                <td className="small" style={{ maxWidth: 240, whiteSpace: "pre-wrap" }}>{b.message}</td>
                <td>
                  {(b.status === "paid" || b.status === "reserved") && (
                    <details>
                      <summary style={{ cursor: "pointer", color: "var(--accent)" }}>Stornieren</summary>
                      <form action={buchungStornieren} className="form" style={{ marginTop: 8, minWidth: 220 }}>
                        <input type="hidden" name="buchung" value={b.id} />
                        <input type="hidden" name="session" value={t.id} />
                        {b.status === "paid" && (
                          <label className="check"><input type="checkbox" name="rueckzahlen" defaultChecked /> <span>Betrag zurückerstatten</span></label>
                        )}
                        <label className="feld">Nachricht (freiwillig)<input name="grund" maxLength={300} /></label>
                        <button className="btn btn-small" type="submit">Buchung stornieren</button>
                      </form>
                    </details>
                  )}
                </td>
              </tr>
            ))}
            {buchungen.length === 0 && <tr><td colSpan={7} className="muted">Noch keine Buchungen.</td></tr>}
          </tbody>
        </table>
      </div>

      {!t.cancelled_at && (
        <div className="raster" style={{ marginTop: 32 }}>
          <form action={terminAendern} className="karte form">
            <h2 style={{ margin: 0 }}>Anpassen</h2>
            <input type="hidden" name="id" value={t.id} />
            <label className="feld">Plätze<input type="number" name="plaetze" min={1} max={40} defaultValue={t.capacity} required /></label>
            <label className="feld">Hinweis auf der Website<input name="note" maxLength={200} defaultValue={t.note} /></label>
            <button className="btn btn-small" type="submit">Speichern</button>
            <Link href={`/admin/termine/neu?von=${t.id}`}>Termin duplizieren</Link>
          </form>
          <form action={terminAbsagenAktion} className="karte form">
            <h2 style={{ margin: 0 }}>Termin absagen</h2>
            <input type="hidden" name="id" value={t.id} />
            <p className="small muted" style={{ margin: 0 }}>Alle Teilnehmenden bekommen eine E-Mail, online Bezahltes geht automatisch zurück.</p>
            <label className="feld">Begründung für die E-Mail<textarea name="grund" maxLength={500} placeholder="z. B. Leider bin ich krank …" /></label>
            <label className="check"><input type="checkbox" name="sicher" /> <span>Ja, Termin absagen</span></label>
            <button className="btn btn-accent btn-small" type="submit">Absagen</button>
          </form>
        </div>
      )}
    </>
  );
}
