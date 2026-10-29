import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Fuss, Kopf } from "../../teile";
import { buchungNachToken, zahlungNachfragen } from "@/lib/buchung";
import { ORT_ZEILE, SITE } from "@/lib/site";
import { chf, datumLang, zeitspanne } from "@/lib/zeit";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Deine Buchung", robots: { index: false } };

export default async function BuchungSeite(props: PageProps<"/buchung/[token]">) {
  const { token } = await props.params;
  const sp = await props.searchParams;
  let b = await buchungNachToken(token);
  if (!b) notFound();
  if (b.status === "pending") {
    await zahlungNachfragen(b);
    b = (await buchungNachToken(token))!;
  }
  const abgebrochen = sp.abgebrochen === "1";
  const fest = b.status === "paid" || b.status === "reserved";
  const termin = b.session_cancelled_at ? "abgesagt" : null;

  return (
    <>
      <Kopf />
      {b.status === "pending" && !abgebrochen && <meta httpEquiv="refresh" content="4" />}
      <main className="narrow seite">
        <div className="karte" style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680 }}>
          {fest && !termin && (
            <>
              <h1 style={{ fontSize: 44, margin: 0 }}>Schön, bis bald.</h1>
              <p style={{ margin: 0, color: "var(--ink-2)" }}>
                Deine Buchung ist bestätigt. Die Bestätigung mit Kalendereintrag geht an <strong>{b.email}</strong>;
                zwei Tage vorher kommt eine Erinnerung.
              </p>
            </>
          )}
          {b.status === "pending" && !abgebrochen && (
            <>
              <h1 style={{ fontSize: 40, margin: 0 }}>Zahlung wird bestätigt …</h1>
              <p style={{ margin: 0, color: "var(--ink-2)" }}>Das dauert meist nur ein paar Sekunden. Die Seite lädt sich selbst neu.</p>
            </>
          )}
          {(b.status === "expired" || (b.status === "pending" && abgebrochen)) && (
            <>
              <h1 style={{ fontSize: 40, margin: 0 }}>Die Zahlung wurde nicht abgeschlossen.</h1>
              <p style={{ margin: 0, color: "var(--ink-2)" }}>Es wurde nichts belastet. Du kannst es gleich nochmals versuchen.</p>
              <Link className="btn btn-accent" href={`/buchen/${b.session_id}`} style={{ alignSelf: "flex-start" }}>Nochmals buchen</Link>
            </>
          )}
          {(b.status === "cancelled" || termin) && (
            <>
              <h1 style={{ fontSize: 40, margin: 0 }}>Diese Buchung ist storniert.</h1>
              <p style={{ margin: 0, color: "var(--ink-2)" }}>
                {b.refunded_at ? `Der Betrag von ${chf(b.amount_cents)} wurde zurückerstattet.` : "Bei Fragen melde dich direkt bei mir."}
              </p>
            </>
          )}

          <dl className="zeilen">
            <dt>Kurs</dt><dd>{b.course_title}</dd>
            <dt>Datum</dt><dd>{datumLang(b.starts_at)}, {zeitspanne(b.starts_at, b.ends_at)} Uhr</dd>
            <dt>Ort</dt><dd>{ORT_ZEILE} · <a href={SITE.ort.karte} rel="noopener">Karte</a></dd>
            <dt>Plätze</dt><dd>{b.seats}</dd>
            <dt>Betrag</dt><dd>{chf(b.amount_cents)}{b.status === "paid" ? " · bezahlt" : b.status === "reserved" && b.amount_cents > 0 ? " · zahlbar vor Ort (TWINT oder bar)" : ""}</dd>
            <dt>Name</dt><dd>{b.name}</dd>
          </dl>

          {fest && !termin && (
            <div className="knoepfe">
              <a className="btn btn-dark" href={`/api/buchung/${b.token}/kalender`}>In den Kalender</a>
              <a className="btn" href={`mailto:${SITE.kontaktEmail}?subject=${encodeURIComponent(`Buchung ${b.course_title}, ${datumLang(b.starts_at)}`)}`}>Umbuchen oder absagen</a>
            </div>
          )}
          {fest && !termin && (
            <p className="small muted" style={{ margin: 0 }}>
              Bis {SITE.stornoTage} Tage vor dem Kurs kannst du kostenlos umbuchen oder absagen. Zieh etwas an, das
              schmutzig werden darf.
            </p>
          )}
        </div>
      </main>
      <Fuss />
    </>
  );
}
